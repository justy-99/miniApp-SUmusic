import { szyReqInstance } from "./index"


export function getMusicBanner(type = 0) {
  return szyReqInstance.get({
    url: "/banner",
    data: {
      type
    }
  })
}
