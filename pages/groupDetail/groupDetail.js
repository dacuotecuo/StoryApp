const App = getApp()
const common = require('../../utils/common.js')
const util = require('../../utils/util.js')
const config = require('../../config.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isIphoneX: false,
        isShow:false,
        pt_scccess_cnt:[],//已成团列表
        pt_list:[], //可拼团列表
        toView: '',
        group_detail: {},
        join_groupid:'',
        now: (new Date().getMonth() + 1) + '月' + new Date().getDate() + '日',
        left_time: '00:00:00',
        currentGroup:{  //当前产品的详情
            gcount:0,  //成团人数
            suc_count:0, //成团个数
            total:0, //宝贝总数
            surplus:0,//剩余个数
            pic:'',
            price:'', //价格
            start:'', //开始时间
            status:1, //当前产品状态
        },
        myGroup: [],//我的拼团列表
        group_uid: '',
        item_id:'',  //当前产品的id
        showMask: false,
        wxShow: false,
        eleShow: false,
        joinPop:false,
        joinSuccess:false,
        groupOpt:{
            founder: 0, //是否为创建者
            hasJoin:0, // 是否当前团的成员  0：否 1：是
            isJoined:0, //是否拼过团 0 || 1   每人只能加团一次
            status:'incomplete',  //是否已成团 incomplete:未成 complete：已成
            type:'',  //判断来源渠道  0：首页   1：0元购  空：分享或者消息通知
            group_id: '',  //团的id
        },
     },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('-----groupDetail options ------', options)
        console.log('数据', this.data)
        // 获取转发详细信息
        this.setData({
            'groupOpt.group_id': options.id || '',
            group_uid: options.uid || '',
            'groupOpt.type':options.type || '',
            item_id:options.itemid || '',
        });
        let id = this.data.groupOpt.group_id,
            uid = this.data.group_uid,
            item_id = this.data.item_id,
            type = this.data.groupOpt.type,
            callBackUrl = `/pages/groupDetail/groupDetail&id=${id}&uid=${uid}&itemid=${item_id}&type=${type}`;
        common.checkLogin(callBackUrl);
        this.setData({
            isIphoneX: App.globalData.isIphoneX ? true : false,
        })
        // 五星股票池权限认证
        let unionId = encodeURIComponent(wx.getStorageSync('unionId'));
        if(unionId){
            common.fivestar(unionId).then(data => {
                if(data.ret === 0){
                    this.setData({wxShow:true})
                }
            })
        }
        // 是否使用带 shareTicket 的转发
        wx.showShareMenu({
            withShareTicket: true,
            success() {
                console.log('使用带 shareTicket 的转发')
            }
        });
        // 获取当前产品的详细数据
        this.getGroupDetail().then( res => {
            this.isFightGroup().then( data => {
                /*
                * 1、判断用户有没有拼过团
                * 2、判断用户身份
                * 3、设置团的状态
                * */
                let groupDetail;
                console.log('1111',this.data.groupOpt.group_id);
                if(this.data.groupOpt.group_id){
                    groupDetail = this.data.group_detail;
                }else{
                    let myGroup = this.data.myGroup;
                    console.log('2222',myGroup);
                    if(myGroup && myGroup.length){  //我的团购列表  必然已参团或已成团
                        if(myGroup.length < 2  && myGroup[0].group_item.id === this.data.item_id){
                            groupDetail = myGroup[0];
                        }else{
                            for(let item of myGroup){
                                console.log('myGroup',item)
                                console.log('hhhhhhhhh',this.data.item_id,item.group_item.id);
                                if(this.data.item_id === item.group_item.id){
                                    if(item.status === 'incomplete' ){  //正在进行的拼团
                                        console.log('dddddddddddddd',item.creater_info.uid,this.data.group_uid)
                                        if(item.creater_info.uid === this.data.group_uid){  //创建者
                                            groupDetail = item;
                                            break;
                                        }else{
                                            groupDetail = item;
                                        }
                                    }else{
                                        groupDetail = item;
                                    }
                                }
                            }
                        }
                    }
                }
                if(groupDetail){
                    this.setData({
                        group_detail:groupDetail,
                        'groupOpt.group_id':groupDetail.id
                    });
                    this.isMenber(this.data.group_uid,groupDetail.menbers);
                    this.judgmentIdentity(groupDetail);
                }
                console.log('筛选获取的当前团的列表',groupDetail);
                this.setData({isShow:true});
                if(this.data.groupOpt.group_id !== this.data.join_groupid && this.data.groupOpt.isJoined === 1 && this.data.groupOpt.founder !== 1){
                    this.setData({showMask:true})
                }
                console.log(this.data.groupOpt);

                this.getPtList();
                this.getSuccessList();
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
        this.setData({
            eleShow: true,
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
    onShareAppMessage: function (options) {
        let id = this.data.groupOpt.group_id,
            uid = encodeURIComponent(wx.getStorageSync('unionId'))
        let data = {
            //title: '99%的人都不知道的买卖点神器！速抢！免费解锁牛股！',
            title: this.data.currentGroup.desc,
            path: `/pages/groupDetail/groupDetail?id=${id}&uid=${uid}`,
            success: function (res) {
                util.fetch({
                    url: `${config.API.USER_SHARESTAT}`,
                    data: {
                        userName: uid,
                        title: '五星股票池',
                    },
                }).then((retData) => {
                    console.log('转发成功', retData)
                }).catch((err) => {});
            },
            fail: function (res) {
                console.log('转发失败', res)
            },
            complete: function (res) {
                console.log('转发', res)
            }
        }

        return data;
    },
    catchTouchMove:function(res) {
        return false;
    },
    /*
    * 当有group_id  代表分享或者消息通知进来的，可以直接获取当前团的信息
    * 没有group_id,则需要根据item_id 获取当前产品的详情，继而获取当前用户的拼团，来筛选当前团的信息
    * */
    getGroupDetail(){
        let unionid =  encodeURIComponent(wx.getStorageSync('unionId'));
        if(this.data.groupOpt.group_id){ //通过分享或消息通知打开的页面，可以直接显示当前团的信息
            return util.fetch({
                url: config.API.ACT_GROUPMYDETAIL,
                data: {
                    uid:unionid,
                    id:this.data.groupOpt.group_id,
                },
            }).then(({data}) => {
                console.log('当前团的详情',data);
                if(data.ret === 0 && data.msg === 'OK'){
                    this.setData({
                        group_uid:data.uid,
                        group_detail:data.data[0],
                        currentGroup:data.data[0].group_item,
                        item_id:data.data[0].group_item.id,
                    });
                    console.log('通过团的id获取当前产品的详情',this.data.currentGroup);
                }
            });
        }else{
            if(this.data.item_id){  //从首页点进来的用户
                return util.fetch({url: config.API.ACT_FINDGROUP, data:{itemid:this.data.item_id},}).then(({data}) => {
                    if(data.ret === 0){
                        this.setData({
                            currentGroup:data.data
                        });
                        console.log('通过首页item—id获取当前产品的详情',this.data.currentGroup);
                    }
                });
            }
        }
    },
    //设置团长或者新人，未成团或已成团
    judgmentIdentity(item){
        if(item){
            if(item.creater_info.uid === this.data.group_uid){
                this.setData({'groupOpt.founder': 1});
            }else{
                this.setData({'groupOpt.founder': 0});
            }
            this.setData({'groupOpt.status': item.status})
        }
    },
    //判断用户是否在当前团中
    isMenber(uid,menbers){
        if(menbers && menbers.length>0){
            for(let item of menbers){
                if(uid === item.uid){
                    this.setData({
                        'groupOpt.hasJoin':1,
                        'groupOpt.isJoined':1
                    });
                    break;
                }
            }
        }
    },
    //判断当前项目当前用户有没有拼过团
    isFightGroup(){
        let unionid =  encodeURIComponent(wx.getStorageSync('unionId'));
        return util.fetch({url: `${config.API.ACT_GROUPMYLIST}`, data: {uid:unionid}}).then(({data})=>{
            if(data.ret === 0){
                this.setData({
                    group_uid:data.uid,
                    myGroup:data.data
                });
                for(let list of data.data){
                    let menberList = list.menbers;
                    console.log('listtttttttttt',list);
                    if(list.menbers.length){
                        for(let item of menberList){
                            console.log('itemmmmmmmmmm',item);
                            /*同种产品下只能拼一次团*/
                            if(this.data.group_uid === item.uid && this.data.currentGroup.id === list.group_item.id){
                                this.setData({
                                    'groupOpt.isJoined':1,
                                    join_groupid:list.group_item.id
                                });
                                console.log('当前用户在哪个团里拼过团',item);
                                break;
                            }
                        }
                    }
                }
                console.log('判断当前用户在本产品有没有拼过团',this.data.groupOpt);
            }
        });
    },
    // 加团
    join(e) {
        let form_id = e.detail.formId;
        let id = e.currentTarget.dataset.id;
        console.log(id)
        // 加入团购
        let data = {
            uid: wx.getStorageSync('unionId'),
            openid: wx.getStorageSync('openId'),
            groupid: id,
            form_id
        }
        console.log('加团',data);
        if (!data.uid || !data.openid || !data.groupid) {
            wx.showModal({
                title: '提示',
                showCancel: false,
                content: '参数错误',
            })
        } else {
            this.setData({
                'groupOpt.group_id':data.groupid
            })
            util.fetch({
                method: "POST",
                url: `${config.API.ACT_GROUPMYADD}`,
                data: data,
            }).then((retData) => {
                if(retData.data.ret === -1){

                }else{
                    console.log('-----加入团购', retData);
                    this.getGroupDetail().then( res => {
                        this.isFightGroup().then( data => {
                            /*
                            * 1、判断用户有没有拼过团
                            * 2、判断用户身份
                            * 3、设置团的状态
                            * */
                            let groupDetail;
                            if(this.data.groupOpt.group_id){
                                groupDetail = this.data.group_detail;
                            }
                            this.setData({
                                group_detail:groupDetail,
                                'groupOpt.group_id':groupDetail.id
                            });
                            console.log('筛选获取的当前团的列表',groupDetail);
                            this.isMenber(this.data.group_uid,groupDetail.menbers);
                            this.judgmentIdentity(groupDetail);
                            this.getPtList();
                            this.getSuccessList();
                            console.log(this.data.groupOpt);
                            if(retData.data.ret === 0){
                                this.setData({
                                    showMask: true,
                                    'groupOpt.isPaid':0
                                })
                            }
                            if(retData.data.ret === 2){ //当前团已满
                                this.setData({showMask:true});
                            }
                        })
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
    toPay() {
        let that = this;
        let nickName =  wx.getStorageSync('nickName') || '';
        util.fetch({
            url: config.API.PAYSTOCK,
            method: 'POST',
            data: {
                attach: 'attach',
                body: that.data.currentGroup.name,
                openId: encodeURIComponent(wx.getStorageSync('openId')),
                unionId: encodeURIComponent(wx.getStorageSync('unionId')),
                nickName:encodeURIComponent(nickName),
            }
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
                            that.setData({
                                wxShow: true
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
    // 锚点链接
    scrollTo(e) {
        let id = e.currentTarget.dataset.id
        this.setData({
            toView: id,
        })
    },
    // 去开团
    gotoCreate(e) {
        try {
            let {id} = e.currentTarget.dataset,
                form_id = e.detail.formId,
                openid = wx.getStorageSync('openId'),
                uid = wx.getStorageSync('unionId');
            console.log(e.currentTarget.dataset)
            util.fetch({
                method: 'POST',
                url: config.API.ACT_GROUPMYCREATE,
                data: {
                    uid,
                    openid,
                    itemid: id,
                    form_id
                }
            }).then(({data}) => {
                console.log('开团的回包',data);
                /**
                 * {ret: 0, msg: "OK", id: "800665970"}
                 */
                if (data.ret === 0 || data.ret === 1) {
                    this.closeMask();
                    this.setData({
                        'groupOpt.group_id':data.id
                    })
                    this.getGroupDetail().then( res => {
                        this.isFightGroup().then( data => {
                            /*
                            * 1、判断用户有没有拼过团
                            * 2、判断用户身份
                            * 3、设置团的状态
                            * */
                            let groupDetail;
                            if(this.data.groupOpt.group_id){
                                groupDetail = this.data.group_detail;
                            }
                            this.setData({
                                group_detail:groupDetail,
                                'groupOpt.group_id':groupDetail.id
                            });
                            console.log('筛选获取的当前团的列表',groupDetail);
                            this.isMenber(this.data.group_uid,groupDetail.menbers);
                            this.judgmentIdentity(groupDetail);
                            console.log(this.data.groupOpt);
                            this.setData({showMask:true});
                            this.getPtList();
                            this.getSuccessList();
                        })
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
    closeMask() {
        this.setData({
            showMask: false
        })
    },
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
                console.log(this.data);
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
    closeWx() {
        this.setData({
            wxShow: false
        })
    },
    gotoDetails(e){
        try {
            let {id} = e.currentTarget.dataset,
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
            }).then(({data}) => {
                /**
                 * {ret: 0, msg: "OK", id: "800665970"}
                 */
                if (data.ret === 0 || data.ret === 1) {
                    this.closeMask();
                    this.setData({
                        'groupOpt.group_id':data.id
                    })
                    if(data.ret === 0){
                        this.setData({showMask:true});
                    }
                    this.getGroupDetail().then( res => {
                        this.isFightGroup().then( data => {
                            /*
                            * 1、判断用户有没有拼过团
                            * 2、判断用户身份
                            * 3、设置团的状态
                            * */
                            let groupDetail;
                            if(this.data.groupOpt.group_id){
                                groupDetail = this.data.group_detail;
                            }
                            this.setData({
                                group_detail:groupDetail,
                                'groupOpt.group_id':groupDetail.id
                            });
                            console.log('筛选获取的当前团的列表',groupDetail);
                            this.isMenber(this.data.group_uid,groupDetail.menbers);
                            this.judgmentIdentity(groupDetail);
                        })
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
    //入群gif的逻辑
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
    goStockPond(e){
        wx.navigateTo({
            url: `/pages/Kline/Kline`
        });
    },
});
