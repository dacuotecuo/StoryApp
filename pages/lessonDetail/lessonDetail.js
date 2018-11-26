const App = getApp()
const util = require('../../utils/util.js');
const config = require('../../config.js');
const common = require('../../utils/common.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isIphoneX: false,
        isShow:false,
        toView: '',
        banner: {
            height: 0,
            indicatorDots: true,
            autoplay: true,
            interval: 3000,
            duration: 500,
        },
        pt_scccess_cnt:[],//已成团列表
        pt_list:[], //可拼团列表
        currentGroup: {  //当前产品的详情
            gcount: 0,  //成团人数
            suc_count: 0, //成团个数
            total: 0, //宝贝总数
            surplus: 0,//剩余个数
            pic: '',
            price: '', //价格
            start: '', //开始时间
            status: 1, //当前产品状态
        },
        joinPop:false,
        joinSuccess:false,
        group_detail: {},
        now: (new Date().getMonth() + 1) + '月' + new Date().getDate() + '日',
        left_time: '00:00:00',
        groupType: '',
        myGroup: [],//我的拼团列表
        item_id:'',  //当前产品的id
        showMask: false,
        wxShow: false,
        eleShow: false,
        groupOpt:{
            isPaid: -1,//-1无权限，0有权限
            founder: 0, //是否为创建者
            hasJoin:0, // 是否当前团的成员  0：否 1：是
            isJoined:0, //是否拼过团 0 || 1   每人只能加团一次
            status:'incomplete',  //是否已成团 incomplete:未成 complete：已成
            type:'',  //判断来源渠道  0：首页   1：0元购  空：分享或者消息通知
            group_id: '',  //团的id
            group_uid: '', //用户的upid
            isOpen:0, //是否开过团
            hasJoin_groupid:'', //已参加团的id
        },
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('-----lessonDetail options ------', options)
        // 获取转发详细信息
        this.setData({
            'groupOpt.group_id': options.id || '',
            'groupOpt.group_uid': options.uid || '',
            item_id:options.itemid || '',
            'groupOpt.type':options.type || '',
        });
        let id = this.data.groupOpt.group_id,
            uid = this.data.groupOpt.group_uid,
            item_id = this.data.item_id,
            type = this.data.groupOpt.type,
            callBackUrl = `/pages/lessonDetail/lessonDetail&id=${id}&uid=${uid}&itemid=${item_id}&type=${type}`;
        common.checkLogin(callBackUrl); //授权
        this.setData({
            isIphoneX: App.globalData.isIphoneX ? true : false,
        });

        // 是否使用带 shareTicket 的转发

        wx.showShareMenu({
            withShareTicket: true,
            success() {
                console.log('使用带 shareTicket 的转发')
            }
        });
        //查询是否有权限
        let unionid =  encodeURIComponent(wx.getStorageSync('unionId'));
        this.checkPay().then((res) => {
            this.getGroupDetail().then((data) => {
                this.isItem(unionid).then((data) =>{
                    console.log('2222222',this.data.group_detail);
                    if(this.data.groupOpt.group_id){
                        this.judgmentIdentity(this.data.group_detail);
                    }
                    console.log(this.data.groupOpt);
                    this.setData({isShow:true});
                    if(this.data.groupOpt.founder === 0 && this.data.groupOpt.hasJoin === 0 && this.data.groupOpt.isJoined === 1){
                        this.setData({showMask:true});
                    }
                    this.getPtList();
                    this.getSuccessList();
                });
            })
        });
        //获取用户昵称用于后端下发通知用
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
        this.countdown();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.setData({eleShow:true});
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
    onShareAppMessage: function (options) {
        if (options.from === 'button') {
            if (this.data.group_detail.status === 'incomplete' || this.data.groupOpt.isPaid == -1) {
                let id = this.data.groupOpt.group_id,
                    uid = encodeURIComponent(wx.getStorageSync('unionId'))
                let data = {
                    //title: '99%的人都不知道的买卖点神器！速抢！免费解锁牛股！',
                    title: this.data.group_detail.group_item.desc,
                    path: `/pages/lessonDetail/lessonDetail?id=${id}&uid=${uid}`,
                    success: function (res) {
                        util.fetch({
                            url: `${config.API.USER_SHARESTAT}`,
                            data: {
                                userName: uid,
                                title: '五星股票池',
                            },
                        }).then((retData) => {
                            console.log('转发成功', retData)
                        }).catch((err) => {

                        })
                    },
                    fail: function (res) {
                        console.log('转发失败', res)
                    },
                    complete: function (res) {
                        console.log('转发', res)
                    }
                }
                return data
            }
        } else {
            return {
                title: '邀请你来股大咖，学习大咖精品课程，还能0元拿特权，点击领取>>',
                path: '/pages/index/index'
            }
        }
    },
    /*禁止用户手滑swiper*/
    catchTouchMove:function(res) {
        return false;
    },
    // 加团
    join(e) {
        let unionid =  wx.getStorageSync('unionId');
        console.log('will join');
        let form_id = e.detail.formId
        // 加入团购
        let data = {
            uid: wx.getStorageSync('unionId'),
            openid: wx.getStorageSync('openId'),
            groupid:e.currentTarget.dataset.id,
            form_id
        };
        console.log('-----加入团购', data)

        if (!data.uid || !data.openid || !data.groupid) {
            wx.showModal({
                title: '提示',
                showCancel: false,
                content: '参数错误',
            })
        } else {
            this.setData({'groupOpt.group_id':data.groupid});
            util.fetch({
                method: "POST",
                url: `${config.API.ACT_GROUPMYADD}`,
                data: data,
            }).then(retData => {
                let data = retData.data;
                console.log('retData',data);
                if (data.ret === -1) {
                    wx.showModal({
                        title: '提示',
                        showCancel: false,
                        content: '您有正在进行中的拼团',
                    })
                }else{
                   console.log('加入团购的回包',data,this.data.groupOpt);
                    this.checkPay().then((res) => {
                        this.getGroupDetail().then((data) => {
                            this.isItem(unionid).then((data) => {
                                console.log('2222222', this.data.group_detail);
                                if (this.data.groupOpt.group_id) {
                                    this.judgmentIdentity(this.data.group_detail);
                                    this.getPtList();
                                    this.getSuccessList();
                                    if(retData.data.ret === 0){
                                        this.setData({
                                            showMask: true,
                                        })
                                        if(this.data.group_detail.menbers.length === 2){
                                            this.setData({ 'groupOpt.isPaid':0});
                                        }
                                    }
                                }
                                if (retData.data.ret === 1 || retData.data.ret === 2) {
                                    //已加过团
                                    this.setData({
                                        showMask: true,
                                    })
                                }
                                console.log(this.data.groupOpt)
                            })
                        });
                    })
                }
            }).catch((err) => {

            })
        }

    },
    // 倒计时
    countdown() {
        let start = new Date();

        function convertLen(data) {
            return data < 10 ? '0' + data : data
        }

        let hours = convertLen(23 - start.getHours()),
            minute = convertLen(59 - start.getMinutes()),
            second = convertLen(59 - start.getSeconds())

        let result = hours + ':' + minute + ':' + second;

        this.setData({
            left_time: result
        })
        setTimeout(this.countdown, 500);
    },
    // 加载团购信息
    //课程只能开一次团，加一次团
    getGroupDetail() {
        let unionid = encodeURIComponent(wx.getStorageSync('unionId'));
        //通过分享或消息通知打开的页面，可以直接显示当前团的信息
        return util.fetch({
            url: config.API.ACT_GROUPMYDETAIL,
            data: {
                uid: unionid,
                id: this.data.groupOpt.group_id,
            },
        }).then(({data}) => {
            console.log('当前团的详情', {data});
            if (data.ret === 0 && data.data.length) {
                this.setData({
                    'groupOpt.group_uid': data.uid,
                    group_detail: data.data[0],
                    currentGroup: data.data[0].group_item,
                    item_id: data.data[0].group_item.id,
                });
                console.log('通过团的id获取当前产品的详情', this.data.group_detail);
            }
        });
    },
    //设置团长或者新人，未成团或已成团
    judgmentIdentity(item){
        console.log(`设置团长或者新人，未成团或已成团,item.creater_info.uid:::${item.creater_info.uid},::group_uid::${this.data.groupOpt.group_uid}`);
        if(item.creater_info.uid && item.creater_info.uid === this.data.groupOpt.group_uid){
            this.setData({
                'groupOpt.founder': 1,
                'groupOpt.hasJoin': 1,
            });
        }else{
            this.isMenber(this.data.groupOpt.group_uid,item.menbers);
        }
        this.setData({'groupOpt.status': item.status})
    },
    //判断用户是否在当前团中
    isMenber(uid,menbers){
        if(menbers.length>0){
            for(let item of menbers){
                if(uid === item.uid){
                    this.setData({
                        'groupOpt.founder': 0,
                        'groupOpt.hasJoin':1,
                        'groupOpt.isJoined':1
                    });
                    break;
                }
            }
        }
    },
    //判断用户是否开过团，是否参过团,以及筛选当前需要展示的团
    isItem(unionid){
        return util.fetch({url: config.API.ACT_GROUPMYLIST, data:{uid:unionid},}).then(({data}) => {
            console.log('myList',data,);
            if(data.ret === 0 && data.data.length){
                this.setData({
                    'groupOpt.group_uid':data.uid,
                    myGroup:data.data
                });
                //判断当前用户是否开过团是否参过团
                let incompleteGroup=[],item_group,itemList=[];
                /*遍历选取当前课程的团*/
                for(let i=0;i<data.data.length;i++){
                    console.log('333')
                    var item = data.data[i];
                    console.log('1',item);
                    if(item.group_item.id === this.data.item_id){
                        itemList.push(item);
                    }
                }
                console.log('itemList当前用户的当前课程所有团购',itemList);
                if(itemList){
                    for(let i=0;i<itemList.length;i++){
                        console.log(i)
                        let item = itemList[i];
                        console.log('222',item)
                        /*判断是否开过团*/
                        if(item.creater_info.uid === this.data.groupOpt.group_uid){
                            this.setData({'groupOpt.isOpen':1});
                        }
                        let menberList = item.menbers;
                        /*判断是否参过团*/
                        console.log(menberList);
                        if(menberList && menberList.length){
                            for(let j =0;j<menberList.length;j++){
                                let menItem = menberList[j];
                                if(this.data.groupOpt.group_uid === menItem['uid']){
                                    this.setData({
                                        'groupOpt.isJoined':1,
                                        'groupOpt.hasJoin_groupid':item.id,
                                        })
                                }
                            }
                        }
                        /*首页进来的用户，通过团的状态来选取优先展示哪个团*/
                        if(!this.data.groupOpt.group_id){
                            if(item.status === 'complete'){  //1、优先展示已成团
                                console.log('555555555555555555555')
                                item_group = item;
                                break;
                            }else{
                                incompleteGroup.push(item);
                            }
                        }
                    }
                    console.log(item_group)
                    if(incompleteGroup && incompleteGroup.length>0 && !item_group){
                        for(let item of incompleteGroup){
                            if(item.creater_info.uid === this.data.groupOpt.group_uid){ //2、次之展示未成团是团长的
                                item_group = item;
                                break;
                            }else{ //3、最后是未成团团员身份的
                                item_group = item;
                            }
                        }
                    }
                }
                if(item_group){
                        this.setData({
                            group_detail:item_group,
                            currentGroup:item_group.group_item,
                            'groupOpt.group_id':item_group.id,
                        });
                }
                console.log('遍历了用户的所有团购,选取需要展示的团',this.data.group_detail);
                if(!this.data.groupOpt.group_id && !this.data.currentGroup.gcount){
                    util.fetch({url: config.API.ACT_FINDGROUP, data:{itemid:this.data.item_id},}).then(({data}) => {
                        if(data.ret === 0){
                            this.setData({
                                currentGroup:data.data
                            });
                            console.log('通过首页item—id获取当前产品的详情',this.data.currentGroup);
                        }
                    });
                }
            }else{
                util.fetch({url: config.API.ACT_FINDGROUP, data:{itemid:this.data.item_id},}).then(({data}) => {
                    if(data.ret === 0){
                        this.setData({
                            currentGroup:data.data
                        });
                        console.log('MY_LIST为空，通过find——group接口获取当前产品详情',this.data.currentGroup);
                    }
                });
            }
        });
    },
    toPay() {
        let that = this;
        let nickName =  wx.getStorageSync('nickName') || '';
        util.fetch({
            url: config.API.PAYLESSON,
            method: 'POST',
            data: {
                attach: 'attach',
                body: that.data.currentGroup.name,
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
                        console.log('----res----', this.data.groupOpt)
                        if (res && res['errMsg'] === 'requestPayment:ok') {
                            console.log('---------------支付成功')
                            that.setData({
                                'groupOpt.isPaid': 0,
                                showMask:true
                            })
                        }
                    },
                    'fail': function (res) {
                        console.log('----fail----', res)
                    }
                })
            }
        })
    },
    //查询是否支付过
    checkPay() {
        let that = this;
        return util.fetch({
            url: config.API.FINDLESSON,
            data: {
                unionId: encodeURIComponent(wx.getStorageSync('unionId'))
            }
        }).then(({data}) =>{
            console.log('查询当前课程权限',data);
           if(data.ret === 0){
               this.setData({'groupOpt.isPaid':0});
               console.log('groupOpt',this.data.groupOpt);
           }
        }).catch( e =>{
            console.log('查询权限失败',url,data);
        })
    },
    // 锚点链接
    scrollTo(e) {
        let id = e.currentTarget.dataset.id
        this.setData({
            toView: id,
        })
    },
    // 去开团
    gotoLesson(e){
        try {
            let {id} = e.currentTarget.dataset,
                form_id = e.detail.formId,
                openid = wx.getStorageSync('openId'),
                uid = wx.getStorageSync('unionId');
            console.log(id, openid, uid);
            util.fetch({
                method: 'POST',
                url: config.API.ACT_GROUPMYCREATE,
                data: {
                    uid,
                    openid,
                    itemid: id,
                    form_id
                }
            }).then(res => {
                console.log('开团成功',res,res.data);
                if (res.data.ret === 0 || res.data.ret === 1) {
                    if(res.data.ret === 0){
                        this.setData({
                            showMask:true
                        })
                    }
                    util.fetch({
                        url: config.API.ACT_GROUPMYDETAIL,
                        data: {
                            uid:uid,
                            id:res.data.id,
                        },
                    }).then(({data}) => {
                        console.log('当前团的详情',{data});
                        if(data.ret === 0 && data.data.length){
                            this.setData({
                                'groupOpt.group_uid':data.uid,
                                group_detail:data.data[0],
                                currentGroup:data.data[0].group_item,
                                'groupOpt.group_id':data.data[0].id,
                                'groupOpt.founder':1,
                                'groupOpt.hasJoin':1,
                                'groupOpt.isOpen':1,
                                'groupOpt.status':data.data[0].status,
                            });
                            console.log('groupOpt',this.data.groupOpt)
                            console.log('通过团的id获取当前产品的详情',this.data.group_detail);
                            this.getPtList();
                            this.getSuccessList();
                        }
                    });
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
    //去查看
    gotoDetails(e){
        this.closeMask();
        try {
            let {id} = e.currentTarget.dataset,
                form_id = e.detail.formId,
                openid = wx.getStorageSync('openId'),
                uid = wx.getStorageSync('unionId');
            console.log(id, openid, uid);
            this.setData({'groupOpt.group_id':id});
            return util.fetch({
                url: config.API.ACT_GROUPMYDETAIL,
                data: {
                    uid: uid,
                    id: id,
                },
            }).then(({data}) => {
                console.log('当前团的详情', {data});
                if (data.ret === 0 && data.data.length) {
                    this.setData({
                        'groupOpt.group_uid': data.uid,
                        group_detail: data.data[0],
                        currentGroup: data.data[0].group_item,
                        item_id: data.data[0].group_item.id,
                    });
                    this.checkPay().then((res) => {
                        this.isItem(uid).then((data) =>{
                            console.log('2222222',this.data.group_detail);
                            if(this.data.groupOpt.group_id){
                                this.judgmentIdentity(this.data.group_detail);
                            }
                            console.log(this.data.groupOpt);
                            this.getPtList();
                            this.getSuccessList();
                        });
                    })
                    console.log('通过团的id获取当前产品的详情', this.data.group_detail);
                }
            });

        } catch (err) {
            console.error('Create Group Error:', err)
        }
    },
    //获取拼团列表
    getPtList(){
        if(this.data.isShow){
            util.fetch({
                url: config.API.ACT_INCOMPLETELIST,
                data:{itemid:this.data.item_id}
            }).then(({data}) => {
                if(data.ret === 0){
                    this.setData({pt_list:data.data});
                    console.log('拼团列表pt_list',this.data.pt_list.length);
                }
                console.log('ACT_INCOMPLETELIST',data.data);
            });
        }
    },
    //已成团滚动列表
    getSuccessList(){
    if(this.data.item_id){
        util.fetch({
            url: config.API.ACT_COMPLETELIST,
            data:{itemid:this.data.item_id}
        }).then(({data}) => {
            console.log('已成团列表',data);
            if (data.ret === 0){
                let completeArr = [];
                for (let item of data.data){

                    for(let list of item.data){
                        list['name'] = item.name;
                        completeArr.push(list);
                    }
                }
                console.log(completeArr);
                this.setData({
                    pt_scccess_cnt: completeArr
                })
            }
        });
    }
},
    closeMask() {
        this.setData({
            showMask: false
        })
    },
    //点击加群gif逻辑
    joinPop(){
        this.setData({
            joinPop:false,
            joinSuccess:false
        })
    },
    showJoinPop(){
        this.setData({
            joinPop:true
        })
    },
    joinSuccess(){
        this.setData({
            joinSuccess:true
        })
    },
    copyWx(){
        let _this = this;
        wx.setClipboardData({
            data:'manylin568',
            success: function () {
                _this.joinSuccess();
            },
            fail:function (err) {
                console.log('复制失败');
            }
        })
    },
});
