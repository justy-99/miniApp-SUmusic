import { HYEventStore } from 'hy-event-store'

import { menuCollection } from "../database/index"

const menuStore = new HYEventStore({
  state: {
    menuList: []
  },

  actions: {
    async fetchMenuListAction(ctx) {
      // 获取歌单数据
      const res = await menuCollection.query()
      ctx.menuList = res.data
    }
  }
})
// 用户不一定在哪个页面进入，加载文件直接发送请求
menuStore.dispatch("fetchMenuListAction")

export default menuStore

