export const db = wx.cloud.database()

class SZYCollection {
  constructor(collectionName) {
    this.collection = db.collection(collectionName)
  }

  // 增删改查
  add(data) {
    return this.collection.add({
      data
    })
  }

  remove(condition, isDoc = true) {
    if (isDoc) {
      return this.collection.doc(condition).remove()
    } else {
      this.collection.where(condition).remove()
    }
  }

  update(condition, data, isDoc = true) {
    if (isDoc) {
      return this.collection.doc(condition).update({ data })
    } else {
      return this.collection.where(condition).update({ data })
    }
  }

  query(offset = 0, size = 20, condition = {}, isDoc = false) {
    if (isDoc) {
      return this.collection.doc(condition).get()
    } else {
      return this.collection.where(condition).skip(offset).limit(size).get()
    }
  }
}

export const favorCollection = new SZYCollection("c_favor")
// favorCollection.add()
// favorCollection.remove("xxxxxxx")
// favorCollection.remove({ name: "xxx" }, false)
// favorCollection.query(60)
export const likeCollection = new SZYCollection("c_like")
export const historyCollection = new SZYCollection("c_history")
export const menuCollection = new SZYCollection("c_menu")