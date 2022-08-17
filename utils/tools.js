// 节流
export function _throttle(fn,interval) {
  let lastTime = 0
  const throttle = function(...args) {
    return new Promise((res, rej) => {
      const nowTime = Date.now()
      let waitTime = interval - (nowTime - lastTime)
      if(waitTime <= 0) {
        res(fn.apply(this,args))
        lastTime = nowTime
      }
    })
  }
  return throttle
}

// 防抖
export function _debounce(fn,delay,immediate = false) {
  let timer = null
  let isInvoke = true

  const debounce = function(...args){
    if(timer) clearTimeout(timer)

    if(isInvoke&&immediate){
      fn.apply(this,args)
      isInvoke = false
      return
    }

    timer = setTimeout(()=>{
      fn.apply(this,args)
      timer = null
    },delay)
  }

  debounce.cancel = ()=>{
    if(timer) clearTimeout(timer)
    timer = null
    isInvoke = true
  }


  return debounce
}