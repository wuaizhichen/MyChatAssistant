import request from './request'

export function login(data) {
  return request.post('/auth/login', data)
}

export function register(data) {
  return request.post('/auth/register', data)
}

export function getUserInfo() {
  return request.get('/auth/userinfo')
}

export function updateUserInfo(data) {
  return request.put('/auth/userinfo', data)
}

export function updatePassword(data) {
  return request.put('/auth/password', data)
}
