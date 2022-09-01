// app.js
App({
  globalData: {
    screenWidth: 375,
    screenHeight: 667,
    statusHeight: 20,
    contentHeight: 500,
    NAVBARHEIGHT: 44
  },
  onLaunch() {
    // 1.获取设备的信息
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.screenWidth = res.screenWidth
        this.globalData.screenHeight = res.screenHeight
        this.globalData.statusHeight = res.statusBarHeight
        this.globalData.contentHeight = res.screenHeight - res.statusBarHeight - this.globalData.NAVBARHEIGHT
      },
    })
    // 2.云开发能力进行初始化
    wx.cloud.init({
      env: "cloud1-7g2e5u8c2407e232"
    })
  }
})
