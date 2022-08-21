// pages/music-player/music-player.js
import { getSongDetail, getSongLyric } from '../../services/player'
import { parseLyric } from "../../utils/parse-lyric"
import { _throttle } from '../../utils/tools'

const App = getApp()

// 创建播放器
const audioContext = wx.createInnerAudioContext()


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
    lyricString: '',
    lyricInfos: [],
    currentLyricText: '666',
    isPlaying: true,
    isFirstPlay: true,

    currentTime: 0,
    durationTime: 0,
    sliderValue: 0,
    isSliderChanging: false,
    isWaiting: false,

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

    const id = options.id
    this.setupPlaySong(id)

  },
  // 更新进度
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
      this.setData({ 
        currentSong: res.songs[0],
        durationTime: res.songs[0].dt
       })
    })
    // 2.2.根据id获取歌词的信息
    getSongLyric(id).then( res => {
      const lrcString = res.lrc.lyric
      const lyricInfos = parseLyric(lrcString)
      this.setData({ lyricInfos })
    })
    // 3.播放当前的歌曲
    audioContext.stop()
    audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
    audioContext.autoplay = true

    // 4.监听播放的进度
    if (this.data.isFirstPlay) {
      this.data.isFirstPlay = false
      const throttleUpdateProgress = _throttle(this.updateProgress, 500)

      audioContext.onTimeUpdate(() => {
        // 1.更新歌曲的进度
        if (!this.data.isSliderChanging && !this.data.isWaiting) {
          throttleUpdateProgress()
        }
  
        // // 2.匹配正确的歌词
        // if (!this.data.lyricInfos.length) return
        // let index = this.data.lyricInfos.length - 1
        // for (let i = 0; i < this.data.lyricInfos.length; i++) {
        //   const info = this.data.lyricInfos[i]
        //   if (info.time > audioContext.currentTime * 1000) {
        //     index = i - 1
        //     break
        //   }
        // }
        // if (index === this.data.currentLyricIndex) return
  
        // 3.获取歌词的索引index和文本text
        // 4.改变歌词滚动页面的位置
        // const currentLyricText = this.data.lyricInfos[index].text
        // this.setData({ 
        //   currentLyricText, 
        //   currentLyricIndex: index,
        //   lyricScrollTop: 35 * index
        // })
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

        // 切换下一首歌曲
        this.changeNewSong()
      })
    }
  },

  // ==================== 事件监听 ==================== 
  onNavBackTap() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack()
    } else {
      wx.switchTab({
        url: '/pages/main-music/main-music',
      })
    }
  },
  onNavTabItemTap(e) {
    const currentPage = e.currentTarget.dataset.index
    this.setData({currentPage})
  },
  onSwiperChange(e) {
    this.setData({ currentPage: e.detail.current })
  },

  // 播放控制
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
  // 点击滑块变化或拖动结束
  onSliderChange(event) {
    this.data.isWaiting = true
    setTimeout(() => {
      this.data.isWaiting = false
    }, 1500)
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
    console.log('onSliderChanging')
    // 1.获取滑动到的位置的value
    const value = event.detail.value
    console.log(value);

    // 2.根据当前的值, 计算出对应的时间
    const currentTime = value / 100 * this.data.durationTime
    this.setData({ currentTime })

    // 3.当前正在滑动
    this.data.isSliderChanging = true
  }, 100),

})