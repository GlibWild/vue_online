import axios from 'axios'
import router from '../router/index'
import store from '../store/index'
import Vue from 'vue'
import qs from 'qs'
const base = ''
// 请求延时
axios.defaults.timeout = 30000
let requests = [] as any
let isRefreshing = false
axios.interceptors.request.use(
  config => {
    let Token = store.state.token as any
    let newToken: any
    const curTime = new Date()
    const expiretime = new Date(Date.parse(store.state.tokenExpire + ''))
    if (config.url !== `${base}/api/login`) {
      if (!store.state.token || !(curTime < expiretime && store.state.tokenExpire)) {
        if (
          window.localStorage.refreshtime &&
          curTime <= new Date(window.localStorage.refreshtime)
        ) {
          if (!isRefreshing) {
            isRefreshing = true
            ;(async () => {
              const tokenRes = await refreshToken({
                token: window.localStorage.Token
              })
              if (tokenRes.success) {
                newToken = tokenRes.response.token as never
                isRefreshing = false // 刷新成功，恢复标志位
                requests.forEach((cb: any) => {
                  cb(newToken)
                })
                requests = []
              } else {
                isRefreshing = false
                requests = []
                ToLogin()
              }
            })()
          }
          const retryOriginalRequest = new Promise((resolve: any) => {
            requests.push((newToken: string) => {
              config.headers.Authorization = 'Bearer' + newToken
              resolve(config)
            })
          })
          return retryOriginalRequest as any
        } else {
          isRefreshing = false
          requests = []
          ToLogin()
        }
      }
      Token = newToken || Token
      config.headers.Authorization = 'Bearer' + Token
    }
    saveRefreshTime()
    if (config.method === 'get') {
      config.paramsSerializer = function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' })
      }
    }
    return config
  },
  err => {
    return Promise.reject(err)
  }
)

// http response 拦截器
axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    // 超时请求处理
    const originalRequest = error.config
    if (
      error.code === 'ECONNABORTED' &&
      error.message.indexOf('timeout') !== -1 &&
      !originalRequest._retry
    ) {
      Vue.prototype.$message({
        message: '请求超时！',
        type: 'error'
      })

      originalRequest._retry = true
      return null
    }

    if (error.response) {
      if (error.response.status === 401) {
        const curTime = new Date()
        const refreshtime = new Date(Date.parse(window.localStorage.refreshtime))
        // 在用户操作的活跃期内
        if (window.localStorage.refreshtime && curTime <= refreshtime) {
          return refreshToken({
            token: window.localStorage.Token
          }).then((res: any) => {
            if (res.success) {
              error.config.__isRetryRequest = true
              error.config.headers.Authorization = 'Bearer ' + res.response.token
              return axios(error.config)
            } else {
              // 刷新token失败 清除token信息并跳转到登录页面
              ToLogin()
            }
          })
        } else {
          // 返回 401，并且不知用户操作活跃期内 清除token信息并跳转到登录页面
          ToLogin()
        }
      }
      // 403 无权限
      if (error.response.status === 403) {
        Vue.prototype.$message({
          message: '失败！该操作无权限',
          type: 'error'
        })
        return null
      }
      // 429 ip限流
      if (error.response.status === 429) {
        Vue.prototype.$message({
          message: '刷新次数过多，请稍事休息重试！',
          type: 'error'
        })
        return null
      }
    }
    return '' // 返回接口返回的错误信息
  }
)

export const BaseApiUrl = base

const ToLogin = () => {
  store.commit('saveToken', '')
  store.commit('saveTokenExpire', '')
  window.localStorage.removeItem('user')
  const key = 'redirect='
  let redirectPath = '/'
  const fullpath = router.currentRoute.fullPath
  if (fullpath) {
    const route = decodeURIComponent(fullpath)
    const index = route.lastIndexOf(key)
    if (index > -1) {
      redirectPath = route.substring(index + key.length)
    } else {
      redirectPath = fullpath
    }
  }
  router.replace({
    path: '/login',
    query: {
      redirect: redirectPath
    }
  })
  window.location.reload()
}

export const refreshToken = (params: any) => {
  return axios
    .get(`${base}/api/login/RefreshToken`, {
      params: params
    })
    .then(response => {
      const data = response.data
      if (data.success) {
        store.commit('saveToken', data.response.token)
        const curTime = new Date()
        const expiredate = new Date(
          curTime.setSeconds(curTime.getSeconds() + data.response.expires_in)
        )
        store.commit('saveTokenExpire', expiredate)
        return Promise.resolve(data)
      } else {
        return Promise.reject(response)
      }
    })
    .catch(function (error) {
      return Promise.reject(error)
    })
}
export const saveRefreshTime = () => {
  const nowtime = new Date()
  let lastRefreshTime = (
    window.localStorage.refreshtime ? new Date(window.localStorage.refreshtime) : new Date(-1)
  ) as Date
  const expiretime = new Date(Date.parse(window.localStorage.TokenExpire))
  const refreshCount = 3 //滑动系数
  if (lastRefreshTime >= nowtime) {
    lastRefreshTime = nowtime > expiretime ? nowtime : expiretime
    lastRefreshTime.setHours(lastRefreshTime.getHours() + refreshCount)
    window.localStorage.refreshtime = lastRefreshTime
  } else {
    window.localStorage.refreshtime = new Date(-1)
  }
}
