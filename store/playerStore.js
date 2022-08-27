import { HYEventStore } from 'hy-event-store'
import { parseLyric } from '../utils/parse-lyric'

import { getSongDetail, getSongLyric } from "../services/player"
// 创建播放器
export let audioContext = wx.createInnerAudioContext()

const playerStore = new HYEventStore({
  state: {
    playSongList: [],
    playSongIndex: 0,

    id: '',
    currentSong: {},

    isPlaying: false,
    currentTime: 0,
    durationTime: 0,

    lyricInfos: [],
    currentLyricText: 'From: 苏music',
    currentLyricIndex: 0,

    isFirstPlay: true,

    playModeIndex: 0, // 0:顺序播放 1:单曲循环 2:随机播放
  },
  actions: {
    // 播放音乐
    playMusicWithSongIdAction(ctx, id) {
      // 将数据回到初始状态
      ctx.currentSong = {}
      ctx.currentTime = 0
      ctx.durationTime = 0
      ctx.lyricInfos = []
      ctx.currentLyricText = 'From: 苏music'
      ctx.currentLyricIndex = 0
      // 1.保存ID
      ctx.id = id
      ctx.isPlaying = true
      
      // 2.请求歌曲相关的数据
      // 2.1.根据id获取歌曲的详情
      getSongDetail(id).then( res => {
        const currentSong = res.songs[0]
        ctx.currentSong = currentSong
        ctx.durationTime = currentSong.dt
      })
      // 2.2.根据id获取歌词的信息
      getSongLyric(id).then( res => {
        const lrcString = res.lrc.lyric
        ctx.lyricInfos = parseLyric(lrcString)
      })
      // 3.播放当前的歌曲
      audioContext.stop()
      audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
      audioContext.autoplay = true

      // 4.监听播放的进度
      if (ctx.isFirstPlay) {
        ctx.isFirstPlay = false

        audioContext.onTimeUpdate(() => {
          // 1.获取当前播放时间
          ctx.currentTime = audioContext.currentTime * 1000

          // 2.匹配正确的歌词 (往前进300ms)
          if (!ctx.lyricInfos.length) return
          let index = ctx.lyricInfos.length - 1
          for (let i = 0; i < ctx.lyricInfos.length; i++) {
            const info = ctx.lyricInfos[i]
            if (info.time - 300 > audioContext.currentTime * 1000) {
              index = i - 1
              break
            }
          }
          if (index === ctx.currentLyricIndex || index === -1) return
    
          // 3.获取歌词的索引index和文本text
          // 4.改变歌词滚动页面的位置
          const currentLyricText = ctx.lyricInfos[index]?.text || ''
        
          ctx.currentLyricText = currentLyricText
          ctx.currentLyricIndex = index
        })
        audioContext.onWaiting(() => {
          audioContext.pause()
        })
        audioContext.onCanplay(() => {
          audioContext.play()
          ctx.isPlaying = true
        })
        audioContext.onEnded(() => {
          // 如果是单曲循环, 不需要切换下一首歌
          if (audioContext.loop) return
          console.log('onEnded')

          // TODO: 切换下一首歌曲
          this.dispatch('playNewSongAction')
        })
      }
    },
    changeMusicStatusAction(ctx) {
      if (!audioContext.paused) {
        audioContext.pause()
        ctx.isPlaying = false
      } else {
        audioContext.play()
        ctx.isPlaying = true
      }
    },
    playNewSongAction(ctx, isNext = true) {
      // 1.获取之前的数据
      const length = ctx.playSongList.length
      let index = ctx.playSongIndex
      if(!length) {
        audioContext.seek(0)
        ctx.currentTime = 0
        return audioContext.loop = true
      }
      console.log('index',index)
      console.log('length',length)
      // 2.根据之前的数据计算最新的索引
      switch (ctx.playModeIndex) {
        case 1: // 单曲循环 手动切换就走顺序播放的逻辑
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
      const newSong = ctx.playSongList[index]
      
      // 开始播放新的歌曲
      this.dispatch('playMusicWithSongIdAction',newSong.id)
      // 4.保存最新的索引值
      ctx.playSongIndex = index
    },
    changePlayModeAction(ctx) {
      // 1.计算新的模式
      let modeIndex = ctx.playModeIndex
      modeIndex = modeIndex + 1
      if (modeIndex === 3) modeIndex = 0
      // 设置是否是单曲循环
      if (modeIndex === 1) {
        audioContext.loop = true
      } else {
        audioContext.loop = false
      }
      // 2.保存当前的模式
      ctx.playModeIndex = modeIndex
    },
  }
})

export default playerStore
