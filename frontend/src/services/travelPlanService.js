/**
 * 旅行计划服务
 * 提供旅行计划相关的CRUD操作和其他业务逻辑
 */

import api from './api'
import eventBus, { EVENT_NAMES } from '@/utils/eventBus'

/**
 * 旅行计划服务
 */
const travelPlanService = {
  /**
   * 获取旅行计划列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.pageSize=10] - 每页数量
   * @param {string} [params.search] - 搜索关键词
   * @param {string} [params.status] - 状态过滤
   * @param {string} [params.sortBy] - 排序字段
   * @param {string} [params.sortOrder] - 排序顺序（asc/desc）
   * @returns {Promise<Object>} 旅行计划列表和分页信息
   */
  async getTravelPlans(params = {}) {
    try {
      const defaultParams = {
        page: 1,
        pageSize: 10,
        ...params
      }
      
      const response = await api.get('/travel-plans', defaultParams)
      return response
    } catch (error) {
      console.error('Get travel plans failed:', error)
      throw error
    }
  },
  
  /**
   * 获取单个旅行计划详情
   * @param {string|number} planId - 旅行计划ID
   * @returns {Promise<Object>} 旅行计划详情
   */
  async getTravelPlanById(planId) {
    try {
      const response = await api.get(`/travel-plans/${planId}`)
      return response
    } catch (error) {
      console.error(`Get travel plan by ID ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 创建新的旅行计划
   * @param {Object} planData - 旅行计划数据
   * @param {string} planData.title - 标题
   * @param {string} planData.destination - 目的地
   * @param {string} planData.startDate - 开始日期
   * @param {string} planData.endDate - 结束日期
   * @param {string} [planData.description] - 描述
   * @param {Array} [planData.tags] - 标签
   * @param {string} [planData.status] - 状态
   * @returns {Promise<Object>} 创建的旅行计划
   */
  async createTravelPlan(planData) {
    try {
      const response = await api.post('/travel-plans', planData)
      
      // 触发创建成功事件
      eventBus.emit(EVENT_NAMES.TRAVEL_PLAN_CREATE, response)
      
      return response
    } catch (error) {
      console.error('Create travel plan failed:', error)
      throw error
    }
  },
  
  /**
   * 更新旅行计划
   * @param {string|number} planId - 旅行计划ID
   * @param {Object} planData - 更新的数据
   * @returns {Promise<Object>} 更新后的旅行计划
   */
  async updateTravelPlan(planId, planData) {
    try {
      const response = await api.put(`/travel-plans/${planId}`, planData)
      
      // 触发更新成功事件
      eventBus.emit(EVENT_NAMES.TRAVEL_PLAN_UPDATE, response)
      
      return response
    } catch (error) {
      console.error(`Update travel plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 删除旅行计划
   * @param {string|number} planId - 旅行计划ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteTravelPlan(planId) {
    try {
      const response = await api.delete(`/travel-plans/${planId}`)
      
      // 触发删除成功事件
      eventBus.emit(EVENT_NAMES.TRAVEL_PLAN_DELETE, planId)
      
      return response
    } catch (error) {
      console.error(`Delete travel plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 切换旅行计划状态
   * @param {string|number} planId - 旅行计划ID
   * @param {string} status - 新状态
   * @returns {Promise<Object>} 更新后的旅行计划
   */
  async changePlanStatus(planId, status) {
    try {
      const response = await api.patch(`/travel-plans/${planId}/status`, { status })
      
      // 触发更新成功事件
      eventBus.emit(EVENT_NAMES.TRAVEL_PLAN_UPDATE, response)
      
      return response
    } catch (error) {
      console.error(`Change plan status ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 复制旅行计划
   * @param {string|number} planId - 源旅行计划ID
   * @param {Object} [options={}] - 复制选项
   * @param {string} [options.title] - 新标题
   * @returns {Promise<Object>} 复制的旅行计划
   */
  async duplicateTravelPlan(planId, options = {}) {
    try {
      const response = await api.post(`/travel-plans/${planId}/duplicate`, options)
      
      // 触发创建成功事件
      eventBus.emit(EVENT_NAMES.TRAVEL_PLAN_CREATE, response)
      
      return response
    } catch (error) {
      console.error(`Duplicate travel plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 获取旅行计划统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getTravelPlanStats() {
    try {
      const response = await api.get('/travel-plans/stats')
      return response
    } catch (error) {
      console.error('Get travel plan stats failed:', error)
      throw error
    }
  },
  
  /**
   * 分享旅行计划
   * @param {string|number} planId - 旅行计划ID
   * @param {Object} shareData - 分享数据
   * @param {Array} [shareData.emails] - 分享的邮箱列表
   * @param {string} [shareData.message] - 分享消息
   * @param {string} [shareData.permission] - 权限（view/edit）
   * @returns {Promise<Object>} 分享结果
   */
  async shareTravelPlan(planId, shareData) {
    try {
      const response = await api.post(`/travel-plans/${planId}/share`, shareData)
      return response
    } catch (error) {
      console.error(`Share travel plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 获取旅行计划的分享链接
   * @param {string|number} planId - 旅行计划ID
   * @param {Object} [options={}] - 选项
   * @param {boolean} [options.expire=true] - 是否设置过期时间
   * @param {number} [options.expireDays=7] - 过期天数
   * @returns {Promise<Object>} 分享链接信息
   */
  async getShareableLink(planId, options = {}) {
    try {
      const response = await api.post(`/travel-plans/${planId}/share-link`, options)
      return response
    } catch (error) {
      console.error(`Get shareable link for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 通过分享链接访问旅行计划
   * @param {string} token - 分享令牌
   * @returns {Promise<Object>} 旅行计划详情
   */
  async accessSharedPlan(token) {
    try {
      const response = await api.get(`/travel-plans/shared/${token}`)
      return response
    } catch (error) {
      console.error('Access shared plan failed:', error)
      throw error
    }
  },
  
  /**
   * 计算旅行天数
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @returns {number} 天数
   */
  calculateTripDays(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 包含开始日期
    return diffDays
  },
  
  /**
   * 获取即将到来的旅行计划
   * @param {number} [limit=5] - 返回数量限制
   * @returns {Promise<Array>} 即将到来的旅行计划列表
   */
  async getUpcomingPlans(limit = 5) {
    try {
      const response = await api.get('/travel-plans/upcoming', { limit })
      return response
    } catch (error) {
      console.error('Get upcoming plans failed:', error)
      throw error
    }
  },
  
  /**
   * 获取最近的旅行计划
   * @param {number} [limit=5] - 返回数量限制
   * @returns {Promise<Array>} 最近的旅行计划列表
   */
  async getRecentPlans(limit = 5) {
    try {
      const response = await api.get('/travel-plans/recent', { limit })
      return response
    } catch (error) {
      console.error('Get recent plans failed:', error)
      throw error
    }
  },
  
  /**
   * 搜索旅行计划
   * @param {string} keyword - 搜索关键词
   * @param {Object} [params={}] - 其他搜索参数
   * @returns {Promise<Object>} 搜索结果
   */
  async searchTravelPlans(keyword, params = {}) {
    try {
      const response = await api.get('/travel-plans/search', {
        keyword,
        ...params
      })
      return response
    } catch (error) {
      console.error('Search travel plans failed:', error)
      throw error
    }
  },
  
  /**
   * 导出旅行计划
   * @param {string|number} planId - 旅行计划ID
   * @param {string} [format='pdf'] - 导出格式（pdf/excel/json）
   * @returns {Promise<Blob>} 导出文件的Blob对象
   */
  async exportTravelPlan(planId, format = 'pdf') {
    try {
      const fileName = `travel-plan-${planId}.${format}`
      const blob = await api.download(`/travel-plans/${planId}/export`, { format }, fileName)
      return blob
    } catch (error) {
      console.error(`Export travel plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 导入旅行计划
   * @param {File} file - 导入的文件
   * @returns {Promise<Object>} 导入结果
   */
  async importTravelPlan(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await api.upload('/travel-plans/import', formData)
      
      // 触发创建成功事件
      if (response && response.plan) {
        eventBus.emit(EVENT_NAMES.TRAVEL_PLAN_CREATE, response.plan)
      }
      
      return response
    } catch (error) {
      console.error('Import travel plan failed:', error)
      throw error
    }
  },
  
  /**
   * 添加旅行计划标签
   * @param {string|number} planId - 旅行计划ID
   * @param {Array} tags - 要添加的标签
   * @returns {Promise<Object>} 更新后的旅行计划
   */
  async addPlanTags(planId, tags) {
    try {
      const response = await api.post(`/travel-plans/${planId}/tags`, { tags })
      
      // 触发更新成功事件
      eventBus.emit(EVENT_NAMES.TRAVEL_PLAN_UPDATE, response)
      
      return response
    } catch (error) {
      console.error(`Add tags to travel plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 移除旅行计划标签
   * @param {string|number} planId - 旅行计划ID
   * @param {string} tagName - 要移除的标签名
   * @returns {Promise<Object>} 更新后的旅行计划
   */
  async removePlanTag(planId, tagName) {
    try {
      const response = await api.delete(`/travel-plans/${planId}/tags/${tagName}`)
      
      // 触发更新成功事件
      eventBus.emit(EVENT_NAMES.TRAVEL_PLAN_UPDATE, response)
      
      return response
    } catch (error) {
      console.error(`Remove tag from travel plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 获取所有旅行计划标签
   * @returns {Promise<Array>} 标签列表
   */
  async getAllTags() {
    try {
      const response = await api.get('/travel-plans/tags')
      return response
    } catch (error) {
      console.error('Get all tags failed:', error)
      throw error
    }
  },
  
  /**
   * 获取推荐的目的地
   * @param {Object} [params={}] - 查询参数
   * @param {number} [params.limit=10] - 返回数量限制
   * @returns {Promise<Array>} 推荐目的地列表
   */
  async getRecommendedDestinations(params = {}) {
    try {
      const response = await api.get('/travel-plans/recommended-destinations', params)
      return response
    } catch (error) {
      console.error('Get recommended destinations failed:', error)
      throw error
    }
  }
}

export default travelPlanService