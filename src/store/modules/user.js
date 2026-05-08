import { login, getUserInfo } from '@/api/user'

const state = {
  token: localStorage.getItem('token') || '',
  userInfo: null,
  isGuest: localStorage.getItem('isGuest') === 'true'
}

const getters = {
  isLoggedIn: state => !!state.token,
  isGuest: state => state.isGuest,
  isAuthenticated: state => !!state.token || state.isGuest,
  userInfo: state => state.userInfo
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
    localStorage.setItem('token', token)
  },
  SET_USER_INFO(state, info) {
    state.userInfo = info
  },
  CLEAR_USER(state) {
    state.token = ''
    state.userInfo = null
    localStorage.removeItem('token')
  },
  SET_GUEST(state, isGuest) {
    state.isGuest = isGuest
    localStorage.setItem('isGuest', String(isGuest))
  }
}

const actions = {
  async login({ commit }, loginForm) {
    const res = await login(loginForm)
    if (res.data && res.data.token) {
      commit('SET_TOKEN', res.data.token)
      commit('SET_GUEST', false)
      return res
    }
    throw new Error(res.message || '登录失败')
  },
  async getUserInfo({ commit }) {
    const res = await getUserInfo()
    if (res.data) {
      commit('SET_USER_INFO', res.data)
    }
    return res
  },
  enterGuestMode({ commit }) {
    commit('SET_GUEST', true)
  },
  logout({ commit }) {
    commit('CLEAR_USER')
    commit('SET_GUEST', false)
    localStorage.removeItem('guest_conversations')
    localStorage.removeItem('guest_messages')
  },
  exitGuestMode({ commit }) {
    commit('SET_GUEST', false)
    localStorage.removeItem('guest_conversations')
    localStorage.removeItem('guest_messages')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
