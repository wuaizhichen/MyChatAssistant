/**
 * 聊天相关 API
 */
import request from './request'

const isDevelopment = process.env.NODE_ENV === 'development'
const API_BASE = isDevelopment ? 'http://localhost:8000' : ''

/**
 * 获取会话列表
 */
export function getSessionList() {
  return request.get('/session/list')
}

/**
 * 创建新会话
 * @param {Object} data - { title } 会话标题
 */
export function createSession(data) {
  return request.post('/session/create', data)
}

/**
 * 删除会话
 * @param {string} sessionId - 会话 ID
 */
export function deleteSession(sessionId) {
  return request.delete(`/session/${sessionId}`)
}

/**
 * 获取会话消息列表
 * @param {string} sessionId - 会话 ID
 */
export function getMessages(sessionId) {
  return request.get(`/session/${sessionId}/messages`)
}

/**
 * 发送消息（普通模式）
 * @param {string} sessionId - 会话 ID
 * @param {Object} data - { content, model, temperature, maxTokens }
 */
export function sendMessage(sessionId, data) {
  return request.post(`/chat/${sessionId}`, data)
}

/**
 * 发送消息（流式模式）
 * @param {string} sessionId - 会话 ID
 * @param {Object} data - 发送的数据 { content }
 * @param {Function} onChunk - 接收到数据块的回调
 * @param {Function} onDone - 完成时的回调
 * @param {Function} onError - 错误时的回调
 * @returns {AbortController} - 用于取消请求
 */
export function sendMessageStream(sessionId, data, onChunk, onDone, onError) {
  const token = localStorage.getItem('token')
  const controller = new AbortController()

  const url = `${API_BASE}/chat/${sessionId}/stream`

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(data),
    signal: controller.signal
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')

      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            onDone && onDone()
            return
          }

          const text = decoder.decode(value, { stream: true })
          onChunk && onChunk({ content: text })

          read()
        }).catch(err => {
          if (err.name !== 'AbortError') {
            onError && onError(err)
          }
        })
      }
      read()
    })
    .catch(err => {
      if (err.name !== 'AbortError') {
        onError && onError(err)
      }
    })

  return controller
}