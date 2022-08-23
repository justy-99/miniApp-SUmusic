// pages/music-player/music-player.js
import { getSongDetail, getSongLyric } from '../../services/player'
import { parseLyric } from "../../utils/parse-lyric"
import playerStore from "../../store/playerStore"
import { _throttle, _debounce } from '../../utils/tools'

const App = getApp()

// 创建播放器
let audioContext = wx.createInnerAudioContext()
console.log('audioContext',audioContext)

const modeNames = ["order", "repeat", "random"]


Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageTitles: ["歌曲","歌词"],
    currentPage: 0,
    contentHeight: 500,

    id: '',
    currentSong: {},
    singer: '',
    
    isPlaying: true,
    isFirstPlay: true,
    currentTime: 0,
    durationTime: 0,
    sliderValue: 0,
    isSliderChanging: false,
    isWaiting: false,
    playSongIndex: 0,
    playSongList: [],

    lyricString: '',
    lyricInfos: [],
    currentLyricText: 'From: 苏music',
    currentLyricIndex: 0,
    lyricScrollTop: 0,

    playModeIndex: 0, // 0:顺序播放 1:单曲循环 2:随机播放
    playModeName: "order",

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
    this.setupPlaySong(id)
    // 3.获取store共享数据
    playerStore.onStates(["playSongList", "playSongIndex"], this.getPlaySongInfosHandler)
  },
  // 自动更新进度
  updateProgress() {
    // 1.记录当前的时间
    // 2.修改sliderValue
    const sliderValue = this.data.currentTime / this.data.durationTime * 100
    this.setData({
      currentTime: audioContext.currentTime * 1000,
      sliderValue
    })
  },
  // 播放歌曲
  setupPlaySong(id) {
    this.setData({ id })

    // 2.请求歌曲相关的数据
    // 2.1.根据id获取歌曲的详情
    getSongDetail(id).then( res => {
      const currentSong = res.songs[0]
      this.setData({ 
        currentSong,
        durationTime: res.songs[0].dt
      })
      let singers = []
      singers = currentSong.ar.map(item => item.name)
      this.setData({ singer: singers.join('、') })
    })
    // 2.2.根据id获取歌词的信息
    getSongLyric(id).then( res => {
      const lrcString = res.lrc.lyric
      const lyricInfos = parseLyric(lrcString)
      this.setData({ lyricInfos, lyricScrollTop: 0 })
      setTimeout(() => {
        if (this.data.isPlaying)
          audioContext.play()
      },2000)
    })
    // 3.播放当前的歌曲
    audioContext.stop()
    audioContext.destroy()
    audioContext = wx.createInnerAudioContext()
    audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
    audioContext.autoplay = true
    audioContext.play()

    // 4.监听播放的进度
    if (this.data.isFirstPlay) {
      this.data.isFirstPlay = false
      const throttleUpdateProgress = _throttle(this.updateProgress, 500, { leading: false })

      audioContext.onTimeUpdate(() => {
        // 1.更新歌曲的进度
        //  当我们在通过滑块拖动或者点击滑块改变歌曲进度时，虽然通过audioContext.seek()设置了audioContext的currentTime,
        //  但是在改变完后马上去获取audioContext.currentTime依然可能会在原来的地方，大概500ms内，偶尔触发。需要通过字段限制先不要自动更新进度
        if (!this.data.isSliderChanging && !this.data.isWaiting) {
          throttleUpdateProgress()
        }
  
        // // 2.匹配正确的歌词 (往前进600ms)
        if (!this.data.lyricInfos.length) return
        let index = this.data.lyricInfos.length - 1
        for (let i = 0; i < this.data.lyricInfos.length; i++) {
          const info = this.data.lyricInfos[i]
          if (info.time - 600 > audioContext.currentTime * 1000) {
            index = i - 1
            break
          }
        }
        if (index === this.data.currentLyricIndex) return
  
        // 3.获取歌词的索引index和文本text
        // 4.改变歌词滚动页面的位置
        const currentLyricText = this.data.lyricInfos[index]?.text || ''
        this.setData({ 
          currentLyricText, 
          currentLyricIndex: index,
          lyricScrollTop: 35 * index
        })
      })
      audioContext.onWaiting(() => {
        audioContext.pause()
      })
      audioContext.onCanplay(() => {
        audioContext.play()
        this.setData({ isPlaying: true })
      })
      audioContext.onEnded(() => {
        // 如果是单曲循环, 不需要切换下一首歌
        if (audioContext.loop) return

        console.log('onEnded')
        // 切换下一首歌曲
        this.changeNewSong()
      })
    }
  },
  changeNewSong(isNext = true) {
    // 1.获取之前的数据
    const length = this.data.playSongList.length
    let index = this.data.playSongIndex
    audioContext.loop = false
    if(!length) {
      const currentTime = 0
      audioContext.seek(currentTime / 1000)
      this.setData({
        currentTime,sliderValue: currentTime
      })
      return audioContext.loop = true
    }
    console.log('index',index)
    console.log('length',length)
    // 2.根据之前的数据计算最新的索引
    switch (this.data.playModeIndex) {
      case 1: // 单曲循环 切换就走顺序播放的逻辑
      case 0: // 顺序播放
        index = isNext ? index + 1: index - 1
        if (index === length) index = 0
        if (index === -1) index = length - 1
        break
      case 2: // 随机播放
        index = Math.floor(Math.random() * length)
        break
    }
    // 3.根据索引获取当前歌曲的信息
    const newSong = this.data.playSongList[index]
    // 将数据回到初始状态
    audioContext.stop()
    audioContext.seek(0)
    this.setData({ currentSong: {}, sliderValue: 0, currentTime: 0, durationTime: 0, singer: '', isFirstPlay: true})
    // 开始播放新的歌曲
    this.setupPlaySong(newSong.id)
    // 4.保存最新的索引值
    playerStore.setState("playSongIndex", index)
  },

  // ==================== 事件监听 ==================== 
  // 播放模式切换
  onModeBtnTap() {
    // 1.计算新的模式
    let modeIndex = this.data.playModeIndex
    modeIndex = modeIndex + 1
    if (modeIndex === 3) modeIndex = 0

    // 设置是否是单曲循环
    if (modeIndex === 1) {
      audioContext.loop = true
    } else {
      audioContext.loop = false
    }

    // 2.保存当前的模式
    this.setData({ playModeIndex: modeIndex, playModeName: modeNames[modeIndex] })
  },
  // 上一曲
  onPrevBtnTap() {
    this.changeNewSong(false)
  },
  // 下一曲
  onNextBtnTap() {
    this.changeNewSong()
  },
  // 播放/暂停
  onPlayOrPauseTap() {
    if (!audioContext.paused) {
      audioContext.pause()
      this.setData({ isPlaying: false })
    } else {
      audioContext.play()
      this.setData({ isPlaying: true })
    }
  },
  // 点击滑块后，改变iswaiting字段（使用防抖）
  debounceWaiting: _debounce(function(){
    console.log('isWaiting')
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

    // 3.设置播放器, 播放计算出的时间
    audioContext.seek(currentTime / 1000)
    this.setData({ currentTime, isSliderChanging: false, sliderValue: value })
  },

  // 通过滑动滑块变化（节流）
  onSliderChanging: _throttle(function(event) {
    // 1.获取滑动到的位置的value
    const value = event.detail.value

    // 2.根据当前的值, 计算出对应的时间 总时长的百分比
    const currentTime = value / 100 * this.data.durationTime
    this.setData({ currentTime })

    // 3.当前正在滑动
    this.data.isSliderChanging = true
  }, 50),
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
  // 导航切换
  onNavTabItemTap(e) {
    const currentPage = e.currentTarget.dataset.index
    this.setData({currentPage})
  },
  // swiper切换
  onSwiperChange(e) {
    this.setData({ currentPage: e.detail.current })
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
  
  onUnload() {
    playerStore.offStates(["playSongList", "playSongIndex"], this.getPlaySongInfosHandler)
  }
})