// pages/detail-song/detail-song.js
import recommendStore from "../../store/recommendStore"
import rankingStore from "../../store/rankingStore"
import { getPlaylistDetail } from "../../services/music"

Page({
  data: {
    type: "ranking",
    key: "newRanking",
    id: "",

    songInfo: {}
  },
  onLoad(options) {
    // 1.确定获取数据的类型
    // type: ranking -> 榜单数据
    // type: recommend -> 推荐数据
    const type = options.type
    // this.data.type = type
    this.setData({ type })

    // 获取store中榜单数据
    if (type === "ranking") {
      const key = options.key
      this.data.key = key
      rankingStore.onState(key, this.handleRanking)
    } else if (type === "recommend") {
      this.data.key = "recommendSongInfo"
      recommendStore.onState(this.data.key, this.handleRanking)
    } else if (type === "menu") {
      const id = options.id
      this.data.id = id
      this.fetchMenuSongInfo()
    }
  },

  async fetchMenuSongInfo() {
    const res = await getPlaylistDetail(this.data.id)
    this.setData({ songInfo: res.playlist })
  },

  handleRanking(value) {
    console.log("value",value)
    if(!value.tracks) {
      recommendStore.dispatch('fetchRecommendSongsAction')
      rankingStore.dispatch("fetchRankingDataAction")
    }
    this.setData({ songInfo: value })
    wx.setNavigationBarTitle({
      title: value.name,
    })
  },

  onUnload() {
    if (this.data.type === "ranking") {
      rankingStore.offState(this.data.key, this.handleRanking)
    } else if (this.data.type === "recommend") {
      recommendStore.offState(this.data.key, this.handleRanking)
    }
  }
})