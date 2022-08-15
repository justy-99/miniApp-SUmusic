import { szyReqInstance } from "./index"

export function getTopMV(offset = 0, limit = 20) {
  return szyReqInstance.get({
    url: "/top/mv",
    data: {
      limit,
      offset
    }
  })
}

export function getMVUrl(id) {
  return szyReqInstance.get({
    url: "/mv/url",
    data: {
      id
    }
  })
}

export function getMVInfo(mvid) {
  return szyReqInstance.get({
    url: "/mv/detail",
    data: {
      mvid
    }
  })
}

export function getMVRelated(id) {
  return szyReqInstance.get({
    url: "/related/allvideo",
    data: {
      id
    }
  })
}
