const App = getApp()
const util = require('../../utils/util.js')
const common = require('../../utils/common.js')
const config = require('../../config.js')



Page({

    /**
     * 页面的初始数据
     */
    data: {
        videoData: [],
        newsData: [],
        isLoad:{
            show:true
        },
        networkStatus: {
            onLoading: false,
            error: false,
            success: false
        },
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
        teachList:[],
        joinPop:false,
        joinSuccess:false,
        currentTab: 1,
        scrollLeft: 0,
        buyPerson:[],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
      let callBackUrl = `/pages/teachList/teachList`;
        common.checkLogin(callBackUrl);
        //从本地缓存读取课程列表数据
        let teachList = wx.getStorageSync('teachList') || '';
        if (teachList){
            teachList = this.setLessonProgress(teachList);
            this.setData({
                teachList:teachList,
                'isLoad.show':false
            });
            this.getTeachList().then( res =>{
                this.buySuccess();
            });
        } else{
            this.getTeachList().then( res =>{
                this.buySuccess();
            });
        }
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
        //实时刷新当前学习进度
        let teachList = this.setLessonProgress(this.data.teachList);
        this.setData({
            teachList:teachList,
            'isLoad.show':false
        });
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
        wx.stopPullDownRefresh()
        return 'success'
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        return 'success'
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
            title:`熊市就要多学习，${nickName}向您超值推荐【${this.data.teachDetail.title}】大咖战法课程>>`,
            path:'/pages/teachList/teachList',
            imageUrl:'https://cdn.upchina.com/front/gudaka/images/2392.png'
        }
    },
    //获取课程列表数据
    getTeachList() {
        let _that = this;
        return util.fetch({
            url: config.API.ACT_VIDEO,
        }).then(({data}) => {
            if(data.ret === 0){
                data.data = this.setLessonProgress(data.data);
                _that.setData({
                    teachList:data.data,
                    'isLoad.show':false
                });
                console.log(this.data.teachList);
            }
        }).catch( e => {
            console.log('请求课程列表失败',e);
        })
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
        this.getTeachList();
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
    //跳转课程详情
    toTeachDetail(e){
        let id = e.currentTarget.dataset.id;
        let url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url:url + '?id=' + id,
        })
    },
    //购买成功数据轮播
    buySuccess(){
        let buyArr = ['〃梦醒如初゛','半世流离','半夏如烟°','半夏微涼','博枫影月','不即不离','不羡江中仙','苍茫大海','曾经沧海','尘埃未定','痴人说梦゛','错位的梦寐','淡墨文竹','蝶衣羽化','俄心永恒','烦琐事','飞蛾扑火','绯色丶浮華','浮生如梦','感觉没feel','共醉','孤城潇陌','故人江海别','观其声与色','鬼島','寒江独钓','何日重到苏澜桥','鹤居','黑羽蝶舞','花开淡墨','花落成殇','酒话','旧人不复','空城旧梦','来年秋风起','来治猩猩的你','蓝忘机','泪染倾城','良人未归','蓅哖之殇','路远马亡','没有烦恼的女孩','美妙的旋律','末世岛屿','陌上烟雨','莫玄羽','墨殇浅辰','墨羽尘曦','拟歌先敛','您可真混蛋','柠檬暖灿','浅唱蝶舞','浅色夏沫','蔷薇·花开','青衫故人','轻斟浅醉','清酒孤灯','清梦','情歌绕耳','求不得','然后离开','人生如梦','三郎','时年七月','世间万物明澈见底','似是嘲讽','谁捡了我的梦','嗣音','送舟行','俗了清风','踏晨雨燕','天涯浪人','徒留回忆','吞食回忆','挽风微凉','万花筒','妄徒之命','魏无羡','魏无羡','无结果的追','夕夏温存','夕阳光下','西洋镜','夏堇丶流年','夏慕槿苏','谢怜','心里没了光','星河','野马踏春生','一别便不再见','一丝苦笑','一夕一夏','一直狠安静','悠悠桃花香','羽之蝶幻','雨博韵潇','欲笑还颦','鸳衾','只言片语','忠贞罘渝','灼琴','浮生若梦'];
        let lessonArr = [];
        for(let item of this.data.teachList){
            lessonArr.push(item.sTitle);
        }
        let showArr = [];
        let buyPerson = [];
        for(let i = 0;i<50;i++){
            let buyNum = common.getRandom(0,100);
            let lessonNum = common.getRandom(0,this.data.teachList.length-1);
            let item = {
                'username':buyArr[buyNum],
                'lessonname':lessonArr[lessonNum],
            };
            showArr.push(item);
        }
        this.setData({buyPerson:showArr});
    },
    //更新当前课程的学习进度
    setLessonProgress(teachList){
        teachList.forEach((item, index) => {
            let learnCount = wx.getStorageSync('learn' + item.iId) || ''; //当前学习进度
            if(learnCount){
                item.learnCount = learnCount;
            }
        });
        return teachList;
    },
});
