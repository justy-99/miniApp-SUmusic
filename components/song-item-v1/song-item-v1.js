// components/song-item-v1/song-item-v1.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    itemData: {
      type: Object,
      value: {},
      observer(val) {
        let singers = []
        singers = val.ar.map(item => item.name)
        this.setData({singer:singers.join('、')})
      }
    }
  },
  data: {
    singer :''
  },
  methods: {
    onSongItemTap() {
      const id = this.properties.itemData.id
      wx.navigateTo({
        url: `/pages/music-player/music-player?id=${id}`,
      })
    }
  }
})
