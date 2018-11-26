// pages/Kline/Kline.js
const config = require('../../config.js')
const App = getApp()
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中'
    })
    let uid = encodeURIComponent(wx.getStorageSync('unionId')),
      getTimeStamp = new Date().getTime(),
      url1 = config.CDN + "?id=" + uid + "&timestamp=" + getTimeStamp
      console.log(url1)
    this.setData({
      url: url1
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 2500)
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
    return {
      title: '大数据+专业人工智能选股五星买点推荐强势买入机会潜...',
      path: '/pages/index/index'
    }
  },
  message(e) {
    console.log(e)
  }
})