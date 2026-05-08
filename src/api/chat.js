import request from './request'

export function getConversations() {
  return request.get('/chat/conversations')
}

export function createConversation(data) {
  return request.post('/chat/conversations', data)
}

export function deleteConversation(id) {
  return request.delete(`/chat/conversations/${id}`)
}

export function updateConversation(id, data) {
  return request.put(`/chat/conversations/${id}`, data)
}

export function getMessages(conversationId) {
  return request.get(`/chat/conversations/${conversationId}/messages`)
}

export function sendMessage(conversationId, data) {
  return request.post(`/chat/conversations/${conversationId}/messages`, data)
}

export function sendMessageStream(conversationId, data, onChunk, onDone, onError) {
  const token = localStorage.getItem('token')
  const controller = new AbortController()

  fetch(`/api/chat/conversations/${conversationId}/messages/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data),
    signal: controller.signal
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            onDone && onDone()
            return
          }
          const text = decoder.decode(value, { stream: true })
          const lines = text.split('\n').filter(line => line.trim())
          lines.forEach(line => {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                onDone && onDone()
                return
              }
              try {
                const parsed = JSON.parse(data)
                onChunk && onChunk(parsed)
              } catch (e) {
                onChunk && onChunk({ content: data })
              }
            }
          })
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
