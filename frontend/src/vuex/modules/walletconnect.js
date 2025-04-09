export default () => {
  const state = {
    connector: null
  }

  const mutations = {
    setWalletConnectConnector(state, connector) {
      state.connector = connector
    }
  }

  const actions = {
    saveWalletConnectConnector({ commit }, { connector }) {
      commit('setWalletConnectConnector', connector)
    }
  }

  const getters = {
    getWalletConnectConnector: state => state.connector
  }

  return {
    state,
    mutations,
    actions,
    getters
  }
}
