// pages/detail-song/detail-song.js
import recommendStore from "../../store/recommendStore"
import rankingStore from "../../store/rankingStore"
import playerStore from "../../store/playerStore"
import menuStore from "../../store/menuStore"
import { getPlaylistDetail } from "../../services/music"
import { menuCollection } from "../../database/index"

const db = wx.cloud.database()

Page({
  data: {
    type: "ranking",
    key: "newRanking",
    id: "",

    songInfo: {},
    menuList: []
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
    } else if (type === "profile") { // 个人中心的tab
      const tabname = options.tabname
      const title = options.title
      this.handleProfileTabInfo(tabname, title)
    } else if (type === 'mineMenu') {
      const id = options.id
      this.handleMineMenuInfo(id)
    }
    
    // 歌单数据
    menuStore.onState("menuList", this.handleMenuList)
  },

  async fetchMenuSongInfo() {
    const res = await getPlaylistDetail(this.data.id)
    this.setData({ songInfo: res.playlist })
  },

  
  async handleProfileTabInfo(tabname, title) {
    // 1.动态获取集合
    const collection = db.collection(`c_${tabname}`)

    // 2.获取数据的结果
    const res = await collection.get()
    this.setData({
      songInfo: {
        name: title,
        tracks: res.data
      }
    })
  },

  async handleMineMenuInfo(id) {
    const res = await menuCollection.query(0, 20, id, true)
    this.setData({
      songInfo: {
        name: res.data.name,
        tracks: res.data.songList
      }
    })
  },

  // ================== wxml事件监听 ==================
  onSongItemTap(event) {
    playerStore.setState("playSongList", this.data.songInfo.tracks)
    const index = event.currentTarget.dataset.index
    playerStore.setState("playSongIndex", index)
  },

  // ================== store共享数据 ==================
  handleRanking(value) {
    console.log("value",value)
    if(!value.tracks) {
      recommendStore.dispatch('fetchRecommendSongsAction')
      rankingStore.dispatch("fetchRankingDataAction")
    }
    this.setData({ songInfo: value })
    if(value.name)
    wx.setNavigationBarTitle({
      title: value.name,
    })
  },

  handleMenuList(value) {
    this.setData({ menuList: value })
  },

  onUnload() {
    if (this.data.type === "ranking") {
      rankingStore.offState(this.data.key, this.handleRanking)
    } else if (this.data.type === "recommend") {
      recommendStore.offState(this.data.key, this.handleRanking)
    }
  }
})