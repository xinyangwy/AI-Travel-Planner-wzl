/**
 * 认证服务
 * 提供登录、注册、退出登录、刷新Token等功能
 */

import api from './api'
import { storage } from '@/utils/storage'
import eventBus, { EVENT_NAMES } from '@/utils/eventBus'

// 存储键名常量
const AUTH_TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_INFO_KEY = 'user_info'

/**
 * 认证服务
 */
const authService = {
  /**
   * 用户登录
   * @param {Object} credentials - 登录凭证
   * @param {string} credentials.username - 用户名或邮箱
   * @param {string} credentials.password - 密码
   * @returns {Promise<Object>} 登录结果
   */
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials)
      
      // 保存认证信息
      this.saveAuthInfo(response)
      
      // 触发登录成功事件
      eventBus.emit(EVENT_NAMES.USER_LOGIN, response.user)
      
      return response
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  },
  
  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @param {string} userData.username - 用户名
   * @param {string} userData.email - 邮箱
   * @param {string} userData.password - 密码
   * @returns {Promise<Object>} 注册结果
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData)
      
      // 保存认证信息
      this.saveAuthInfo(response)
      
      // 触发登录成功事件
      eventBus.emit(EVENT_NAMES.USER_LOGIN, response.user)
      
      return response
    } catch (error) {
      console.error('Register failed:', error)
      throw error
    }
  },
  
  /**
   * 用户退出登录
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // 调用退出登录接口
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout API call failed:', error)
      // 即使接口调用失败，也继续清理本地数据
    } finally {
      // 清理本地存储的认证信息
      this.clearAuthInfo()
      
      // 触发退出登录事件
      eventBus.emit(EVENT_NAMES.USER_LOGOUT)
    }
  },
  
  /**
   * 刷新Token
   * @returns {Promise<Object>} 刷新结果
   */
  async refreshToken() {
    try {
      const refreshToken = storage.get(REFRESH_TOKEN_KEY)
      
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }
      
      const response = await api.post('/auth/refresh', { refreshToken })
      
      // 更新认证信息
      this.saveAuthInfo(response)
      
      return response
    } catch (error) {
      console.error('Refresh token failed:', error)
      // Token刷新失败，清理认证信息
      this.clearAuthInfo()
      eventBus.emit(EVENT_NAMES.USER_LOGOUT)
      throw error
    }
  },
  
  /**
   * 获取当前用户信息
   * @returns {Promise<Object>} 用户信息
   */
  async getCurrentUser() {
    try {
      // 先尝试从缓存获取
      const cachedUser = this.getUserInfo()
      
      if (cachedUser) {
        return cachedUser
      }
      
      // 缓存中没有，从服务器获取
      const response = await api.get('/auth/me')
      
      // 更新缓存
      storage.set(USER_INFO_KEY, response.user)
      
      return response.user
    } catch (error) {
      console.error('Get current user failed:', error)
      throw error
    }
  },
  
  /**
   * 更新用户信息
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} 更新后的用户信息
   */
  async updateUserInfo(userData) {
    try {
      const response = await api.put('/auth/profile', userData)
      
      // 更新缓存
      storage.set(USER_INFO_KEY, response.user)
      
      // 触发用户信息更新事件
      eventBus.emit(EVENT_NAMES.USER_UPDATE, response.user)
      
      return response.user
    } catch (error) {
      console.error('Update user info failed:', error)
      throw error
    }
  },
  
  /**
   * 修改密码
   * @param {Object} passwordData - 密码数据
   * @param {string} passwordData.oldPassword - 旧密码
   * @param {string} passwordData.newPassword - 新密码
   * @returns {Promise<Object>} 修改结果
   */
  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData)
      return response
    } catch (error) {
      console.error('Change password failed:', error)
      throw error
    }
  },
  
  /**
   * 发送重置密码邮件
   * @param {string} email - 用户邮箱
   * @returns {Promise<Object>} 发送结果
   */
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return response
    } catch (error) {
      console.error('Forgot password failed:', error)
      throw error
    }
  },
  
  /**
   * 重置密码
   * @param {Object} resetData - 重置密码数据
   * @param {string} resetData.token - 重置密码令牌
   * @param {string} resetData.password - 新密码
   * @returns {Promise<Object>} 重置结果
   */
  async resetPassword(resetData) {
    try {
      const response = await api.post('/auth/reset-password', resetData)
      return response
    } catch (error) {
      console.error('Reset password failed:', error)
      throw error
    }
  },
  
  /**
   * 验证邮箱
   * @param {string} token - 验证令牌
   * @returns {Promise<Object>} 验证结果
   */
  async verifyEmail(token) {
    try {
      const response = await api.post('/auth/verify-email', { token })
      return response
    } catch (error) {
      console.error('Verify email failed:', error)
      throw error
    }
  },
  
  /**
   * 重新发送验证邮件
   * @param {string} email - 用户邮箱
   * @returns {Promise<Object>} 发送结果
   */
  async resendVerificationEmail(email) {
    try {
      const response = await api.post('/auth/resend-verification', { email })
      return response
    } catch (error) {
      console.error('Resend verification email failed:', error)
      throw error
    }
  },
  
  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  isAuthenticated() {
    const token = storage.get(AUTH_TOKEN_KEY)
    return !!token
  },
  
  /**
   * 获取认证Token
   * @returns {string|null} 认证Token
   */
  getAuthToken() {
    return storage.get(AUTH_TOKEN_KEY)
  },
  
  /**
   * 获取刷新Token
   * @returns {string|null} 刷新Token
   */
  getRefreshToken() {
    return storage.get(REFRESH_TOKEN_KEY)
  },
  
  /**
   * 获取用户信息
   * @returns {Object|null} 用户信息
   */
  getUserInfo() {
    return storage.get(USER_INFO_KEY)
  },
  
  /**
   * 保存认证信息
   * @param {Object} response - 登录/注册接口返回的数据
   */
  saveAuthInfo(response) {
    const { token, refreshToken, user } = response
    
    // 保存Token
    if (token) {
      storage.set(AUTH_TOKEN_KEY, token)
    }
    
    // 保存刷新Token
    if (refreshToken) {
      storage.set(REFRESH_TOKEN_KEY, refreshToken)
    }
    
    // 保存用户信息
    if (user) {
      storage.set(USER_INFO_KEY, user)
    }
  },
  
  /**
   * 清理认证信息
   */
  clearAuthInfo() {
    storage.remove(AUTH_TOKEN_KEY)
    storage.remove(REFRESH_TOKEN_KEY)
    storage.remove(USER_INFO_KEY)
  },
  
  /**
   * 检查Token是否即将过期
   * @param {number} [thresholdMinutes=5] - 过期阈值（分钟）
   * @returns {boolean} Token是否即将过期
   */
  isTokenExpiringSoon(thresholdMinutes = 5) {
    const token = this.getAuthToken()
    
    if (!token) {
      return true
    }
    
    try {
      // 解析JWT Token
      const tokenParts = token.split('.')
      
      if (tokenParts.length !== 3) {
        return true
      }
      
      // 解码payload部分
      const payload = JSON.parse(atob(tokenParts[1]))
      
      // 检查exp字段
      if (!payload.exp) {
        return true
      }
      
      // 计算Token过期时间和当前时间
      const expiryTime = payload.exp * 1000 // 转换为毫秒
      const now = Date.now()
      const thresholdMs = thresholdMinutes * 60 * 1000
      
      // 检查是否即将过期
      return expiryTime - now < thresholdMs
    } catch (error) {
      console.error('Failed to parse token:', error)
      return true
    }
  },
  
  /**
   * 初始化认证服务
   * 设置Token自动刷新等
   */
  init() {
    // 检查Token是否存在
    if (!this.isAuthenticated()) {
      return
    }
    
    // 设置定时刷新Token
    this.setupTokenRefreshTimer()
  },
  
  /**
   * 设置Token自动刷新定时器
   */
  setupTokenRefreshTimer() {
    // 每分钟检查一次Token是否即将过期
    setInterval(() => {
      if (this.isTokenExpiringSoon()) {
        // 静默刷新Token
        this.refreshToken().catch(error => {
          console.error('Auto refresh token failed:', error)
        })
      }
    }, 60 * 1000) // 1分钟
  },
  
  /**
   * 获取用户权限
   * @returns {Array<string>} 权限列表
   */
  getUserPermissions() {
    const userInfo = this.getUserInfo()
    return userInfo?.permissions || []
  },
  
  /**
   * 检查用户是否有指定权限
   * @param {string} permission - 权限名称
   * @returns {boolean} 是否有权限
   */
  hasPermission(permission) {
    const permissions = this.getUserPermissions()
    return permissions.includes(permission)
  },
  
  /**
   * 检查用户是否有指定角色
   * @param {string|Array<string>} role - 角色名称或角色数组
   * @returns {boolean} 是否有角色
   */
  hasRole(role) {
    const userInfo = this.getUserInfo()
    const userRoles = userInfo?.roles || []
    
    if (Array.isArray(role)) {
      return role.some(r => userRoles.includes(r))
    } else {
      return userRoles.includes(role)
    }
  }
}

export default authService