// pages/main-music/main-music.js
import { getMusicBanner, getPlaylistDetail, getSongMenuList } from '../../services/music'
import recommendStore from "../../store/recommendStore"
import rankingStore, { rankingsMap } from "../../store/rankingStore"
import { _throttle } from '../../utils/tools'
import querySelect from '../../utils/query-select'
// 节流处理
const querySelectThrottle = _throttle(querySelect, 100)

Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners: [],
    bannerHeight: 130,

    recommendSongs: [],  //推荐歌曲

    // 歌单数据
    hotMenuList: [],
    recMenuList: [],

    // 巅峰榜数据
    isRankingData: false,
    rankingInfos: {}

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.fetchMusicBanner()
    this.fetchSongMenuList()
    // this.fetchRecommendSongs()
    // 发起action
    recommendStore.onState("recommendSongInfo", this.handleRecommendSongs)
    recommendStore.dispatch("fetchRecommendSongsAction")

    // rankingStore.onState("upRanking", this.handleUpRanking)
    // rankingStore.onState("newRanking", this.handleNewRanking)
    // rankingStore.onState("originRanking", this.handleOriginRanking)
    for (const key in rankingsMap) {
      rankingStore.onState(key, this.getRankingHanlder(key))
    }
    rankingStore.dispatch("fetchRankingDataAction")
  },

  // 网络请求的方法封装
  async fetchMusicBanner() {
    const res = await getMusicBanner()
    this.setData({ banners: res.banners })
  },
  // 请求歌单数据
  fetchSongMenuList() {
    getSongMenuList().then(res => {
      this.setData({ hotMenuList: res.playlists })
    })
    getSongMenuList("华语").then(res => {
      this.setData({ recMenuList: res.playlists })
    })
  },

  // 动态计算图片高度后设置到swiper上
  onBannerImageLoad(event) {
    querySelectThrottle(".banner-image").then(res => {
      this.setData({ bannerHeight: res[0].height })
    })
  },
  // 点击搜索框
  onSearchClick() {
    wx.navigateTo({
      url: '/pages/detail-search/detail-search',
    })
  },
  // 推荐歌曲点击更多
  onRecommendMoreClick() {
    const id = 3778678
      wx.navigateTo({
        url: `/pages/detail-song/detail-song?type=recommend&id=${id}`,
      })
  },
  
  // ====================== 从Store中获取数据 ======================
  handleRecommendSongs(value) {
    // console.log("value",value)
    if (!value.tracks) return
    this.setData({ recommendSongs: value.tracks.slice(0, 6) })
  },
  // handleNewRanking(value) {
  //   // console.log("新歌榜:", value);
  //   if (!value.name) return
  //   this.setData({ isRankingData: true })
  //   const newRankingInfos = { ...this.data.rankingInfos, newRanking: value }
  //   this.setData({ rankingInfos: newRankingInfos })
  // },
  // handleOriginRanking(value) {
  //   // console.log("原创榜:", value);
  //   if (!value.name) return
  //   this.setData({ isRankingData: true })
  //   const newRankingInfos = { ...this.data.rankingInfos, originRanking: value }
  //   this.setData({ rankingInfos: newRankingInfos })
  // },
  // handleUpRanking(value) {
  //   // console.log("飙升榜:", value);
  //   if (!value.name) return
  //   this.setData({ isRankingData: true })
  //   const newRankingInfos = { ...this.data.rankingInfos, upRanking: value }
  //   this.setData({ rankingInfos: newRankingInfos })
  // },
  getRankingHanlder(ranking) {
    return value => {
      if (!value.name) return
      const newRankingInfos = { ...this.data.rankingInfos, [ranking]: value }
      this.setData({ rankingInfos: newRankingInfos })
      this.setData({ isRankingData: true })
        
      // 停止下拉刷新
      wx.stopPullDownRefresh()
    }
  },

  onPullDownRefresh() {
    this.fetchMusicBanner()
    this.fetchSongMenuList()
    recommendStore.dispatch("fetchRecommendSongsAction")
    rankingStore.dispatch("fetchRankingDataAction")
  },
})