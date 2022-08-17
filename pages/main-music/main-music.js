// pages/main-music/main-music.js
import { getMusicBanner } from '../../services/music'
import { _throttle } from '../../utils/tools'
import querySelect from '../../utils/query-select'
const querySelectThrottle = _throttle(querySelect, 100)

Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners: [],
    bannerHeight: 0,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.fetchMusicBanner()

  },

  // 网络请求的方法封装
  async fetchMusicBanner() {
    const res = await getMusicBanner()
    this.setData({ banners: res.banners })
  },


  onBannerImageLoad(event) {
    querySelectThrottle(".banner-image").then(res => {
      this.setData({ bannerHeight: res[0].height })
    })
  },

  onSearchClick() {
    wx.navigateTo({
      url: '/pages/detail-search/detail-search',
    })
  }
  
})