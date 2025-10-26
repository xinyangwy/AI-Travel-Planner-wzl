/**
 * 格式化工具类
 * 提供各种数据格式化功能
 */
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

/**
 * 格式化货币
 * @param {number} value - 金额
 * @param {string} currency - 货币符号，默认为 ¥
 * @param {number} decimals - 小数位数，默认为 2
 * @returns {string} 格式化后的货币字符串
 */
export const formatCurrency = (value, currency = '¥', decimals = 2) => {
  if (typeof value !== 'number') return `${currency}0.00`
  return `${currency}${value.toFixed(decimals)}`
}

/**
 * 格式化日期
 * @param {string|Date} date - 日期
 * @param {string} format - 格式字符串，默认为 YYYY-MM-DD
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化日期时间
 * @param {string|Date} date - 日期时间
 * @param {string} format - 格式字符串，默认为 YYYY-MM-DD HH:mm:ss
 * @returns {string} 格式化后的日期时间字符串
 */
export const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化相对时间
 * @param {string|Date} date - 日期
 * @returns {string} 相对时间字符串，如：3天前、刚刚等
 */
export const formatRelativeTime = (date) => {
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
  
  const diffYears = now.diff(target, 'year')
  return `${diffYears}年前`
}

/**
 * 格式化文件大小
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化后的文件大小
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化手机号码（中间四位用星号替换）
 * @param {string} phone - 手机号码
 * @returns {string} 格式化后的手机号码
 */
export const formatPhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string' || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 格式化邮箱（部分用星号替换）
 * @param {string} email - 邮箱地址
 * @returns {string} 格式化后的邮箱地址
 */
export const formatEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) return email
  
  const [username, domain] = email.split('@')
  if (username.length <= 3) {
    return username.charAt(0) + '***@' + domain
  } else {
    const visibleChars = Math.floor(username.length / 2)
    const maskedChars = username.length - visibleChars
    const maskedPart = '*'.repeat(maskedChars)
    return username.substring(0, visibleChars) + maskedPart + '@' + domain
  }
}

/**
 * 格式化数字（添加千位分隔符）
 * @param {number} num - 数字
 * @returns {string} 格式化后的数字
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number') return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化百分比
 * @param {number} value - 数值（0-1之间）
 * @param {number} decimals - 小数位数，默认为 2
 * @returns {string} 格式化后的百分比
 */
export const formatPercentage = (value, decimals = 2) => {
  if (typeof value !== 'number') return '0%'
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * 格式化费用类型
 * @param {string} type - 费用类型代码
 * @returns {string} 费用类型的中文名称
 */
export const formatExpenseType = (type) => {
  const typeMap = {
    'TRANSPORTATION': '交通',
    'ACCOMMODATION': '住宿',
    'FOOD': '餐饮',
    'ATTRACTION': '景点门票',
    'SHOPPING': '购物',
    'ENTERTAINMENT': '娱乐',
    'OTHER': '其他'
  }
  return typeMap[type] || type
}

/**
 * 格式化支付方式
 * @param {string} method - 支付方式代码
 * @returns {string} 支付方式的中文名称
 */
export const formatPaymentMethod = (method) => {
  const methodMap = {
    'CASH': '现金',
    'CREDIT_CARD': '信用卡',
    'DEBIT_CARD': '借记卡',
    'ALIPAY': '支付宝',
    'WECHAT_PAY': '微信支付',
    'BANK_TRANSFER': '银行转账',
    'OTHER': '其他'
  }
  return methodMap[method] || method
}

/**
 * 格式化旅行计划状态
 * @param {string} status - 状态代码
 * @returns {string} 状态的中文名称
 */
export const formatPlanStatus = (status) => {
  const statusMap = {
    'PENDING': '待执行',
    'IN_PROGRESS': '进行中',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || status
}

/**
 * 格式化旅行类型
 * @param {string} type - 类型代码
 * @returns {string} 类型的中文名称
 */
export const formatTravelType = (type) => {
  const typeMap = {
    'VACATION': '休闲度假',
    'ADVENTURE': '探险旅行',
    'CULTURE': '文化体验',
    'FAMILY': '家庭游',
    'BUSINESS': '商务旅行',
    'HONEYMOON': '蜜月旅行',
    'OTHER': '其他'
  }
  return typeMap[type] || type
}

/**
 * 格式化性别
 * @param {string} gender - 性别代码
 * @returns {string} 性别的中文名称
 */
export const formatGender = (gender) => {
  const genderMap = {
    'MALE': '男',
    'FEMALE': '女',
    'OTHER': '其他'
  }
  return genderMap[gender] || gender
}

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatFileSize,
  formatPhoneNumber,
  formatEmail,
  formatNumber,
  formatPercentage,
  formatExpenseType,
  formatPaymentMethod,
  formatPlanStatus,
  formatTravelType,
  formatGender
}