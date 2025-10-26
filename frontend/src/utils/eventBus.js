/**
 * 事件总线工具
 * 提供一个简单的发布-订阅模式实现，用于组件间通信
 */

/**
 * 事件处理器回调函数类型
 * @typedef {Function} EventHandler
 * @param {...*} args - 事件参数
 */

class EventBus {
  constructor() {
    // 事件映射表，用于存储事件名称和对应的处理器数组
    this._events = {}
    // 事件处理器ID计数器，用于唯一标识每个处理器
    this._handlerIdCounter = 0
  }

  /**
   * 订阅事件
   * @param {string} eventName - 事件名称
   * @param {EventHandler} handler - 事件处理函数
   * @param {Object} [options={}] - 选项
   * @param {boolean} [options.once=false] - 是否只执行一次
   * @returns {number} 事件处理器ID，可用于取消订阅
   */
  on(eventName, handler, options = {}) {
    if (typeof eventName !== 'string' || typeof handler !== 'function') {
      console.error('EventBus.on: Invalid event name or handler')
      return -1
    }

    const { once = false } = options
    
    // 如果事件不存在，创建一个空数组
    if (!this._events[eventName]) {
      this._events[eventName] = []
    }

    // 生成唯一的处理器ID
    const handlerId = this._handlerIdCounter++
    
    // 添加处理器到事件映射表
    this._events[eventName].push({
      id: handlerId,
      handler,
      once
    })

    return handlerId
  }

  /**
   * 订阅只执行一次的事件
   * @param {string} eventName - 事件名称
   * @param {EventHandler} handler - 事件处理函数
   * @returns {number} 事件处理器ID，可用于取消订阅
   */
  once(eventName, handler) {
    return this.on(eventName, handler, { once: true })
  }

  /**
   * 取消订阅事件
   * @param {string} eventName - 事件名称
   * @param {number|EventHandler} handlerIdOrHandler - 事件处理器ID或处理函数
   * @returns {boolean} 是否取消成功
   */
  off(eventName, handlerIdOrHandler) {
    // 检查事件是否存在
    if (!this._events[eventName]) {
      return false
    }

    // 根据处理器ID或处理函数取消订阅
    const handlers = this._events[eventName]
    let removed = false

    // 过滤掉要移除的处理器
    this._events[eventName] = handlers.filter(handlerInfo => {
      const shouldRemove = typeof handlerIdOrHandler === 'number'
        ? handlerInfo.id === handlerIdOrHandler
        : handlerInfo.handler === handlerIdOrHandler
      
      if (shouldRemove) {
        removed = true
        return false
      }
      return true
    })

    // 如果事件的处理器数组为空，删除该事件
    if (this._events[eventName].length === 0) {
      delete this._events[eventName]
    }

    return removed
  }

  /**
   * 取消指定事件的所有订阅
   * @param {string} eventName - 事件名称
   * @returns {boolean} 是否取消成功
   */
  offAll(eventName) {
    if (!eventName) {
      console.error('EventBus.offAll: Event name is required')
      return false
    }

    if (this._events[eventName]) {
      delete this._events[eventName]
      return true
    }

    return false
  }

  /**
   * 清空所有事件订阅
   * @returns {boolean} 是否清空成功
   */
  clear() {
    this._events = {}
    return true
  }

  /**
   * 发布事件
   * @param {string} eventName - 事件名称
   * @param {...*} args - 传递给事件处理器的参数
   * @returns {boolean} 是否发布成功
   */
  emit(eventName, ...args) {
    // 检查事件是否存在
    if (!this._events[eventName]) {
      return false
    }

    // 复制一份处理器数组，防止在执行过程中数组被修改
    const handlers = [...this._events[eventName]]
    // 需要移除的一次性处理器ID数组
    const handlersToRemove = []

    // 执行所有处理器
    handlers.forEach(handlerInfo => {
      try {
        handlerInfo.handler(...args)
      } catch (error) {
        console.error(`Error in EventBus handler for event "${eventName}":`, error)
      }

      // 如果是一次性处理器，添加到移除列表
      if (handlerInfo.once) {
        handlersToRemove.push(handlerInfo.id)
      }
    })

    // 移除所有一次性处理器
    handlersToRemove.forEach(handlerId => {
      this.off(eventName, handlerId)
    })

    return true
  }

  /**
   * 获取指定事件的订阅者数量
   * @param {string} eventName - 事件名称
   * @returns {number} 订阅者数量
   */
  getListenerCount(eventName) {
    if (!this._events[eventName]) {
      return 0
    }

    return this._events[eventName].length
  }

  /**
   * 获取所有已注册的事件名称
   * @returns {Array<string>} 事件名称数组
   */
  getEvents() {
    return Object.keys(this._events)
  }

  /**
   * 检查事件是否有订阅者
   * @param {string} eventName - 事件名称
   * @returns {boolean} 是否有订阅者
   */
  hasListeners(eventName) {
    return this.getListenerCount(eventName) > 0
  }

  /**
   * 创建一个命名空间的事件总线
   * @param {string} namespace - 命名空间名称
   * @returns {Object} 命名空间事件总线
   */
  createNamespace(namespace) {
    const nsEventBus = {
      on: (eventName, handler, options) => {
        return this.on(`${namespace}:${eventName}`, handler, options)
      },
      once: (eventName, handler) => {
        return this.once(`${namespace}:${eventName}`, handler)
      },
      off: (eventName, handlerIdOrHandler) => {
        return this.off(`${namespace}:${eventName}`, handlerIdOrHandler)
      },
      offAll: () => {
        const events = this.getEvents()
        events.forEach(event => {
          if (event.startsWith(`${namespace}:`)) {
            this.offAll(event)
          }
        })
        return true
      },
      emit: (eventName, ...args) => {
        return this.emit(`${namespace}:${eventName}`, ...args)
      },
      getListenerCount: (eventName) => {
        return this.getListenerCount(`${namespace}:${eventName}`)
      },
      hasListeners: (eventName) => {
        return this.hasListeners(`${namespace}:${eventName}`)
      }
    }

    return nsEventBus
  }

  /**
   * 导出事件总线实例的状态（调试用）
   * @returns {Object} 事件总线状态
   */
  exportState() {
    return {
      events: Object.keys(this._events).reduce((acc, eventName) => {
        acc[eventName] = this._events[eventName].length
        return acc
      }, {}),
      totalHandlers: Object.values(this._events).reduce((acc, handlers) => {
        return acc + handlers.length
      }, 0)
    }
  }

  /**
   * 打印事件总线状态（调试用）
   */
  printState() {
    const state = this.exportState()
    console.log('EventBus state:', state)
    console.log('Registered events:', state.events)
    console.log(`Total handlers: ${state.totalHandlers}`)
  }
}

// 创建单例实例
const eventBus = new EventBus()

/**
 * 常用事件名称常量
 */
export const EVENT_NAMES = {
  // 应用级事件
  APP_LOADING_START: 'app:loading:start',
  APP_LOADING_END: 'app:loading:end',
  APP_ERROR: 'app:error',
  APP_WARNING: 'app:warning',
  APP_INFO: 'app:info',
  APP_SUCCESS: 'app:success',
  
  // 用户相关事件
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_UPDATE: 'user:update',
  USER_PROFILE_CHANGE: 'user:profile:change',
  
  // 旅行计划相关事件
  TRAVEL_PLAN_CREATE: 'travel:plan:create',
  TRAVEL_PLAN_UPDATE: 'travel:plan:update',
  TRAVEL_PLAN_DELETE: 'travel:plan:delete',
  TRAVEL_PLAN_SELECT: 'travel:plan:select',
  TRAVEL_PLAN_LOAD: 'travel:plan:load',
  
  // 行程相关事件
  ITINERARY_ADD: 'itinerary:add',
  ITINERARY_UPDATE: 'itinerary:update',
  ITINERARY_DELETE: 'itinerary:delete',
  ITINERARY_REORDER: 'itinerary:reorder',
  
  // 费用相关事件
  EXPENSE_ADD: 'expense:add',
  EXPENSE_UPDATE: 'expense:update',
  EXPENSE_DELETE: 'expense:delete',
  EXPENSE_CATEGORY_CHANGE: 'expense:category:change',
  
  // 地图相关事件
  MAP_LOAD: 'map:load',
  MAP_CENTER_CHANGE: 'map:center:change',
  MAP_ZOOM_CHANGE: 'map:zoom:change',
  MAP_MARKER_ADD: 'map:marker:add',
  MAP_MARKER_REMOVE: 'map:marker:remove',
  
  // 搜索相关事件
  SEARCH_START: 'search:start',
  SEARCH_END: 'search:end',
  SEARCH_RESULT_UPDATE: 'search:result:update',
  
  // 过滤器相关事件
  FILTER_APPLY: 'filter:apply',
  FILTER_RESET: 'filter:reset',
  
  // 视图相关事件
  VIEW_CHANGE: 'view:change',
  VIEW_REFRESH: 'view:refresh',
  VIEW_RESIZE: 'view:resize',
  
  // 通知相关事件
  NOTIFICATION_ADD: 'notification:add',
  NOTIFICATION_REMOVE: 'notification:remove',
  NOTIFICATION_CLEAR: 'notification:clear',
  
  // 权限相关事件
  PERMISSION_GRANTED: 'permission:granted',
  PERMISSION_DENIED: 'permission:denied',
  
  // 设置相关事件
  SETTINGS_UPDATE: 'settings:update',
  
  // 网络相关事件
  NETWORK_ONLINE: 'network:online',
  NETWORK_OFFLINE: 'network:offline',
  
  // 语言相关事件
  LANGUAGE_CHANGE: 'language:change',
  
  // 主题相关事件
  THEME_CHANGE: 'theme:change',
  
  // 加载状态事件
  LOADING_START: 'loading:start',
  LOADING_END: 'loading:end',
  
  // 数据同步事件
  DATA_SYNC_START: 'data:sync:start',
  DATA_SYNC_END: 'data:sync:end',
  DATA_SYNC_ERROR: 'data:sync:error',
  
  // 协作相关事件
  COLLABORATOR_ADD: 'collaborator:add',
  COLLABORATOR_REMOVE: 'collaborator:remove',
  COLLABORATION_UPDATE: 'collaboration:update'
}

/**
 * 为Vue实例提供插件安装方法
 * @param {Object} Vue - Vue构造函数
 */
EventBus.install = function(Vue) {
  // 添加全局属性
  Vue.prototype.$eventBus = eventBus
  
  // 添加全局方法
  Vue.eventBus = eventBus
  
  // 添加事件名称常量
  Vue.EVENT_NAMES = EVENT_NAMES
}

export { EventBus }
export default eventBus