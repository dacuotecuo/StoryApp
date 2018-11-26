const App = getApp()
const util = require('../../utils/util.js');
const common = require('../../utils/common.js');
const config = require('../../config.js');
const WxParse = require('../../wxParse/wxParse.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        teachId:'',//课程id
        teachDetail:{}, //课系目录列表
        currentTab:1,
        newsSection:[], //课系介绍列表
        contentText:'', //当前课程宣传内容
        isPermission:0, //当前课程是否有权限
        learnCount:{},  //用户当前学习章节
        footerShow:false, //底部button显示
        teachImg:'',
        isPay:false, //支付loading状态
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            teachId:options.id
        });
        let _that = this;
        let callBackUrl = `/pages/teachDetail/teachDetail&id=${this.data.teachId}`;
        common.checkLogin(callBackUrl);
        this.judgeAuthority();
        this.getDetail().then(({data})=>{
            if(data.ret === 0){
                let contentText = data.data.ext2.replace(/[\\]/g,'').replace('H5desc','').replace(/[\r\n]/g,'');
                let learnCount = wx.getStorageSync('learn' + this.data.teachId) || ''; //当前学习进度
                WxParse.wxParse('contentText','html',contentText,_that,0);
                //需要进行setData的数据
                let setDataOpt = {
                    teachDetail:'',
                    teachImg:'',
                    learnCount:{},
                    newsSection:'',
                };
                setDataOpt.teachDetail = data.data;
                setDataOpt.teachImg = data.data.imgurl;
                if(data.data.price === 0){
                    this.setData({isPermission:1})
                }
                if(learnCount){
                    setDataOpt.learnCount = learnCount;
                }else{
                    setDataOpt.learnCount = data.data.chapters.value[0];
                }
                if(data.data.chapters.value.length > 2){
                        setDataOpt.newsSection = data.data.chapters.value.slice(0,3)
                }else{
                    setDataOpt.newsSection = data.data.chapters.value
                }
                let sectionArr = []; //课程章节列表
                if(data.data.chapters.value && data.data.chapters.value.length > 0){
                    data.data.chapters.value.forEach((item, index) =>{
                        let opt = {
                            id:item.id,
                            kcid:item.kcid,
                            title:item.title,
                            index:index,

                        }
                        sectionArr.push(opt)
                    });
                    wx.setStorageSync(this.data.teachId, sectionArr);
                }
                this.setData({
                    teachDetail:setDataOpt.teachDetail,
                    teachImg:setDataOpt.teachImg,
                    learnCount:setDataOpt.learnCount,
                    newsSection:setDataOpt.newsSection,
                });
            }else{
                wx.showToast({
                    title: '获取课程详情失败，请退出重试',
                    icon: 'none',
                    duration: 2000
                })
            }
        }).catch( e=> {
           console.log('获取课程详情失败',e);
            wx.showToast({
                title: '获取课程详情失败，请退出重试',
                icon: 'none',
                duration: 2000
            });
        });
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
        let nickName =  wx.getStorageSync('nickName') || '';
        if(nickName){
            nickName += '@';
        }
        return {
            title:`熊市就要多学习，${nickName}向您超值推荐${this.data.teachDetail.title}大咖战法课程>>`,
            path:`/pages/teachDetail/teachDetail?id=${this.data.teachId}`,
            imageUrl:`https://cdn.upchina.com/front/gudaka/images/${this.data.teachId}.png` || `https://cdn.upchina.com/front/gudaka/images/share_list.png`
        }
    },
    //权限判断
    judgeAuthority(){
        let _that = this;
        let  unionId = encodeURIComponent(wx.getStorageSync('unionId'));
        console.log('权限判断',unionId,this.data.teachId)
        return util.fetch({
            url:config.API.ACT_VIDEOJUDGE,
            method:'GET',
            data:{kcid:this.data.teachId,unionId:unionId}
        }).then(({data}) => {
            if(data.ret === 0){
                _that.setData({isPermission:1});
            }
        _that.setData({footerShow:true})
        }).catch(err => {
            console.log('查询订单错误',err);
        });
    },
    //获取课程详情内容
    getDetail(){
        return util.fetch({
            url:config.API.ACT_VIDEODETAIL,
            data:{id:this.data.teachId}
        });
    },
    //tab切换
    tabEvent(e) {
        let currentTab = e.currentTarget.dataset.current;
        this.setData({
            currentTab: currentTab
        });
    },
    //课系介绍跳转
    toDetail(e){
        let form_id = e.detail.formId;
        App.sendForm(form_id);
        if(this.data.isPermission){
            this.toWatch(e);
        }else{
            this.toPay(e);
        }
    },
    //支付
    toPay() {
        this.setData({isPay:true})
        let that = this;
        let nickName =  wx.getStorageSync('nickName') || '';
        util.fetch({
            url: config.API.ACT_VIDEOPAY,
            method: 'POST',
            data: {
                kcid:that.data.teachId || '',
                attach: 'attach',
                body: that.data.teachDetail.title,
                openId: encodeURIComponent(wx.getStorageSync('openId')),
                unionId: encodeURIComponent(wx.getStorageSync('unionId')),
                nickName:encodeURIComponent(nickName),
            }
        }).then(({data}) => {
            console.log('----data-----', data)
            if (data.data && data.ret === 0) {
                wx.requestPayment({
                    'timeStamp': data.data['timeStamp'],
                    'nonceStr': data.data['nonceStr'],
                    'package': data.data['package'],
                    'signType': data.data['signType'],
                    'paySign': data.data['paySign'],
                    'success': function (res) {
                        if (res && res['errMsg'] === 'requestPayment:ok') {
                            console.log('---------------支付成功');
                            that.setData({isPermission:1});
                        }
                    },
                    'fail': function (res) {
                        console.log('----fail----', res)
                    }
                });
                this.setData({isPay:false})
            }
        }).catch(e =>{
            console.log(e);
        })
    },
    //去观看视频
    toWatch(e){
        let id = e.currentTarget.dataset.id;
        let kcid = this.data.teachId;
        let subtitle = this.data.teachDetail.title;
        this.getMyLearn(id);
        wx.setStorageSync('teachImg',this.data.teachImg);
        wx.navigateTo({
            url:"/pages/watchVideo/watchVideo?kcid=" + kcid + '&id=' + id + '&subtitle=' + subtitle
        })
    },
    //底部开始学习
    toMemoryDetail(e){
        let id = e.currentTarget.dataset.id || "";
        let kcid = this.data.teachId;
        let subtitle = this.data.teachDetail.title;
        let form_id = e.detail.formId;
        App.sendForm(form_id);
        wx.setStorageSync('teachImg',this.data.teachImg);
        let learnCount = wx.getStorageSync('learn' + this.data.teachId) || '';
        if(learnCount){
            this.setData({learnCount:learnCount});
        }else{
            this.getMyLearn(id)
        }
        wx.navigateTo({
            url:"/pages/watchVideo/watchVideo?kcid=" + kcid + '&id=' + id + '&subtitle=' + subtitle
        })
    },
    //更新当前学习的章节
    getMyLearn(id){
        let sectionArr = wx.getStorageSync(this.data.teachId) || {};
        let learnCount = {};
        if(sectionArr){
            for(let i = 0; i<sectionArr.length;i++){
                let item = sectionArr[i];
                if(id == item.id){
                    learnCount = item;
                    break;
                }
            }
        }
        console.log('2222',learnCount)
        if(learnCount){
            this.setData({learnCount:learnCount});
            wx.setStorageSync('learn'+ this.data.teachId,learnCount);
        }
    },
});

