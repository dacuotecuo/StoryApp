const App = getApp()
const util = require('../../utils/util')
const config = require('../../config')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        listData: [],// 当前所要展示的订单
        allData:[], //全部订单
        orderPayArr:[],//代付款
    orderCompletedArr:[],//已完成
        networkStatus: {
            onLoading: false,
            error: false,
            success: false
        },
        isLoad:{
            show:true
        },
        showMask:false,
        currentTab: 1,
        noData:false,
        popId:'', //弹框里的课程id
        isPay:false, //支付loading状态
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.fetchListData();
        wx.getUserInfo({
            success: function(res) {
                let userInfo = res.userInfo;
                wx.setStorageSync('nickName',userInfo.nickName);
            }
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

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
        return config.SHARE_CONFIG.DEFAULT
    },
    fetchListData: function () {
        let allData = []; //全部订单
        let orderPayArr = []; //待支付订单
        let orderCompletedArr = []; //已完成订单
        let unionId = wx.getStorageSync('unionId');
        util.fetch({
            url: `${config.API.ORDERLIST}`,
            data: {
                unionId: encodeURIComponent(unionId),
            }
        }).then((res) => {
            console.log('全部订单列表',res.data.stOrderList);
            if (res.data.iRet == 0) {
                res.data.stOrderList.map( item =>{
                    item.ctime = util.transDate(item.ctime);
                    if(item.productid === config[config.PTNAME]['proId']){
                        item.type = 'pt';
                    }else{
                        let productList  = config[config.JPKNAME];
                        productList.map( value => {
                            if(item.productid == value['proId'] ){
                                item.type = 'kc';
                                item.kcid = value['kcId'];
                            }
                        });
                    }
                    if(item.type){
                        allData.push(item);
                    }
                });
                console.log('处理过',allData)
                this.setData({allData:allData});
                allData.map( value => {
                    if(value.status === 180 || value.status === 70){
                        orderPayArr.push(value);
                        this.setData({
                            orderPayArr:orderPayArr
                        })
                    }else if(value.status === 220){
                        orderCompletedArr.push(value);
                        this.setData({
                            orderCompletedArr:orderCompletedArr
                        })
                    }
                });
                switch (this.data.currentTab) {
                    case '2':
                        this.setData({
                            listData: orderPayArr
                        });
                        break;
                    case '3':
                        this.setData({
                            listData: orderCompletedArr
                        });
                        break;
                    default:
                        this.setData({
                            listData: allData
                        });
                }
            }
            this.setData({
                'isLoad.show':false
            })
        }).catch((err) => {
            console.log('获取用户订单列表失败',err);
        })
    },
    //tab切换
    tabEvent(e) {
        let currentTab = e.currentTarget.dataset.current;
        this.setData({
            currentTab: currentTab
        });
        console.log(currentTab);
        switch (this.data.currentTab) {
            case '2':
                this.setData({
                    listData: this.data.orderPayArr
                });
                break;
            case '3':
                this.setData({
                    listData: this.data.orderCompletedArr
                });
                break;
            default:
                this.setData({
                    listData: this.data.allData
                });
        }
        console.log('处理过2',this.data.listData)
    },
    toPay(e) {
        let that = this;
        this.setData({isPay:true});
        let proName = e.currentTarget.dataset.proName,
            id = e.currentTarget.dataset.id || '',
            orderid = e.currentTarget.dataset.orderid || '',
            form_id = e.detail.formId;
            console.log(form_id)
        App.sendForm(form_id);
        if(proName === '五星股票池（1个月）'){
            that.payinterface(proName,orderid);
        }else{
            that.checkPay(id).then( payData => {
                console.log('查询课程权限',payData);
                if(payData.data.ret === 0){
                    this.setData({isPay:false});
                    that.setData({
                        showMask: true,
                        popId:id
                    });
                }else{
                    that.payinterface(proName,orderid);
                    }
            }).catch( e =>{
                console.log('查询权限失败',e);
            })
        }
    },
    //支付接口
    payinterface(proName,orderid){
        let _that = this;
        let nickName =  wx.getStorageSync('nickName') || '';
        let data = {
            orderId:orderid || '',
            body: proName,
            openId: encodeURIComponent(wx.getStorageSync('openId')),
            unionId: encodeURIComponent(wx.getStorageSync('unionId')),
            nickName:encodeURIComponent(nickName),
        };
        util.fetch({
            url:  config.API.ACT_ORDERPAY,
            method: 'POST',
            data: data
        }).then(({data}) => {
            console.log('----data-----', data);
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
                            _that.fetchListData();
                        }
                    },
                    'fail': function (res) {
                        console.log('----fail----', res)

                    }
                })
            }
            this.setData({isPay:false});
        })
    },
    //查询课程是否有权限，有的话不需要重新支付
    checkPay(kcid) {
        console.log(encodeURIComponent(wx.getStorageSync('unionId')))
        return util.fetch({
            url: config.API.ACT_VIDEOJUDGE,
            data: {
                kcid:kcid,
                unionId: encodeURIComponent(wx.getStorageSync('unionId'))
            }
        });
    },
    closeMask() {
        this.setData({
            showMask: false
        })
    },
    //课程跳转
    toCourse(e){
        let id = e.currentTarget.dataset.id;
        let form_id = e.detail.formId;
        console.log(form_id)
        App.sendForm(form_id);
        wx.navigateTo({
            url: `/pages/teachDetail/teachDetail?id=${id}`
        });
    },
    //五星股票池跳转
    goStockPond(e){
        let form_id = e.detail.formId;
        console.log(form_id)
        App.sendForm(form_id);
        wx.navigateTo({
            url: `/pages/Kline/Kline`
        });
    },
})
