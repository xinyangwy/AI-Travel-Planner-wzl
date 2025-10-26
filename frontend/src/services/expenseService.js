/**
 * 费用服务
 * 提供旅行费用相关的CRUD操作和业务逻辑
 */

import api from './api'
import eventBus, { EVENT_NAMES } from '@/utils/eventBus'

/**
 * 费用服务
 */
const expenseService = {
  /**
   * 获取旅行计划的所有费用
   * @param {string|number} planId - 旅行计划ID
   * @param {Object} [params={}] - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.pageSize=20] - 每页数量
   * @param {string} [params.category] - 分类过滤
   * @param {string} [params.startDate] - 开始日期
   * @param {string} [params.endDate] - 结束日期
   * @param {string} [params.sortBy='date'] - 排序字段
   * @param {string} [params.sortOrder='desc'] - 排序顺序（asc/desc）
   * @returns {Promise<Object>} 费用列表和分页信息
   */
  async getExpenses(planId, params = {}) {
    try {
      const defaultParams = {
        page: 1,
        pageSize: 20,
        ...params
      }
      
      const response = await api.get(`/travel-plans/${planId}/expenses`, defaultParams)
      return response
    } catch (error) {
      console.error(`Get expenses for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 获取单个费用详情
   * @param {string|number} planId - 旅行计划ID
   * @param {string|number} expenseId - 费用ID
   * @returns {Promise<Object>} 费用详情
   */
  async getExpenseById(planId, expenseId) {
    try {
      const response = await api.get(`/travel-plans/${planId}/expenses/${expenseId}`)
      return response
    } catch (error) {
      console.error(`Get expense ${expenseId} for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 创建新的费用记录
   * @param {string|number} planId - 旅行计划ID
   * @param {Object} expenseData - 费用数据
   * @param {string} expenseData.category - 分类
   * @param {number} expenseData.amount - 金额
   * @param {string} expenseData.date - 日期
   * @param {string} [expenseData.currency='CNY'] - 货币类型
   * @param {string} [expenseData.paymentMethod] - 支付方式
   * @param {string} [expenseData.description] - 描述
   * @param {string} [expenseData.location] - 地点
   * @param {Array} [expenseData.receipts] - 收据（图片URL）
   * @param {Array} [expenseData.tags] - 标签
   * @returns {Promise<Object>} 创建的费用记录
   */
  async createExpense(planId, expenseData) {
    try {
      const response = await api.post(`/travel-plans/${planId}/expenses`, expenseData)
      
      // 触发添加事件
      eventBus.emit(EVENT_NAMES.EXPENSE_ADD, { planId, expense: response })
      
      return response
    } catch (error) {
      console.error(`Create expense for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 批量创建费用记录
   * @param {string|number} planId - 旅行计划ID
   * @param {Array} expensesData - 费用数据数组
   * @returns {Promise<Array>} 创建的费用记录列表
   */
  async batchCreateExpenses(planId, expensesData) {
    try {
      const response = await api.post(`/travel-plans/${planId}/expenses/batch`, {
        expenses: expensesData
      })
      
      // 触发添加事件
      response.forEach(expense => {
        eventBus.emit(EVENT_NAMES.EXPENSE_ADD, { planId, expense })
      })
      
      return response
    } catch (error) {
      console.error(`Batch create expenses for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 更新费用记录
   * @param {string|number} planId - 旅行计划ID
   * @param {string|number} expenseId - 费用ID
   * @param {Object} expenseData - 更新的数据
   * @returns {Promise<Object>} 更新后的费用记录
   */
  async updateExpense(planId, expenseId, expenseData) {
    try {
      const response = await api.put(`/travel-plans/${planId}/expenses/${expenseId}`, expenseData)
      
      // 触发更新事件
      eventBus.emit(EVENT_NAMES.EXPENSE_UPDATE, { planId, expense: response })
      
      return response
    } catch (error) {
      console.error(`Update expense ${expenseId} for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 删除费用记录
   * @param {string|number} planId - 旅行计划ID
   * @param {string|number} expenseId - 费用ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteExpense(planId, expenseId) {
    try {
      const response = await api.delete(`/travel-plans/${planId}/expenses/${expenseId}`)
      
      // 触发删除事件
      eventBus.emit(EVENT_NAMES.EXPENSE_DELETE, { planId, expenseId })
      
      return response
    } catch (error) {
      console.error(`Delete expense ${expenseId} for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 批量删除费用记录
   * @param {string|number} planId - 旅行计划ID
   * @param {Array<string|number>} expenseIds - 费用ID数组
   * @returns {Promise<Object>} 删除结果
   */
  async batchDeleteExpenses(planId, expenseIds) {
    try {
      const response = await api.delete(`/travel-plans/${planId}/expenses/batch`, {
        ids: expenseIds
      })
      
      // 触发删除事件
      expenseIds.forEach(id => {
        eventBus.emit(EVENT_NAMES.EXPENSE_DELETE, { planId, expenseId: id })
      })
      
      return response
    } catch (error) {
      console.error(`Batch delete expenses for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 获取费用统计信息
   * @param {string|number} planId - 旅行计划ID
   * @param {Object} [params={}] - 查询参数
   * @param {string} [params.startDate] - 开始日期
   * @param {string} [params.endDate] - 结束日期
   * @returns {Promise<Object>} 统计信息
   */
  async getExpenseStats(planId, params = {}) {
    try {
      const response = await api.get(`/travel-plans/${planId}/expenses/stats`, params)
      return response
    } catch (error) {
      console.error(`Get expense stats for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 按分类统计费用
   * @param {string|number} planId - 旅行计划ID
   * @param {Object} [params={}] - 查询参数
   * @param {string} [params.startDate] - 开始日期
   * @param {string} [params.endDate] - 结束日期
   * @returns {Promise<Object>} 按分类统计的数据
   */
  async getExpensesByCategory(planId, params = {}) {
    try {
      const response = await api.get(`/travel-plans/${planId}/expenses/grouped-by-category`, params)
      return response
    } catch (error) {
      console.error(`Get expenses by category for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 按日期统计费用
   * @param {string|number} planId - 旅行计划ID
   * @param {Object} [params={}] - 查询参数
   * @param {string} [params.startDate] - 开始日期
   * @param {string} [params.endDate] - 结束日期
   * @param {string} [params.granularity='day'] - 粒度（day/week/month）
   * @returns {Promise<Object>} 按日期统计的数据
   */
  async getExpensesByDate(planId, params = {}) {
    try {
      const response = await api.get(`/travel-plans/${planId}/expenses/grouped-by-date`, params)
      return response
    } catch (error) {
      console.error(`Get expenses by date for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 搜索费用记录
   * @param {string|number} planId - 旅行计划ID
   * @param {string} keyword - 搜索关键词
   * @param {Object} [params={}] - 其他搜索参数
   * @returns {Promise<Object>} 搜索结果
   */
  async searchExpenses(planId, keyword, params = {}) {
    try {
      const response = await api.get(`/travel-plans/${planId}/expenses/search`, {
        keyword,
        ...params
      })
      return response
    } catch (error) {
      console.error(`Search expenses for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 获取费用分类列表
   * @returns {Promise<Array>} 费用分类列表
   */
  async getExpenseCategories() {
    try {
      const response = await api.get('/expense-categories')
      return response
    } catch (error) {
      console.error('Get expense categories failed:', error)
      throw error
    }
  },
  
  /**
   * 添加自定义费用分类
   * @param {Object} categoryData - 分类数据
   * @param {string} categoryData.name - 分类名称
   * @param {string} [categoryData.icon] - 分类图标
   * @param {string} [categoryData.color] - 分类颜色
   * @returns {Promise<Object>} 创建的分类
   */
  async addExpenseCategory(categoryData) {
    try {
      const response = await api.post('/expense-categories', categoryData)
      
      // 触发分类变更事件
      eventBus.emit(EVENT_NAMES.EXPENSE_CATEGORY_CHANGE)
      
      return response
    } catch (error) {
      console.error('Add expense category failed:', error)
      throw error
    }
  },
  
  /**
   * 上传费用收据
   * @param {string|number} planId - 旅行计划ID
   * @param {string|number} expenseId - 费用ID
   * @param {File|Array<File>} files - 文件或文件数组
   * @returns {Promise<Object>} 更新后的费用记录
   */
  async uploadExpenseReceipts(planId, expenseId, files) {
    try {
      const formData = new FormData()
      
      // 处理单个文件或文件数组
      if (Array.isArray(files)) {
        files.forEach(file => formData.append('receipts', file))
      } else {
        formData.append('receipts', files)
      }
      
      const response = await api.upload(
        `/travel-plans/${planId}/expenses/${expenseId}/receipts`,
        formData
      )
      
      // 触发更新事件
      eventBus.emit(EVENT_NAMES.EXPENSE_UPDATE, { planId, expense: response })
      
      return response
    } catch (error) {
      console.error(`Upload receipts for expense ${expenseId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 删除费用收据
   * @param {string|number} planId - 旅行计划ID
   * @param {string|number} expenseId - 费用ID
   * @param {string} receiptId - 收据ID或URL
   * @returns {Promise<Object>} 更新后的费用记录
   */
  async deleteExpenseReceipt(planId, expenseId, receiptId) {
    try {
      const response = await api.delete(
        `/travel-plans/${planId}/expenses/${expenseId}/receipts/${receiptId}`
      )
      
      // 触发更新事件
      eventBus.emit(EVENT_NAMES.EXPENSE_UPDATE, { planId, expense: response })
      
      return response
    } catch (error) {
      console.error(`Delete receipt from expense ${expenseId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 导出费用数据
   * @param {string|number} planId - 旅行计划ID
   * @param {Object} [params={}] - 查询参数
   * @param {string} [params.format='excel'] - 导出格式（excel/pdf/csv）
   * @param {string} [params.startDate] - 开始日期
   * @param {string} [params.endDate] - 结束日期
   * @returns {Promise<Blob>} 导出文件的Blob对象
   */
  async exportExpenses(planId, params = {}) {
    try {
      const { format = 'excel', ...queryParams } = params
      const fileName = `expenses-plan-${planId}.${format}`
      
      const blob = await api.download(`/travel-plans/${planId}/expenses/export`, queryParams, fileName)
      return blob
    } catch (error) {
      console.error(`Export expenses for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 导入费用数据
   * @param {string|number} planId - 旅行计划ID
   * @param {File} file - 导入的文件
   * @returns {Promise<Object>} 导入结果
   */
  async importExpenses(planId, file) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await api.upload(`/travel-plans/${planId}/expenses/import`, formData)
      
      // 触发添加事件
      if (response && response.expenses && Array.isArray(response.expenses)) {
        response.expenses.forEach(expense => {
          eventBus.emit(EVENT_NAMES.EXPENSE_ADD, { planId, expense })
        })
      }
      
      return response
    } catch (error) {
      console.error(`Import expenses for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 获取费用预算对比
   * @param {string|number} planId - 旅行计划ID
   * @returns {Promise<Object>} 预算对比数据
   */
  async getBudgetComparison(planId) {
    try {
      const response = await api.get(`/travel-plans/${planId}/budget/comparison`)
      return response
    } catch (error) {
      console.error(`Get budget comparison for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 设置费用预算
   * @param {string|number} planId - 旅行计划ID
   * @param {Object} budgetData - 预算数据
   * @param {number} budgetData.total - 总预算
   * @param {Object} [budgetData.byCategory] - 按分类预算 { category1: amount1, ... }
   * @returns {Promise<Object>} 设置的预算
   */
  async setBudget(planId, budgetData) {
    try {
      const response = await api.put(`/travel-plans/${planId}/budget`, budgetData)
      return response
    } catch (error) {
      console.error(`Set budget for plan ${planId} failed:`, error)
      throw error
    }
  },
  
  /**
   * 分析费用趋势
   * @param {string|number} planId - 旅行计划ID
   * @param {Object} [params={}] - 查询参数
   * @param {string} [params.period='month'] - 周期（week/month/quarter）
   * @returns {Promise<Object>} 趋势分析数据
   */
  async analyzeExpenseTrends(planId, params = {}) {
    try {
      const response = await api.get(`/travel-plans/${planId}/expenses/trends`, params)
      return response
    } catch (error) {
      console.error(`Analyze expense trends for plan ${planId} failed:`, error)
      throw error
    }
  }
}

export default expenseService