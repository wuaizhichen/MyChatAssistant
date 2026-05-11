/**
 * 用户相关 API
 */
import request from './request'

/**
 * 用户登录
 * @param {Object} data - { username, password }
 */
export function login(data) {
  return request.post('/auth/login', data)
}

/**
 * 用户注册
 * @param {Object} data - { username, email, password }
 */
export function register(data) {
  return request.post('/auth/register', data)
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return request.get('/auth/userinfo')
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息
 */
export function updateUserInfo(data) {
  return request.put('/auth/userinfo', data)
}

/**
 * 修改密码
 * @param {Object} data - { oldPassword, newPassword }
 */
export function updatePassword(data) {
  return request.put('/auth/password', data)
}
