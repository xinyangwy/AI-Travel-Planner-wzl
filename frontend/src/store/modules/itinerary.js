/**
 * 行程模块
 * 管理旅行行程相关的状态
 */

import Vue from 'vue'
import itineraryService from '@/services/itineraryService'
import eventBus from '@/utils/eventBus'

export default {
  namespaced: true,
  
  state: {
    // 行程列表，按旅行计划ID分组
    itinerariesByPlan: {},
    
    // 当前选中的行程
    currentItinerary: null,
    
    // 加载状态
    loading: {
      list: false,
      detail: false,
      create: false,
      update: false,
      delete: false,
      batch: false
    },
    
    // 筛选条件
    filters: {
      date: null,
      type: '',
      search: ''
    },
    
    // 错误信息
    error: null
  },
  
  getters: {
    /**
     * 获取指定旅行计划的所有行程
     */
    getItinerariesByPlanId: state => planId => {
      return state.itinerariesByPlan[planId] || []
    },
    
    /**
     * 获取当前行程
     */
    currentItinerary: state => state.currentItinerary,
    
    /**
     * 获取加载状态
     */
    loading: state => state.loading,
    
    /**
     * 获取筛选条件
     */
    filters: state => state.filters,
    
    /**
     * 获取错误信息
     */
    error: state => state.error,
    
    /**
     * 根据ID获取行程
     */
    getItineraryById: state => (planId, itineraryId) => {
      const itineraries = state.itinerariesByPlan[planId] || []
      return itineraries.find(item => item.id === itineraryId) || null
    },
    
    /**
     * 获取指定日期的行程
     */
    getItinerariesByDate: state => (planId, date) => {
      const itineraries = state.itinerariesByPlan[planId] || []
      const targetDate = new Date(date).toISOString().split('T')[0]
      
      return itineraries
        .filter(item => item.startTime.split('T')[0] === targetDate)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    },
    
    /**
     * 获取行程类型统计
     */
    getItineraryTypeStats: state => planId => {
      const itineraries = state.itinerariesByPlan[planId] || []
      const stats = {}
      
      itineraries.forEach(item => {
        if (!stats[item.type]) {
          stats[item.type] = 0
        }
        stats[item.type]++
      })
      
      return stats
    },
    
    /**
     * 获取行程按日期分组
     */
    getItinerariesGroupedByDate: state => planId => {
      const itineraries = state.itinerariesByPlan[planId] || []
      const grouped = {}
      
      itineraries.forEach(item => {
        const date = item.startTime.split('T')[0]
        if (!grouped[date]) {
          grouped[date] = []
        }
        grouped[date].push(item)
      })
      
      // 对每天的行程按时间排序
      Object.keys(grouped).forEach(date => {
        grouped[date].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      })
      
      return grouped
    },
    
    /**
     * 获取筛选后的行程
     */
    getFilteredItineraries: state => planId => {
      let itineraries = state.itinerariesByPlan[planId] || []
      
      // 按日期筛选
      if (state.filters.date) {
        const targetDate = new Date(state.filters.date).toISOString().split('T')[0]
        itineraries = itineraries.filter(item => item.startTime.split('T')[0] === targetDate)
      }
      
      // 按类型筛选
      if (state.filters.type) {
        itineraries = itineraries.filter(item => item.type === state.filters.type)
      }
      
      // 按搜索文本筛选
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        itineraries = itineraries.filter(item => 
          item.title.toLowerCase().includes(searchLower) || 
          item.description.toLowerCase().includes(searchLower) ||
          item.location.toLowerCase().includes(searchLower)
        )
      }
      
      // 按开始时间排序
      itineraries.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      
      return itineraries
    }
  },
  
  mutations: {
    /**
     * 设置旅行计划的行程列表
     */
    SET_ITINERARIES(state, { planId, itineraries }) {
      Vue.set(state.itinerariesByPlan, planId, itineraries)
    },
    
    /**
     * 设置当前行程
     */
    SET_CURRENT_ITINERARY(state, itinerary) {
      state.currentItinerary = itinerary
    },
    
    /**
     * 添加行程
     */
    ADD_ITINERARY(state, { planId, itinerary }) {
      if (!state.itinerariesByPlan[planId]) {
        Vue.set(state.itinerariesByPlan, planId, [])
      }
      state.itinerariesByPlan[planId].push(itinerary)
    },
    
    /**
     * 更新行程
     */
    UPDATE_ITINERARY(state, { planId, updatedItinerary }) {
      if (!state.itinerariesByPlan[planId]) return
      
      const index = state.itinerariesByPlan[planId].findIndex(item => item.id === updatedItinerary.id)
      if (index !== -1) {
        state.itinerariesByPlan[planId].splice(index, 1, updatedItinerary)
      }
      
      // 更新当前行程（如果匹配）
      if (state.currentItinerary && state.currentItinerary.id === updatedItinerary.id) {
        state.currentItinerary = updatedItinerary
      }
    },
    
    /**
     * 删除行程
     */
    DELETE_ITINERARY(state, { planId, itineraryId }) {
      if (!state.itinerariesByPlan[planId]) return
      
      const index = state.itinerariesByPlan[planId].findIndex(item => item.id === itineraryId)
      if (index !== -1) {
        state.itinerariesByPlan[planId].splice(index, 1)
      }
      
      // 如果删除的是当前行程，清空当前行程
      if (state.currentItinerary && state.currentItinerary.id === itineraryId) {
        state.currentItinerary = null
      }
    },
    
    /**
     * 批量更新行程
     */
    BATCH_UPDATE_ITINERARIES(state, { planId, updatedItineraries }) {
      if (!state.itinerariesByPlan[planId]) return
      
      updatedItineraries.forEach(updatedItem => {
        const index = state.itinerariesByPlan[planId].findIndex(item => item.id === updatedItem.id)
        if (index !== -1) {
          state.itinerariesByPlan[planId][index] = updatedItem
        }
      })
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
     * 设置筛选条件
     */
    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters }
    },
    
    /**
     * 设置错误信息
     */
    SET_ERROR(state, error) {
      state.error = error
    },
    
    /**
     * 清空指定旅行计划的行程
     */
    CLEAR_PLAN_ITINERARIES(state, planId) {
      if (state.itinerariesByPlan[planId]) {
        Vue.delete(state.itinerariesByPlan, planId)
      }
    },
    
    /**
     * 清空所有行程
     */
    CLEAR_ALL_ITINERARIES(state) {
      state.itinerariesByPlan = {}
      state.currentItinerary = null
    }
  },
  
  actions: {
    /**
     * 获取旅行计划的行程列表
     */
    async getItineraries({ commit, dispatch }, planId) {
      try {
        commit('SET_LOADING', { type: 'list', status: true })
        commit('SET_ERROR', null)
        
        // 调用服务获取行程列表
        const response = await itineraryService.getItinerariesByPlanId(planId)
        const itineraries = response.data
        
        // 设置行程列表
        commit('SET_ITINERARIES', { planId, itineraries })
        
        return itineraries
      } catch (error) {
        const errorMessage = error.response?.data?.message || '获取行程列表失败'
        commit('SET_ERROR', errorMessage)
        dispatch('showError', { message: errorMessage }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { type: 'list', status: false })
      }
    },
    
    /**
     * 获取行程详情
     */
    async getItineraryDetail({ commit, dispatch, state }, { planId, itineraryId }) {
      try {
        commit('SET_LOADING', { type: 'detail', status: true })
        commit('SET_ERROR', null)
        
        // 先检查缓存中是否已有该行程
        const cachedItinerary = state.itinerariesByPlan[planId]?.find(item => item.id === itineraryId)
        if (cachedItinerary) {
          commit('SET_CURRENT_ITINERARY', cachedItinerary)
          return cachedItinerary
        }
        
        // 调用服务获取行程详情
        const response = await itineraryService.getItineraryById(itineraryId)
        const itinerary = response.data
        
        // 设置当前行程
        commit('SET_CURRENT_ITINERARY', itinerary)
        
        return itinerary
      } catch (error) {
        const errorMessage = error.response?.data?.message || '获取行程详情失败'
        commit('SET_ERROR', errorMessage)
        dispatch('showError', { message: errorMessage }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { type: 'detail', status: false })
      }
    },
    
    /**
     * 创建行程
     */
    async createItinerary({ commit, dispatch }, { planId, itineraryData }) {
      try {
        commit('SET_LOADING', { type: 'create', status: true })
        commit('SET_ERROR', null)
        
        // 调用服务创建行程
        const response = await itineraryService.createItinerary(planId, itineraryData)
        const newItinerary = response.data
        
        // 添加到行程列表
        commit('ADD_ITINERARY', { planId, itinerary: newItinerary })
        
        // 触发创建成功事件
        eventBus.emit('itinerary:created', { planId, itinerary: newItinerary })
        
        // 显示成功消息
        dispatch('showSuccess', '行程创建成功', { root: true })
        
        return newItinerary
      } catch (error) {
        const errorMessage = error.response?.data?.message || '创建行程失败'
        commit('SET_ERROR', errorMessage)
        dispatch('showError', { message: errorMessage }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { type: 'create', status: false })
      }
    },
    
    /**
     * 更新行程
     */
    async updateItinerary({ commit, dispatch }, { planId, itineraryId, itineraryData }) {
      try {
        commit('SET_LOADING', { type: 'update', status: true })
        commit('SET_ERROR', null)
        
        // 调用服务更新行程
        const response = await itineraryService.updateItinerary(itineraryId, itineraryData)
        const updatedItinerary = response.data
        
        // 更新行程
        commit('UPDATE_ITINERARY', { planId, updatedItinerary })
        
        // 触发更新成功事件
        eventBus.emit('itinerary:updated', { planId, itinerary: updatedItinerary })
        
        // 显示成功消息
        dispatch('showSuccess', '行程更新成功', { root: true })
        
        return updatedItinerary
      } catch (error) {
        const errorMessage = error.response?.data?.message || '更新行程失败'
        commit('SET_ERROR', errorMessage)
        dispatch('showError', { message: errorMessage }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { type: 'update', status: false })
      }
    },
    
    /**
     * 删除行程
     */
    async deleteItinerary({ commit, dispatch }, { planId, itineraryId }) {
      try {
        commit('SET_LOADING', { type: 'delete', status: true })
        commit('SET_ERROR', null)
        
        // 调用服务删除行程
        await itineraryService.deleteItinerary(itineraryId)
        
        // 从列表中删除
        commit('DELETE_ITINERARY', { planId, itineraryId })
        
        // 触发删除成功事件
        eventBus.emit('itinerary:deleted', { planId, itineraryId })
        
        // 显示成功消息
        dispatch('showSuccess', '行程删除成功', { root: true })
        
        return true
      } catch (error) {
        const errorMessage = error.response?.data?.message || '删除行程失败'
        commit('SET_ERROR', errorMessage)
        dispatch('showError', { message: errorMessage }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { type: 'delete', status: false })
      }
    },
    
    /**
     * 批量更新行程（用于重新排序等）
     */
    async batchUpdateItineraries({ commit, dispatch }, { planId, itineraries }) {
      try {
        commit('SET_LOADING', { type: 'batch', status: true })
        commit('SET_ERROR', null)
        
        // 调用服务批量更新行程
        const response = await itineraryService.batchUpdateItineraries(itineraries)
        const updatedItineraries = response.data
        
        // 更新行程列表
        commit('BATCH_UPDATE_ITINERARIES', { planId, updatedItineraries })
        
        // 触发批量更新事件
        eventBus.emit('itinerary:batch-updated', { planId, itineraries: updatedItineraries })
        
        return updatedItineraries
      } catch (error) {
        const errorMessage = error.response?.data?.message || '批量更新行程失败'
        commit('SET_ERROR', errorMessage)
        dispatch('showError', { message: errorMessage }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { type: 'batch', status: false })
      }
    },
    
    /**
     * 复制行程
     */
    async duplicateItinerary({ commit, dispatch }, { planId, itineraryId, newDate }) {
      try {
        // 调用服务复制行程
        const response = await itineraryService.duplicateItinerary(itineraryId, newDate)
        const newItinerary = response.data
        
        // 添加到行程列表
        commit('ADD_ITINERARY', { planId, itinerary: newItinerary })
        
        // 显示成功消息
        dispatch('showSuccess', '行程复制成功', { root: true })
        
        return newItinerary
      } catch (error) {
        const errorMessage = error.response?.data?.message || '复制行程失败'
        commit('SET_ERROR', errorMessage)
        dispatch('showError', { message: errorMessage }, { root: true })
        throw error
      }
    },
    
    /**
     * 设置筛选条件
     */
    setFilters({ commit }, filters) {
      commit('SET_FILTERS', filters)
    },
    
    /**
     * 清空指定旅行计划的行程
     */
    clearPlanItineraries({ commit }, planId) {
      commit('CLEAR_PLAN_ITINERARIES', planId)
    },
    
    /**
     * 清空所有行程
     */
    clearItineraries({ commit }) {
      commit('CLEAR_ALL_ITINERARIES')
    },
    
    /**
     * 清除错误信息
     */
    clearError({ commit }) {
      commit('SET_ERROR', null)
    }
  }
}