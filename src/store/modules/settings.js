const state = {
  model: localStorage.getItem('chat-model') || 'gpt-3.5-turbo',
  temperature: parseFloat(localStorage.getItem('chat-temperature')) || 0.7,
  maxTokens: parseInt(localStorage.getItem('chat-maxTokens')) || 2048,
  streamEnabled: localStorage.getItem('chat-stream') !== 'false',
  theme: localStorage.getItem('chat-theme') || 'light'
}

const getters = {
  model: state => state.model,
  temperature: state => state.temperature,
  maxTokens: state => state.maxTokens,
  streamEnabled: state => state.streamEnabled,
  theme: state => state.theme
}

const mutations = {
  SET_MODEL(state, model) {
    state.model = model
    localStorage.setItem('chat-model', model)
  },
  SET_TEMPERATURE(state, temp) {
    state.temperature = temp
    localStorage.setItem('chat-temperature', String(temp))
  },
  SET_MAX_TOKENS(state, tokens) {
    state.maxTokens = tokens
    localStorage.setItem('chat-maxTokens', String(tokens))
  },
  SET_STREAM_ENABLED(state, enabled) {
    state.streamEnabled = enabled
    localStorage.setItem('chat-stream', String(enabled))
  },
  SET_THEME(state, theme) {
    state.theme = theme
    localStorage.setItem('chat-theme', theme)
  }
}

const actions = {
  updateSettings({ commit }, settings) {
    if (settings.model !== undefined) commit('SET_MODEL', settings.model)
    if (settings.temperature !== undefined) commit('SET_TEMPERATURE', settings.temperature)
    if (settings.maxTokens !== undefined) commit('SET_MAX_TOKENS', settings.maxTokens)
    if (settings.streamEnabled !== undefined) commit('SET_STREAM_ENABLED', settings.streamEnabled)
    if (settings.theme !== undefined) commit('SET_THEME', settings.theme)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
