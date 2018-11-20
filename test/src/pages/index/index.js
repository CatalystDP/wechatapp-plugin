//index.js
//获取应用实例
const app = getApp()
const testUtil = require('util/test-util');
require('./img');
const img = require('../../img/webpack-logo.jpeg?from=page/index');
// const img = require('../../img/webpack-logo.jpeg');
console.log('img in page/index/index.js ',img);
// const util = require('util/util');
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    subPageBtns:[
      '/packageA/pages/pageA1/pageA1',
      '/packageA/pages/pageA2/pageA2',
      '/packageB/pages/pageB1/pageB1',
      '/packageB/pages/pageB2/pageB2'
    ]
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    testUtil.f('page/index')
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  goSub(e) {
    wx.navigateTo({
      url:e.target.dataset.url
    });
  }
})
