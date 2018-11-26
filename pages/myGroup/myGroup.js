const App = getApp()
const util = require('../../utils/util')
const config = require('../../config')

const pageSize = 10
let id = 0
let dayCache

Page({

  /**
   * 页面的初始数据
   */
  data: {
    listData: [],
    course: '',//课程权限
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (`${options.isRefresh}` === '1') {
      return this.onPullDownRefresh()
    }

    //课程权限验证
    util.fetch({
      url: config.API.FINDLESSON,
      data: {
        unionId: encodeURIComponent(wx.getStorageSync('unionId'))
      }
    }).then(data => {
      that.setData({
        course: data.data.ret
      })
    }).catch((err) => {

    })
    //   let myGroup = wx.getStorageSync('myGroup')
    //   if (myGroup) {
    //       this.setData({
    //           listData: myGroup,
    //           hasCache: true,
    //           networkStatus: {
    //               success: true,
    //           }
    //       })
    //   }
    this.fetchListData()

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
    this.fetchListData().then(ret => {
      if (ret === 'error') {
        dayCache = recover     // 防止重复出现日期标记
      }
    })
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
  toGroup(e) {
    console.log(e.currentTarget.dataset)
    if (e.currentTarget.dataset.id == 'teach_001') {
       wx.navigateTo({
         url: '/pages/groupDetail/groupDetail?id='+e.currentTarget.dataset.idx,
       })
    } else if (e.currentTarget.dataset.id == 'teach_004') {
      wx.navigateTo({
        url: '/pages/lessonDetail/lessonDetail?id=' + e.currentTarget.dataset.idx,
      })

    }
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

    return util.fetch({
      url: `${config.API.ACT_GROUPMYLIST}`,
      data: {
        uid: wx.getStorageSync('unionId'),
        //   type: 'create',
      }
    }).then((res) => {
      console.log(res)
      let dataList = res.data.data || []
      if (!dataList) {
        return
      }

      // 分页
      if (!res.data.isEnd) {
        util.setData(this, {
          loadMoreStatus: {
            isNoMoreData: true
          }
        })
      }
      let dataLen = dataList.length
      let preData = pageCount > 1 ? this.data.listData : []
      dataList.forEach((item, index) => {
        item['date'] = item.creater_info.create_time.slice(0, 10)
      })

      this.setData({
        listData: [...preData, ...dataList],
      })

      util.setData(this, {
        loadMoreStatus: {
          onFetch: false
        },
      })

      if (pageCount === 1) {
        if (!this.data.hasCache) {
          this.setData({
            networkStatus: {
              success: true
            }
          })
        }
        try {
          wx.setStorageSync('myGroup', dataList)
        } catch (e) {
        }
      }
      wx.stopPullDownRefresh()
      return 'success'
    }).catch((err) => {
      if (pageCount === 1) {
        util.setData(this, {
          loadMoreStatus: {
            onFetch: false,
            showLoadMoreBar: false
          }
        })
      } else {
        util.setData(this, {
          loadMoreStatus: {
            onFetch: false,
            error: true
          }
        })
      }
      wx.stopPullDownRefresh()
      return 'error'
    })
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
    this.fetchListData()
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
    this.fetchListData()
  },

})