// 封装成函数
export function szyRequest(options) {
  return new Promise((resolve, reject) => {
    wx.request({ 
      ...options, 
      success: (res) => {
        resolve(res.data)
      },
      fail: reject
    })
  })
}

// 封装成类 -> 实例
class SZYRequest {
  constructor(baseURL) {
    this.baseURL = baseURL
  }
  request(options) {
    const { url } = options
    wx.showLoading({
      title: '拼命加载中~',
      mask: true
    })
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        url: this.baseURL + url,
        success: (res) => {
          wx.hideLoading()
          resolve(res.data)
        },
        fail: (err) => {
          wx.hideLoading()
          console.log("err:", err);
        }
      })
    })
  }
  get(options) {
    return this.request({ ...options, method: "get" })
  }
  post(options) {
    return this.request({ ...options, method: "post" })
  }
}

export const szyReqInstance = new SZYRequest("http://codercba.com:9002")
