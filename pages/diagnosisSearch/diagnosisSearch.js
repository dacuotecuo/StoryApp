// pages/diagnosis/diagnosis.js
const config = require('../../config');
Page({
  /**
   * 页面的初始数据
   */
  data: {
      url:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      console.log(options);
      if (options.path) {
          this.setData({url:decodeURIComponent(options.path)});
      }else{
          this.setData({url:config.API.ZNZGURL})
      }
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
  onShareAppMessage: function (opt) {

   let path = opt.webViewUrl || '';
   console.log('333333333333333333333',path);
   if(path){
       return {
           title: '邀请你来股大咖，学习大咖精品课程，还能0元拿特权，点击领取>>',
           path:`/pages/diagnosisSearch/diagnosisSearch?path=${encodeURIComponent(path)}`
       }
   }else{
       wx.showToast({
           title: '分享失败，请退出重试',
           icon: 'none',
           duration: 2000
       })
   }
  }
})