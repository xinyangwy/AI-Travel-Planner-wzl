/**
 * 表单验证工具
 */

/**
 * 检查是否为空
 * @param {*} value - 要检查的值
 * @returns {boolean} 是否为空
 */
export const isEmpty = (value) => {
  return value === undefined || value === null || value === ''
}

/**
 * 检查字符串最小长度
 * @param {string} value - 要检查的字符串
 * @param {number} minLength - 最小长度
 * @returns {boolean} 是否通过验证
 */
export const minLength = (value, minLength) => {
  if (isEmpty(value)) return false
  return String(value).length >= minLength
}

/**
 * 检查字符串最大长度
 * @param {string} value - 要检查的字符串
 * @param {number} maxLength - 最大长度
 * @returns {boolean} 是否通过验证
 */
export const maxLength = (value, maxLength) => {
  if (isEmpty(value)) return true
  return String(value).length <= maxLength
}

/**
 * 检查字符串长度范围
 * @param {string} value - 要检查的字符串
 * @param {number} minLength - 最小长度
 * @param {number} maxLength - 最大长度
 * @returns {boolean} 是否通过验证
 */
export const lengthBetween = (value, minLength, maxLength) => {
  if (isEmpty(value)) return false
  const length = String(value).length
  return length >= minLength && length <= maxLength
}

/**
 * 验证电子邮件格式
 * @param {string} email - 电子邮件地址
 * @returns {boolean} 是否通过验证
 */
export const isValidEmail = (email) => {
  if (isEmpty(email)) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证手机号码格式（中国大陆）
 * @param {string} phone - 手机号码
 * @returns {boolean} 是否通过验证
 */
export const isValidPhone = (phone) => {
  if (isEmpty(phone)) return false
  const phoneRegex = /^1[3456789]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证是否为有效的URL
 * @param {string} url - URL地址
 * @returns {boolean} 是否通过验证
 */
export const isValidUrl = (url) => {
  if (isEmpty(url)) return false
  try {
    new URL(url)
    return true
  } catch (error) {
    return false
  }
}

/**
 * 验证是否为数字
 * @param {*} value - 要检查的值
 * @returns {boolean} 是否通过验证
 */
export const isNumber = (value) => {
  if (isEmpty(value)) return false
  return !isNaN(value) && Number.isFinite(Number(value))
}

/**
 * 验证是否为整数
 * @param {*} value - 要检查的值
 * @returns {boolean} 是否通过验证
 */
export const isInteger = (value) => {
  if (isEmpty(value)) return false
  return Number.isInteger(Number(value))
}

/**
 * 验证正整数
 * @param {*} value - 要检查的值
 * @returns {boolean} 是否通过验证
 */
export const isPositiveInteger = (value) => {
  if (isEmpty(value)) return false
  const num = Number(value)
  return Number.isInteger(num) && num > 0
}

/**
 * 验证非负整数
 * @param {*} value - 要检查的值
 * @returns {boolean} 是否通过验证
 */
export const isNonNegativeInteger = (value) => {
  if (isEmpty(value)) return false
  const num = Number(value)
  return Number.isInteger(num) && num >= 0
}

/**
 * 验证正数
 * @param {*} value - 要检查的值
 * @returns {boolean} 是否通过验证
 */
export const isPositiveNumber = (value) => {
  if (isEmpty(value)) return false
  const num = Number(value)
  return !isNaN(num) && num > 0
}

/**
 * 验证非负数
 * @param {*} value - 要检查的值
 * @returns {boolean} 是否通过验证
 */
export const isNonNegativeNumber = (value) => {
  if (isEmpty(value)) return false
  const num = Number(value)
  return !isNaN(num) && num >= 0
}

/**
 * 验证数字范围
 * @param {*} value - 要检查的值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {boolean} 是否通过验证
 */
export const numberBetween = (value, min, max) => {
  if (isEmpty(value)) return false
  const num = Number(value)
  return !isNaN(num) && num >= min && num <= max
}

/**
 * 验证日期格式 (YYYY-MM-DD)
 * @param {string} date - 日期字符串
 * @returns {boolean} 是否通过验证
 */
export const isValidDateFormat = (date) => {
  if (isEmpty(date)) return false
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(date)) return false
  
  // 进一步检查是否为有效日期
  const d = new Date(date)
  return d instanceof Date && !isNaN(d)
}

/**
 * 验证时间格式 (HH:mm)
 * @param {string} time - 时间字符串
 * @returns {boolean} 是否通过验证
 */
export const isValidTimeFormat = (time) => {
  if (isEmpty(time)) return false
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

/**
 * 验证结束日期是否晚于开始日期
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {boolean} 是否通过验证
 */
export const isEndDateAfterStartDate = (startDate, endDate) => {
  if (isEmpty(startDate) || isEmpty(endDate)) return false
  const start = new Date(startDate)
  const end = new Date(endDate)
  return end >= start
}

/**
 * 验证日期是否在今天之后
 * @param {string} date - 要检查的日期
 * @param {boolean} includeToday - 是否包括今天，默认为true
 * @returns {boolean} 是否通过验证
 */
export const isDateAfterToday = (date, includeToday = true) => {
  if (isEmpty(date)) return false
  const checkDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (includeToday) {
    return checkDate >= today
  } else {
    return checkDate > today
  }
}

/**
 * 验证密码强度
 * 至少包含：大写字母、小写字母、数字和特殊字符中的三种
 * @param {string} password - 密码
 * @returns {object} 密码强度结果
 */
export const checkPasswordStrength = (password) => {
  if (isEmpty(password)) {
    return { valid: false, strength: 0, message: '密码不能为空' }
  }
  
  if (password.length < 8) {
    return { valid: false, strength: 0, message: '密码长度至少8位' }
  }
  
  let strength = 0
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  
  if (hasUpper) strength++
  if (hasLower) strength++
  if (hasNumber) strength++
  if (hasSpecial) strength++
  
  let valid = false
  let message = ''
  
  if (strength < 3) {
    message = '密码强度弱，请包含至少三种字符类型（大写字母、小写字母、数字和特殊字符）'
  } else if (strength === 3) {
    valid = true
    message = '密码强度中等'
  } else {
    valid = true
    message = '密码强度强'
  }
  
  return { valid, strength, message }
}

/**
 * 验证两个值是否相等
 * @param {*} value1 - 第一个值
 * @param {*} value2 - 第二个值
 * @returns {boolean} 是否通过验证
 */
export const isEqual = (value1, value2) => {
  return value1 === value2
}

/**
 * 创建表单验证规则
 * @returns {object} 验证规则对象
 */
export const createValidationRules = () => {
  return {
    required: {
      validator: (rule, value, callback) => {
        if (isEmpty(value)) {
          callback(new Error('此项为必填项'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    },
    
    minLength: (min) => ({
      validator: (rule, value, callback) => {
        if (isEmpty(value)) {
          callback()
        } else if (!minLength(value, min)) {
          callback(new Error(`最少需要${min}个字符`))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }),
    
    maxLength: (max) => ({
      validator: (rule, value, callback) => {
        if (isEmpty(value)) {
          callback()
        } else if (!maxLength(value, max)) {
          callback(new Error(`最多允许${max}个字符`))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }),
    
    email: {
      validator: (rule, value, callback) => {
        if (isEmpty(value)) {
          callback()
        } else if (!isValidEmail(value)) {
          callback(new Error('请输入有效的电子邮箱地址'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    },
    
    phone: {
      validator: (rule, value, callback) => {
        if (isEmpty(value)) {
          callback()
        } else if (!isValidPhone(value)) {
          callback(new Error('请输入有效的手机号码'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    },
    
    positiveNumber: {
      validator: (rule, value, callback) => {
        if (isEmpty(value)) {
          callback()
        } else if (!isPositiveNumber(value)) {
          callback(new Error('请输入有效的正数'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    },
    
    nonNegativeNumber: {
      validator: (rule, value, callback) => {
        if (isEmpty(value)) {
          callback()
        } else if (!isNonNegativeNumber(value)) {
          callback(new Error('请输入有效的非负数'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    },
    
    positiveInteger: {
      validator: (rule, value, callback) => {
        if (isEmpty(value)) {
          callback()
        } else if (!isPositiveInteger(value)) {
          callback(new Error('请输入有效的正整数'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    },
    
    dateFormat: {
      validator: (rule, value, callback) => {
        if (isEmpty(value)) {
          callback()
        } else if (!isValidDateFormat(value)) {
          callback(new Error('请输入有效的日期格式 (YYYY-MM-DD)'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    },
    
    timeFormat: {
      validator: (rule, value, callback) => {
        if (isEmpty(value)) {
          callback()
        } else if (!isValidTimeFormat(value)) {
          callback(new Error('请输入有效的时间格式 (HH:mm)'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    },
    
    endDateAfterStartDate: (startDateField) => ({
      validator: (rule, value, callback) => {
        const startDate = rule.field === startDateField ? value : rule.form[startDateField]
        const endDate = rule.field === startDateField ? rule.form[rule.field] : value
        
        if (isEmpty(startDate) || isEmpty(endDate)) {
          callback()
        } else if (!isEndDateAfterStartDate(startDate, endDate)) {
          callback(new Error('结束日期必须晚于或等于开始日期'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }),
    
    dateAfterToday: (includeToday = true) => ({
      validator: (rule, value, callback) => {
        if (isEmpty(value)) {
          callback()
        } else if (!isDateAfterToday(value, includeToday)) {
          const message = includeToday ? '日期必须是今天或之后' : '日期必须在今天之后'
          callback(new Error(message))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }),
    
    passwordStrength: {
      validator: (rule, value, callback) => {
        if (isEmpty(value)) {
          callback()
        } else {
          const result = checkPasswordStrength(value)
          if (!result.valid) {
            callback(new Error(result.message))
          } else {
            callback()
          }
        }
      },
      trigger: 'blur'
    },
    
    equalTo: (field) => ({
      validator: (rule, value, callback) => {
        if (isEmpty(value)) {
          callback()
        } else if (!isEqual(value, rule.form[field])) {
          callback(new Error('两次输入的内容不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    })
  }
}

export default {
  isEmpty,
  minLength,
  maxLength,
  lengthBetween,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isNumber,
  isInteger,
  isPositiveInteger,
  isNonNegativeInteger,
  isPositiveNumber,
  isNonNegativeNumber,
  numberBetween,
  isValidDateFormat,
  isValidTimeFormat,
  isEndDateAfterStartDate,
  isDateAfterToday,
  checkPasswordStrength,
  isEqual,
  createValidationRules
}