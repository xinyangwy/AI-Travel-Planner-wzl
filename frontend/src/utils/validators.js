/**
 * 验证工具类
 * 提供常用的表单验证和数据校验方法
 */

/**
 * 验证是否为空
 * @param {*} value - 要验证的值
 * @returns {boolean} 验证结果
 */
export const isEmpty = (value) => {
  return value === null || value === undefined || value === ''
}

/**
 * 验证是否为有效的用户名
 * 规则：4-20位字母、数字或下划线，必须以字母开头
 * @param {string} username - 用户名
 * @returns {boolean} 验证结果
 */
export const isValidUsername = (username) => {
  if (isEmpty(username)) return false
  const reg = /^[a-zA-Z][a-zA-Z0-9_]{3,19}$/
  return reg.test(username)
}

/**
 * 验证是否为有效的密码
 * 规则：8-20位，必须包含字母和数字，可以包含特殊字符
 * @param {string} password - 密码
 * @returns {boolean} 验证结果
 */
export const isValidPassword = (password) => {
  if (isEmpty(password)) return false
  const reg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,20}$/
  return reg.test(password)
}

/**
 * 验证是否为有效的邮箱
 * @param {string} email - 邮箱地址
 * @returns {boolean} 验证结果
 */
export const isValidEmail = (email) => {
  if (isEmpty(email)) return false
  const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return reg.test(email)
}

/**
 * 验证是否为有效的手机号码（中国大陆）
 * @param {string} phone - 手机号码
 * @returns {boolean} 验证结果
 */
export const isValidPhone = (phone) => {
  if (isEmpty(phone)) return false
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

/**
 * 验证是否为有效的固定电话号码（中国大陆）
 * @param {string} tel - 固定电话号码
 * @returns {boolean} 验证结果
 */
export const isValidTel = (tel) => {
  if (isEmpty(tel)) return false
  const reg = /^0\d{2,3}-\d{7,8}$/
  return reg.test(tel)
}

/**
 * 验证是否为有效的身份证号码（中国大陆）
 * @param {string} idCard - 身份证号码
 * @returns {boolean} 验证结果
 */
export const isValidIdCard = (idCard) => {
  if (isEmpty(idCard)) return false
  
  // 18位身份证号码的正则表达式
  const reg = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
  
  if (!reg.test(idCard)) {
    return false
  }
  
  // 校验码验证
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const codes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i]
  }
  
  const checkCode = codes[sum % 11]
  return checkCode.toUpperCase() === idCard[17].toUpperCase()
}

/**
 * 验证是否为有效的银行卡号
 * @param {string} cardNumber - 银行卡号
 * @returns {boolean} 验证结果
 */
export const isValidBankCard = (cardNumber) => {
  if (isEmpty(cardNumber)) return false
  
  // 移除空格
  const cleaned = cardNumber.replace(/\s/g, '')
  
  // 检查是否全部是数字且长度在16-19之间
  if (!/^\d{16,19}$/.test(cleaned)) {
    return false
  }
  
  // Luhn算法验证
  let sum = 0
  let isEven = false
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i))
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

/**
 * 验证是否为有效的URL
 * @param {string} url - URL地址
 * @returns {boolean} 验证结果
 */
export const isValidUrl = (url) => {
  if (isEmpty(url)) return false
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

/**
 * 验证是否为有效的IPv4地址
 * @param {string} ip - IP地址
 * @returns {boolean} 验证结果
 */
export const isValidIPv4 = (ip) => {
  if (isEmpty(ip)) return false
  const reg = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return reg.test(ip)
}

/**
 * 验证是否为有效的整数
 * @param {*} value - 要验证的值
 * @param {object} options - 配置项
 * @param {number} options.min - 最小值
 * @param {number} options.max - 最大值
 * @returns {boolean} 验证结果
 */
export const isValidInteger = (value, options = {}) => {
  const { min, max } = options
  const num = Number(value)
  
  if (isNaN(num) || !Number.isInteger(num)) {
    return false
  }
  
  if (min !== undefined && num < min) {
    return false
  }
  
  if (max !== undefined && num > max) {
    return false
  }
  
  return true
}

/**
 * 验证是否为有效的浮点数
 * @param {*} value - 要验证的值
 * @param {object} options - 配置项
 * @param {number} options.min - 最小值
 * @param {number} options.max - 最大值
 * @param {number} options.decimal - 小数位数
 * @returns {boolean} 验证结果
 */
export const isValidFloat = (value, options = {}) => {
  const { min, max, decimal = 2 } = options
  const num = Number(value)
  
  if (isNaN(num) || !Number.isFinite(num)) {
    return false
  }
  
  // 检查小数位数
  const decimalRegex = new RegExp(`^-?\d+(\.\d{1,${decimal}})?$`)
  if (!decimalRegex.test(value.toString())) {
    return false
  }
  
  if (min !== undefined && num < min) {
    return false
  }
  
  if (max !== undefined && num > max) {
    return false
  }
  
  return true
}

/**
 * 验证是否为有效的金额（最多两位小数的正数）
 * @param {*} value - 金额
 * @returns {boolean} 验证结果
 */
export const isValidAmount = (value) => {
  if (isEmpty(value)) return false
  const reg = /^\d+(\.\d{1,2})?$/
  return reg.test(value.toString()) && Number(value) > 0
}

/**
 * 验证字符串长度是否在指定范围内
 * @param {string} str - 字符串
 * @param {number} min - 最小长度
 * @param {number} max - 最大长度
 * @returns {boolean} 验证结果
 */
export const isValidLength = (str, min, max) => {
  if (isEmpty(str)) return false
  const length = str.toString().length
  return length >= min && length <= max
}

/**
 * 验证是否包含特殊字符
 * @param {string} str - 字符串
 * @returns {boolean} 包含特殊字符返回true，否则返回false
 */
export const containsSpecialChars = (str) => {
  if (isEmpty(str)) return false
  const reg = /[`~!@#$%^&*()\-_=+\[\]{}|;:'",.<>/?]/
  return reg.test(str)
}

/**
 * 验证是否为有效的日期字符串
 * @param {string} date - 日期字符串
 * @param {string} format - 日期格式，默认为 YYYY-MM-DD
 * @returns {boolean} 验证结果
 */
export const isValidDate = (date, format = 'YYYY-MM-DD') => {
  if (isEmpty(date)) return false
  
  // 简单的YYYY-MM-DD格式验证
  if (format === 'YYYY-MM-DD') {
    const reg = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
    if (!reg.test(date)) return false
    
    // 验证日期的有效性
    const d = new Date(date)
    const year = d.getFullYear().toString()
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    
    return `${year}-${month}-${day}` === date
  }
  
  // 可以根据需要添加更多格式的验证
  return false
}

/**
 * 验证两个日期之间的关系
 * @param {Date|string} startDate - 开始日期
 * @param {Date|string} endDate - 结束日期
 * @returns {boolean} 如果开始日期小于等于结束日期返回true，否则返回false
 */
export const isValidDateRange = (startDate, endDate) => {
  if (isEmpty(startDate) || isEmpty(endDate)) return false
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return start <= end
}

/**
 * 验证是否为有效的十六进制颜色值
 * @param {string} color - 颜色值
 * @returns {boolean} 验证结果
 */
export const isValidHexColor = (color) => {
  if (isEmpty(color)) return false
  const reg = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/  
  return reg.test(color)
}

/**
 * 验证是否为有效的文件扩展名
 * @param {string} filename - 文件名
 * @param {Array} allowedExtensions - 允许的扩展名数组
 * @returns {boolean} 验证结果
 */
export const isValidFileExtension = (filename, allowedExtensions) => {
  if (isEmpty(filename) || !Array.isArray(allowedExtensions)) return false
  
  const extension = filename.split('.').pop().toLowerCase()
  return allowedExtensions.map(ext => ext.toLowerCase()).includes(extension)
}

/**
 * 验证文件大小是否在允许的范围内
 * @param {File} file - 文件对象
 * @param {number} maxSize - 最大文件大小（字节）
 * @returns {boolean} 验证结果
 */
export const isValidFileSize = (file, maxSize) => {
  if (!file || typeof file.size !== 'number' || typeof maxSize !== 'number') {
    return false
  }
  
  return file.size <= maxSize
}

export default {
  isEmpty,
  isValidUsername,
  isValidPassword,
  isValidEmail,
  isValidPhone,
  isValidTel,
  isValidIdCard,
  isValidBankCard,
  isValidUrl,
  isValidIPv4,
  isValidInteger,
  isValidFloat,
  isValidAmount,
  isValidLength,
  containsSpecialChars,
  isValidDate,
  isValidDateRange,
  isValidHexColor,
  isValidFileExtension,
  isValidFileSize
}