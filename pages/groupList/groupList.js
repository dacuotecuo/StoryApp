const App = getApp()
const util = require('../../utils/util.js')
const config = require('../../config.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        listData: [],
        myGroup: [],//我的拼团
        course: '',//课程权限
        group_uid:'',
        group_detail:'',
        isPaid:-1,
        networkStatus: {
            onLoading: false,
            error: false,
            success: false
        },
        joinPop:false,
        joinSuccess:false,
        loadMoreStatus: {
            pageCount: 1,
            showLoadMoreBar: true,
            isNoMoreData: false,
            onFetch: false,
            error: false,
            loadingTip: '数据加载中',
            noMoreDataTip: '没有更多数据了',
            errorTip: '加载失败，请点击重试',
        },
        resultMap: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('课程权限', options.course);
        this.setData({
            course: options.course
        })
        //我的团购列表
        let uid = encodeURIComponent(wx.getStorageSync('unionId'))
        util.fetch({
            url: `${config.API.ACT_GROUPMYLIST}`,
            data: {
                uid,
            }
        }).then((res) => {
            let data = res.data
            console.log('mygroup', res.data)
            if (data.ret === 0) {
                if (data.data.length !== 0) {
                    this.setData({
                        myGroup: res.data.data
                    })
                }
            }
        }).catch((err) => {
        });
        //加载列表
        this.fetchListData().then( data => {
            this.personGroup().then(({data}) => {
                console.log('我的团购列表',data);
                if(data.data && data.data.length){
                    let pgData = data.data;  //我的拼团列表
                    let result = [],complateRes = [], resultMap = {}, doing = {}, done = [];
                    let group_detail = [];
                    // 判断未成团,优先选择未成团
                    if (pgData) {
                        result = pgData.filter(item => item.status === 'incomplete');
                        if(result && result.length){
                            result.forEach(item => doing[item.group_item.id] = item.id);
                        }
                        // 组成字典
                        resultMap = {
                            doing,
                            done
                        };
                        this.setData({
                            resultMap: resultMap,
                            group_uid:data.uid,
                            myGroup:pgData
                        });
                        console.log('resultMap', resultMap, Object.keys(resultMap.doing).length,this.data.group_uid,this.data.myGroup);
                    }
                }
            }).catch(err => {
                console.log('promise all err:', err)
            }).catch(e => {
                console.log(e);
            })
        })
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
        if (this.data.loadMoreStatus.onFetch) {
            return
        }
        let recover = dayCache
        dayCache = undefined
        id = 0
        util.setData(this, {
            loadMoreStatus: {
                pageCount: 1,
                isNoMoreData: false,
                onFetch: false,
                showLoadingStatus: false,
            },
        })
        // this.fetchListData().then(ret => {
        //     if (ret === 'error') {
        //         dayCache = recover     // 防止重复出现日期标记
        //     }
        // })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.fetchNextData()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return config.SHARE_CONFIG.DEFAULT
    },
    personGroup: function () {
        return util.fetch({
            url: `${config.API.ACT_GROUPMYLIST}`,
            data: {
                uid: wx.getStorageSync('unionId')
            }
        })
    },
    fetchListData: function () {
        let pageCount = this.data.loadMoreStatus.pageCount
        if (this.data.loadMoreStatus.onFetch) {
            return
        }

        util.setData(this, {
            loadMoreStatus: {
                showLoadMoreBar: pageCount > 1 ? true : false,
                onFetch: true,
                error: false,
            }
        })
        return util.fetch({url: `${config.API.ACT_GROUP}`,}).then( ({data}) => {
            if(data.data.group_items && data.data.group_items.length){
                let ltData = data.data.group_items; //团购列表
                console.log('我的产品列表',ltData);
                ltData.forEach((item, index) => {
                    item['date'] = item.start.slice(0, 10)
                });
                this.setData({
                    listData: [...ltData],
                });
            }
            console.log('产品列表222', this.data.listData);
        }).catch(e =>{
           console.log(e)
        });

    },
    // 获取下页数据
    fetchNextData() {
        if (this.data.loadMoreStatus.isNoMoreData) {
            return
        }
        if (this.data.loadMoreStatus.onFetch) {
            return
        }
        util.setData(this, {
            loadMoreStatus: {
                pageCount: this.data.loadMoreStatus.pageCount + 1,
            }
        })
        // this.fetchListData()
    },
    networkErrorRefresh() {
        util.setData(this, {
            loadMoreStatus: {
                pageCount: 1,
                showLoadMoreBar: false,
                isNoMoreData: false,
                onFetch: false,
                error: false,
            }
        })
        // this.fetchListData()
    },
    // 跳转不做请求
    navByurl(e) {
        let id = e.currentTarget.dataset.id || '',
            idx = e.currentTarget.dataset.idx,
            form_id = e.detail.formId,
            type;
        console.log(id,idx);
        App.sendForm(form_id);
        var detailGroup = config.DETAIL_GROUP;
        Array.prototype.in_array=function(e){
            var r=new RegExp(','+e+',');
            return (r.test(','+this.join(this.S)+','));
        };
        for(var item in detailGroup){
            var list = detailGroup[item];
            for (let itemKey in list ) {
                if(list.in_array(idx)){
                    type = item;
                }
            }
        };
        console.log(type,idx)
        if (type === 'pro1') {
            wx.navigateTo({
                url: `/pages/groupDetail/groupDetail?type=0&itemid=${idx}&id=${id}`
            });
        } else if(type === 'pro2'){
            wx.navigateTo({
                url: `/pages/lessonDetail/lessonDetail?type=0&itemid=${idx}&id=${id}`
            })
        }
    },
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
})
