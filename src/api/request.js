import { API_BASE } from '../config.js'

function cleanParams(data) {
  // GET 请求去掉 undefined/null，避免后端 query 解析 422
  if (!data || typeof data !== 'object') return data
  const out = {}
  for (const k of Object.keys(data)) {
    if (data[k] !== undefined && data[k] !== null) out[k] = data[k]
  }
  return out
}

export function request({ url, method = 'GET', data }) {
  const token = uni.getStorageSync('token') || ''
  if (method === 'GET') data = cleanParams(data)
  return new Promise((resolve, reject) => {
    uni.request({
      url: API_BASE + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      success: (res) => {
        if (res.statusCode === 401) {
          uni.removeStorageSync('token')
          uni.reLaunch({ url: '/pages/login/login' })
          reject(new Error('登录已过期，请重新登录'))
          return
        }
        if (res.statusCode >= 400) {
          reject(new Error((res.data && res.data.detail) || '请求失败'))
          return
        }
        resolve(res.data)
      },
      fail: (err) => reject(new Error('网络错误：' + (err.errMsg || ''))),
    })
  })
}

export function uploadFile(url, filePath) {
  const token = uni.getStorageSync('token') || ''
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: API_BASE + url,
      filePath,
      name: 'file',
      header: token ? { Authorization: 'Bearer ' + token } : {},
      success: (res) => {
        try {
          resolve(JSON.parse(res.data))
        } catch {
          reject(new Error('上传返回解析失败'))
        }
      },
      fail: (err) => reject(new Error('上传失败：' + (err.errMsg || ''))),
    })
  })
}
