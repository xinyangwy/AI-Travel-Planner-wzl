import { createStore } from 'vuex'
import axios from 'axios'

export default createStore({
  state: {
    user: null,
    token: null,
    plans: [],
    currentPlan: null,
    expenses: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    LOGOUT(state) {
      state.user = null
      state.token = null
      state.plans = []
      state.currentPlan = null
      state.expenses = []
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    },
    SET_PLANS(state, plans) {
      state.plans = plans
    },
    ADD_PLAN(state, plan) {
      state.plans.unshift(plan)
    },
    UPDATE_PLAN(state, updatedPlan) {
      const index = state.plans.findIndex(p => p.id === updatedPlan.id)
      if (index !== -1) {
        state.plans[index] = updatedPlan
      }
      if (state.currentPlan && state.currentPlan.id === updatedPlan.id) {
        state.currentPlan = updatedPlan
      }
    },
    DELETE_PLAN(state, planId) {
      state.plans = state.plans.filter(p => p.id !== planId)
      if (state.currentPlan && state.currentPlan.id === planId) {
        state.currentPlan = null
      }
    },
    SET_CURRENT_PLAN(state, plan) {
      state.currentPlan = plan
    },
    SET_EXPENSES(state, expenses) {
      state.expenses = expenses
    },
    ADD_EXPENSE(state, expense) {
      state.expenses.unshift(expense)
    },
    UPDATE_EXPENSE(state, updatedExpense) {
      const index = state.expenses.findIndex(e => e.id === updatedExpense.id)
      if (index !== -1) {
        state.expenses[index] = updatedExpense
      }
    },
    DELETE_EXPENSE(state, expenseId) {
      state.expenses = state.expenses.filter(e => e.id !== expenseId)
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    // 登录
    async login({ commit }, credentials) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.post('/auth/login', credentials)
        commit('SET_TOKEN', response.token)
        commit('SET_USER', response.user)
        commit('SET_ERROR', null)
        return response
      } catch (error) {
        commit('SET_ERROR', error.response.data.error || '登录失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 注册
    async register({ commit }, userData) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.post('/auth/register', userData)
        commit('SET_ERROR', null)
        return response
      } catch (error) {
        commit('SET_ERROR', error.response.data.error || '注册失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 获取用户个人资料
    async fetchProfile({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get('/user/profile')
        commit('SET_USER', response)
        commit('SET_ERROR', null)
        return response
      } catch (error) {
        commit('SET_ERROR', error.response.data.error || '获取个人资料失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 更新用户个人资料
    async updateProfile({ commit }, userData) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.put('/user/profile', userData)
        commit('SET_USER', response)
        commit('SET_ERROR', null)
        return response
      } catch (error) {
        commit('SET_ERROR', error.response.data.error || '更新个人资料失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 获取用户的旅行计划列表
    async fetchTravelPlans({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get('/travel/plans')
        commit('SET_PLANS', response)
        commit('SET_ERROR', null)
        return response
      } catch (error) {
        commit('SET_ERROR', error.response.data.error || '获取旅行计划列表失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 创建旅行计划
    async createTravelPlan({ commit }, planData) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.post('/travel/plan', planData)
        commit('ADD_PLAN', response)
        commit('SET_ERROR', null)
        return response
      } catch (error) {
        commit('SET_ERROR', error.response.data.error || '创建旅行计划失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 获取旅行计划详情
    async fetchTravelPlanById({ commit }, planId) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get(`/travel/plan/${planId}`)
        commit('SET_CURRENT_PLAN', response)
        commit('SET_ERROR', null)
        return response
      } catch (error) {
        commit('SET_ERROR', error.response.data.error || '获取旅行计划详情失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 更新旅行计划
    async updateTravelPlan({ commit }, { planId, planData }) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.put(`/travel/plan/${planId}`, planData)
        commit('UPDATE_PLAN', response)
        commit('SET_ERROR', null)
        return response
      } catch (error) {
        commit('SET_ERROR', error.response.data.error || '更新旅行计划失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 删除旅行计划
    async deleteTravelPlan({ commit }, planId) {
      commit('SET_LOADING', true)
      try {
        await axios.delete(`/travel/plan/${planId}`)
        commit('DELETE_PLAN', planId)
        commit('SET_ERROR', null)
      } catch (error) {
        commit('SET_ERROR', error.response.data.error || '删除旅行计划失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 生成行程
    async generateItinerary({ commit }, requestData) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.post('/travel/generate', requestData)
        commit('SET_ERROR', null)
        return response
      } catch (error) {
        commit('SET_ERROR', error.response.data.error || '生成行程失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 获取旅行计划的费用记录
    async fetchExpenses({ commit }, planId) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get(`/expense/plan/${planId}`)
        commit('SET_EXPENSES', response)
        commit('SET_ERROR', null)
        return response
      } catch (error) {
        commit('SET_ERROR', error.response.data.error || '获取费用记录失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 添加费用记录
    async addExpense({ commit }, expenseData) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.post('/expense', expenseData)
        commit('ADD_EXPENSE', response)
        commit('SET_ERROR', null)
        return response
      } catch (error) {
        commit('SET_ERROR', error.response.data.error || '添加费用记录失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 更新费用记录
    async updateExpense({ commit }, { expenseId, expenseData }) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.put(`/expense/${expenseId}`, expenseData)
        commit('UPDATE_EXPENSE', response)
        commit('SET_ERROR', null)
        return response
      } catch (error) {
        commit('SET_ERROR', error.response.data.error || '更新费用记录失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 删除费用记录
    async deleteExpense({ commit }, expenseId) {
      commit('SET_LOADING', true)
      try {
        await axios.delete(`/expense/${expenseId}`)
        commit('DELETE_EXPENSE', expenseId)
        commit('SET_ERROR', null)
      } catch (error) {
        commit('SET_ERROR', error.response.data.error || '删除费用记录失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 获取费用统计
    async fetchExpenseStatistics({ commit }, planId) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get(`/expense/statistics/${planId}`)
        commit('SET_ERROR', null)
        return response
      } catch (error) {
        commit('SET_ERROR', error.response.data.error || '获取费用统计失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 语音识别
    async recognizeVoice({ commit }, audioData) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.post('/voice/recognize', audioData)
        commit('SET_ERROR', null)
        return response
      } catch (error) {
        commit('SET_ERROR', error.response.data.error || '语音识别失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 语音记录费用
    async voiceExpense({ commit }, audioData) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.post('/voice/expense', audioData)
        commit('SET_ERROR', null)
        return response
      } catch (error) {
        commit('SET_ERROR', error.response.data.error || '语音记录费用失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {
    isAuthenticated: state => !!state.token,
    getUser: state => state.user,
    getPlans: state => state.plans,
    getCurrentPlan: state => state.currentPlan,
    getExpenses: state => state.expenses,
    getLoading: state => state.loading,
    getError: state => state.error
  }
})