/**
 * axios 请求封装
 * 提供统一的请求配置、拦截器处理
 */
import axios from 'axios'
import { Message } from 'element-ui'
import router from '@/router'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',  // API 基础路径，通过 vue.config.js 代理到后端
  timeout: 60000     // 请求超时时间 60 秒
})

// 请求拦截器：自动在请求头添加 Token
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器：统一处理错误信息
request.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        // 登录过期，清除 Token 并跳转登录页
        localStorage.removeItem('token')
        router.push('/login')
        Message.error('登录已过期，请重新登录')
      } else if (status === 403) {
        Message.error('没有权限访问')
      } else if (status === 429) {
        Message.error('请求过于频繁，请稍后再试')
      } else {
        Message.error(data.message || '请求失败')
      }
    } else if (error.message.includes('timeout')) {
      Message.error('请求超时，请稍后重试')
    } else {
      Message.error('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

export default request
