/**
 * 旅行计划相关 Vuex Module
 */
import { get, post, put, del } from '../../utils/request'
import { API, STORAGE_KEYS } from '../../constants'
import { localStorage } from '../../utils/storage'

const travel = {
  // 命名空间
  namespaced: true,
  
  // 状态
  state() {
    return {
      // 旅行计划列表
      travelList: [],
      // 当前旅行计划详情
      currentTravel: null,
      // 行程安排列表
      itineraryList: [],
      // 加载状态
      loading: {
        list: false,
        detail: false,
        create: false,
        update: false,
        delete: false,
        itinerary: false
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
        status: '',
        type: '',
        startDate: '',
        endDate: ''
      },
      // 缓存的旅行计划数据
      cachedTravels: {}
    }
  },
  
  // 获取器
  getters: {
    // 获取旅行计划列表
    travelList: state => state.travelList,
    
    // 获取当前旅行计划详情
    currentTravel: state => state.currentTravel,
    
    // 获取行程安排列表
    itineraryList: state => state.itineraryList,
    
    // 获取加载状态
    loading: state => state.loading,
    
    // 获取分页信息
    pagination: state => state.pagination,
    
    // 获取搜索条件
    searchParams: state => state.searchParams,
    
    // 根据ID获取旅行计划
    getTravelById: state => id => {
      return state.travelList.find(travel => travel.id === id) || 
             state.cachedTravels[id] || 
             null
    },
    
    // 按状态分组的旅行计划
    travelsByStatus: state => {
      const grouped = {}
      state.travelList.forEach(travel => {
        if (!grouped[travel.status]) {
          grouped[travel.status] = []
        }
        grouped[travel.status].push(travel)
      })
      return grouped
    },
    
    // 获取进行中的旅行计划
    inProgressTravels: state => {
      return state.travelList.filter(travel => travel.status === 'IN_PROGRESS')
    },
    
    // 获取即将到来的旅行计划
    upcomingTravels: state => {
      const now = new Date()
      return state.travelList.filter(travel => {
        const startDate = new Date(travel.startDate)
        return travel.status === 'PENDING' && startDate > now
      }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    },
    
    // 获取已完成的旅行计划
    completedTravels: state => {
      return state.travelList.filter(travel => travel.status === 'COMPLETED')
    }
  },
  
  // 变更函数
  mutations: {
    // 设置旅行计划列表
    SET_TRAVEL_LIST(state, { list, total }) {
      state.travelList = list
      if (total !== undefined) {
        state.pagination.total = total
      }
      
      // 更新缓存
      list.forEach(travel => {
        state.cachedTravels[travel.id] = travel
      })
      
      // 保存到本地存储（可选，用于优化加载速度）
      localStorage.set(STORAGE_KEYS.CACHED_TRAVELS, state.cachedTravels)
    },
    
    // 设置当前旅行计划详情
    SET_CURRENT_TRAVEL(state, travel) {
      state.currentTravel = travel
      
      // 更新缓存
      if (travel && travel.id) {
        state.cachedTravels[travel.id] = travel
        localStorage.set(STORAGE_KEYS.CACHED_TRAVELS, state.cachedTravels)
      }
    },
    
    // 设置行程安排列表
    SET_ITINERARY_LIST(state, list) {
      state.itineraryList = list
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
    
    // 添加旅行计划
    ADD_TRAVEL(state, travel) {
      state.travelList.unshift(travel)
      state.cachedTravels[travel.id] = travel
      localStorage.set(STORAGE_KEYS.CACHED_TRAVELS, state.cachedTravels)
      state.pagination.total += 1
    },
    
    // 更新旅行计划
    UPDATE_TRAVEL(state, updatedTravel) {
      const index = state.travelList.findIndex(t => t.id === updatedTravel.id)
      if (index !== -1) {
        state.travelList.splice(index, 1, updatedTravel)
      }
      
      // 更新缓存
      state.cachedTravels[updatedTravel.id] = updatedTravel
      localStorage.set(STORAGE_KEYS.CACHED_TRAVELS, state.cachedTravels)
      
      // 如果当前查看的就是这个旅行计划，也更新currentTravel
      if (state.currentTravel && state.currentTravel.id === updatedTravel.id) {
        state.currentTravel = updatedTravel
      }
    },
    
    // 删除旅行计划
    DELETE_TRAVEL(state, travelId) {
      const index = state.travelList.findIndex(t => t.id === travelId)
      if (index !== -1) {
        state.travelList.splice(index, 1)
        state.pagination.total -= 1
      }
      
      // 从缓存中删除
      if (state.cachedTravels[travelId]) {
        delete state.cachedTravels[travelId]
        localStorage.set(STORAGE_KEYS.CACHED_TRAVELS, state.cachedTravels)
      }
      
      // 如果当前查看的就是这个旅行计划，清空currentTravel
      if (state.currentTravel && state.currentTravel.id === travelId) {
        state.currentTravel = null
      }
    },
    
    // 添加行程安排
    ADD_ITINERARY(state, itinerary) {
      state.itineraryList.push(itinerary)
    },
    
    // 更新行程安排
    UPDATE_ITINERARY(state, updatedItinerary) {
      const index = state.itineraryList.findIndex(i => i.id === updatedItinerary.id)
      if (index !== -1) {
        state.itineraryList.splice(index, 1, updatedItinerary)
      }
    },
    
    // 删除行程安排
    DELETE_ITINERARY(state, itineraryId) {
      const index = state.itineraryList.findIndex(i => i.id === itineraryId)
      if (index !== -1) {
        state.itineraryList.splice(index, 1)
      }
    },
    
    // 初始化缓存
    INIT_CACHE(state) {
      const cachedTravels = localStorage.get(STORAGE_KEYS.CACHED_TRAVELS, {})
      state.cachedTravels = cachedTravels
    },
    
    // 清除当前旅行计划
    CLEAR_CURRENT_TRAVEL(state) {
      state.currentTravel = null
    },
    
    // 清除行程安排列表
    CLEAR_ITINERARY_LIST(state) {
      state.itineraryList = []
    }
  },
  
  // 动作函数
  actions: {
    // 初始化缓存
    initCache({ commit }) {
      commit('INIT_CACHE')
    },
    
    // 获取旅行计划列表
    async getTravelList({ commit, state, dispatch }, params = {}) {
      try {
        commit('SET_LOADING', { key: 'list', status: true })
        
        // 合并搜索条件和分页信息
        const queryParams = {
          ...state.searchParams,
          ...state.pagination,
          ...params
        }
        
        const response = await get(API.ENDPOINTS.TRAVEL_LIST, queryParams)
        
        commit('SET_TRAVEL_LIST', {
          list: response.records || [],
          total: response.total || 0
        })
        
        return response
      } catch (error) {
        console.error('获取旅行计划列表失败:', error)
        dispatch('showMessage', { message: '获取旅行计划列表失败', type: 'error' }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { key: 'list', status: false })
      }
    },
    
    // 获取旅行计划详情
    async getTravelDetail({ commit, state, dispatch }, travelId) {
      try {
        // 先检查缓存
        if (state.cachedTravels[travelId]) {
          commit('SET_CURRENT_TRAVEL', state.cachedTravels[travelId])
          return state.cachedTravels[travelId]
        }
        
        commit('SET_LOADING', { key: 'detail', status: true })
        
        const travelDetail = await get(`${API.ENDPOINTS.TRAVEL_DETAIL}/${travelId}`)
        commit('SET_CURRENT_TRAVEL', travelDetail)
        
        return travelDetail
      } catch (error) {
        console.error('获取旅行计划详情失败:', error)
        dispatch('showMessage', { message: '获取旅行计划详情失败', type: 'error' }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { key: 'detail', status: false })
      }
    },
    
    // 创建旅行计划
    async createTravel({ commit, dispatch }, travelData) {
      try {
        commit('SET_LOADING', { key: 'create', status: true })
        
        const newTravel = await post(API.ENDPOINTS.TRAVEL_CREATE, travelData)
        commit('ADD_TRAVEL', newTravel)
        
        dispatch('showMessage', { message: '旅行计划创建成功', type: 'success' }, { root: true })
        return newTravel
      } catch (error) {
        console.error('创建旅行计划失败:', error)
        dispatch('showMessage', { message: '创建旅行计划失败', type: 'error' }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { key: 'create', status: false })
      }
    },
    
    // 更新旅行计划
    async updateTravel({ commit, dispatch }, { id, data }) {
      try {
        commit('SET_LOADING', { key: 'update', status: true })
        
        const updatedTravel = await put(`${API.ENDPOINTS.TRAVEL_UPDATE}/${id}`, data)
        commit('UPDATE_TRAVEL', updatedTravel)
        
        dispatch('showMessage', { message: '旅行计划更新成功', type: 'success' }, { root: true })
        return updatedTravel
      } catch (error) {
        console.error('更新旅行计划失败:', error)
        dispatch('showMessage', { message: '更新旅行计划失败', type: 'error' }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { key: 'update', status: false })
      }
    },
    
    // 删除旅行计划
    async deleteTravel({ commit, dispatch }, travelId) {
      try {
        commit('SET_LOADING', { key: 'delete', status: true })
        
        await del(`${API.ENDPOINTS.TRAVEL_DELETE}/${travelId}`)
        commit('DELETE_TRAVEL', travelId)
        
        dispatch('showMessage', { message: '旅行计划删除成功', type: 'success' }, { root: true })
      } catch (error) {
        console.error('删除旅行计划失败:', error)
        dispatch('showMessage', { message: '删除旅行计划失败', type: 'error' }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { key: 'delete', status: false })
      }
    },
    
    // 获取行程安排列表
    async getItineraryList({ commit, dispatch }, travelId) {
      try {
        commit('SET_LOADING', { key: 'itinerary', status: true })
        
        const list = await get(`${API.ENDPOINTS.ITINERARY_LIST}/${travelId}`)
        commit('SET_ITINERARY_LIST', list || [])
        
        return list
      } catch (error) {
        console.error('获取行程安排列表失败:', error)
        dispatch('showMessage', { message: '获取行程安排列表失败', type: 'error' }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { key: 'itinerary', status: false })
      }
    },
    
    // 创建行程安排
    async createItinerary({ commit, dispatch }, itineraryData) {
      try {
        const newItinerary = await post(API.ENDPOINTS.ITINERARY_CREATE, itineraryData)
        commit('ADD_ITINERARY', newItinerary)
        
        dispatch('showMessage', { message: '行程安排创建成功', type: 'success' }, { root: true })
        return newItinerary
      } catch (error) {
        console.error('创建行程安排失败:', error)
        dispatch('showMessage', { message: '创建行程安排失败', type: 'error' }, { root: true })
        throw error
      }
    },
    
    // 更新行程安排
    async updateItinerary({ commit, dispatch }, { id, data }) {
      try {
        const updatedItinerary = await put(`${API.ENDPOINTS.ITINERARY_UPDATE}/${id}`, data)
        commit('UPDATE_ITINERARY', updatedItinerary)
        
        dispatch('showMessage', { message: '行程安排更新成功', type: 'success' }, { root: true })
        return updatedItinerary
      } catch (error) {
        console.error('更新行程安排失败:', error)
        dispatch('showMessage', { message: '更新行程安排失败', type: 'error' }, { root: true })
        throw error
      }
    },
    
    // 删除行程安排
    async deleteItinerary({ commit, dispatch }, itineraryId) {
      try {
        await del(`${API.ENDPOINTS.ITINERARY_DELETE}/${itineraryId}`)
        commit('DELETE_ITINERARY', itineraryId)
        
        dispatch('showMessage', { message: '行程安排删除成功', type: 'success' }, { root: true })
      } catch (error) {
        console.error('删除行程安排失败:', error)
        dispatch('showMessage', { message: '删除行程安排失败', type: 'error' }, { root: true })
        throw error
      }
    },
    
    // 智能生成旅行计划
    async generateTravel({ dispatch }, generateData) {
      try {
        const generatedTravel = await post(API.ENDPOINTS.TRAVEL_GENERATE, generateData)
        
        dispatch('showMessage', { message: '旅行计划生成成功', type: 'success' }, { root: true })
        return generatedTravel
      } catch (error) {
        console.error('生成旅行计划失败:', error)
        dispatch('showMessage', { message: '生成旅行计划失败', type: 'error' }, { root: true })
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
    
    // 清除当前旅行计划
    clearCurrentTravel({ commit }) {
      commit('CLEAR_CURRENT_TRAVEL')
      commit('CLEAR_ITINERARY_LIST')
    }
  }
}

export default travel