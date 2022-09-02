// components/song-item-v2/song-item-v2.js
import { favorCollection, likeCollection, menuCollection, db } from "../../database/index"

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
    },

    onMoreIconTap() {
      // 弹出actionSheet
      wx.showActionSheet({
        itemList: ["收藏", "喜欢", "添加到歌单"],
        success: (res) => {
          const index = res.tapIndex
          this.handleOperationResult(index)
        }
      })
    },

    async handleOperationResult(index) {
      let res = null
      switch(index) {
        case 0: // 收藏
          res = await favorCollection.add(this.properties.itemData)
          break
        case 1:
          res = await likeCollection.add(this.properties.itemData)
          break // 喜欢
        case 2:
          const menuNames = this.properties.menuList.map(item => item.name)
          wx.showActionSheet({
            itemList: menuNames,
            success: (res) => {
              const menuIndex = res.tapIndex
              this.handleMenuIndex(menuIndex)
            }
          })
          return
      }
      if (res) {
        const title = index === 0 ? '收藏': '喜欢'
        wx.showToast({ title: `${title}成功~`})
      }
    },
    
  }
})
