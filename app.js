'use strict';

const config = require('./config');
const util = require('./utils/util');

App({
    globalData: {
        systemInfo: {},
        userInfo: {},
        isIphoneX: false,
    },
    onLaunch: function (options) {
        //版本异步更新加强制更新
        const updateManager = wx.getUpdateManager()
        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
            console.log(res.hasUpdate)
        })
        updateManager.onUpdateReady(function () {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success: function (res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            })
        })
        updateManager.onUpdateFailed(function () {
            wx.showModal({
                title: '已经有新版本了',
                content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开！',
            })
        })
        util.getSystemInfo().then(res => {
            let modelmes = res.model
            if (modelmes.search('iPhone X') != -1) {
                this.globalData.isIphoneX = true
            }
            this.globalData.systemInfo = res
        })

        wx.checkSession({
            success: function () {
                console.log('------session_key 未过期-----')
                let sessionKey = wx.getStorageSync('sessionKey')
                if (!sessionKey) {
                    wx.login({
                        success: function (res) {
                            if (res.code) {
                                util.fetch({
                                    url: `${config.API.USER_LOGIN}`,
                                    data: {
                                        code: res.code,
                                    },
                                }).then((retData) => {
                                    if (retData.data.ret === 0) {
                                        try {
                                            wx.setStorageSync('openId', retData.data.data['openId'])
                                            wx.setStorageSync('sessionKey', retData.data.data['sessionKey'])
                                            wx.setStorageSync('unionId', retData.data.data['unionId'])
                                        } catch (e) {

                                        }
                                    }
                                }).catch((err) => {
                                    wx.showModal({
                                        title: '提示',
                                        showCancel: false,
                                        content: '网络错误，请重启小程序',
                                    })
                                })
                            }
                        }
                    })
                }
            },
            fail: function () {
                console.log('------session_key 已过期-----');
                wx.login({
                    success: function (res) {
                        if (res.code) {
                            util.fetch({
                                url: `${config.API.USER_LOGIN}`,
                                data: {
                                    code: res.code,
                                },
                            }).then((retData) => {
                                if (retData.data.ret === 0) {
                                    try {
                                        wx.setStorageSync('openId', retData.data.data['openId'])
                                        wx.setStorageSync('sessionKey', retData.data.data['sessionKey'])
                                        wx.setStorageSync('unionId', retData.data.data['unionId'])
                                    } catch (e) {

                                    }
                                }
                            }).catch((err) => {
                                wx.showModal({
                                    title: '提示',
                                    showCancel: false,
                                    content: '网络错误，请重启小程序',
                                })
                            })
                        }
                    },
                    fail: function (e) {
                        console.log('444444', e);
                    }
                })
            }
        })
    },
    onShow: function (res) {

    },
    sendForm(formId) {
        console.log('formid:', formId)
        var openId = wx.getStorageSync('openId')
        var unionId = wx.getStorageSync('unionId')
        util.fetch({
            url: `${config.API.ACT_FORM}`,
            method: 'POST',
            data: {unionId, openId, formId}
        }).then((res) => {
            console.log('formId回包',res)
        })
    },
    checkLogin() {
        console.log('login')
        try {
            wx.removeStorageSync('openId')
            wx.removeStorageSync('unionId')

        } catch (e) {
            wx.removeStorage({
                key: 'openId'
            })
            wx.removeStorage({
                key: 'unionId'
            })
        }
        wx.reLaunch({
            url: '/pages/login/login',
        })
    },
})
