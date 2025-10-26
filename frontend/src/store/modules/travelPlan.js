/**
 * 旅行计划模块
 * 管理旅行计划相关的状态
 */

import travelPlanService from '@/services/travelPlanService'
import eventBus from '@/utils/eventBus'

export default {
  namespaced: true,
  
  state: {
    // 旅行计划列表
    plans: [],
    
    // 当前选中的旅行计划
    currentPlan: null,
    
    // 加载状态
    loading: {
      list: false,
      detail: false,
      create: false,
      update: false,
      delete: false,
      stats: false
    },
    
    // 分页信息
    pagination: {
      currentPage: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    },
    
    // 筛选条件
    filters: {
      search: '',
      status: '',
      startDate: null,
      endDate: null,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    },
    
    // 统计数据
    statistics: {
      totalPlans: 0,
      activePlans: 0,
      completedPlans: 0,
      upcomingPlans: 0,
      recentExpenses: 0,
      totalDays: 0
    },
    
    // 错误信息
    error: null
  },
  
  getters: {
    /**
     * 获取所有旅行计划
     */
    allPlans: state => state.plans,
    
    /**
     * 获取当前旅行计划
     */
    currentPlan: state => state.currentPlan,
    
    /**
     * 获取加载状态
     */
    loading: state => state.loading,
    
    /**
     * 获取分页信息
     */
    pagination: state => state.pagination,
    
    /**
     * 获取筛选条件
     */
    filters: state => state.filters,
    
    /**
     * 获取统计数据
     */
    statistics: state => state.statistics,
    
    /**
     * 获取错误信息
     */
    error: state => state.error,
    
    /**
     * 根据ID获取旅行计划
     */
    getPlanById: state => id => {
      return state.plans.find(plan => plan.id === id) || state.currentPlan?.id === id ? state.currentPlan : null
    },
    
    /**
     * 获取活跃的旅行计划
     */
    activePlans: state => {
      return state.plans.filter(plan => plan.status === 'ACTIVE')
    },
    
    /**
     * 获取已完成的旅行计划
     */
    completedPlans: state => {
      return state.plans.filter(plan => plan.status === 'COMPLETED')
    },
    
    /**
     * 获取即将到来的旅行计划
     */
    upcomingPlans: state => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      return state.plans.filter(plan => {
        const startDate = new Date(plan.startDate)
        return startDate >= today && plan.status !== 'COMPLETED'
      }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    },
    
    /**
     * 获取进行中的旅行计划
     */
    ongoingPlans: state => {
      const today = new Date()
      
      return state.plans.filter(plan => {
        const startDate = new Date(plan.startDate)
        const endDate = new Date(plan.endDate)
        return today >= startDate && today <= endDate && plan.status !== 'COMPLETED'
      })
    }
  },
  
  mutations: {
    /**
     * 设置旅行计划列表
     */
    SET_PLANS(state, plans) {
      state.plans = plans
    },
    
    /**
     * 设置当前旅行计划
     */
    SET_CURRENT_PLAN(state, plan) {
      state.currentPlan = plan
    },
    
    /**
     * 添加旅行计划
     */
    ADD_PLAN(state, plan) {
      state.plans.unshift(plan)
    },
    
    /**
     * 更新旅行计划
     */
    UPDATE_PLAN(state, updatedPlan) {
      // 更新列表中的计划
      const index = state.plans.findIndex(plan => plan.id === updatedPlan.id)
      if (index !== -1) {
        state.plans.splice(index, 1, updatedPlan)
      }
      
      // 更新当前计划（如果匹配）
      if (state.currentPlan && state.currentPlan.id === updatedPlan.id) {
        state.currentPlan = updatedPlan
      }
    },
    
    /**
     * 删除旅行计划
     */
    DELETE_PLAN(state, planId) {
      const index = state.plans.findIndex(plan => plan.id === planId)
      if (index !== -1) {
        state.plans.splice(index, 1)
      }
      
      // 如果删除的是当前计划，清空当前计划
      if (state.currentPlan && state.currentPlan.id === planId) {
        state.currentPlan = null
      }
    },
    
    /**
     * 设置加载状态
     */
    SET_LOADING(state, { type, status }) {
      if (state.loading.hasOwnProperty(type)) {
        state.loading[type] = status
      }
    },
    
    /**
     * 设置分页信息
     */
    SET_PAGINATION(state, pagination) {
      state.pagination = { ...state.pagination, ...pagination }
    },
    
    /**
     * 设置筛选条件
     */
    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters }
    },
    
    /**
     * 设置统计数据
     */
    SET_STATISTICS(state, statistics) {
      state.statistics = { ...state.statistics, ...statistics }
    },
    
    /**
     * 设置错误信息
     */
    SET_ERROR(state, error) {
      state.error = error
    },
    
    /**
     * 清空旅行计划
     */
    CLEAR_PLANS(state) {
      state.plans = []
      state.currentPlan = null
      state.pagination = {
        currentPage: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
      }
    }
  },
  
  actions: {
    /**
     * 获取旅行计划列表
     */
    async getTravelPlans({ commit, state, dispatch }, { page = 1, pageSize = 10, resetFilters = false } = {}) {
      try {
        commit('SET_LOADING', { type: 'list', status: true })
        commit('SET_ERROR', null)
        
        // 如果重置筛选条件
        if (resetFilters) {
          commit('SET_FILTERS', {
            search: '',
            status: '',
            startDate: null,
            endDate: null,
            sortBy: 'createdAt',
            sortOrder: 'desc'
          })
        }
        
        // 构建请求参数
        const params = {
          page,
          pageSize,
          ...state.filters
        }
        
        // 调用服务获取旅行计划列表
        const response = await travelPlanService.getTravelPlans(params)
        const { data, meta } = response.data
        
        // 设置旅行计划列表和分页信息
        commit('SET_PLANS', data)
        commit('SET_PAGINATION', {
          currentPage: meta.currentPage,
          pageSize: meta.pageSize,
          total: meta.total,
          totalPages: meta.totalPages
        })
        
        return data
      } catch (error) {
        const errorMessage = error.response?.data?.message || '获取旅行计划列表失败'
        commit('SET_ERROR', errorMessage)
        dispatch('showError', { message: errorMessage }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { type: 'list', status: false })
      }
    },
    
    /**
     * 获取旅行计划详情
     */
    async loadTravelPlan({ commit, state, dispatch }, planId) {
      try {
        commit('SET_LOADING', { type: 'detail', status: true })
        commit('SET_ERROR', null)
        
        // 先检查缓存中是否已有该计划
        const cachedPlan = state.plans.find(plan => plan.id === planId)
        if (cachedPlan) {
          commit('SET_CURRENT_PLAN', cachedPlan)
          return cachedPlan
        }
        
        // 调用服务获取旅行计划详情
        const response = await travelPlanService.getTravelPlanById(planId)
        const plan = response.data
        
        // 设置当前旅行计划
        commit('SET_CURRENT_PLAN', plan)
        
        return plan
      } catch (error) {
        const errorMessage = error.response?.data?.message || '获取旅行计划详情失败'
        commit('SET_ERROR', errorMessage)
        dispatch('showError', { message: errorMessage }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { type: 'detail', status: false })
      }
    },
    
    /**
     * 创建旅行计划
     */
    async createTravelPlan({ commit, dispatch }, planData) {
      try {
        commit('SET_LOADING', { type: 'create', status: true })
        commit('SET_ERROR', null)
        
        // 调用服务创建旅行计划
        const response = await travelPlanService.createTravelPlan(planData)
        const newPlan = response.data
        
        // 添加到计划列表
        commit('ADD_PLAN', newPlan)
        
        // 触发创建成功事件
        eventBus.emit('travelPlan:created', newPlan)
        
        // 显示成功消息
        dispatch('showSuccess', '旅行计划创建成功', { root: true })
        
        return newPlan
      } catch (error) {
        const errorMessage = error.response?.data?.message || '创建旅行计划失败'
        commit('SET_ERROR', errorMessage)
        dispatch('showError', { message: errorMessage }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { type: 'create', status: false })
      }
    },
    
    /**
     * 更新旅行计划
     */
    async updateTravelPlan({ commit, dispatch }, { planId, planData }) {
      try {
        commit('SET_LOADING', { type: 'update', status: true })
        commit('SET_ERROR', null)
        
        // 调用服务更新旅行计划
        const response = await travelPlanService.updateTravelPlan(planId, planData)
        const updatedPlan = response.data
        
        // 更新计划
        commit('UPDATE_PLAN', updatedPlan)
        
        // 触发更新成功事件
        eventBus.emit('travelPlan:updated', updatedPlan)
        
        // 显示成功消息
        dispatch('showSuccess', '旅行计划更新成功', { root: true })
        
        return updatedPlan
      } catch (error) {
        const errorMessage = error.response?.data?.message || '更新旅行计划失败'
        commit('SET_ERROR', errorMessage)
        dispatch('showError', { message: errorMessage }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { type: 'update', status: false })
      }
    },
    
    /**
     * 删除旅行计划
     */
    async deleteTravelPlan({ commit, dispatch, state }, planId) {
      try {
        commit('SET_LOADING', { type: 'delete', status: true })
        commit('SET_ERROR', null)
        
        // 调用服务删除旅行计划
        await travelPlanService.deleteTravelPlan(planId)
        
        // 从列表中删除
        commit('DELETE_PLAN', planId)
        
        // 如果删除的是当前活跃计划，清空活跃计划ID
        if (state.currentPlan && state.currentPlan.id === planId) {
          dispatch('setActivePlan', null, { root: true })
        }
        
        // 触发删除成功事件
        eventBus.emit('travelPlan:deleted', planId)
        
        // 显示成功消息
        dispatch('showSuccess', '旅行计划删除成功', { root: true })
        
        return true
      } catch (error) {
        const errorMessage = error.response?.data?.message || '删除旅行计划失败'
        commit('SET_ERROR', errorMessage)
        dispatch('showError', { message: errorMessage }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { type: 'delete', status: false })
      }
    },
    
    /**
     * 切换旅行计划状态
     */
    async togglePlanStatus({ commit, dispatch }, { planId, status }) {
      try {
        // 调用服务更新状态
        const response = await travelPlanService.updateTravelPlanStatus(planId, status)
        const updatedPlan = response.data
        
        // 更新计划
        commit('UPDATE_PLAN', updatedPlan)
        
        // 触发状态更新事件
        eventBus.emit('travelPlan:status-changed', { planId, status })
        
        // 显示成功消息
        const statusText = status === 'COMPLETED' ? '已完成' : status === 'ACTIVE' ? '已激活' : '已取消'
        dispatch('showSuccess', `旅行计划${statusText}`, { root: true })
        
        return updatedPlan
      } catch (error) {
        const errorMessage = error.response?.data?.message || '更新旅行计划状态失败'
        commit('SET_ERROR', errorMessage)
        dispatch('showError', { message: errorMessage }, { root: true })
        throw error
      }
    },
    
    /**
     * 复制旅行计划
     */
    async duplicateTravelPlan({ commit, dispatch }, planId) {
      try {
        // 调用服务复制旅行计划
        const response = await travelPlanService.duplicateTravelPlan(planId)
        const newPlan = response.data
        
        // 添加到计划列表
        commit('ADD_PLAN', newPlan)
        
        // 显示成功消息
        dispatch('showSuccess', '旅行计划复制成功', { root: true })
        
        return newPlan
      } catch (error) {
        const errorMessage = error.response?.data?.message || '复制旅行计划失败'
        commit('SET_ERROR', errorMessage)
        dispatch('showError', { message: errorMessage }, { root: true })
        throw error
      }
    },
    
    /**
     * 获取旅行计划统计数据
     */
    async getTravelPlanStatistics({ commit, dispatch }) {
      try {
        commit('SET_LOADING', { type: 'stats', status: true })
        
        // 调用服务获取统计数据
        const response = await travelPlanService.getTravelPlanStatistics()
        const statistics = response.data
        
        // 设置统计数据
        commit('SET_STATISTICS', statistics)
        
        return statistics
      } catch (error) {
        console.error('获取旅行计划统计数据失败:', error)
        // 统计数据获取失败不应该阻止用户操作，所以不显示错误消息
        return state.statistics
      } finally {
        commit('SET_LOADING', { type: 'stats', status: false })
      }
    },
    
    /**
     * 设置筛选条件
     */
    setFilters({ commit, dispatch }, filters) {
      commit('SET_FILTERS', filters)
      // 筛选条件改变时，重新获取旅行计划列表
      dispatch('getTravelPlans', { page: 1 })
    },
    
    /**
     * 清空旅行计划
     */
    clearTravelPlans({ commit }) {
      commit('CLEAR_PLANS')
    },
    
    /**
     * 清除错误信息
     */
    clearError({ commit }) {
      commit('SET_ERROR', null)
    }
  }
}