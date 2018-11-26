const App = getApp();
const util = require('../../utils/util.js');
const config = require('../../config.js');
const common = require('../../utils/common.js');
const pageSize = 10
let id = 0
let dayCache;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isIphoneX: App.globalData.isIphoneX ? true : false,
        callBackUrl: '',
        group_data: {},
        ifPermission: '', //股票池权限 0：有权限，-1无权限，-2权限到期
        course: '',//课程权限
        stock: {}, //首页股票
        newsTitle: {}, //首页新闻
        is_bind_tel: 0,
        newsTitle: [],
        pt_scccess_cnt: [], //滚动列表内容
       isNews:false,
        networkStatus: {
            onLoading: false,
            error: false,
            success: false
        },
        loadMoreStatus: {
            pageCount: 1,
            showLoadMoreBar: false,
            isNoMoreData: false,
            onFetch: false,
            error: false,
            loadingTip: '数据加载中',
            noMoreDataTip: '没有更多数据了',
            errorTip: '加载失败，请点击重试',
        },
        popId:'2392',  //心吾弹框和轮播课程id
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let isNews = wx.getStorageSync('isNews') || ''; //判断是否为首次进入小程序
        if (isNews) {} else {
            this.setData({isNews: true});
            wx.setStorageSync('isNews', true);
        }
        common.checkLogin();
        this.indexData();
    },
    bindTel:function(){
        this.setData({is_bind_tel:1})
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {},
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {},
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

        this.indexData()
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {},
    /**
     * 用户点击右上角分享
     */
    /*禁止用户手滑swiper*/
    catchTouchMove:function(res) {
        return false;
    },

    indexData() {
        let uid = encodeURIComponent(wx.getStorageSync('unionId'));
        console.log('uidddddddddddd',uid);
        let that = this;
        //验证股票池权限
        util.fetch({
            url: config.API.ACT_STOCKPERMIT,
            data: {
                unionId: uid
            }
        }).then((data) => {
            console.log(data)
            this.setData({
                ifPermission: data.data.ret
            })
            console.log(data.data.msg, this.data.ifPermission)
        });
        //首页股票数据
        wx.showLoading({
            title: '加载中',
        });
        util.fetch({
            url: config.API.ACT_FIVESTARKLINE
        }).then(({data}) => {
            if (data.ret === 0)
                that.setData({
                    stock: data.data
                })
            wx.hideLoading()
        });
        // 团购信息
        util.fetch({url: config.API.ACT_GROUP}).then(({data}) => {
                if (data.ret === 0) {
                    that.setData({
                        group_data: data.data.group_items
                    })
                }
                console.log('拼团列表',this.data.group_data)
            });
        //已成团滚动列表
        util.fetch({
            url: config.API.ACT_COMPLETELIST
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
               console.log(completeArr)
                this.setData({
                    pt_scccess_cnt: completeArr
                })
            }
        });
        //首页资讯
        Promise.all([this.newsDetail1(), this.newsDetail2(), this.newsDetail3()]).then((res) => {
            let title = []
            for (let i = 0; i < res.length; i++) {
                let str = res[i].data.toString().replace(new RegExp('(?=[^>]*(?=<))\\s+', 'g'), '')
                str = str.match(new RegExp('<div class=\"title\">([\\S|s]*?)</div>'))[1]
                title.push(str)
            }
            this.setData({
                newsTitle: title
            })
        })
        // 判断是否绑定手机号
        let unionId = wx.getStorageSync('unionId');
        if (unionId) {
            util.fetch({
                url: config.API.USER_FINDPHONE,
                data: {
                    unionId
                }
            }).then(({data}) => {
                if (data.ret === 0) {
                    this.setData({
                        is_bind_tel: 1
                    })
                } else {
                    if (data.msg === '用户不存在') {
                        App.checkLogin()
                    }
                }
            })
        }
        //获取课程列表数据
        util.fetch({url: config.API.ACT_VIDEO}).then(({data})=>{
            if(data.ret === 0){
                wx.setStorageSync('teachList', data.data)
            }
        }).catch(e =>{
            console.log('请求课程列表失败',e);
        });
        //判断当前用户拼团的状态
        wx.stopPullDownRefresh()
        return 'success';
    },
    
    newsDetail1() {
        return util.fetch({
            url: `${config.API.ACT_NEWS1}`,
        })
    },
    newsDetail2() {
        return util.fetch({
            url: `${config.API.ACT_NEWS2}`,
        })
    },
    newsDetail3() {
        return util.fetch({
            url: `${config.API.ACT_NEWS3}`,
        })
    },
    getPhoneNumber(e) {
        let that = this;
        let data = {
            sessionKey: wx.getStorageSync('sessionKey'),
            iv: encodeURIComponent(e.detail.iv),
            encryptedData: encodeURIComponent(e.detail.encryptedData),
            unionId: '',
        }
        try {
            var unionId = wx.getStorageSync('unionId')
            if (unionId) {
                data['unionId'] = unionId
            } else {
                return util.routeTo('/pages/login/login')
            }
        } catch (e) {}
        if (!data.sessionKey || !data.iv || !data.encryptedData || !data.unionId) {
            wx.showModal({
                title: '提示',
                showCancel: false,
                content: '未授权',
            })
        } else {
            // 服务端数据解密
            util.fetch({
                url: `${config.API.USER_PHONE}`,
                data: data,
            });
            this.setData({is_bind_tel:1});
            wx.navigateTo({
                url: '/pages/diagnosisSearch/diagnosisSearch'
            })
        }
    },
    //跳转至拼团详情页
    gotoDetail(e) {
        let type;//当前拼团产品类型
        let currentGroupList; //当前用户对应的当前拼团产品的团购列表
        let {id} = e.currentTarget.dataset,
            form_id = e.detail.formId;
        console.log('22',id);
        App.sendForm(form_id);
        var detailGroup = config.DETAIL_GROUP;
        Array.prototype.in_array=function(e){
            var r=new RegExp(','+e+',');
            return (r.test(','+this.join(this.S)+','));
        };
        for(var item in detailGroup){
            var list = detailGroup[item];
            for (let itemKey in list ) {
                if(list.in_array(id)){
                    type =  item;
                }
            }
        };
        console.log(type,id)
        if (type === 'pro1') {
            wx.navigateTo({
                url: `/pages/groupDetail/groupDetail?type=0&itemid=${id}`
            });
        } else if(type === 'pro2'){
            wx.navigateTo({
                url: `/pages/lessonDetail/lessonDetail?type=0&itemid=${id}`
            })
        }
    },
    gotoKline(e) {
        let formId = e.detail.formId;
        App.sendForm(formId);
        //课程权限验证
        let uid = wx.getStorageSync('unionId');
        common.fivestar(uid).then(({data}) =>{
            this.setData({
                ifPermission: data.ret
            })
            if (this.data.ifPermission === 0) {
                wx.navigateTo({
                    url: '/pages/Kline/Kline'
                })
            } else {
                wx.navigateTo({
                    url: '/pages/noKline/noKline'
                })
            }
            console.log('股票池权限',this.data.ifPermission);
        });
    },
    newsDetail(e) {
        let id = e.currentTarget.dataset.id + 1;
        let url = "https://cdn.upchina.com/acm/newsdetail" + id + "/index.html"
        wx.navigateTo({
            url: '/pages/newsDetail/newsDetail?url=' + url,
        })
    },
    popClose() {
        this.setData({
            isNews : false,
        })
    },
    toSwitch(e) {
        let url = e.currentTarget.dataset.url;
        let form_id = e.detail.formId;
        App.sendForm(form_id);
        wx.switchTab({
            url,
        })
    },
    toDetails(e){
        console.log('3333333333',this.data.is_bind_tel)
        let url = e.currentTarget.dataset.url;
        let form_id = e.detail.formId;
        App.sendForm(form_id);
        console.log(form_id)
        wx.navigateTo({
            url,
        })
    },
    //首页弹框 跳转至心吾课程详情页
    toCourse(e){
        let id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url:`/pages/teachDetail/teachDetail?id=${id}`,
        })
    },
});
