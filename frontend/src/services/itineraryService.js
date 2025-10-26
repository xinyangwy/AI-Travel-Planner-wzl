/**
 * 行程服务
 * 提供旅行行程相关的CRUD操作和业务逻辑
 */

import api from './api'
import eventBus, { EVENT_NAMES } from '@/utils/eventBus'

/**
 * 行程服务
 */
const itineraryService = {
  /**
   * 获取旅行计划的所有行程
   * @param {string|number} planId - 旅行计划ID
   * @param {Object} [params={}] - 查询参数
   * @param {string} [params.date] - 按日期过滤
   * @param {string} [params.sortBy='order'] - 排序字段
   * @returns {Promise<Array>} 行程列表
   */
  async getItineraries(planId, params = {}) {
    try {
      const response = await api.get(`/travel-plans/${planId}/itineraries`, params)
      return response
    } catch (error) {
      console.error(`Get itineraries for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 获取单个行程详情
   * @param {string|number} planId - 旅行计划ID
   * @param {string|number} itineraryId - 行程ID
   * @returns {Promise<Object>} 行程详情
   */
  async getItineraryById(planId, itineraryId) {
    try {
      const response = await api.get(`/travel-plans/${planId}/itineraries/${itineraryId}`)
      return response
    } catch (error) {
      console.error(`Get itinerary ${itineraryId} for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 创建新的行程
   * @param {string|number} planId - 旅行计划ID
   * @param {Object} itineraryData - 行程数据
   * @param {string} itineraryData.title - 标题
   * @param {string} itineraryData.date - 日期
   * @param {string} itineraryData.startTime - 开始时间
   * @param {string} itineraryData.endTime - 结束时间
   * @param {string} [itineraryData.location] - 地点
   * @param {string} [itineraryData.description] - 描述
   * @param {string} [itineraryData.type] - 类型
   * @param {Array} [itineraryData.tags] - 标签
   * @param {number} [itineraryData.order] - 排序顺序
   * @returns {Promise<Object>} 创建的行程
   */
  async createItinerary(planId, itineraryData) {
    try {
      const response = await api.post(`/travel-plans/${planId}/itineraries`, itineraryData)
      
      // 触发添加事件
      eventBus.emit(EVENT_NAMES.ITINERARY_ADD, { planId, itinerary: response })
      
      return response
    } catch (error) {
      console.error(`Create itinerary for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 批量创建行程
   * @param {string|number} planId - 旅行计划ID
   * @param {Array} itinerariesData - 行程数据数组
   * @returns {Promise<Array>} 创建的行程列表
   */
  async batchCreateItineraries(planId, itinerariesData) {
    try {
      const response = await api.post(`/travel-plans/${planId}/itineraries/batch`, {
        itineraries: itinerariesData
      })
      
      // 触发添加事件
      response.forEach(itinerary => {
        eventBus.emit(EVENT_NAMES.ITINERARY_ADD, { planId, itinerary })
      })
      
      return response
    } catch (error) {
      console.error(`Batch create itineraries for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 更新行程
   * @param {string|number} planId - 旅行计划ID
   * @param {string|number} itineraryId - 行程ID
   * @param {Object} itineraryData - 更新的数据
   * @returns {Promise<Object>} 更新后的行程
   */
  async updateItinerary(planId, itineraryId, itineraryData) {
    try {
      const response = await api.put(`/travel-plans/${planId}/itineraries/${itineraryId}`, itineraryData)
      
      // 触发更新事件
      eventBus.emit(EVENT_NAMES.ITINERARY_UPDATE, { planId, itinerary: response })
      
      return response
    } catch (error) {
      console.error(`Update itinerary ${itineraryId} for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 删除行程
   * @param {string|number} planId - 旅行计划ID
   * @param {string|number} itineraryId - 行程ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteItinerary(planId, itineraryId) {
    try {
      const response = await api.delete(`/travel-plans/${planId}/itineraries/${itineraryId}`)
      
      // 触发删除事件
      eventBus.emit(EVENT_NAMES.ITINERARY_DELETE, { planId, itineraryId })
      
      return response
    } catch (error) {
      console.error(`Delete itinerary ${itineraryId} for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 批量删除行程
   * @param {string|number} planId - 旅行计划ID
   * @param {Array<string|number>} itineraryIds - 行程ID数组
   * @returns {Promise<Object>} 删除结果
   */
  async batchDeleteItineraries(planId, itineraryIds) {
    try {
      const response = await api.delete(`/travel-plans/${planId}/itineraries/batch`, {
        ids: itineraryIds
      })
      
      // 触发删除事件
      itineraryIds.forEach(id => {
        eventBus.emit(EVENT_NAMES.ITINERARY_DELETE, { planId, itineraryId: id })
      })
      
      return response
    } catch (error) {
      console.error(`Batch delete itineraries for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 重新排序行程
   * @param {string|number} planId - 旅行计划ID
   * @param {Array<Object>} orderData - 排序数据 [{id: 1, order: 0}, {id: 2, order: 1}, ...]
   * @returns {Promise<Object>} 排序结果
   */
  async reorderItineraries(planId, orderData) {
    try {
      const response = await api.put(`/travel-plans/${planId}/itineraries/reorder`, {
        orderData
      })
      
      // 触发重新排序事件
      eventBus.emit(EVENT_NAMES.ITINERARY_REORDER, { planId, orderData })
      
      return response
    } catch (error) {
      console.error(`Reorder itineraries for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 复制行程到其他日期
   * @param {string|number} planId - 旅行计划ID
   * @param {string|number} itineraryId - 行程ID
   * @param {Array<string>} targetDates - 目标日期数组
   * @returns {Promise<Array>} 复制的行程列表
   */
  async copyItineraryToDates(planId, itineraryId, targetDates) {
    try {
      const response = await api.post(`/travel-plans/${planId}/itineraries/${itineraryId}/copy`, {
        targetDates
      })
      
      // 触发添加事件
      response.forEach(itinerary => {
        eventBus.emit(EVENT_NAMES.ITINERARY_ADD, { planId, itinerary })
      })
      
      return response
    } catch (error) {
      console.error(`Copy itinerary ${itineraryId} to dates failed:`, error)
      throw error
    }
  },
  
  /**
   * 获取行程统计信息
   * @param {string|number} planId - 旅行计划ID
   * @returns {Promise<Object>} 统计信息
   */
  async getItineraryStats(planId) {
    try {
      const response = await api.get(`/travel-plans/${planId}/itineraries/stats`)
      return response
    } catch (error) {
      console.error(`Get itinerary stats for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 按日期分组获取行程
   * @param {string|number} planId - 旅行计划ID
   * @returns {Promise<Object>} 按日期分组的行程 { '2024-05-01': [...], ... }
   */
  async getItinerariesByDate(planId) {
    try {
      const response = await api.get(`/travel-plans/${planId}/itineraries/grouped-by-date`)
      return response
    } catch (error) {
      console.error(`Get itineraries by date for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 搜索行程
   * @param {string|number} planId - 旅行计划ID
   * @param {string} keyword - 搜索关键词
   * @returns {Promise<Array>} 搜索结果
   */
  async searchItineraries(planId, keyword) {
    try {
      const response = await api.get(`/travel-plans/${planId}/itineraries/search`, {
        keyword
      })
      return response
    } catch (error) {
      console.error(`Search itineraries for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 更新行程地点信息
   * @param {string|number} planId - 旅行计划ID
   * @param {string|number} itineraryId - 行程ID
   * @param {Object} locationData - 地点信息
   * @param {string} locationData.name - 地点名称
   * @param {number} locationData.latitude - 纬度
   * @param {number} locationData.longitude - 经度
   * @param {string} [locationData.address] - 详细地址
   * @returns {Promise<Object>} 更新后的行程
   */
  async updateItineraryLocation(planId, itineraryId, locationData) {
    try {
      const response = await api.patch(`/travel-plans/${planId}/itineraries/${itineraryId}/location`, locationData)
      
      // 触发更新事件
      eventBus.emit(EVENT_NAMES.ITINERARY_UPDATE, { planId, itinerary: response })
      
      return response
    } catch (error) {
      console.error(`Update itinerary location for ${itineraryId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 添加行程附件
   * @param {string|number} planId - 旅行计划ID
   * @param {string|number} itineraryId - 行程ID
   * @param {File|Array<File>} files - 文件或文件数组
   * @returns {Promise<Object>} 更新后的行程
   */
  async addItineraryAttachments(planId, itineraryId, files) {
    try {
      const formData = new FormData()
      
      // 处理单个文件或文件数组
      if (Array.isArray(files)) {
        files.forEach(file => formData.append('files', file))
      } else {
        formData.append('files', files)
      }
      
      const response = await api.upload(
        `/travel-plans/${planId}/itineraries/${itineraryId}/attachments`,
        formData
      )
      
      // 触发更新事件
      eventBus.emit(EVENT_NAMES.ITINERARY_UPDATE, { planId, itinerary: response })
      
      return response
    } catch (error) {
      console.error(`Add attachments to itinerary ${itineraryId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 删除行程附件
   * @param {string|number} planId - 旅行计划ID
   * @param {string|number} itineraryId - 行程ID
   * @param {string} attachmentId - 附件ID
   * @returns {Promise<Object>} 更新后的行程
   */
  async deleteItineraryAttachment(planId, itineraryId, attachmentId) {
    try {
      const response = await api.delete(
        `/travel-plans/${planId}/itineraries/${itineraryId}/attachments/${attachmentId}`
      )
      
      // 触发更新事件
      eventBus.emit(EVENT_NAMES.ITINERARY_UPDATE, { planId, itinerary: response })
      
      return response
    } catch (error) {
      console.error(`Delete attachment from itinerary ${itineraryId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 获取行程类型列表
   * @returns {Promise<Array>} 行程类型列表
   */
  async getItineraryTypes() {
    try {
      const response = await api.get('/itinerary-types')
      return response
    } catch (error) {
      console.error('Get itinerary types failed:', error)
      throw error
    }
  },
  
  /**
   * 生成行程建议
   * @param {string|number} planId - 旅行计划ID
   * @param {string} date - 日期
   * @param {string} destination - 目的地
   * @returns {Promise<Array>} 行程建议列表
   */
  async generateItinerarySuggestions(planId, date, destination) {
    try {
      const response = await api.post('/itinerary-suggestions/generate', {
        planId,
        date,
        destination
      })
      return response
    } catch (error) {
      console.error('Generate itinerary suggestions failed:', error)
      throw error
    }
  },
  
  /**
   * 计算行程之间的距离和时间（基于地点）
   * @param {Object} fromLocation - 出发地点
   * @param {number} fromLocation.latitude - 出发纬度
   * @param {number} fromLocation.longitude - 出发经度
   * @param {Object} toLocation - 目的地点
   * @param {number} toLocation.latitude - 目的纬度
   * @param {number} toLocation.longitude - 目的经度
   * @returns {Promise<Object>} 距离和时间信息
   */
  async calculateRouteDistance(fromLocation, toLocation) {
    try {
      const response = await api.post('/route/calculate', {
        from: fromLocation,
        to: toLocation
      })
      return response
    } catch (error) {
      console.error('Calculate route distance failed:', error)
      throw error
    }
  }
}

export default itineraryService