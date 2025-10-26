/**
 * 存储工具类
 * 封装localStorage和sessionStorage操作，提供更安全、便捷的存储方法
 */

/**
 * localStorage操作类
 */
export const localStorage = {
  /**
   * 设置存储项
   * @param {string} key - 存储键名
   * @param {*} value - 存储值（会自动JSON序列化）
   * @returns {boolean} 是否设置成功
   */
  set(key, value) {
    try {
      const stringValue = JSON.stringify(value)
      window.localStorage.setItem(key, stringValue)
      return true
    } catch (error) {
      console.error('localStorage设置失败:', error)
      return false
    }
  },

  /**
   * 获取存储项
   * @param {string} key - 存储键名
   * @param {*} defaultValue - 默认值，当获取失败或不存在时返回
   * @returns {*} 存储值（会自动JSON解析）或默认值
   */
  get(key, defaultValue = null) {
    try {
      const stringValue = window.localStorage.getItem(key)
      if (stringValue === null) {
        return defaultValue
      }
      return JSON.parse(stringValue)
    } catch (error) {
      console.error('localStorage获取失败:', error)
      return defaultValue
    }
  },

  /**
   * 删除存储项
   * @param {string} key - 存储键名
   * @returns {boolean} 是否删除成功
   */
  remove(key) {
    try {
      window.localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('localStorage删除失败:', error)
      return false
    }
  },

  /**
   * 清空所有存储
   * @returns {boolean} 是否清空成功
   */
  clear() {
    try {
      window.localStorage.clear()
      return true
    } catch (error) {
      console.error('localStorage清空失败:', error)
      return false
    }
  },

  /**
   * 检查存储项是否存在
   * @param {string} key - 存储键名
   * @returns {boolean} 是否存在
   */
  has(key) {
    try {
      return window.localStorage.getItem(key) !== null
    } catch (error) {
      console.error('localStorage检查失败:', error)
      return false
    }
  },

  /**
   * 获取存储大小（单位：字节）
   * @returns {number} 存储大小
   */
  getSize() {
    try {
      let size = 0
      for (let key in window.localStorage) {
        if (window.localStorage.hasOwnProperty(key)) {
          size += window.localStorage[key].length + key.length
        }
      }
      return size
    } catch (error) {
      console.error('获取localStorage大小失败:', error)
      return 0
    }
  },

  /**
   * 获取所有存储键名
   * @returns {Array} 存储键名数组
   */
  keys() {
    try {
      return Object.keys(window.localStorage)
    } catch (error) {
      console.error('获取localStorage键名失败:', error)
      return []
    }
  },

  /**
   * 获取所有存储项
   * @returns {Object} 所有存储项的对象
   */
  getAll() {
    try {
      const result = {}
      for (let key in window.localStorage) {
        if (window.localStorage.hasOwnProperty(key)) {
          try {
            result[key] = JSON.parse(window.localStorage[key])
          } catch (e) {
            result[key] = window.localStorage[key]
          }
        }
      }
      return result
    } catch (error) {
      console.error('获取localStorage所有项失败:', error)
      return {}
    }
  },

  /**
   * 设置带过期时间的存储项
   * @param {string} key - 存储键名
   * @param {*} value - 存储值
   * @param {number} ttl - 过期时间（毫秒）
   * @returns {boolean} 是否设置成功
   */
  setWithExpiry(key, value, ttl) {
    try {
      const item = {
        value,
        expiry: Date.now() + ttl
      }
      return this.set(key, item)
    } catch (error) {
      console.error('设置带过期时间的localStorage失败:', error)
      return false
    }
  },

  /**
   * 获取带过期时间的存储项
   * @param {string} key - 存储键名
   * @param {*} defaultValue - 默认值
   * @returns {*} 存储值或默认值
   */
  getWithExpiry(key, defaultValue = null) {
    try {
      const item = this.get(key)
      
      // 如果项目不存在，返回默认值
      if (item === null) {
        return defaultValue
      }
      
      // 检查是否过期
      if (Date.now() > item.expiry) {
        // 过期则删除并返回默认值
        this.remove(key)
        return defaultValue
      }
      
      return item.value
    } catch (error) {
      console.error('获取带过期时间的localStorage失败:', error)
      return defaultValue
    }
  }
}

/**
 * sessionStorage操作类
 */
export const sessionStorage = {
  /**
   * 设置存储项
   * @param {string} key - 存储键名
   * @param {*} value - 存储值（会自动JSON序列化）
   * @returns {boolean} 是否设置成功
   */
  set(key, value) {
    try {
      const stringValue = JSON.stringify(value)
      window.sessionStorage.setItem(key, stringValue)
      return true
    } catch (error) {
      console.error('sessionStorage设置失败:', error)
      return false
    }
  },

  /**
   * 获取存储项
   * @param {string} key - 存储键名
   * @param {*} defaultValue - 默认值，当获取失败或不存在时返回
   * @returns {*} 存储值（会自动JSON解析）或默认值
   */
  get(key, defaultValue = null) {
    try {
      const stringValue = window.sessionStorage.getItem(key)
      if (stringValue === null) {
        return defaultValue
      }
      return JSON.parse(stringValue)
    } catch (error) {
      console.error('sessionStorage获取失败:', error)
      return defaultValue
    }
  },

  /**
   * 删除存储项
   * @param {string} key - 存储键名
   * @returns {boolean} 是否删除成功
   */
  remove(key) {
    try {
      window.sessionStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('sessionStorage删除失败:', error)
      return false
    }
  },

  /**
   * 清空所有存储
   * @returns {boolean} 是否清空成功
   */
  clear() {
    try {
      window.sessionStorage.clear()
      return true
    } catch (error) {
      console.error('sessionStorage清空失败:', error)
      return false
    }
  },

  /**
   * 检查存储项是否存在
   * @param {string} key - 存储键名
   * @returns {boolean} 是否存在
   */
  has(key) {
    try {
      return window.sessionStorage.getItem(key) !== null
    } catch (error) {
      console.error('sessionStorage检查失败:', error)
      return false
    }
  },

  /**
   * 获取存储大小（单位：字节）
   * @returns {number} 存储大小
   */
  getSize() {
    try {
      let size = 0
      for (let key in window.sessionStorage) {
        if (window.sessionStorage.hasOwnProperty(key)) {
          size += window.sessionStorage[key].length + key.length
        }
      }
      return size
    } catch (error) {
      console.error('获取sessionStorage大小失败:', error)
      return 0
    }
  },

  /**
   * 获取所有存储键名
   * @returns {Array} 存储键名数组
   */
  keys() {
    try {
      return Object.keys(window.sessionStorage)
    } catch (error) {
      console.error('获取sessionStorage键名失败:', error)
      return []
    }
  },

  /**
   * 获取所有存储项
   * @returns {Object} 所有存储项的对象
   */
  getAll() {
    try {
      const result = {}
      for (let key in window.sessionStorage) {
        if (window.sessionStorage.hasOwnProperty(key)) {
          try {
            result[key] = JSON.parse(window.sessionStorage[key])
          } catch (e) {
            result[key] = window.sessionStorage[key]
          }
        }
      }
      return result
    } catch (error) {
      console.error('获取sessionStorage所有项失败:', error)
      return {}
    }
  }
}

/**
 * Cookie操作类
 */
export const cookie = {
  /**
   * 设置Cookie
   * @param {string} key - Cookie键名
   * @param {*} value - Cookie值
   * @param {Object} options - 配置项
   * @param {number} options.expires - 过期时间（天数）
   * @param {string} options.path - 路径
   * @param {string} options.domain - 域名
   * @param {boolean} options.secure - 是否只在HTTPS下传输
   * @returns {boolean} 是否设置成功
   */
  set(key, value, options = {}) {
    try {
      const { expires, path = '/', domain, secure } = options
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
      
      let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(stringValue)}`
      
      if (expires) {
        const date = new Date()
        date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000))
        cookieString += `; expires=${date.toUTCString()}`
      }
      
      if (path) {
        cookieString += `; path=${path}`
      }
      
      if (domain) {
        cookieString += `; domain=${domain}`
      }
      
      if (secure) {
        cookieString += '; secure'
      }
      
      document.cookie = cookieString
      return true
    } catch (error) {
      console.error('设置Cookie失败:', error)
      return false
    }
  },

  /**
   * 获取Cookie
   * @param {string} key - Cookie键名
   * @param {*} defaultValue - 默认值
   * @returns {*} Cookie值或默认值
   */
  get(key, defaultValue = null) {
    try {
      const cookies = document.cookie.split(';')
      
      for (let cookie of cookies) {
        const [name, value] = cookie.split('=').map(item => item.trim())
        
        if (decodeURIComponent(name) === key) {
          const decodedValue = decodeURIComponent(value)
          
          // 尝试解析为JSON，如果失败则返回原始字符串
          try {
            return JSON.parse(decodedValue)
          } catch (e) {
            return decodedValue
          }
        }
      }
      
      return defaultValue
    } catch (error) {
      console.error('获取Cookie失败:', error)
      return defaultValue
    }
  },

  /**
   * 删除Cookie
   * @param {string} key - Cookie键名
   * @param {Object} options - 配置项
   * @param {string} options.path - 路径
   * @param {string} options.domain - 域名
   * @returns {boolean} 是否删除成功
   */
  remove(key, options = {}) {
    try {
      return this.set(key, '', { ...options, expires: -1 })
    } catch (error) {
      console.error('删除Cookie失败:', error)
      return false
    }
  },

  /**
   * 检查Cookie是否存在
   * @param {string} key - Cookie键名
   * @returns {boolean} 是否存在
   */
  has(key) {
    try {
      const cookies = document.cookie.split(';')
      
      for (let cookie of cookies) {
        const name = cookie.split('=')[0].trim()
        
        if (decodeURIComponent(name) === key) {
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error('检查Cookie失败:', error)
      return false
    }
  },

  /**
   * 清空所有Cookie
   * @param {Object} options - 配置项
   * @param {string} options.path - 路径
   * @param {string} options.domain - 域名
   * @returns {boolean} 是否清空成功
   */
  clear(options = {}) {
    try {
      const cookies = document.cookie.split(';')
      
      for (let cookie of cookies) {
        const key = cookie.split('=')[0].trim()
        this.remove(decodeURIComponent(key), options)
      }
      
      return true
    } catch (error) {
      console.error('清空Cookie失败:', error)
      return false
    }
  }
}

/**
 * 导出统一的存储工具
 */
export default {
  localStorage,
  sessionStorage,
  cookie
}