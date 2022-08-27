// pages/music-player/music-player.js
import playerStore, { audioContext } from "../../store/playerStore"
import { _throttle, _debounce } from '../../utils/tools'

const App = getApp()
const modeNames = ["order", "repeat", "random"]

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 页面相关
    pageTitles: ["歌曲","歌词"],
    currentPage: 0,
    contentHeight: 500,
    sliderValue: 0,
    isSliderChanging: false,
    lyricScrollTop: 0,
    singer: '',

    // 共享数据
    stateKeys: ['id','currentSong','durationTime','isPlaying','currentTime','lyricInfos','currentLyricText','currentLyricIndex','playModeIndex'],

    id: '',
    currentSong: {},
    playSongIndex: 0,
    playSongList: [],

    playModeIndex: 0, // 0:顺序播放 1:单曲循环 2:随机播放
    playModeName: "order",
    
    isPlaying: true,
    isFirstPlay: true,
    currentTime: 0,
    durationTime: 0,
    isWaiting: false,

    lyricString: '',
    lyricInfos: [],
    currentLyricText: 'From: 苏music',
    currentLyricIndex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 0.获取设备信息
    this.setData({ 
      contentHeight: App.globalData.contentHeight
    })
    // 1 获取歌曲ID
    const id = options.id
    // 2 放歌
    if(id !== undefined) playerStore.dispatch("playMusicWithSongIdAction", id)

    // 3.获取store共享数据
    playerStore.onStates(["playSongList", "playSongIndex"], this.getPlaySongInfosHandler)
    playerStore.onStates(this.data.stateKeys, this.getPlayerInfosHandler)
  },

   // 自动更新进度
  updateProgress: _throttle(function(currentTime) {
  //  当我们在通过滑块拖动或者点击滑块改变歌曲进度时，虽然通过audioContext.seek()设置了audioContext的currentTime,
    //  但是在改变完后马上去获取audioContext.currentTime依然可能会在原来的地方，大概500ms内，偶尔触发。需要通过字段限制先不要自动更新进度，
    //  isSliderChanging表示正在滑动。isWaiting表示刚点击完或者刚滑动结束，需要等待一段时间
    if( this.data.isSliderChanging || this.data.isWaiting ) return 
    // 1.记录当前的时间 2.修改sliderValue
    const sliderValue = this.data.currentTime / this.data.durationTime * 100
    this.setData({ currentTime,  sliderValue })
  },500),

  // ==================== 事件监听 ==================== 
  // 点击返回
  onNavBackTap() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack()
    } else {
      wx.switchTab({
        url: '/pages/main-music/main-music',
      })
    }
  },
  // 点击图片，预览
  showImg(){
    if(!this.data.currentSong.al) return
    // wx.previewImage({
    //   urls: [this.data.currentSong.al.picUrl],
    // })
  },
  // 导航切换
  onNavTabItemTap(e) {
    const currentPage = e.currentTarget.dataset.index
    this.setData({currentPage})
  },
  // swiper切换
  onSwiperChange(e) {
    this.setData({ currentPage: e.detail.current })
  },
  
  // 点击滑块后，改变iswaiting字段（使用防抖）
  debounceWaiting: _debounce(function(){
    this.data.isWaiting = false
  },1000),
  // 点击滑块变化或拖动结束
  onSliderChange(event) {
    this.data.isWaiting = true
    this.debounceWaiting()
    // 1.获取点击滑块位置对应的value
    const value = event.detail.value
    // 2.计算出要播放的位置时间
    const currentTime = value / 100 * this.data.durationTime
    this.setData({ currentTime, isSliderChanging: false, sliderValue: value })
    // 3.设置播放器, 播放计算出的时间
    audioContext.seek(currentTime / 1000)
  },
  // 通过滑动滑块变化（节流）
  onSliderChanging: _throttle(function(event) {
    // 0.当前正在滑动状态
    this.data.isSliderChanging = true
    // 1.获取滑动到的位置的value
    const value = event.detail.value
    // 2.根据当前的值, 计算出对应的时间 总时长的百分比
    const currentTime = value / 100 * this.data.durationTime
    this.setData({ currentTime })
  }, 100),

  // 播放模式切换
  onModeBtnTap() {
    playerStore.dispatch('changePlayModeAction')
  },
  // 上一曲
  onPrevBtnTap() {
    playerStore.dispatch('playNewSongAction',false)
  },
  // 下一曲
  onNextBtnTap() {
    playerStore.dispatch('playNewSongAction')
  },
  // 播放/暂停
  onPlayOrPauseTap() {
    playerStore.dispatch('changeMusicStatusAction')
  },

  // ====================== store共享数据 ====================
  getPlaySongInfosHandler({ playSongList, playSongIndex }) {
    if (playSongList) {
      this.setData({ playSongList })
    }
    if (playSongIndex !== undefined) {
      this.setData({ playSongIndex })
    }
  },

  getPlayerInfosHandler({
    id,currentSong,durationTime,isPlaying,currentTime,lyricInfos,currentLyricText,currentLyricIndex,playModeIndex
  }) {
    // 歌曲ID
    if(id !== undefined) {
      this.setData( {id} )
    }
    // 正在播放的歌曲信息
    if (currentSong) {
      this.setData({ currentSong })
      if( !currentSong.ar ) return
      let singers = currentSong.ar.map(item => item.name)
      this.setData({ singer: singers.join('、') })
    }
    // 歌曲总时长
    if (durationTime !== undefined ) {
      this.setData({ durationTime })
    }
    // 是否正在播放
    if (isPlaying !== undefined) {
      this.setData({ isPlaying })
    }
    // 当前播放进度
    if (currentTime !== undefined) {
      if(currentTime === 0) {
        this.setData({ currentTime, sliderValue:0 })
      }
      // 根据当前时间改变进度
      this.updateProgress(currentTime )
    }
    // 歌词信息
    if( lyricInfos ) {
      this.setData({ lyricInfos })
    }
    // 当前播放那一句歌词
    if (currentLyricText !== undefined) {
      this.setData({ currentLyricText })
    }
    // 当前播放歌词索引
    if (currentLyricIndex !== undefined) {
      this.setData({ currentLyricIndex,lyricScrollTop: 35 * currentLyricIndex })
    }
    // 当前播放那一句歌词
    if (playModeIndex !== undefined) {
      this.setData({ playModeIndex, playModeName: modeNames[playModeIndex] })
    }
  },
  
  onUnload() {
    playerStore.offStates(["playSongList", "playSongIndex"], this.getPlaySongInfosHandler)
    playerStore.offStates(this.data.stateKeys, this.getPlayerInfosHandler)
  }
})