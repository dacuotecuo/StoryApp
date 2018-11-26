const App = getApp();
const util = require('../../utils/util.js');
const config = require('../../config.js');
const common = require('../../utils/common.js');
const teachAudio = wx.createInnerAudioContext();
const WxParse = require('../../wxParse/wxParse.js');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        networkStatus: {
            onLoading: false,
            error: false,
            success: false
        },
        teachId:'',//课程id
        id:'', //章节id
        videoDetail:'', //视频详情
        subtitle:'',  //课程标题
        mediaType:1, //音视频类型
        audioImg:'', //音频封面
        status:'pause',//音频的状态
        currentTime: '00:00', //当前的进度
        duration: '00:00', //总进度
        progress: 0, //进度条
        sliderMax:0, //进度条的总长度
        audioLoad:false,
        isShow:false,
        prevDisable:'',//上一章节到头了
        nextDisable:'',//下一章节到头了

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log('观看视频参数',options);
        let _that = this;
        let teachImg = wx.getStorageSync('teachImg');
       if(options){
           this.setData({
               teachId:options.kcid,
               id:options.id,
               subtitle:options.subtitle,
               teachImg:teachImg
           });
       }
       this.isHeadTail();
       this.getVideoDetail().then(({data}) =>{
            if(data.ret === 0){
                console.log(data)
                this.setData({
                    videoDetail:data.data,
                    mediaType:data.data.mediatype,
                    isShow:true
                });
                let contentText = data.data.content;
                WxParse.wxParse('contentText','html',contentText,_that,0);
                if(this.data.mediaType === 2 && this.data.videoDetail){
                    teachAudio.src = this.data.videoDetail.url;
                }
            }else{
                wx.showToast({
                    title: '获取视频失败，请退出重试',
                    icon: 'none',
                    duration: 2000
                })
            }
       }).catch(err => {
           console.log(err);
           wx.showToast({
               title: '获取视频失败，请退出重试',
               icon: 'none',
               duration: 2000
           })
       });
       //音频播放
       teachAudio.onPlay(() => {
           teachAudio.obeyMuteSwitch = false;
           this.setData({audioLoad:false});
           teachAudio.onTimeUpdate(() =>{
               if(teachAudio.duration){
                   let sumTime = this.MillisecondToDate(teachAudio.duration * 1000);
                   let progress = (100 / teachAudio.duration) * 100;
                   let currentTime = this.MillisecondToDate(teachAudio.currentTime * 1000);
                   _that.setData({
                      duration:sumTime,
                      progress:teachAudio.currentTime.toFixed(),
                      currentTime:currentTime,
                      sliderMax:teachAudio.duration.toFixed()
                  })
               }
           });
       });
       teachAudio.onEnded(() => {
            //当前章节播放完毕，自动播放下一章
            _that.setData({
                duration:"00:00",
                progress:0,
                currentTime:"00:00",
                sliderMax:0,
                status:'pause'
            });
            _that.autoPlay('next');
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
        teachAudio.stop();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {},
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        let nickName =  wx.getStorageSync('nickName') || '';
        if(nickName){
            nickName += '@';
        }
        return {
            title:`熊市就要多学习，${nickName}向您超值推荐${this.data.subtitle}大咖战法课程>>`,
            path:`/pages/teachDetail/teachDetail?id=${this.data.teachId}`,
            imageUrl:`https://cdn.upchina.com/front/gudaka/images/${this.data.teachId}.png`
        }
    },
    //获取视频详情
    getVideoDetail(){
        let unionId =  encodeURIComponent(wx.getStorageSync('unionId'));
        return util.fetch({
            url:config.API.ACT_VIDEOURL,
            data:{
                kcid:this.data.teachId,
                id:this.data.id,
                unionId:unionId
            }
        });
    },
    //音频播放暂停
    clickAudio(e){
        this.setData({audioLoad:true});
        let status = e.currentTarget.dataset.status;
        if(status === 'pause'){
            this.setData({status:'play'});
            teachAudio.play();
        }else{
            this.setData({status:'pause'});
            teachAudio.pause();
        }
    },
    timeSliderChanged(e){
        let value = e.detail.value;
        teachAudio.seek(value);
    },
    //处理视频播放时长
    MillisecondToDate(msd) {
        var time = parseFloat(msd) / 1000;
        if (null != time && "" != time) {
            if (time > 60 && time < 60 * 60) {
                time = parseInt(time / 60.0) + ":" + parseInt((parseFloat(time / 60.0) -
                    parseInt(time / 60.0)) * 60);
            }
            else if (time >= 60 * 60 && time < 60 * 60 * 24) {
                time = parseInt(time / 3600.0) + ":" + parseInt((parseFloat(time / 3600.0) -
                    parseInt(time / 3600.0)) * 60) + ":" +
                    parseInt((parseFloat((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60) -
                        parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60)) * 60);
            }
            else {
                if(parseInt(time) < 10){
                    time = '0:' + parseInt(time);
                }else{
                    time = '0:' + parseInt(time);
                }
            }
        }
        var  timeArr = time.toString().split(':');
        var newsArr = [];
        timeArr.map(function (item, index) {
            if(Number(item) < 10){
                var str  = '0' + item;
                newsArr.push(str);
            }else{
                newsArr.push(item);
            }
        });
        time = newsArr[0] + ':' + newsArr[1];
        return time;
    },
    //自动播放下一章节
    autoPlay(direction){
        console.log(direction)
        let _that = this;
        let sectionArr = wx.getStorageSync(_that.data.teachId) || [];
        let learnCount = _that.getMyLearn(_that.data.id,direction) || [];
        let index = 0;
        if(_that.data.prevDisable && direction === 'prev'){
            return false;
        }
        if(_that.data.nextDisable && direction === 'next'){
            return false;
        }
        if(learnCount){
            index = learnCount.index;
            if(index === sectionArr.length -1){
                _that.setData({nextDisable:'disabled'})
            }else{
                _that.setData({nextDisable:''})
            }
            if(index === 0){
                _that.setData({prevDisable:'disabled'})
            }else{
                _that.setData({prevDisable:''})
            }
        }
        //获取下一章节的课程id
        let nextId = learnCount.id || '';
       if(nextId && index < sectionArr.length){
           _that.setData({id:nextId});
           let unionId =  encodeURIComponent(wx.getStorageSync('unionId'));
           util.fetch({
               url:config.API.ACT_VIDEOURL,
               data:{
                   kcid:_that.data.teachId,
                   id:nextId,
                   unionId:unionId
               }
           }).then(({data}) =>{
               if(data.ret === 0){
                   _that.setData({
                       videoDetail:data.data,
                       mediaType:data.data.mediatype,
                       id:nextId
                   });
                   let contentText = data.data.content;
                   WxParse.wxParse('contentText','html',contentText,_that,0);
                   if(this.data.mediaType === 2 && this.data.videoDetail){
                       teachAudio.src = _that.data.videoDetail.url;
                       _that.setData({status:'play',audioLoad:true});
                       teachAudio.play();
                   }
               }else{
                   wx.showToast({
                       title: '获取视频失败，请退出重试',
                       icon: 'none',
                       duration: 2000
                   })
               }
           }).catch( err =>{
               wx.showToast({
                   title: '获取视频失败，请退出重试',
                   icon: 'none',
                   duration: 2000
               })
           });
       }else{
           teachAudio.pause();
       }
    },
    //更新章节
    getMyLearn(id,direction){
        let sectionArr = wx.getStorageSync(this.data.teachId) || {};
        let learnCount = {};
        if(sectionArr){
            for(var i = 0; i<sectionArr.length;i++){
                let item = sectionArr[i];
                if(id == item.id){
                    if(direction === 'prev'){
                        learnCount = sectionArr[i-1];
                    }else{
                        learnCount = sectionArr[i+1];
                    }
                    break;
                }
            }
        }
        if(learnCount){
            wx.setStorageSync('learn'+ this.data.teachId,learnCount);
        }
        console.log(learnCount)
        return learnCount;
    },
    //首次进入页面，判断当前章节是否为头尾两节，从而置灰前进后退按钮
    isHeadTail(){
        let sectionArr = wx.getStorageSync(this.data.teachId) || {};
        let id = this.data.id || '';
        let lessonIndex;
        if(!id) return false;
        sectionArr.forEach((item,index) => {
           if(item.id == id){
               console.log(item)
               lessonIndex = item.index;
           }
        });
        console.log(id,lessonIndex)
        if(lessonIndex == 0){
            this.setData({prevDisable:'disabled'})
        }
        if(lessonIndex == sectionArr.length -1){
            this.setData({nextDisable:'disabled'})
        }
    },
    toPrev(e){
        this.autoPlay('prev');
    },
    //播放下一章节
    toNext(e){
        this.autoPlay('next');
    },
})
