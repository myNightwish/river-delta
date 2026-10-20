import { reactive } from 'vue'

export const userStore = reactive({
  token: uni.getStorageSync('token') || '',
  get logined() {
    return !!this.token
  },
  setToken(t) {
    this.token = t
    uni.setStorageSync('token', t)
  },
  logout() {
    this.token = ''
    uni.removeStorageSync('token')
    uni.reLaunch({ url: '/pages/login/login' })
  },
})
