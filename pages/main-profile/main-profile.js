// pages/main-profile/main-profile.js
Page({

  data: {
    isLogin: false,
    userInfo: {},

    tabs: [
      { name: "我的收藏", type: "favor" },
      { name: "我的喜欢", type: "like" },
      { name: "历史记录", type: "history" },
    ],

    isShowDialog: false,
    menuName: "",
    menuList: []
  },
  onLoad(options) {
    // 1.判断用户是否登录
    const openid = wx.getStorageSync('openid')
    const userInfo = wx.getStorageSync('userinfo')
    this.setData({ isLogin: !!openid })
    if (this.data.isLogin) {
      this.setData({ userInfo })
    }
  },
  // ================ 事件监听 ==================
  async onUserInfoTap() {
    // 1.获取用户的头像和昵称
    const profile = await wx.getUserProfile({
      desc: '获取您的头像和昵称',
    })
    // 2.获取用户的openid
    const loginRes = await wx.cloud.callFunction({
      name: "music-login"
    })
    const openid = loginRes.result.openid

    // // 3.保存在本地
    wx.setStorageSync('openid', openid)
    wx.setStorageSync('userinfo', profile.userInfo)

    // 4.profile中的数据修改
    this.setData({ isLogin: true, userInfo: profile.userInfo })
  },

  onTabItemClick(event) {
    const item = event.currentTarget.dataset.item
    
    wx.navigateTo({
      url: `/pages/detail-song/detail-song?type=profile&tabname=${item.type}&title=${item.name}`,
    })
  },

})