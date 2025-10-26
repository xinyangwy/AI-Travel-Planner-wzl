/**
 * 用户相关 Vuex Module
 */
import { get, post } from '../../utils/request'
import { API, STORAGE_KEYS } from '../../constants'
import { localStorage, sessionStorage } from '../../utils/storage'

const user = {
  // 命名空间
  namespaced: true,
  
  // 状态
  state() {
    return {
      // 用户信息
      userInfo: null,
      // 登录状态
      isLoggedIn: false,
      // Token
      token: null,
      // 用户设置
      settings: {},
      // 权限列表
      permissions: [],
      // 角色列表
      roles: []
    }
  },
  
  // 获取器
  getters: {
    // 获取用户信息
    userInfo: state => state.userInfo,
    
    // 获取登录状态
    isLoggedIn: state => state.isLoggedIn,
    
    // 获取Token
    token: state => state.token,
    
    // 获取用户名
    username: state => state.userInfo?.username || '',
    
    // 获取用户ID
    userId: state => state.userInfo?.id || null,
    
    // 获取用户设置
    settings: state => state.settings,
    
    // 获取权限列表
    permissions: state => state.permissions,
    
    // 获取角色列表
    roles: state => state.roles,
    
    // 判断是否有指定权限
    hasPermission: state => permission => {
      return state.permissions.includes(permission)
    },
    
    // 判断是否有指定角色
    hasRole: state => role => {
      return state.roles.includes(role)
    },
    
    // 判断是否为管理员
    isAdmin: state => {
      return state.roles.includes('ADMIN')
    },
    
    // 获取用户头像
    avatar: state => state.userInfo?.avatar || '/default-avatar.png'
  },
  
  // 变更函数
  mutations: {
    // 设置用户信息
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
      // 保存到本地存储
      localStorage.set(STORAGE_KEYS.USER_INFO, userInfo)
    },
    
    // 设置登录状态
    SET_LOGGED_IN(state, isLoggedIn) {
      state.isLoggedIn = isLoggedIn
    },
    
    // 设置Token
    SET_TOKEN(state, token) {
      state.token = token
      // 保存到本地存储
      localStorage.set(STORAGE_KEYS.USER_TOKEN, token)
    },
    
    // 设置用户设置
    SET_SETTINGS(state, settings) {
      state.settings = settings
      // 保存到本地存储
      localStorage.set(STORAGE_KEYS.USER_SETTINGS, settings)
    },
    
    // 设置权限列表
    SET_PERMISSIONS(state, permissions) {
      state.permissions = permissions
    },
    
    // 设置角色列表
    SET_ROLES(state, roles) {
      state.roles = roles
    },
    
    // 更新用户信息
    UPDATE_USER_INFO(state, updates) {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...updates }
        // 保存到本地存储
        localStorage.set(STORAGE_KEYS.USER_INFO, state.userInfo)
      }
    },
    
    // 重置用户状态
    RESET_USER_STATE(state) {
      state.userInfo = null
      state.isLoggedIn = false
      state.token = null
      state.settings = {}
      state.permissions = []
      state.roles = []
      
      // 清除本地存储
      localStorage.remove(STORAGE_KEYS.USER_INFO)
      localStorage.remove(STORAGE_KEYS.USER_TOKEN)
      localStorage.remove(STORAGE_KEYS.USER_SETTINGS)
      sessionStorage.clear()
    }
  },
  
  // 动作函数
  actions: {
    // 初始化用户状态（从本地存储恢复）
    initUserState({ commit }) {
      // 从本地存储获取token
      const token = localStorage.get(STORAGE_KEYS.USER_TOKEN)
      if (token) {
        commit('SET_TOKEN', token)
        commit('SET_LOGGED_IN', true)
        
        // 获取用户信息
        const userInfo = localStorage.get(STORAGE_KEYS.USER_INFO)
        if (userInfo) {
          commit('SET_USER_INFO', userInfo)
          // 设置权限和角色
          commit('SET_PERMISSIONS', userInfo.permissions || [])
          commit('SET_ROLES', userInfo.roles || [])
        }
        
        // 获取用户设置
        const settings = localStorage.get(STORAGE_KEYS.USER_SETTINGS, {})
        commit('SET_SETTINGS', settings)
      }
    },
    
    // 登录
    async login({ commit, dispatch }, { username, password, remember }) {
      try {
        // 调用登录接口
        const response = await post(API.ENDPOINTS.USER_LOGIN, { username, password })
        
        const { token, userInfo } = response
        
        // 设置token
        commit('SET_TOKEN', token)
        
        // 设置用户信息
        commit('SET_USER_INFO', userInfo)
        
        // 设置登录状态
        commit('SET_LOGGED_IN', true)
        
        // 设置权限和角色
        commit('SET_PERMISSIONS', userInfo.permissions || [])
        commit('SET_ROLES', userInfo.roles || [])
        
        // 如果需要记住用户名
        if (remember) {
          localStorage.set(STORAGE_KEYS.REMEMBER_USERNAME, username)
        } else {
          localStorage.remove(STORAGE_KEYS.REMEMBER_USERNAME)
        }
        
        // 记录登录时间
        localStorage.set(STORAGE_KEYS.LAST_LOGIN_TIME, new Date().toISOString())
        
        // 显示登录成功消息
        dispatch('showMessage', { message: '登录成功', type: 'success' }, { root: true })
        
        return response
      } catch (error) {
        console.error('登录失败:', error)
        dispatch('showMessage', { message: error.message || '登录失败', type: 'error' }, { root: true })
        throw error
      }
    },
    
    // 注册
    async register({ dispatch }, userData) {
      try {
        // 调用注册接口
        const response = await post(API.ENDPOINTS.USER_REGISTER, userData)
        
        // 显示注册成功消息
        dispatch('showMessage', { message: '注册成功，请登录', type: 'success' }, { root: true })
        
        return response
      } catch (error) {
        console.error('注册失败:', error)
        dispatch('showMessage', { message: error.message || '注册失败', type: 'error' }, { root: true })
        throw error
      }
    },
    
    // 登出
    async logout({ commit, dispatch }) {
      try {
        // 调用登出接口（可选）
        await post(API.ENDPOINTS.USER_LOGOUT)
      } catch (error) {
        console.error('登出接口调用失败:', error)
        // 即使接口调用失败，也要继续执行登出逻辑
      } finally {
        // 重置用户状态
        commit('RESET_USER_STATE')
        
        // 显示登出成功消息
        dispatch('showMessage', { message: '已退出登录', type: 'info' }, { root: true })
      }
    },
    
    // 获取用户信息
    async getUserInfo({ commit, dispatch }) {
      try {
        // 调用获取用户信息接口
        const userInfo = await get(API.ENDPOINTS.USER_INFO)
        
        // 更新用户信息
        commit('SET_USER_INFO', userInfo)
        commit('SET_PERMISSIONS', userInfo.permissions || [])
        commit('SET_ROLES', userInfo.roles || [])
        
        return userInfo
      } catch (error) {
        console.error('获取用户信息失败:', error)
        
        // 如果是token过期或无效，重置登录状态
        if (error.response && error.response.status === 401) {
          commit('RESET_USER_STATE')
        }
        
        throw error
      }
    },
    
    // 更新用户信息
    async updateUserInfo({ commit, dispatch }, updates) {
      try {
        // 调用更新用户信息接口
        const userInfo = await put(API.ENDPOINTS.USER_UPDATE, updates)
        
        // 更新本地状态
        commit('UPDATE_USER_INFO', userInfo)
        
        // 显示更新成功消息
        dispatch('showMessage', { message: '个人信息更新成功', type: 'success' }, { root: true })
        
        return userInfo
      } catch (error) {
        console.error('更新用户信息失败:', error)
        dispatch('showMessage', { message: error.message || '更新失败', type: 'error' }, { root: true })
        throw error
      }
    },
    
    // 修改密码
    async changePassword({ dispatch }, { oldPassword, newPassword, confirmPassword }) {
      try {
        // 验证两次密码是否一致
        if (newPassword !== confirmPassword) {
          throw new Error('两次输入的新密码不一致')
        }
        
        // 调用修改密码接口
        await post(API.ENDPOINTS.USER_PASSWORD, { oldPassword, newPassword })
        
        // 显示修改成功消息
        dispatch('showMessage', { message: '密码修改成功', type: 'success' }, { root: true })
      } catch (error) {
        console.error('修改密码失败:', error)
        dispatch('showMessage', { message: error.message || '修改密码失败', type: 'error' }, { root: true })
        throw error
      }
    },
    
    // 更新用户设置
    updateSettings({ commit }, settings) {
      commit('SET_SETTINGS', { ...this.state.user.settings, ...settings })
    },
    
    // 重置Token
    resetToken({ commit }) {
      commit('RESET_USER_STATE')
    }
  }
}

// 导入put方法
import { put } from '../../utils/request'

export default user