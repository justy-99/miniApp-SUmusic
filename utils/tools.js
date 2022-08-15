// 节流
export function _throttle(fn,interval) {
  let lastTime = 0
  const _throttle = function(...args) {
    const nowTime = Date.now()
    let waitTime = interval - (nowTime - lastTime)
    if(waitTime <= 0) {
      fn.apply(this,args)
      lastTime = nowTime
    }
  }
  return _throttle
}

// 防抖
export function _debounce(fn,delay,immediate = false) {
  let timer = null
  let isInvoke = true

  const _debounce = function(...args){
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

  _debounce.cancel = ()=>{
    if(timer) clearTimeout(timer)
    timer = null
    isInvoke = true
  }


  return _debounce
}