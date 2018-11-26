const App = getApp()
const util = require('../../utils/util')
const config = require('../../config')
const common = require('../../utils/common');
// pages/my/my.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        img: "https://cdn.upchina.com/front/gudaka/images/631.png",
        lessonList: '',//我的课程列表
        status: '',//展开还是收起状态 open：展开  close 收起
        recommondCnt:{}, //推荐课程内容
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let callBackUrl = `/pages/my/my&id=`;
        common.checkLogin(callBackUrl);
        this.setData({recommondCnt:config.RECOMMEND});
        this.getMyLesson().then(({data}) => {
            if (data.iRet === 0 && data.stOrderList.length > 0) {
                data.stOrderList = this.setLessonId(data.stOrderList);
                let lessonList = this.setLessonProgress(data.stOrderList);
                this.setData({lessonList:lessonList});
            }
            this.setData({status:"open"})
        }).catch(err => {
            wx.showToast({
                title: '获取我的课程失败，请退出重试',
                icon: 'none',
                duration: 2000
            })
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
        this.getMyLesson().then(({data}) => {
            if (data.iRet === 0 && data.stOrderList.length > 0) {
                data.stOrderList = this.setLessonId(data.stOrderList);
                let lessonList = this.setLessonProgress(data.stOrderList);
                this.setData({lessonList:lessonList });
            }
            this.setData({status:"open"});
            console.log(this.data.lessonList)
        });
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
    toZerogroup: function () {
        wx.navigateTo({
            url: '../myGroup/myGroup'
        })
    },
    toPaidgroup() {
        wx.navigateTo({
            url: '/pages/myOrderList/myOrderList',
        })
    },
    getMyLesson() {
        let unionId = wx.getStorageSync('unionId');
        return util.fetch({
            url: config.API.ORDERLIST,
            data: {
                unionId: encodeURIComponent(unionId),
                type: 'course',
                status: '220'
            }
        });
    },
    //展开收起
    flexible() {
        let status = this.data.status;
        if (status === 'open') {
            this.setData({status: ''})
        } else {
            this.setData({status: 'open'})
        }
    },
    //跳转课程详情页
    toLessonDetail(e) {
        let id = e.currentTarget.dataset.id || '';
        let productid = e.currentTarget.dataset.productid || '';
        let form_id = e.detail.formId;
        App.sendForm(form_id);
        if (!id) {
            let lessonList = config[config.JPKNAME];
            lessonList.map((item,index) => {
                if(productid == item.proId){
                    id =item.kcId;
                }
            })
        }
        wx.navigateTo({
            url: `/pages/teachDetail/teachDetail?id=${id}`,
        })
    },
    //更新当前课程的学习进度
    setLessonProgress(teachList){
        teachList.forEach((item, index) => {
            let learnCount;
            if(item.courseId){
               learnCount = wx.getStorageSync('learn' + item.courseId) || ''; //当前学习进度
            }else{
               learnCount = wx.getStorageSync('learn' + item.courseIds) || ''; //当前学习进度
            }
            if(learnCount){
                item.learnCount = learnCount;
            }
        });
        return teachList;
    },
    /*
    * 给v1.52版本之前的订单 从配置项中匹配课程id
    * */
    setLessonId(lessonList){
        let lessonConList = config[config.JPKNAME];
        lessonConList.map((item,index) => {
            lessonList.map((i,key) => {
               if(item.proId == i.productid){
                   i.courseIds = item.kcId;
               }
            });
        });
        return lessonList;
    },
})
