/**
 * HTTP请求工具类
 * 封装axios，统一处理请求和响应
 */
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import store from '../store'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '/api', // API基础URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求前做些什么
    // 1. 从store中获取token
    const token = store.getters.token || localStorage.getItem('token')
    
    // 2. 如果token存在，添加到请求头中
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // 3. 可以在这里添加其他通用请求头或处理逻辑
    config.headers['X-Request-Time'] = new Date().getTime()
    
    return config
  },
  error => {
    // 处理请求错误
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据进行处理
    const res = response.data
    
    // 1. 根据自定义的状态码判断请求是否成功
    // 这里假设后端返回的数据格式为 { code: 200, message: 'success', data: {} }
    if (res.code !== 200) {
      // 错误消息处理
      ElMessage.error({
        message: res.message || '请求失败',
        duration: 3000
      })
      
      // 2. 特定错误码处理
      // -1: 未登录状态，需要重新登录
      if (res.code === -1) {
        // 清除token和用户信息
        store.dispatch('user/resetToken')
        
        // 提示用户登录
        ElMessageBox.alert('登录已过期，请重新登录', '提示', {
          confirmButtonText: '确定',
          callback: () => {
            // 重定向到登录页或执行其他操作
            window.location.href = '/login'
          }
        })
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      // 请求成功，直接返回数据
      return res.data
    }
  },
  error => {
    // 处理响应错误
    console.error('响应错误:', error)
    
    let message = '网络错误，请稍后重试'
    
    // 根据HTTP状态码给出更具体的错误信息
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          // 清除token和用户信息
          store.dispatch('user/resetToken')
          // 重定向到登录页
          setTimeout(() => {
            window.location.href = '/login'
          }, 1500)
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 408:
          message = '请求超时'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 501:
          message = '服务未实现'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        case 504:
          message = '网关超时'
          break
        default:
          message = `请求失败 (${error.response.status})`
      }
      
      // 如果后端返回了错误消息，则使用后端消息
      if (error.response.data && error.response.data.message) {
        message = error.response.data.message
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      message = '未收到响应，请检查网络连接'
    }
    
    // 显示错误消息
    ElMessage.error({
      message,
      duration: 3000
    })
    
    return Promise.reject(error)
  }
)

/**
 * 封装GET请求
 * @param {string} url - 请求URL
 * @param {object} params - 请求参数
 * @returns {Promise} 请求Promise对象
 */
export const get = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    service.get(url, { params })
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}

/**
 * 封装POST请求
 * @param {string} url - 请求URL
 * @param {object} data - 请求数据
 * @param {object} config - 配置项
 * @returns {Promise} 请求Promise对象
 */
export const post = (url, data = {}, config = {}) => {
  return new Promise((resolve, reject) => {
    service.post(url, data, config)
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}

/**
 * 封装PUT请求
 * @param {string} url - 请求URL
 * @param {object} data - 请求数据
 * @returns {Promise} 请求Promise对象
 */
export const put = (url, data = {}) => {
  return new Promise((resolve, reject) => {
    service.put(url, data)
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}

/**
 * 封装DELETE请求
 * @param {string} url - 请求URL
 * @param {object} params - 请求参数
 * @returns {Promise} 请求Promise对象
 */
export const del = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    service.delete(url, { params })
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}

/**
 * 封装PATCH请求
 * @param {string} url - 请求URL
 * @param {object} data - 请求数据
 * @returns {Promise} 请求Promise对象
 */
export const patch = (url, data = {}) => {
  return new Promise((resolve, reject) => {
    service.patch(url, data)
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}

/**
 * 上传文件
 * @param {string} url - 请求URL
 * @param {object} formData - FormData对象，包含文件
 * @param {function} onUploadProgress - 上传进度回调函数
 * @returns {Promise} 请求Promise对象
 */
export const uploadFile = (url, formData, onUploadProgress = null) => {
  return new Promise((resolve, reject) => {
    service.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onUploadProgress
    })
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}

/**
 * 下载文件
 * @param {string} url - 请求URL
 * @param {object} params - 请求参数
 * @param {string} filename - 文件名
 */
export const downloadFile = (url, params = {}, filename = '') => {
  service.get(url, {
    params,
    responseType: 'blob' // 重要：设置响应类型为blob
  }).then(res => {
    // 创建Blob对象
    const blob = new Blob([res], { type: 'application/octet-stream' })
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    
    // 设置文件名
    if (filename) {
      link.download = filename
    } else {
      // 尝试从响应头获取文件名
      const contentDisposition = res.headers ? res.headers['content-disposition'] : ''
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/)
        if (match && match[1]) {
          link.download = decodeURIComponent(match[1])
        } else {
          link.download = 'download.dat'
        }
      } else {
        link.download = 'download.dat'
      }
    }
    
    // 模拟点击下载
    document.body.appendChild(link)
    link.click()
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    }, 100)
  }).catch(error => {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请稍后重试')
  })
}

// 导出service实例，以便在需要时直接使用
export default service

// 导出所有方法
export {
  get,
  post,
  put,
  del,
  patch,
  uploadFile,
  downloadFile
}