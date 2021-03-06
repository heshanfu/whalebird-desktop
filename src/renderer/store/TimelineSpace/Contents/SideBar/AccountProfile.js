import Mastodon from 'megalodon'
import Timeline from './AccountProfile/Timeline'
import Follows from './AccountProfile/Follows'
import Followers from './AccountProfile/Followers'

const AccountProfile = {
  namespaced: true,
  modules: {
    Timeline,
    Follows,
    Followers
  },
  state: {
    account: null,
    relationship: null,
    loading: false
  },
  mutations: {
    changeAccount (state, account) {
      state.account = account
    },
    changeRelationship (state, relationship) {
      state.relationship = relationship
    },
    changeLoading (state, value) {
      state.loading = value
    }
  },
  actions: {
    searchAccount ({ commit, rootState }, accountURL) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get('/search', { q: accountURL })
        .then(data => {
          if (data.accounts.length <= 0) throw new AccountNotFound('not found')
          return data.accounts[0]
        })
    },
    changeAccount ({ commit, dispatch }, account) {
      dispatch('fetchRelationship', account)
      commit('changeAccount', account)
    },
    fetchRelationship ({ state, commit, rootState }, account) {
      commit('changeRelationship', null)
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get('/accounts/relationships', { id: [account.id] })
        .then(data => {
          commit('changeRelationship', data[0])
          return data
        })
    },
    follow ({ state, commit, rootState }, account) {
      commit('changeLoading', true)
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/accounts/${account.id}/follow`)
        .then(data => {
          commit('changeLoading', false)
          commit('changeRelationship', data)
          return data
        })
        .catch(err => {
          commit('changeLoading', false)
          throw err
        })
    },
    unfollow ({ state, commit, rootState }, account) {
      commit('changeLoading', true)
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/accounts/${account.id}/unfollow`)
        .then(data => {
          commit('changeLoading', false)
          commit('changeRelationship', data)
          return data
        })
        .catch(err => {
          commit('changeLoading', false)
          throw err
        })
    },
    close ({ commit }) {
      commit('changeAccount', null)
    }
  }
}

class AccountNotFound {
  constructor (msg) {
    this.msg = msg
  }
}

export default AccountProfile
