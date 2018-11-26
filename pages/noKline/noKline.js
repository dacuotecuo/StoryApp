// pages/noKline/noKline.js
const App = getApp();
const util = require('../../utils/util.js');
const config = require('../../config.js');
const common = require('../../utils/common.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIphoneX: App.globalData.isIphoneX ? true : false,
    stock: [],
    ifPermission: '', //股票池权限 0：有权限，-1无权限，-2权限到期
    videoShow: false,
    klineShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    let uid = encodeURIComponent(wx.getStorageSync('unionId'))
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    util.fetch({
      url: config.API.ACT_NOKLINE
    }).then(({
      data
    }) => {
      if (data.ret === 0) {
        this.setData({
          stock: data.data
        })
        wx.hideLoading()
      }
    })
    //验证股票池权限
      common.fivestar(uid).then(({data}) =>{
          this.setData({
              ifPermission: data.ret
          })
          console.log('股票池权限',this.data.ifPermission);
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let uid = encodeURIComponent(wx.getStorageSync('unionId'))
    let data = {
      title: '大数据+专业人工智能选股五星买点推荐强势买入机会潜...',
      path: '/pages/index/index',
      success: function(res) {
        util.fetch({
          url: `${config.API.ACT_SHARESTOCK}`,
          method: 'POST',
          data: {
            unionId: uid
          }
        }).then((retData) => {
          console.log('转发成功', retData)
          if (retData.data.ret === 0) {
            wx.redirectTo({
              url: '/pages/Kline/Kline',
            })
          }
        }).catch((res) => {})
      },
      fail: function(res) {
        console.log('转发失败', res)
      }
    }
    return data
  },
  // 去开团
  gotoCreate(e) {
    try {
      let {
        id
      } = e.currentTarget.dataset,
        form_id = e.detail.formId,
        openid = wx.getStorageSync('openId'),
        uid = wx.getStorageSync('unionId');
      util.fetch({
        method: 'POST',
        url: config.API.ACT_GROUPMYCREATE,
        data: {
          uid,
          openid,
          itemid: id,
          form_id
        }
      }).then(({
        data
      }) => {
        /**
         * {ret: 0, msg: "OK", id: "800665970"}
         */
        console.log('------------', data)
        if (data.ret === 0 || data.ret === 1) {
          this.setData({
            klineShow: false
          })
          wx.navigateTo({
            url: `/pages/groupDetail/groupDetail?id=${data.id}`
          })
        } else {
          wx.showToast({
            title: '创建失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
    } catch (err) {
      console.error('Create Group Error:', err)
    }
  },
  showVideo() {
    let video = !this.data.videoShow
    this.setData({
      videoShow: video
    })
  },
  goShare(e) {
    this.setData({
      klineShow: true
    })
  },
  popClose() {
    this.setData({
      klineShow: false,
    })
  },
  goPay(){
    util.fetch({
      url: config.API.PAYSTOCK,
      method: 'POST',
      data: {
        attach: 'attach',
        body: '五星股票池（1个月）',
        openId: encodeURIComponent(wx.getStorageSync('openId')),
        unionId: encodeURIComponent(wx.getStorageSync('unionId')),
      }
    }).then(({ data }) => {
      console.log('----data-----', data)
      if (data && data.ret === 0) {
        wx.requestPayment({
          'timeStamp': data.data['timeStamp'],
          'nonceStr': data.data['nonceStr'],
          'package': data.data['package'],
          'signType': data.data['signType'],
          'paySign': data.data['paySign'],
          'success': function (res) {
            console.log('----res----', res)
            if (res && res['errMsg'] === 'requestPayment:ok') {
              console.log('---------------支付成功')
              wx.redirectTo({
                url: '/pages/Kline/Kline',
              })
            }
          },
          'fail': function (res) {
            console.log('----fail----', res)
          }
        })
      }
    })
  }
})
