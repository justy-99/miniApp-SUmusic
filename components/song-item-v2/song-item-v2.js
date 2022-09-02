// components/song-item-v2/song-item-v2.js
import { favorCollection, likeCollection, menuCollection, db } from "../../database/index"
import menuStore from "../../store/menuStore"

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
    },
    menuList: {
      type: Array,
      value: []
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
    // 歌单数据由父组件获取后传入，fetchMenuListAction事件可以组件内发送
    async handleMenuIndex(index) {
      // 1.获取要添加进去的歌单
      const menuItem = this.properties.menuList[index]

      // 2.向menuItem歌单中songList中添加一条数据
      const data = this.properties.itemData
      const cmd = db.command
      const res = await menuCollection.update(menuItem._id, {
        songList: cmd.push(data)
      })
      if (res) {
        menuStore.dispatch("fetchMenuListAction")
        wx.showToast({ title: '将歌曲添加到歌单成功~' })
      }
    }
  }
})
