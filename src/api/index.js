import { request, uploadFile } from './request.js'

export const api = {
  // 登录
  sendCode: (phone) => request({ url: '/auth/code', method: 'POST', data: { phone } }),
  login: (phone, code) => request({ url: '/auth/login', method: 'POST', data: { phone, code } }),

  // 档案
  getMe: () => request({ url: '/me' }),
  saveProfile: (data) => request({ url: '/me/profile', method: 'PUT', data }),

  // OCR
  ocrUpload: (filePath) => uploadFile('/ocr/screenshot', filePath),
  ocrResult: (jobId) => request({ url: `/ocr/result/${jobId}` }),
  ocrConfirm: (data) => request({ url: '/ocr/confirm', method: 'POST', data }),

  // 岛屿
  islandPlayers: (island, kdMin) =>
    request({ url: '/island/players', data: { island, kd_min: kdMin } }),
  islandPosts: (island) => request({ url: '/island/posts', data: { island } }),

  // 组队
  createPost: (data) => request({ url: '/posts', method: 'POST', data }),
  applyPost: (postId) => request({ url: `/posts/${postId}/apply`, method: 'POST' }),
  acceptApply: (appId) => request({ url: `/applications/${appId}/accept`, method: 'POST' }),
  rejectApply: (appId) => request({ url: `/applications/${appId}/reject`, method: 'POST' }),
  postApplications: (postId) => request({ url: `/posts/${postId}/applications` }),
  myTeams: () => request({ url: '/me/teams' }),
  teamDetail: (matchId) => request({ url: `/matches/${matchId}/team` }),
  confirmMatch: (matchId) => request({ url: `/matches/${matchId}/confirm`, method: 'POST' }),
  quitMatch: (matchId) => request({ url: `/matches/${matchId}/quit`, method: 'POST' }),
  sendRoomCode: (matchId, roomCode) =>
    request({ url: `/matches/${matchId}/room-code`, method: 'POST', data: { room_code: roomCode } }),
  messages: (matchId) => request({ url: `/matches/${matchId}/messages` }),

  // 支付
  createOrder: (matchId) => request({ url: '/pay/order', method: 'POST', data: { match_id: matchId } }),
  payNotify: (orderNo) => request({ url: '/pay/notify', method: 'POST', data: { order_no: orderNo, paid: true } }),
  myOrders: () => request({ url: '/pay/orders' }),

  // 评价
  rate: (matchId, rateeId, score, tags) =>
    request({ url: `/matches/${matchId}/rate`, method: 'POST', data: { ratee_id: rateeId, score, tags } }),
}
