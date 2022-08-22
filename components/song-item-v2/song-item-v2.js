// components/song-item-v2/song-item-v2.js
Component({
  properties: {
    itemData: {
      type: Object,
      value: {},
      observer(val) {
        let singers = []
        singers = val.ar.map(item => item.name)
        this.setData({singer:singers.join('、')})
      }
    },
    index: {
      type: Number,
      value: -1
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
