// pages/main-music/main-music.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  onSearchClick() {
    wx.navigateTo({
      url: '/pages/detail-search/detail-search',
    })
  }
  
})