const App = getApp()
const util = require('../../utils/util.js')
const config = require('../../config.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        callBackUrl: '',
        relationData: {
            uid: '',
            inviteUid: '',
            title: '',
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log('---login.js---options.callBackUrl------', options)
        let callBackUrl = options.callBackUrl ? options.callBackUrl : '',
            id = options.id || '',
            uid = options.uid || '',
            itemid = options.itemid || '',
            type = options.type || '';
        if (callBackUrl){
            this.setData({
                callBackUrl: `${callBackUrl}?id=${id}&uid=${uid}&itemid=${itemid}&type=${type}`,
            })
        }
        if (uid && id){
            this.data.relationData['uid'] = uid
            this.data.relationData['inviteUid'] = wx.getStorageSync('unionId')
            this.setData({
                relationData: this.data.relationData,
            })

            // 获取团购详情信息
            util.fetch({
                url: config.API.ACT_GROUPMYDETAIL,
                data: {
                    uid: uid,
                    id: id,
                }
            }).then(({ data }) => {
                if (data.ret === 0) {
                    data = data.data[0]
                    this.data.relationData['title'] = data.group_item.name
                    this.setData({
                        relationData: this.data.relationData,
                    });
                    console.log('---login.js---groupDetail------', data, this.data.relationData)
                }
            })
        }
        console.log('---login.js---callBackUrl------', this.data.callBackUrl, this.data.relationData)
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
    // onShareAppMessage: function() {

    // },

    getUserInfo(e) {
        let data = {
            sessionKey: wx.getStorageSync('sessionKey'),
            iv: encodeURIComponent(e.detail.iv),
            encryptedData: encodeURIComponent(e.detail.encryptedData),
            systemData: {
                plat: '',
            },
            relationData: this.data.relationData,
        }
        let systemPlat = App.globalData.systemInfo.system.toLocaleLowerCase()
        if (systemPlat.indexOf('ios') >= 0) {
            data.systemData['plat'] = 'I'
        } else if (systemPlat.indexOf('android') >= 0) {
            data.systemData['plat'] = 'A'
        }

        if (!data.sessionKey || !data.iv || !data.encryptedData || !data.systemData) {
            console.log(`-----未授权----, data.sessionKey:${data.sessionKey}, data.iv:${data.iv}, data.encryptedData:${data.encryptedData}, data.systemData:${data.systemData}`)
            wx.showModal({
                title: '提示',
                showCancel: false,
                content: '未授权',
            })
        } else {
            // 服务端数据解密
            util.fetch({
                url: `${config.API.USER_INFO}`,
                data: data,
            }).then((retData) => {
                let data = retData.data;
                if (data.ret === 0) {
                    try {
                        wx.setStorageSync('openId', retData.data.data['openId'])
                        wx.setStorageSync('unionId', retData.data.data['unionId'])
                    } catch (e) {
                      wx.setStorage({
                        key: "openId",
                        data: retData.data.data['openId']
                      })
                      wx.setStorage({
                        key: "unionId",
                        data: retData.data.data['unionId']
                      })
                    }
                    if (this.data.callBackUrl) {
                        console.log('----login.js---redirectTo-111--', this.data.callBackUrl);
                        if(this.data.callBackUrl.indexOf('/pages/teachList/teachList') !== -1){
                            wx.switchTab({
                                url: '/pages/teachList/teachList'
                            })
                        }else if(this.data.callBackUrl.indexOf('/pages/my/my') !== -1){
                            wx.switchTab({
                                url: '/pages/my/my'
                            })
                        }else{
                            wx.redirectTo({
                                url: this.data.callBackUrl,
                            })
                        }
                    }else{
                        wx.setStorageSync('isNews', false);
                        wx.switchTab({
                          url: '/pages/index/index'
                        })
                    }
                }else{
                    if(data.msg != '参数有误'){
                        wx.showModal({
                            title: '提示',
                            showCancel: false,
                            content: data.msg,
                        })
                    }
                }
            }).catch((err) => {

            })
        }
    },
})
