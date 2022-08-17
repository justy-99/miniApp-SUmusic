// 节流
export function _throttle(fn, interval = 200) {
  let lastTime = 0
  const throttle = function(...args) {
    return new Promise((res, rej) => {
      try {
        const nowTime = Date.now()
        let waitTime = interval - (nowTime - lastTime)
        if(waitTime <= 0) {
          res(fn.apply(this,args))
          lastTime = nowTime
        }
      } catch (err) {
        rej(err)
      }
    })
  }
  return throttle
}

// 防抖
export function _debounce(fn, delay = 200, immediate = false) {
  let timer = null
  let isInvoke = true

  const debounce = function(...args){
    return new Promise((resolve,reject) => {
      try {
        if(timer) clearTimeout(timer)

        if(isInvoke&&immediate){
          resolve(fn.apply(this,args))
          isInvoke = false
          return
        }

        timer = setTimeout(()=>{
          resolve(fn.apply(this,args))
          timer = null
        },delay)
      } catch (err){
        reject(err)
      }
    })
  }

  debounce.cancel = ()=>{
    if(timer) clearTimeout(timer)
    timer = null
    isInvoke = true
  }


  return debounce
}