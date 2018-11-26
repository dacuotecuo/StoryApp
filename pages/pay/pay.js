const App = getApp();
const util = require('../../utils/util.js');
const config = require('../../config.js');
const common = require('../../utils/common');

// pages/pay/pay.js
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let  callBackUrl = `/pages/pay/pay&id=&uid=`;
        common.checkLogin(callBackUrl);
        //获取用户昵称用于后端下发通知用
        wx.getUserInfo({
            success: function(res) {
                let userInfo = res.userInfo;
                wx.setStorageSync('nickName',userInfo.nickName);
                let nickName =  wx.getStorageSync('nickName') || '';
                util.fetch({
                    url: config.API.PAYSTOCK,
                    method: 'POST',
                    data: {
                        attach: 'attach',
                        body: '五星股票池（1个月）',
                        openId: encodeURIComponent(wx.getStorageSync('openId')),
                        unionId: encodeURIComponent(wx.getStorageSync('unionId')),
                        nickName:encodeURIComponent(nickName),
                    }
                }).then(({ data }) => {
                    console.log('----data-----', data);
                    if(data && data.ret === 0){
                        wx.requestPayment({
                            'timeStamp': data.data['timeStamp'],
                            'nonceStr': data.data['nonceStr'],
                            'package': data.data['package'],
                            'signType': data.data['signType'],
                            'paySign': data.data['paySign'],
                            'success': function (res) {
                                console.log('----res----', res)
                                if (res && res['errMsg'] === 'requestPayment:ok'){
                                    console.log('---------------支付成功')
                                    wx.showToast({
                                        title: '成功',
                                        icon: 'success',
                                        success: function () {
                                            wx.redirectTo({
                                                url: '/pages/Kline/Kline',
                                            })
                                        }
                                    })
                                }
                            },
                            'fail': function (res) {
                                console.log('----fail----', res)
                                wx.showToast({
                                    title: '支付失败',
                                    icon:'loading',
                                    success:function(){
                                        wx.redirectTo({
                                            url: '/pages/Kline/Kline',
                                        })
                                    }
                                })

                            }
                        })
                    }
                })
            }
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {


        //   wx.requestPayment({
        //       'timeStamp': '',
        //       'nonceStr': '',
        //       'package': '',
        //       'signType': 'MD5',
        //       'paySign': '',
        //       'success': function (res) {
        //       },
        //       'fail': function (res) {
        //       }
        //   })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
