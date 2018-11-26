/**
 * util.js
 * 
 */
'use strict';
// const Promise = require('../utils/bluebird.min');
// const Promise = require('./promise.min.js')
const polyfillObject = require('./polyfill').Object;

const util = {
  getSystemInfo() {
    return new Promise((resolve, reject) => {
      wx.getSystemInfo({
        success: (res) => {
          resolve(res);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },
  setNavigationBarTitle(title) {
    return new Promise((resolve, reject) => {
      wx.setNavigationBarTitle({
        title: 'title',
        success: () => {
          resolve();
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },
  /**
   * setData
   * 该函数会将新数据与被修改对象中的原有数据进行合并，如果新数据与原有数据相同则
   * 不调用小程序的 setData 方法，以提高性能
   * 
   * @param page {object} Page 对象，用于调用 this.setData 方法
   * @param key {string | object} 该参数接收两种参数，传字符串时更新该键名的数据，
   * 传 JSON 对象时会遍历更新对象相关数据
   * @param value {string} 需要更新的数据
   * @param isCover {bool} 是否覆盖原有数据
   */
  setData(page, key, value, isCover) {
    if (!page || !page.data) {
      console.log('util.js setData error: param page error');
      return;
    }
    if (typeof key === 'object') {
      let keys = polyfillObject.keys(key);
      keys.forEach(item => {
        if (page.data[item] === undefined) {
          console.log(`util.js setData error: cannot find ${item} Object`);
          return;
        }
        let preData;
        let nextData;
        if (isCover) {
          nextData = key[item];
        } else {
          preData = page.data[item];
          nextData = polyfillObject.assign(preData, key[item]);
        }
        page.setData({
          [item]: nextData
        });
      });
    } else if (typeof key === 'string') {
      page.setData({
        [key]: value
      });
    }
  },
  /**
   * updateData
   * 将原始数据与新数据合并，
   * @param preData {array}
   * @param newData {object}
   * @param merge {boole} 是否合并
   * @param sort {string} 排序方式 asc, desc
   */
  updateData(preData, newData, diffKey, merge, sort) {
    // console.log('util.js updateData 73: ', JSON.stringify(preData), JSON.stringify(newData));
    let nextData = [];
    let eqIndex;
    if (!preData || !newData) {
      console.log('util.js updateData 71: ', 'preData || newData error');
      return false;
    }
    if (preData.length === 0) {
      nextData.push(newData);
      return nextData;
    }
    nextData = preData;
    preData.forEach((item, index) => {
      if (diffKey) {
        if (item[diffKey] === newData[diffKey]) {
          eqIndex = index;
        }
      } else {
        // TODO 没有 diffKey 时要遍历所有数据值
        /*for (let key in item) {
            console.log('util.js  76: ', key, item[key]);
        }*/
      }
    });
    if (merge && eqIndex !== undefined) {
      newData = polyfillObject.assign(preData[eqIndex], newData);
    }
    if (sort && eqIndex !== undefined) {
      nextData.splice(eqIndex, 1);
    }
    if (sort === 'desc') {
      nextData.unshift(newData);
    } else if (sort === 'asc') {
      nextData.push(newData);
    } else {
      nextData[eqIndex] = newData;
    }
    return nextData;
  },
  routeTo(path) {
    return new Promise((resolve, reject) => {
      wx.navigateTo({
        url: path,
        success: () => {
          resolve();
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },
  fetch({
    url,
    method = 'GET',
    header = {
      'Content-Type': 'application/json'
    },
    data
  }) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: method,
        header: header,
        data: data,
        success: function(res) {
          if (res.statusCode === 200 || res.statusCode === '200') {
            resolve(res);
          } else {
            reject(res.statusCode);
          }
        },
        fail: function(err) {
          reject(err);
        }
      });
    });
  },
  getStorage({
    key
  }) {
    return new Promise((resolve, reject) => {
      wx.getStorage({
        key: key,
        success: function(res) {
          resolve(res);
        },
        fail: function(err) {
          reject(err);
        },
        complete: function(ret) {
          //resolve(ret);
        }
      });
    });
  },
  setStorage({
    key,
    data
  }) {
    return new Promise((resolve, reject) => {
      wx.setStorage({
        key: key,
        data: data,
        success: function(res) {
          resolve(res);
        },
        fail: function(err) {
          reject(err);
        }
      });
    });
  },
  removeStorage({
    key
  }) {
    return new Promise((resolve, reject) => {
      wx.removeStorage({
        key: key,
        success: function(res) {
          resolve(res);
        },
        fail: function(err) {
          reject(err);
        }
      });
    });
  },
  formatDate(date) {
    date = date.toString();
    return date.substring(0, 4).trim() + '.' + date.substring(4, 6).trim() + '.' + date.substring(6, 8).trim();
  },
  formatStockCode(codestr) {
    return codestr.substring(0, 2).trim() + '00' + codestr.substring(2).trim();
  },
  getDate: function() {
    let now = new Date();
    let month = now.getMonth() + 1;

    return {
      year: now.getFullYear(),
      month: month < 10 ? '0' + month : month,
      date: now.getDate(),
    }
  },
  inTransaction: function() {
    let open = 30 + 9 * 60 // 9:30
    let close = 30 + 11 * 60 // 11:30
    let open2 = 13 * 60 // 13:00
    let close2 = 15 * 60 // 15:00
    let dt = new Date();
    let mins = dt.getMinutes() + 60 * dt.getHours();
    // console.log(open, close, open2, close2, mins);
    if (open < mins && mins < close ||
      open2 < mins && mins < close2) {
      return true
    }
    return false;
  },
  transDate: function (unixtime){
    var dateTime = new Date(parseInt(unixtime) * 1000)
    var year = dateTime.getFullYear();
    var month = (dateTime.getMonth() + 1 < 10 ? '0' + (dateTime.getMonth() + 1) : dateTime.getMonth() + 1);
    var day = dateTime.getDate();
    var timeSpanStr = year + '-' + month + '-' + day ;
    return timeSpanStr;

  }
}

module.exports = util;