/**
 * 设置模块
 * 管理应用程序配置设置
 */

import { storage } from '@/utils/storage'
import eventBus from '@/utils/eventBus'

export default {
  namespaced: true,
  
  state: {
    // 用户偏好设置
    preferences: {
      // 默认货币
      currency: 'CNY',
      // 语言
      language: 'zh-CN',
      // 日期格式
      dateFormat: 'YYYY-MM-DD',
      // 时间格式
      timeFormat: '24h', // '12h' or '24h'
      // 温度单位
      temperatureUnit: 'C', // 'C' for Celsius, 'F' for Fahrenheit
      // 距离单位
      distanceUnit: 'km', // 'km' for kilometers, 'mi' for miles
      // 是否启用通知
      enableNotifications: true,
      // 是否启用自动保存
      autoSave: true,
      // 自动保存间隔（秒）
      autoSaveInterval: 30,
      // 是否显示天气信息
      showWeather: true,
      // 是否显示货币转换
      showCurrencyConversion: true,
      // 默认视图模式
      defaultViewMode: 'list' // 'list', 'calendar', 'map'
    },
    
    // 应用程序设置
    appSettings: {
      // 是否启用分析
      enableAnalytics: true,
      // 是否启用自动检查更新
      checkUpdates: true,
      // 上次检查更新时间
      lastUpdateCheck: null,
      // 是否使用暗色主题
      darkMode: false,
      // 是否压缩图片上传
      compressImages: true,
      // 图片压缩质量
      imageCompressionQuality: 0.8,
      // 最大上传文件大小（MB）
      maxUploadSize: 10,
      // 是否在新标签页打开外部链接
      openExternalLinksInNewTab: true,
      // 是否显示教程提示
      showTutorialTips: true,
      // 上次显示教程时间
      lastTutorialShown: null
    },
    
    // 同步设置
    sync: {
      // 是否启用自动同步
      autoSync: true,
      // 同步间隔（分钟）
      syncInterval: 15,
      // 上次同步时间
      lastSyncTime: null,
      // 同步状态
      syncStatus: 'idle', // 'idle', 'syncing', 'success', 'error'
      // 同步错误信息
      syncError: null
    },
    
    // 地图设置
    map: {
      // 地图服务提供商
      provider: 'google', // 'google', 'baidu', 'amap', 'bing'
      // 默认缩放级别
      defaultZoom: 10,
      // 初始中心点坐标
      defaultCenter: { lat: 39.9042, lng: 116.4074 }, // 默认北京
      // 是否启用街景
      enableStreetView: true,
      // 交通图层
      showTraffic: false,
      // 卫星图层
      showSatellite: false
    },
    
    // 加载状态
    loading: false,
    
    // 错误信息
    error: null
  },
  
  getters: {
    /**
     * 获取用户偏好设置
     */
    preferences: state => state.preferences,
    
    /**
     * 获取应用程序设置
     */
    appSettings: state => state.appSettings,
    
    /**
     * 获取同步设置
     */
    sync: state => state.sync,
    
    /**
     * 获取地图设置
     */
    map: state => state.map,
    
    /**
     * 获取加载状态
     */
    loading: state => state.loading,
    
    /**
     * 获取错误信息
     */
    error: state => state.error,
    
    /**
     * 获取默认货币
     */
    defaultCurrency: state => state.preferences.currency,
    
    /**
     * 获取语言设置
     */
    language: state => state.preferences.language,
    
    /**
     * 获取日期格式
     */
    dateFormat: state => state.preferences.dateFormat,
    
    /**
     * 获取时间格式
     */
    timeFormat: state => state.preferences.timeFormat,
    
    /**
     * 判断是否启用通知
     */
    notificationsEnabled: state => state.preferences.enableNotifications,
    
    /**
     * 判断是否启用自动同步
     */
    autoSyncEnabled: state => state.sync.autoSync,
    
    /**
     * 获取同步状态
     */
    syncStatus: state => state.sync.syncStatus
  },
  
  mutations: {
    /**
     * 设置用户偏好设置
     */
    SET_PREFERENCES(state, preferences) {
      state.preferences = { ...state.preferences, ...preferences }
      // 保存到本地存储
      storage.set('user_preferences', state.preferences)
      // 触发设置变更事件
      eventBus.emit('settings:preferences-changed', state.preferences)
    },
    
    /**
     * 设置应用程序设置
     */
    SET_APP_SETTINGS(state, appSettings) {
      state.appSettings = { ...state.appSettings, ...appSettings }
      // 保存到本地存储
      storage.set('app_settings', state.appSettings)
      // 触发设置变更事件
      eventBus.emit('settings:app-settings-changed', state.appSettings)
    },
    
    /**
     * 设置同步设置
     */
    SET_SYNC_SETTINGS(state, syncSettings) {
      state.sync = { ...state.sync, ...syncSettings }
      // 保存到本地存储
      storage.set('sync_settings', state.sync)
      // 触发设置变更事件
      eventBus.emit('settings:sync-settings-changed', state.sync)
    },
    
    /**
     * 设置地图设置
     */
    SET_MAP_SETTINGS(state, mapSettings) {
      state.map = { ...state.map, ...mapSettings }
      // 保存到本地存储
      storage.set('map_settings', state.map)
      // 触发设置变更事件
      eventBus.emit('settings:map-settings-changed', state.map)
    },
    
    /**
     * 设置加载状态
     */
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    /**
     * 设置错误信息
     */
    SET_ERROR(state, error) {
      state.error = error
    },
    
    /**
     * 更新同步状态
     */
    UPDATE_SYNC_STATUS(state, { status, error = null }) {
      state.sync.syncStatus = status
      if (error) {
        state.sync.syncError = error
      }
      if (status === 'success' || status === 'error') {
        state.sync.lastSyncTime = new Date().toISOString()
      }
      // 保存到本地存储
      storage.set('sync_settings', state.sync)
    },
    
    /**
     * 重置所有设置到默认值
     */
    RESET_SETTINGS(state) {
      // 重置用户偏好设置
      state.preferences = {
        currency: 'CNY',
        language: 'zh-CN',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        temperatureUnit: 'C',
        distanceUnit: 'km',
        enableNotifications: true,
        autoSave: true,
        autoSaveInterval: 30,
        showWeather: true,
        showCurrencyConversion: true,
        defaultViewMode: 'list'
      }
      
      // 重置应用程序设置
      state.appSettings = {
        enableAnalytics: true,
        checkUpdates: true,
        lastUpdateCheck: null,
        darkMode: false,
        compressImages: true,
        imageCompressionQuality: 0.8,
        maxUploadSize: 10,
        openExternalLinksInNewTab: true,
        showTutorialTips: true,
        lastTutorialShown: null
      }
      
      // 重置同步设置
      state.sync = {
        autoSync: true,
        syncInterval: 15,
        lastSyncTime: null,
        syncStatus: 'idle',
        syncError: null
      }
      
      // 重置地图设置
      state.map = {
        provider: 'google',
        defaultZoom: 10,
        defaultCenter: { lat: 39.9042, lng: 116.4074 },
        enableStreetView: true,
        showTraffic: false,
        showSatellite: false
      }
      
      // 清除错误
      state.error = null
      
      // 保存到本地存储
      storage.set('user_preferences', state.preferences)
      storage.set('app_settings', state.appSettings)
      storage.set('sync_settings', state.sync)
      storage.set('map_settings', state.map)
      
      // 触发设置重置事件
      eventBus.emit('settings:reset')
    }
  },
  
  actions: {
    /**
     * 加载设置
     */
    loadSettings({ commit }) {
      try {
        commit('SET_LOADING', true)
        
        // 从本地存储加载设置
        const preferences = storage.get('user_preferences')
        const appSettings = storage.get('app_settings')
        const syncSettings = storage.get('sync_settings')
        const mapSettings = storage.get('map_settings')
        
        // 设置加载的设置（如果存在）
        if (preferences) {
          commit('SET_PREFERENCES', preferences)
        }
        
        if (appSettings) {
          commit('SET_APP_SETTINGS', appSettings)
        }
        
        if (syncSettings) {
          commit('SET_SYNC_SETTINGS', syncSettings)
        }
        
        if (mapSettings) {
          commit('SET_MAP_SETTINGS', mapSettings)
        }
      } catch (error) {
        console.error('加载设置失败:', error)
        commit('SET_ERROR', '加载设置失败')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    /**
     * 更新用户偏好设置
     */
    updatePreferences({ commit }, preferences) {
      try {
        commit('SET_PREFERENCES', preferences)
        return true
      } catch (error) {
        commit('SET_ERROR', '更新偏好设置失败')
        throw error
      }
    },
    
    /**
     * 更新应用程序设置
     */
    updateAppSettings({ commit }, appSettings) {
      try {
        commit('SET_APP_SETTINGS', appSettings)
        return true
      } catch (error) {
        commit('SET_ERROR', '更新应用程序设置失败')
        throw error
      }
    },
    
    /**
     * 更新同步设置
     */
    updateSyncSettings({ commit }, syncSettings) {
      try {
        commit('SET_SYNC_SETTINGS', syncSettings)
        return true
      } catch (error) {
        commit('SET_ERROR', '更新同步设置失败')
        throw error
      }
    },
    
    /**
     * 更新地图设置
     */
    updateMapSettings({ commit }, mapSettings) {
      try {
        commit('SET_MAP_SETTINGS', mapSettings)
        return true
      } catch (error) {
        commit('SET_ERROR', '更新地图设置失败')
        throw error
      }
    },
    
    /**
     * 重置所有设置
     */
    resetSettings({ commit, dispatch }) {
      try {
        commit('RESET_SETTINGS')
        dispatch('showSuccess', '设置已重置为默认值', { root: true })
        return true
      } catch (error) {
        commit('SET_ERROR', '重置设置失败')
        dispatch('showError', { message: '重置设置失败' }, { root: true })
        throw error
      }
    },
    
    /**
     * 导出设置
     */
    exportSettings({ state }) {
      try {
        const settings = {
          preferences: state.preferences,
          appSettings: state.appSettings,
          sync: state.sync,
          map: state.map,
          exportDate: new Date().toISOString()
        }
        
        // 转换为JSON字符串
        const settingsJson = JSON.stringify(settings, null, 2)
        
        // 创建Blob对象
        const blob = new Blob([settingsJson], { type: 'application/json' })
        
        // 创建下载链接
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `travel-planner-settings-${new Date().toISOString().split('T')[0]}.json`
        
        // 触发下载
        document.body.appendChild(a)
        a.click()
        
        // 清理
        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }, 0)
        
        return true
      } catch (error) {
        console.error('导出设置失败:', error)
        throw new Error('导出设置失败')
      }
    },
    
    /**
     * 导入设置
     */
    importSettings({ commit, dispatch }, settingsJson) {
      try {
        // 解析JSON
        const settings = JSON.parse(settingsJson)
        
        // 验证导入的设置
        if (!settings.preferences || !settings.appSettings || !settings.sync || !settings.map) {
          throw new Error('无效的设置文件格式')
        }
        
        // 应用导入的设置
        commit('SET_PREFERENCES', settings.preferences)
        commit('SET_APP_SETTINGS', settings.appSettings)
        commit('SET_SYNC_SETTINGS', settings.sync)
        commit('SET_MAP_SETTINGS', settings.map)
        
        dispatch('showSuccess', '设置导入成功', { root: true })
        
        // 触发设置导入事件
        eventBus.emit('settings:imported', settings)
        
        return true
      } catch (error) {
        console.error('导入设置失败:', error)
        dispatch('showError', { message: error.message || '导入设置失败' }, { root: true })
        throw error
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