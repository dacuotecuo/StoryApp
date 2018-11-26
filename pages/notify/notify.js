// pages/notify/notify.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        id:'',
        itemId:'',
        url:[]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        this.setData({
            id:options.id,
            itemId:options.itemId
        })
        this.toGroup()
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
    onShareAppMessage: function () {

    },
    toGroup(){
        console.log(123)
        if(this.data.id && this.data.itemId){
            if(this.data.itemId === 'teach_001'){
                wx.redirectTo({
                    url: '/pages/groupDetail/groupDetail?id='+this.data.id,
                })
            } else if (this.data.itemId === 'teach_004'){
                wx.redirectTo({
                    url: '/pages/lessonDetail/lessonDetail?id=' + this.data.id,
                })
            }
        }
    }
})