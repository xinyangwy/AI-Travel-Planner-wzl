/**
 * API请求服务
 * 封装axios，提供统一的请求处理、错误处理、拦截器等功能
 */

import axios from 'axios'
import { storage } from '@/utils/storage'
import eventBus, { EVENT_NAMES } from '@/utils/eventBus'

// API基础URL配置
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || '/api'

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 请求超时时间：15秒
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // 允许携带凭证（cookies）
  withCredentials: true
})

/**
 * 请求拦截器
 * 在发送请求之前做些什么
 */
apiClient.interceptors.request.use(
  (config) => {
    // 显示全局加载状态
    eventBus.emit(EVENT_NAMES.LOADING_START)
    
    // 获取token
    const token = storage.get('auth_token')
    
    // 如果有token，添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加时间戳参数，防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    // 日志记录（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        params: config.params,
        data: config.data
      })
    }
    
    return config
  },
  (error) => {
    // 隐藏加载状态
    eventBus.emit(EVENT_NAMES.LOADING_END)
    
    // 处理请求错误
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 对响应数据做点什么
 */
apiClient.interceptors.response.use(
  (response) => {
    // 隐藏加载状态
    eventBus.emit(EVENT_NAMES.LOADING_END)
    
    // 日志记录（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
        data: response.data
      })
    }
    
    // 处理业务错误（后端返回的错误）
    const { data } = response
    
    // 假设后端返回的数据格式为：{ code: 0, message: 'success', data: any }
    // code为0表示成功，非0表示失败
    if (data && typeof data.code === 'number' && data.code !== 0) {
      // 显示错误消息
      eventBus.emit(EVENT_NAMES.APP_ERROR, data.message || '请求失败')
      
      // 返回失败的Promise
      return Promise.reject(new Error(data.message || '请求失败'))
    }
    
    // 返回响应数据
    return response
  },
  (error) => {
    // 隐藏加载状态
    eventBus.emit(EVENT_NAMES.LOADING_END)
    
    // 日志记录（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.error('API Response Error:', error)
    }
    
    // 处理网络错误
    let errorMessage = '网络请求失败'
    
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          errorMessage = data?.message || '请求参数错误'
          break
        case 401:
          // 未授权，清除token并跳转到登录页
          storage.remove('auth_token')
          storage.remove('user_info')
          errorMessage = '登录已过期，请重新登录'
          eventBus.emit(EVENT_NAMES.USER_LOGOUT)
          // 可以在这里添加跳转到登录页的逻辑
          break
        case 403:
          errorMessage = '没有权限访问该资源'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        default:
          errorMessage = data?.message || `请求失败(${status})`
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      if (error.code === 'ECONNABORTED') {
        errorMessage = '请求超时，请稍后重试'
      } else {
        errorMessage = '网络连接失败，请检查网络'
      }
    }
    
    // 显示错误消息
    eventBus.emit(EVENT_NAMES.APP_ERROR, errorMessage)
    
    return Promise.reject(error)
  }
)

/**
 * API请求方法
 */
const api = {
  /**
   * GET请求
   * @param {string} url - 请求URL
   * @param {Object} [params={}] - 请求参数
   * @param {Object} [config={}] - 请求配置
   * @returns {Promise<any>} 响应数据
   */
  get(url, params = {}, config = {}) {
    return apiClient.get(url, { params, ...config })
      .then(response => response.data)
  },
  
  /**
   * POST请求
   * @param {string} url - 请求URL
   * @param {Object} [data={}] - 请求数据
   * @param {Object} [config={}] - 请求配置
   * @returns {Promise<any>} 响应数据
   */
  post(url, data = {}, config = {}) {
    return apiClient.post(url, data, config)
      .then(response => response.data)
  },
  
  /**
   * PUT请求
   * @param {string} url - 请求URL
   * @param {Object} [data={}] - 请求数据
   * @param {Object} [config={}] - 请求配置
   * @returns {Promise<any>} 响应数据
   */
  put(url, data = {}, config = {}) {
    return apiClient.put(url, data, config)
      .then(response => response.data)
  },
  
  /**
   * DELETE请求
   * @param {string} url - 请求URL
   * @param {Object} [params={}] - 请求参数
   * @param {Object} [config={}] - 请求配置
   * @returns {Promise<any>} 响应数据
   */
  delete(url, params = {}, config = {}) {
    return apiClient.delete(url, { params, ...config })
      .then(response => response.data)
  },
  
  /**
   * PATCH请求
   * @param {string} url - 请求URL
   * @param {Object} [data={}] - 请求数据
   * @param {Object} [config={}] - 请求配置
   * @returns {Promise<any>} 响应数据
   */
  patch(url, data = {}, config = {}) {
    return apiClient.patch(url, data, config)
      .then(response => response.data)
  },
  
  /**
   * 上传文件
   * @param {string} url - 请求URL
   * @param {FormData} formData - FormData对象，包含文件和其他字段
   * @param {Object} [config={}] - 请求配置
   * @returns {Promise<any>} 响应数据
   */
  upload(url, formData, config = {}) {
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      // 支持上传进度监听
      onUploadProgress: config.onUploadProgress,
      ...config
    })
      .then(response => response.data)
  },
  
  /**
   * 下载文件
   * @param {string} url - 请求URL
   * @param {Object} [params={}] - 请求参数
   * @param {string} [fileName=''] - 文件名
   * @param {Object} [config={}] - 请求配置
   * @returns {Promise<Blob>} 文件Blob对象
   */
  download(url, params = {}, fileName = '', config = {}) {
    return apiClient.get(url, {
      params,
      responseType: 'blob',
      ...config
    })
      .then(response => {
        const blob = response.data
        
        // 如果提供了文件名，则自动下载
        if (fileName) {
          const link = document.createElement('a')
          const url = URL.createObjectURL(blob)
          
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          
          // 清理
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
        
        return blob
      })
  },
  
  /**
   * 发送多个并发请求
   * @param {Array<Promise>} requests - 请求Promise数组
   * @returns {Promise<Array<any>>} 所有请求的响应数据数组
   */
  all(requests) {
    return Promise.all(requests)
  },
  
  /**
   * 发送多个并发请求，只要有一个请求成功就返回
   * @param {Array<Promise>} requests - 请求Promise数组
   * @returns {Promise<any>} 第一个成功的请求的响应数据
   */
  race(requests) {
    return Promise.race(requests)
  },
  
  /**
   * 取消所有正在进行的请求
   */
  cancelAll() {
    // 这里可以使用axios的CancelToken来实现
    // 暂时使用简单的实现
    apiClient.defaults.cancelToken = new axios.CancelToken(cancel => {
      setTimeout(() => {
        cancel('所有请求已取消')
      }, 0)
    })
  },
  
  /**
   * 设置请求超时时间
   * @param {number} timeout - 超时时间（毫秒）
   */
  setTimeout(timeout) {
    apiClient.defaults.timeout = timeout
  },
  
  /**
   * 设置基础URL
   * @param {string} baseURL - 基础URL
   */
  setBaseURL(baseURL) {
    apiClient.defaults.baseURL = baseURL
  },
  
  /**
   * 获取axios实例
   * @returns {Object} axios实例
   */
  getClient() {
    return apiClient
  }
}

/**
 * 导出API接口定义
 */
export default api