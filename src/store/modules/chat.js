/**
 * Vuex 聊天状态管理
 * 数据从后端 API 获取
 */
import Vue from 'vue'
import { generateId } from '@/utils'
import { getSessionList, createSession, deleteSession, getMessages } from '@/api/chat'

const state = {
  sessions: [],            // 会话列表
  currentSessionId: null,  // 当前会话 ID
  messages: {},           // 消息字典 { sessionId: [messages] }
  loading: false,         // 加载状态
  sendingMessage: false   // 发送中状态
}

const getters = {
  // 当前会话
  currentConversation: state => {
    return state.sessions.find(s => s.id === state.currentSessionId) || null
  },
  // 当前会话的消息
  currentMessages: state => {
    return state.messages[state.currentSessionId] || []
  },
  // 按更新时间倒序的会话列表
  sortedConversations: state => {
    return [...state.sessions].sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })
  }
}

const mutations = {
  SET_SESSIONS(state, sessions) {
    state.sessions = sessions
  },
  SET_CURRENT_SESSION(state, id) {
    state.currentSessionId = id
  },
  SET_MESSAGES(state, { sessionId, messages }) {
    Vue.set(state.messages, sessionId, messages)
  },
  ADD_MESSAGE(state, { sessionId, message }) {
    if (!state.messages[sessionId]) {
      Vue.set(state.messages, sessionId, [])
    }
    state.messages[sessionId].push(message)
  },
  UPDATE_LAST_MESSAGE(state, { sessionId, content }) {
    const msgs = state.messages[sessionId]
    if (msgs && msgs.length > 0) {
      const lastMsg = msgs[msgs.length - 1]
      if (lastMsg.role === 'assistant') {
        const updatedMsgs = [...msgs]
        // 直接替换内容，不追加
        updatedMsgs[updatedMsgs.length - 1] = {
          ...lastMsg,
          content: content
        }
        Vue.set(state.messages, sessionId, updatedMsgs)
      }
    }
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_SENDING(state, sending) {
    state.sendingMessage = sending
  },
  ADD_SESSION(state, session) {
    state.sessions.unshift(session)
  },
  REMOVE_SESSION(state, id) {
    state.sessions = state.sessions.filter(s => s.id !== id)
    if (state.currentSessionId === id) {
      state.currentSessionId = null
    }
    Vue.delete(state.messages, id)
  },
  UPDATE_SESSION_TITLE(state, { id, title }) {
    const session = state.sessions.find(s => s.id === id)
    if (session) {
      session.title = title
    }
  }
}

const actions = {
  // 加载所有会话
  async fetchConversations({ commit }) {
    commit('SET_LOADING', true)
    try {
      const res = await getSessionList()
      commit('SET_SESSIONS', res.data || [])
    } catch (err) {
      console.error('获取会话列表失败:', err)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  // 加载单个会话的消息
  async fetchMessages({ commit }, sessionId) {
    try {
      const res = await getMessages(sessionId)
      // 转换 role: 1 -> 'user', role: 2 -> 'assistant'
      const messages = (res.data || []).map(msg => ({
        ...msg,
        role: msg.role === 1 ? 'user' : 'assistant'
      }))
      commit('SET_MESSAGES', {
        sessionId,
        messages
      })
    } catch (err) {
      console.error('获取消息失败:', err)
    }
  },
  // 创建新会话
  async createConversation({ commit }, title = '新对话') {
    try {
      const res = await createSession({ title })
      const session = res.data
      commit('ADD_SESSION', session)
      commit('SET_CURRENT_SESSION', session.id)
      commit('SET_MESSAGES', { sessionId: session.id, messages: [] })
      return session
    } catch (err) {
      console.error('创建会话失败:', err)
      throw err
    }
  },
  // 选择会话
  selectConversation({ commit }, id) {
    commit('SET_CURRENT_SESSION', id)
  },
  // 删除会话
  async deleteConversation({ commit }, id) {
    try {
      await deleteSession(id)
      commit('REMOVE_SESSION', id)
    } catch (err) {
      console.error('删除会话失败:', err)
    }
  },
  // 添加消息
  addMessage({ commit }, { sessionId, message }) {
    commit('ADD_MESSAGE', { sessionId, message })
  },
  // 流式更新 AI 回复
  updateAssistantMessage({ commit }, { sessionId, content }) {
    commit('UPDATE_LAST_MESSAGE', { sessionId, content })
  },
  setSending({ commit }, sending) {
    commit('SET_SENDING', sending)
  },
  // 更新会话标题
  async updateConversationTitle({ commit, state }, { id, title }) {
    commit('UPDATE_SESSION_TITLE', { id, title })
  },
  // 清空会话消息
  clearMessages({ commit }, sessionId) {
    commit('SET_MESSAGES', { sessionId, messages: [] })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
