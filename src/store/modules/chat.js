import Vue from 'vue'
import { createConversation, getConversations, getMessages } from '@/api/chat'
import { generateId } from '@/utils'

const GUEST_CONVERSATIONS_KEY = 'guest_conversations'
const GUEST_MESSAGES_KEY = 'guest_messages'

function getGuestConversations() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CONVERSATIONS_KEY)) || []
  } catch {
    return []
  }
}

function saveGuestConversations(conversations) {
  localStorage.setItem(GUEST_CONVERSATIONS_KEY, JSON.stringify(conversations))
}

function getGuestMessages() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_MESSAGES_KEY)) || {}
  } catch {
    return {}
  }
}

function saveGuestMessages(messages) {
  localStorage.setItem(GUEST_MESSAGES_KEY, JSON.stringify(messages))
}

const state = {
  conversations: [],
  currentConversationId: null,
  messages: {},
  loading: false,
  sendingMessage: false
}

const getters = {
  currentConversation: state => {
    return state.conversations.find(c => c.id === state.currentConversationId) || null
  },
  currentMessages: state => {
    return state.messages[state.currentConversationId] || []
  },
  sortedConversations: state => {
    return [...state.conversations].sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })
  }
}

const mutations = {
  SET_CONVERSATIONS(state, conversations) {
    state.conversations = conversations
  },
  SET_CURRENT_CONVERSATION(state, id) {
    state.currentConversationId = id
  },
  SET_MESSAGES(state, { conversationId, messages }) {
    Vue.set(state.messages, conversationId, messages)
  },
  ADD_MESSAGE(state, { conversationId, message }) {
    if (!state.messages[conversationId]) {
      Vue.set(state.messages, conversationId, [])
    }
    state.messages[conversationId].push(message)
  },
  UPDATE_LAST_MESSAGE(state, { conversationId, content }) {
    const msgs = state.messages[conversationId]
    if (msgs && msgs.length > 0) {
      const lastMsg = msgs[msgs.length - 1]
      if (lastMsg.role === 'assistant') {
        lastMsg.content += content
      }
    }
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_SENDING(state, sending) {
    state.sendingMessage = sending
  },
  ADD_CONVERSATION(state, conversation) {
    state.conversations.unshift(conversation)
  },
  REMOVE_CONVERSATION(state, id) {
    state.conversations = state.conversations.filter(c => c.id !== id)
    if (state.currentConversationId === id) {
      state.currentConversationId = null
    }
    Vue.delete(state.messages, id)
  },
  UPDATE_CONVERSATION_TITLE(state, { id, title }) {
    const conv = state.conversations.find(c => c.id === id)
    if (conv) {
      conv.title = title
    }
  }
}

const actions = {
  async fetchConversations({ commit, rootState }) {
    const isGuest = rootState.user.isGuest
    commit('SET_LOADING', true)
    try {
      if (isGuest) {
        commit('SET_CONVERSATIONS', getGuestConversations())
        commit('SET_MESSAGES', { conversationId: '__load__', messages: [] })
        const guestMsgs = getGuestMessages()
        Object.keys(guestMsgs).forEach(id => {
          commit('SET_MESSAGES', { conversationId: id, messages: guestMsgs[id] })
        })
      } else {
        const res = await getConversations()
        commit('SET_CONVERSATIONS', res.data || [])
      }
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async fetchMessages({ commit, rootState }, conversationId) {
    const isGuest = rootState.user.isGuest
    if (isGuest) {
      const guestMsgs = getGuestMessages()
      commit('SET_MESSAGES', {
        conversationId,
        messages: guestMsgs[conversationId] || []
      })
    } else if (conversationId) {
      const res = await getMessages(conversationId)
      commit('SET_MESSAGES', {
        conversationId,
        messages: res.data || []
      })
    }
  },
  async createConversation({ commit, rootState }, title = '新对话') {
    const isGuest = rootState.user.isGuest
    if (isGuest) {
      const conversation = {
        id: generateId(),
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      commit('ADD_CONVERSATION', conversation)
      commit('SET_CURRENT_CONVERSATION', conversation.id)
      commit('SET_MESSAGES', { conversationId: conversation.id, messages: [] })
      saveGuestConversations(rootState.chat.conversations)
      return conversation
    }
    const res = await createConversation({ title })
    const conversation = res.data
    commit('ADD_CONVERSATION', conversation)
    commit('SET_CURRENT_CONVERSATION', conversation.id)
    commit('SET_MESSAGES', { conversationId: conversation.id, messages: [] })
    return conversation
  },
  selectConversation({ commit }, id) {
    commit('SET_CURRENT_CONVERSATION', id)
  },
  deleteConversation({ commit, rootState }, id) {
    commit('REMOVE_CONVERSATION', id)
    if (rootState.user.isGuest) {
      saveGuestConversations(rootState.chat.conversations)
      const guestMsgs = getGuestMessages()
      delete guestMsgs[id]
      saveGuestMessages(guestMsgs)
    }
  },
  addMessage({ commit, rootState }, { conversationId, message }) {
    commit('ADD_MESSAGE', { conversationId, message })
    if (rootState.user.isGuest) {
      const guestMsgs = getGuestMessages()
      if (!guestMsgs[conversationId]) {
        guestMsgs[conversationId] = []
      }
      guestMsgs[conversationId].push(message)
      saveGuestMessages(guestMsgs)
    }
  },
  updateAssistantMessage({ commit, rootState }, { conversationId, content }) {
    commit('UPDATE_LAST_MESSAGE', { conversationId, content })
    if (rootState.user.isGuest) {
      const guestMsgs = getGuestMessages()
      if (guestMsgs[conversationId] && guestMsgs[conversationId].length > 0) {
        const lastMsg = guestMsgs[conversationId][guestMsgs[conversationId].length - 1]
        if (lastMsg.role === 'assistant') {
          lastMsg.content += content
          saveGuestMessages(guestMsgs)
        }
      }
    }
  },
  setSending({ commit }, sending) {
    commit('SET_SENDING', sending)
  },
  updateConversationTitle({ commit, rootState }, { id, title }) {
    commit('UPDATE_CONVERSATION_TITLE', { id, title })
    if (rootState.user.isGuest) {
      saveGuestConversations(rootState.chat.conversations)
    }
  },
  clearMessages({ commit, rootState }, conversationId) {
    commit('SET_MESSAGES', { conversationId, messages: [] })
    if (rootState.user.isGuest) {
      const guestMsgs = getGuestMessages()
      guestMsgs[conversationId] = []
      saveGuestMessages(guestMsgs)
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
