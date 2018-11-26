const util =  require('util.js');
const config =  require('../config.js');
const common = {
    //验证股票池权限
    fivestar:function (unionId) {
        return new Promise((resolve, reject) => {
            util.fetch({
                url: config.API.ACT_STOCKPERMIT,
                data: {unionId: unionId}
            }).then((data) => {
               resolve(data);
            }).catch(e => {
                reject(e);
            })
        })
    },
    //授权验证
    checkLogin(callBackUrl) {
        let openId = wx.getStorageSync('openId'),
            unionId = wx.getStorageSync('unionId');
            callBackUrl = callBackUrl || ''

        if (!openId || !unionId) {
            let url = `/pages/login/login?callBackUrl=${callBackUrl}`
            console.log('------index.js--url----', url);
            wx.redirectTo({
                url: url,
            })
        }
    },
    getRandom(min,max){
        var r = Math.random() * (max - min);
        var re = Math.round(r + min);
        re = Math.max(Math.min(re, max), min)
        return re;
    },
};

module.exports = common;
