/**
 * Vuex 用户状态管理
 */

const state = {
  isGuest: true  // 是否为游客模式
}

const getters = {
  isGuest: state => state.isGuest,
  isAuthenticated: state => true  // 本地模式始终认证通过
}

const mutations = {
  SET_GUEST(state, isGuest) {
    state.isGuest = isGuest
  }
}

const actions = {
  // 进入游客模式
  enterGuestMode({ commit }) {
    commit('SET_GUEST', true)
  },
  // 退出登录
  logout({ commit }) {
    commit('SET_GUEST', true)
    // 清除本地存储的游客数据
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
