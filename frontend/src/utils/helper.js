/**
 * 工具函数集合
 */

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/**
 * 格式化日期
 * @param {string} date - 日期字符串
 * @param {string} format - 格式化模板，默认'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化日期时间
 * @param {string} date - 日期时间字符串
 * @param {string} format - 格式化模板，默认'YYYY-MM-DD HH:mm'
 * @returns {string} 格式化后的日期时间字符串
 */
export const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 计算两个日期之间的天数
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {number} 天数
 */
export const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0
  return dayjs(endDate).diff(dayjs(startDate), 'day') + 1
}

/**
 * 格式化金额
 * @param {number} amount - 金额
 * @param {string} currency - 货币符号，默认'¥'
 * @returns {string} 格式化后的金额字符串
 */
export const formatCurrency = (amount, currency = '¥') => {
  if (amount === undefined || amount === null) return `${currency}0`
  return `${currency}${Number(amount).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

/**
 * 格式化相对时间
 * @param {Date|string} date - 日期
 * @returns {string} 相对时间字符串
 */
export const formatRelativeTime = (date) => {
  if (!date) return ''
  return dayjs(date).fromNow()
}

/**
 * 计算预算使用率
 * @param {number} spent - 已花费金额
 * @param {number} budget - 预算金额
 * @returns {number} 使用率百分比
 */
export const calculateBudgetUsage = (spent, budget) => {
  if (!budget || budget === 0) return 0
  return Math.round((spent / budget) * 100)
}

/**
 * 获取状态类型对应的样式类
 * @param {string} status - 状态类型
 * @returns {string} 样式类名
 */
export const getStatusClass = (status) => {
  const statusMap = {
    PLANNED: 'status-planned',
    ONGOING: 'status-ongoing',
    COMPLETED: 'status-completed',
    CANCELLED: 'status-cancelled'
  }
  return statusMap[status] || 'status-default'
}

/**
 * 获取状态文本
 * @param {string} status - 状态类型
 * @returns {string} 状态中文文本
 */
export const getStatusText = (status) => {
  const statusMap = {
    PLANNED: '计划中',
    ONGOING: '进行中',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return statusMap[status] || '未知'
}

/**
 * 获取旅行类型文本
 * @param {string} type - 旅行类型
 * @returns {string} 旅行类型中文文本
 */
export const getTravelTypeText = (type) => {
  const typeMap = {
    VACATION: '休闲度假',
    BUSINESS: '商务出差',
    FAMILY: '家庭聚会',
    ADVENTURE: '探险旅行',
    CULTURE: '文化体验',
    OTHER: '其他'
  }
  return typeMap[type] || '其他'
}

/**
 * 获取费用类别文本
 * @param {string} category - 费用类别
 * @returns {string} 费用类别中文文本
 */
export const getCategoryText = (category) => {
  const categoryMap = {
    TRANSPORT: '交通',
    ACCOMMODATION: '住宿',
    FOOD: '餐饮',
    SHOPPING: '购物',
    ACTIVITY: '活动',
    OTHER: '其他'
  }
  return categoryMap[category] || '其他'
}

/**
 * 获取支付方式文本
 * @param {string} paymentMethod - 支付方式
 * @returns {string} 支付方式中文文本
 */
export const getPaymentMethodText = (paymentMethod) => {
  const paymentMap = {
    CASH: '现金',
    CREDIT_CARD: '信用卡',
    DEBIT_CARD: '借记卡',
    ALIPAY: '支付宝',
    WECHAT: '微信支付',
    COMPANY_CARD: '公司卡',
    OTHER: '其他'
  }
  return paymentMap[paymentMethod] || '其他'
}

/**
 * 生成随机颜色（用于图表等）
 * @param {number} index - 索引值，用于生成一致的颜色
 * @returns {string} 颜色值
 */
export const generateChartColor = (index) => {
  const colors = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
    '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#5470c6'
  ]
  return colors[index % colors.length]
}

/**
 * 防抖函数
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间，单位毫秒
 * @returns {Function} 防抖处理后的函数
 */
export const debounce = (fn, delay = 300) => {
  let timer = null
  return function () {
    const context = this
    const args = arguments
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(context, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} fn - 要执行的函数
 * @param {number} limit - 限制时间，单位毫秒
 * @returns {Function} 节流处理后的函数
 */
export const throttle = (fn, limit = 300) => {
  let inThrottle = false
  return function () {
    const context = this
    const args = arguments
    if (!inThrottle) {
      fn.apply(context, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 深拷贝对象
 * @param {Object} obj - 要拷贝的对象
 * @returns {Object} 拷贝后的对象
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  
  if (obj instanceof Array) {
    const cloneArr = []
    for (let i = 0; i < obj.length; i++) {
      cloneArr[i] = deepClone(obj[i])
    }
    return cloneArr
  }
  
  if (obj instanceof Object) {
    const cloneObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloneObj[key] = deepClone(obj[key])
      }
    }
    return cloneObj
  }
}

/**
 * 检查是否为空对象
 * @param {Object} obj - 要检查的对象
 * @returns {boolean} 是否为空对象
 */
export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

/**
 * 获取URL中的查询参数
 * @param {string} name - 参数名
 * @returns {string|null} 参数值
 */
export const getQueryParam = (name) => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}

/**
 * 滚动到指定位置
 * @param {HTMLElement|string} target - 目标元素或选择器
 * @param {Object} options - 滚动选项
 */
export const scrollToElement = (target, options = {}) => {
  const defaults = {
    behavior: 'smooth',
    block: 'start'
  }
  
  const settings = { ...defaults, ...options }
  
  let element
  if (typeof target === 'string') {
    element = document.querySelector(target)
  } else if (target instanceof HTMLElement) {
    element = target
  }
  
  if (element) {
    element.scrollIntoView(settings)
  }
}

/**
 * 截断文本
 * @param {string} text - 原始文本
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀，默认为'...'
 * @returns {string} 截断后的文本
 */
export const truncateText = (text, maxLength = 50, suffix = '...') => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * 下载文本内容为文件
 * @param {string} content - 文件内容
 * @param {string} fileName - 文件名
 * @param {string} contentType - 内容类型
 */
export const downloadFile = (content, fileName, contentType = 'text/plain') => {
  const a = document.createElement('a')
  const file = new Blob([content], { type: contentType })
  
  a.href = URL.createObjectURL(file)
  a.download = fileName
  document.body.appendChild(a)
  
  a.click()
  
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(a.href)
  }, 100)
}

/**
 * 计算文本阅读时间
 * @param {string} text - 文本内容
 * @param {number} wordsPerMinute - 每分钟阅读字数，默认200字
 * @returns {number} 预计阅读时间（分钟）
 */
export const calculateReadingTime = (text, wordsPerMinute = 200) => {
  if (!text) return 0
  const wordCount = text.trim().split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

/**
 * 获取相对时间描述
 * @param {string} date - 日期字符串
 * @returns {string} 相对时间描述
 */
export const getRelativeTime = (date) => {
  if (!date) return ''
  
  const now = dayjs()
  const target = dayjs(date)
  const diffMinutes = now.diff(target, 'minute')
  
  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  
  const diffHours = now.diff(target, 'hour')
  if (diffHours < 24) return `${diffHours}小时前`
  
  const diffDays = now.diff(target, 'day')
  if (diffDays < 30) return `${diffDays}天前`
  
  const diffMonths = now.diff(target, 'month')
  if (diffMonths < 12) return `${diffMonths}个月前`
  
  return `${now.diff(target, 'year')}年前`
}