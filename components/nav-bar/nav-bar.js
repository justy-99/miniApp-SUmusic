// components/nav-bar/nav-bar.js
const App = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: "导航标题"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    statusHeight: 20,
    NAVBARHEIGHT: 44
  },
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多 slot 支持
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onLeftTap() {
      this.triggerEvent("leftclick")
    }
  },

  lifetimes: {
    attached() {
      // 0.获取设备信息
      this.setData({ 
        statusHeight: App.globalData.statusHeight,
        NAVBARHEIGHT: App.globalData.NAVBARHEIGHT
      })
    }
  }


  
})
