/**
 * 费用管理相关 Vuex Module
 */
import { get, post, put, del } from '../../utils/request'
import { API, STORAGE_KEYS } from '../../constants'
import { localStorage } from '../../utils/storage'

const expense = {
  // 命名空间
  namespaced: true,
  
  // 状态
  state() {
    return {
      // 费用列表
      expenseList: [],
      // 当前费用详情
      currentExpense: null,
      // 费用统计数据
      statistics: {
        totalAmount: 0,
        categoryData: [],
        paymentMethodData: [],
        trendData: [],
        count: 0,
        averageAmount: 0,
        maxAmount: 0
      },
      // 加载状态
      loading: {
        list: false,
        detail: false,
        create: false,
        update: false,
        delete: false,
        statistics: false
      },
      // 分页信息
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      // 搜索条件
      searchParams: {
        keyword: '',
        type: '',
        paymentMethod: '',
        travelId: '',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: ''
      },
      // 缓存的费用数据
      cachedExpenses: {}
    }
  },
  
  // 获取器
  getters: {
    // 获取费用列表
    expenseList: state => state.expenseList,
    
    // 获取当前费用详情
    currentExpense: state => state.currentExpense,
    
    // 获取费用统计数据
    statistics: state => state.statistics,
    
    // 获取加载状态
    loading: state => state.loading,
    
    // 获取分页信息
    pagination: state => state.pagination,
    
    // 获取搜索条件
    searchParams: state => state.searchParams,
    
    // 根据ID获取费用
    getExpenseById: state => id => {
      return state.expenseList.find(expense => expense.id === id) || 
             state.cachedExpenses[id] || 
             null
    },
    
    // 按类型分组的费用
    expensesByType: state => {
      const grouped = {}
      state.expenseList.forEach(expense => {
        if (!grouped[expense.type]) {
          grouped[expense.type] = []
        }
        grouped[expense.type].push(expense)
      })
      return grouped
    },
    
    // 按支付方式分组的费用
    expensesByPaymentMethod: state => {
      const grouped = {}
      state.expenseList.forEach(expense => {
        if (!grouped[expense.paymentMethod]) {
          grouped[expense.paymentMethod] = []
        }
        grouped[expense.paymentMethod].push(expense)
      })
      return grouped
    },
    
    // 按旅行计划分组的费用
    expensesByTravel: state => {
      const grouped = {}
      state.expenseList.forEach(expense => {
        const travelId = expense.travelId || '未分类'
        if (!grouped[travelId]) {
          grouped[travelId] = []
        }
        grouped[travelId].push(expense)
      })
      return grouped
    },
    
    // 计算总费用
    totalAmount: state => {
      return state.expenseList.reduce((total, expense) => total + Number(expense.amount || 0), 0)
    },
    
    // 获取最大金额的费用
    maxAmountExpense: state => {
      if (state.expenseList.length === 0) return null
      return state.expenseList.reduce((max, expense) => 
        (Number(expense.amount || 0) > Number(max.amount || 0)) ? expense : max
      )
    },
    
    // 获取最近的费用记录
    recentExpenses: state => (count = 5) => {
      return [...state.expenseList]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, count)
    }
  },
  
  // 变更函数
  mutations: {
    // 设置费用列表
    SET_EXPENSE_LIST(state, { list, total }) {
      state.expenseList = list
      if (total !== undefined) {
        state.pagination.total = total
      }
      
      // 更新缓存
      list.forEach(expense => {
        state.cachedExpenses[expense.id] = expense
      })
      
      // 保存到本地存储
      localStorage.set(STORAGE_KEYS.CACHED_EXPENSES, state.cachedExpenses)
    },
    
    // 设置当前费用详情
    SET_CURRENT_EXPENSE(state, expense) {
      state.currentExpense = expense
      
      // 更新缓存
      if (expense && expense.id) {
        state.cachedExpenses[expense.id] = expense
        localStorage.set(STORAGE_KEYS.CACHED_EXPENSES, state.cachedExpenses)
      }
    },
    
    // 设置费用统计数据
    SET_STATISTICS(state, statistics) {
      state.statistics = { ...state.statistics, ...statistics }
    },
    
    // 设置加载状态
    SET_LOADING(state, { key, status }) {
      if (state.loading.hasOwnProperty(key)) {
        state.loading[key] = status
      }
    },
    
    // 设置分页信息
    SET_PAGINATION(state, pagination) {
      state.pagination = { ...state.pagination, ...pagination }
    },
    
    // 设置搜索条件
    SET_SEARCH_PARAMS(state, params) {
      state.searchParams = { ...state.searchParams, ...params }
    },
    
    // 添加费用
    ADD_EXPENSE(state, expense) {
      state.expenseList.unshift(expense)
      state.cachedExpenses[expense.id] = expense
      localStorage.set(STORAGE_KEYS.CACHED_EXPENSES, state.cachedExpenses)
      state.pagination.total += 1
    },
    
    // 更新费用
    UPDATE_EXPENSE(state, updatedExpense) {
      const index = state.expenseList.findIndex(e => e.id === updatedExpense.id)
      if (index !== -1) {
        state.expenseList.splice(index, 1, updatedExpense)
      }
      
      // 更新缓存
      state.cachedExpenses[updatedExpense.id] = updatedExpense
      localStorage.set(STORAGE_KEYS.CACHED_EXPENSES, state.cachedExpenses)
      
      // 如果当前查看的就是这个费用，也更新currentExpense
      if (state.currentExpense && state.currentExpense.id === updatedExpense.id) {
        state.currentExpense = updatedExpense
      }
    },
    
    // 删除费用
    DELETE_EXPENSE(state, expenseId) {
      const index = state.expenseList.findIndex(e => e.id === expenseId)
      if (index !== -1) {
        state.expenseList.splice(index, 1)
        state.pagination.total -= 1
      }
      
      // 从缓存中删除
      if (state.cachedExpenses[expenseId]) {
        delete state.cachedExpenses[expenseId]
        localStorage.set(STORAGE_KEYS.CACHED_EXPENSES, state.cachedExpenses)
      }
      
      // 如果当前查看的就是这个费用，清空currentExpense
      if (state.currentExpense && state.currentExpense.id === expenseId) {
        state.currentExpense = null
      }
    },
    
    // 初始化缓存
    INIT_CACHE(state) {
      const cachedExpenses = localStorage.get(STORAGE_KEYS.CACHED_EXPENSES, {})
      state.cachedExpenses = cachedExpenses
    },
    
    // 清除当前费用
    CLEAR_CURRENT_EXPENSE(state) {
      state.currentExpense = null
    },
    
    // 重置统计数据
    RESET_STATISTICS(state) {
      state.statistics = {
        totalAmount: 0,
        categoryData: [],
        paymentMethodData: [],
        trendData: [],
        count: 0,
        averageAmount: 0,
        maxAmount: 0
      }
    }
  },
  
  // 动作函数
  actions: {
    // 初始化缓存
    initCache({ commit }) {
      commit('INIT_CACHE')
    },
    
    // 获取费用列表
    async getExpenseList({ commit, state, dispatch }, params = {}) {
      try {
        commit('SET_LOADING', { key: 'list', status: true })
        
        // 合并搜索条件和分页信息
        const queryParams = {
          ...state.searchParams,
          ...state.pagination,
          ...params
        }
        
        const response = await get(API.ENDPOINTS.EXPENSE_LIST, queryParams)
        
        commit('SET_EXPENSE_LIST', {
          list: response.records || [],
          total: response.total || 0
        })
        
        return response
      } catch (error) {
        console.error('获取费用列表失败:', error)
        dispatch('showMessage', { message: '获取费用列表失败', type: 'error' }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { key: 'list', status: false })
      }
    },
    
    // 获取费用详情
    async getExpenseDetail({ commit, state, dispatch }, expenseId) {
      try {
        // 先检查缓存
        if (state.cachedExpenses[expenseId]) {
          commit('SET_CURRENT_EXPENSE', state.cachedExpenses[expenseId])
          return state.cachedExpenses[expenseId]
        }
        
        commit('SET_LOADING', { key: 'detail', status: true })
        
        const expenseDetail = await get(`${API.ENDPOINTS.EXPENSE_DETAIL}/${expenseId}`)
        commit('SET_CURRENT_EXPENSE', expenseDetail)
        
        return expenseDetail
      } catch (error) {
        console.error('获取费用详情失败:', error)
        dispatch('showMessage', { message: '获取费用详情失败', type: 'error' }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { key: 'detail', status: false })
      }
    },
    
    // 创建费用
    async createExpense({ commit, dispatch }, expenseData) {
      try {
        commit('SET_LOADING', { key: 'create', status: true })
        
        const newExpense = await post(API.ENDPOINTS.EXPENSE_CREATE, expenseData)
        commit('ADD_EXPENSE', newExpense)
        
        dispatch('showMessage', { message: '费用记录创建成功', type: 'success' }, { root: true })
        return newExpense
      } catch (error) {
        console.error('创建费用记录失败:', error)
        dispatch('showMessage', { message: '创建费用记录失败', type: 'error' }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { key: 'create', status: false })
      }
    },
    
    // 更新费用
    async updateExpense({ commit, dispatch }, { id, data }) {
      try {
        commit('SET_LOADING', { key: 'update', status: true })
        
        const updatedExpense = await put(`${API.ENDPOINTS.EXPENSE_UPDATE}/${id}`, data)
        commit('UPDATE_EXPENSE', updatedExpense)
        
        dispatch('showMessage', { message: '费用记录更新成功', type: 'success' }, { root: true })
        return updatedExpense
      } catch (error) {
        console.error('更新费用记录失败:', error)
        dispatch('showMessage', { message: '更新费用记录失败', type: 'error' }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { key: 'update', status: false })
      }
    },
    
    // 删除费用
    async deleteExpense({ commit, dispatch }, expenseId) {
      try {
        commit('SET_LOADING', { key: 'delete', status: true })
        
        await del(`${API.ENDPOINTS.EXPENSE_DELETE}/${expenseId}`)
        commit('DELETE_EXPENSE', expenseId)
        
        dispatch('showMessage', { message: '费用记录删除成功', type: 'success' }, { root: true })
      } catch (error) {
        console.error('删除费用记录失败:', error)
        dispatch('showMessage', { message: '删除费用记录失败', type: 'error' }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { key: 'delete', status: false })
      }
    },
    
    // 获取费用统计数据
    async getExpenseStatistics({ commit, dispatch }, params = {}) {
      try {
        commit('SET_LOADING', { key: 'statistics', status: true })
        
        const statistics = await get(API.ENDPOINTS.EXPENSE_STATISTICS, params)
        commit('SET_STATISTICS', statistics)
        
        return statistics
      } catch (error) {
        console.error('获取费用统计数据失败:', error)
        dispatch('showMessage', { message: '获取费用统计数据失败', type: 'error' }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { key: 'statistics', status: false })
      }
    },
    
    // 批量删除费用
    async batchDeleteExpenses({ dispatch }, expenseIds) {
      try {
        // 循环删除每个费用
        for (const id of expenseIds) {
          await dispatch('deleteExpense', id)
        }
        
        dispatch('showMessage', { message: '批量删除成功', type: 'success' }, { root: true })
      } catch (error) {
        console.error('批量删除费用失败:', error)
        dispatch('showMessage', { message: '批量删除失败', type: 'error' }, { root: true })
        throw error
      }
    },
    
    // 设置搜索条件
    setSearchParams({ commit }, params) {
      commit('SET_SEARCH_PARAMS', params)
    },
    
    // 设置分页信息
    setPagination({ commit }, pagination) {
      commit('SET_PAGINATION', pagination)
    },
    
    // 清除当前费用
    clearCurrentExpense({ commit }) {
      commit('CLEAR_CURRENT_EXPENSE')
    },
    
    // 重置统计数据
    resetStatistics({ commit }) {
      commit('RESET_STATISTICS')
    }
  }
}

export default expense