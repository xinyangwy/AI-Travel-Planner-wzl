/**
 * 认证模块
 * 管理用户认证相关的状态
 */

import authService from '@/services/authService'
import { storage } from '@/utils/storage'
import eventBus from '@/utils/eventBus'

export default {
  namespaced: true,
  
  state: {
    // 用户信息
    user: null,
    
    // 认证令牌
    token: null,
    
    // 刷新令牌
    refreshToken: null,
    
    // 认证状态
    isAuthenticated: false,
    
    // 登录加载状态
    isLoggingIn: false,
    
    // 注册加载状态
    isRegistering: false,
    
    // 错误信息
    error: null,
    
    // 用户权限
    permissions: [],
    
    // 上次登录时间
    lastLoginTime: null
  },
  
  getters: {
    /**
     * 获取当前用户信息
     */
    currentUser: state => state.user,
    
    /**
     * 获取认证令牌
     */
    token: state => state.token,
    
    /**
     * 获取用户是否已认证
     */
    isAuthenticated: state => state.isAuthenticated,
    
    /**
     * 获取登录加载状态
     */
    isLoggingIn: state => state.isLoggingIn,
    
    /**
     * 获取注册加载状态
     */
    isRegistering: state => state.isRegistering,
    
    /**
     * 获取错误信息
     */
    error: state => state.error,
    
    /**
     * 获取用户权限列表
     */
    permissions: state => state.permissions,
    
    /**
     * 获取用户名
     */
    userName: state => state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
    
    /**
     * 获取用户头像URL
     */
    userAvatar: state => state.user && state.user.avatar ? state.user.avatar : null,
    
    /**
     * 检查用户是否有指定权限
     */
    hasPermission: state => permission => {
      return state.permissions.includes(permission)
    },
    
    /**
     * 检查用户是否为管理员
     */
    isAdmin: state => state.permissions.includes('ADMIN')
  },
  
  mutations: {
    /**
     * 设置认证信息
     */
    SET_AUTHENTICATION(state, { user, token, refreshToken, permissions }) {
      state.user = user
      state.token = token
      state.refreshToken = refreshToken
      state.isAuthenticated = true
      state.permissions = permissions || []
      state.lastLoginTime = new Date().toISOString()
      state.error = null
    },
    
    /**
     * 清除认证信息
     */
    CLEAR_AUTHENTICATION(state) {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.permissions = []
      state.lastLoginTime = null
      state.error = null
    },
    
    /**
     * 设置登录加载状态
     */
    SET_LOGGING_IN(state, isLoggingIn) {
      state.isLoggingIn = isLoggingIn
    },
    
    /**
     * 设置注册加载状态
     */
    SET_REGISTERING(state, isRegistering) {
      state.isRegistering = isRegistering
    },
    
    /**
     * 设置错误信息
     */
    SET_ERROR(state, error) {
      state.error = error
    },
    
    /**
     * 更新用户信息
     */
    UPDATE_USER(state, userData) {
      if (state.user) {
        state.user = { ...state.user, ...userData }
      }
    },
    
    /**
     * 更新认证令牌
     */
    UPDATE_TOKEN(state, { token, refreshToken }) {
      state.token = token
      if (refreshToken) {
        state.refreshToken = refreshToken
      }
    },
    
    /**
     * 更新用户权限
     */
    UPDATE_PERMISSIONS(state, permissions) {
      state.permissions = permissions
    }
  },
  
  actions: {
    /**
     * 初始化认证状态
     */
    async init({ commit, dispatch }) {
      try {
        // 从本地存储恢复认证信息
        const token = storage.get('auth_token')
        const refreshToken = storage.get('refresh_token')
        const user = storage.get('user_info')
        const permissions = storage.get('user_permissions')
        
        if (token && user) {
          // 设置认证状态
          commit('SET_AUTHENTICATION', {
            user,
            token,
            refreshToken,
            permissions
          })
          
          // 触发登录成功事件
          eventBus.emit('auth:login-success', user)
          
          // 验证令牌是否有效
          dispatch('validateToken')
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error)
        // 如果初始化失败，清除可能损坏的认证信息
        dispatch('logout')
      }
    },
    
    /**
     * 用户登录
     */
    async login({ commit, dispatch }, { email, password }) {
      try {
        commit('SET_LOGGING_IN', true)
        commit('SET_ERROR', null)
        
        // 调用登录服务
        const response = await authService.login(email, password)
        const { user, token, refreshToken, permissions } = response.data
        
        // 设置认证状态
        commit('SET_AUTHENTICATION', {
          user,
          token,
          refreshToken,
          permissions
        })
        
        // 保存认证信息到本地存储
        storage.set('auth_token', token)
        storage.set('refresh_token', refreshToken)
        storage.set('user_info', user)
        storage.set('user_permissions', permissions)
        
        // 触发登录成功事件
        eventBus.emit('auth:login-success', user)
        
        // 显示成功消息
        dispatch('showSuccess', '登录成功', { root: true })
        
        return user
      } catch (error) {
        const errorMessage = error.response?.data?.message || '登录失败，请检查您的邮箱和密码'
        commit('SET_ERROR', errorMessage)
        throw new Error(errorMessage)
      } finally {
        commit('SET_LOGGING_IN', false)
      }
    },
    
    /**
     * 用户注册
     */
    async register({ commit, dispatch }, userData) {
      try {
        commit('SET_REGISTERING', true)
        commit('SET_ERROR', null)
        
        // 调用注册服务
        const response = await authService.register(userData)
        const { user, token, refreshToken, permissions } = response.data
        
        // 设置认证状态
        commit('SET_AUTHENTICATION', {
          user,
          token,
          refreshToken,
          permissions
        })
        
        // 保存认证信息到本地存储
        storage.set('auth_token', token)
        storage.set('refresh_token', refreshToken)
        storage.set('user_info', user)
        storage.set('user_permissions', permissions)
        
        // 触发注册成功事件
        eventBus.emit('auth:register-success', user)
        // 触发登录成功事件
        eventBus.emit('auth:login-success', user)
        
        // 显示成功消息
        dispatch('showSuccess', '注册成功，欢迎使用旅行计划助手', { root: true })
        
        return user
      } catch (error) {
        const errorMessage = error.response?.data?.message || '注册失败，请稍后重试'
        commit('SET_ERROR', errorMessage)
        throw new Error(errorMessage)
      } finally {
        commit('SET_REGISTERING', false)
      }
    },
    
    /**
     * 用户退出登录
     */
    async logout({ commit, dispatch }) {
      try {
        // 调用退出登录服务
        await authService.logout()
      } catch (error) {
        console.error('退出登录失败:', error)
      } finally {
        // 清除认证状态
        commit('CLEAR_AUTHENTICATION')
        
        // 清除本地存储中的认证信息
        storage.remove('auth_token')
        storage.remove('refresh_token')
        storage.remove('user_info')
        storage.remove('user_permissions')
        
        // 触发退出登录事件
        eventBus.emit('auth:logout')
        
        // 清除活跃的旅行计划
        dispatch('setActivePlan', null, { root: true })
      }
    },
    
    /**
     * 刷新认证令牌
     */
    async refreshToken({ commit, state, dispatch }) {
      try {
        if (!state.refreshToken) {
          throw new Error('没有刷新令牌')
        }
        
        // 调用刷新令牌服务
        const response = await authService.refreshToken(state.refreshToken)
        const { token, refreshToken } = response.data
        
        // 更新令牌
        commit('UPDATE_TOKEN', { token, refreshToken })
        
        // 更新本地存储
        storage.set('auth_token', token)
        storage.set('refresh_token', refreshToken)
        
        return token
      } catch (error) {
        console.error('刷新令牌失败:', error)
        // 如果刷新令牌失败，退出登录
        dispatch('logout')
        throw error
      }
    },
    
    /**
     * 验证令牌是否有效
     */
    async validateToken({ dispatch, state }) {
      try {
        if (!state.token) return false
        
        // 调用验证令牌服务
        await authService.validateToken()
        return true
      } catch (error) {
        console.error('令牌验证失败:', error)
        // 如果令牌无效，尝试刷新令牌
        if (state.refreshToken) {
          try {
            await dispatch('refreshToken')
            return true
          } catch (refreshError) {
            // 刷新令牌也失败，退出登录
            dispatch('logout')
            return false
          }
        } else {
          // 没有刷新令牌，退出登录
          dispatch('logout')
          return false
        }
      }
    },
    
    /**
     * 更新用户信息
     */
    async updateUserProfile({ commit, dispatch }, userData) {
      try {
        // 调用更新用户信息服务
        const response = await authService.updateProfile(userData)
        const updatedUser = response.data
        
        // 更新用户信息
        commit('UPDATE_USER', updatedUser)
        
        // 更新本地存储
        storage.set('user_info', updatedUser)
        
        // 触发用户信息更新事件
        eventBus.emit('auth:profile-updated', updatedUser)
        
        // 显示成功消息
        dispatch('showSuccess', '个人信息更新成功', { root: true })
        
        return updatedUser
      } catch (error) {
        const errorMessage = error.response?.data?.message || '更新个人信息失败'
        commit('SET_ERROR', errorMessage)
        throw new Error(errorMessage)
      }
    },
    
    /**
     * 修改密码
     */
    async changePassword({ commit, dispatch }, { currentPassword, newPassword }) {
      try {
        // 调用修改密码服务
        await authService.changePassword(currentPassword, newPassword)
        
        // 显示成功消息
        dispatch('showSuccess', '密码修改成功', { root: true })
        
        return true
      } catch (error) {
        const errorMessage = error.response?.data?.message || '修改密码失败，请检查当前密码是否正确'
        commit('SET_ERROR', errorMessage)
        throw new Error(errorMessage)
      }
    },
    
    /**
     * 重置密码（通过邮箱）
     */
    async resetPassword({ commit, dispatch }, email) {
      try {
        // 调用重置密码服务
        await authService.resetPassword(email)
        
        // 显示成功消息
        dispatch('showSuccess', '重置密码邮件已发送，请查收', { root: true })
        
        return true
      } catch (error) {
        const errorMessage = error.response?.data?.message || '发送重置密码邮件失败'
        commit('SET_ERROR', errorMessage)
        throw new Error(errorMessage)
      }
    },
    
    /**
     * 清除错误信息
     */
    clearError({ commit }) {
      commit('SET_ERROR', null)
    }
  }
}