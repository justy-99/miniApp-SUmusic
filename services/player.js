import { szyReqInstance } from './index'
// 歌曲信息
export function getSongDetail(ids) {
  return szyReqInstance.get({
    url: "/song/detail",
    data: {
      ids
    }
  })
}
// 歌词信息
export function getSongLyric(id) {
  return szyReqInstance.get({
    url: "/lyric",
    data: {
      id
    }
  })
}
