/**
 * 通知管理器
 * 用于集中管理应用中的通知显示
 */
import Vue from 'vue'
import Notification from './Notification.vue'

// 通知组件实例池
const instances = new Map()
// 通知计数器，用于生成唯一ID
let notificationCounter = 0

// 创建通知实例
const createNotification = (options) => {
  // 生成唯一ID
  const id = `notification_${++notificationCounter}`
  
  // 合并默认选项和用户选项
  const mergedOptions = {
    id,
    type: 'info',
    title: '',
    message: '',
    placement: 'top-right',
    duration: 3000,
    closable: true,
    showIcon: true,
    showProgress: false,
    ...options
  }
  
  // 创建Vue组件构造器
  const NotificationConstructor = Vue.extend(Notification)
  
  // 创建组件实例
  const instance = new NotificationConstructor({
    propsData: mergedOptions
  })
  
  // 设置关闭回调
  instance.$on('close', () => {
    removeNotification(id)
    // 触发用户自定义关闭回调
    if (typeof mergedOptions.onClose === 'function') {
      mergedOptions.onClose(instance)
    }
  })
  
  // 挂载到DOM
  instance.$mount()
  document.body.appendChild(instance.$el)
  
  // 存储实例
  instances.set(id, instance)
  
  // 处理相同位置的通知堆叠
  adjustPosition(instance, mergedOptions.placement)
  
  return instance
}

// 调整通知位置（处理堆叠）
const adjustPosition = (instance, placement) => {
  // 获取相同位置的所有通知
  const samePositionInstances = Array.from(instances.values())
    .filter(item => item.$props.placement === placement)
    .sort((a, b) => {
      // 按照创建顺序排序
      const idA = parseInt(a.$props.id.split('_')[1])
      const idB = parseInt(b.$props.id.split('_')[1])
      return idA - idB
    })
  
  // 为每个通知设置正确的位置
  let verticalOffset = 24 // 初始偏移量
  
  samePositionInstances.forEach(item => {
    const { $el } = item
    const height = $el.offsetHeight + 16 // 通知高度 + 间距
    
    // 设置样式
    const style = $el.style
    
    // 根据位置设置样式
    switch (placement) {
      case 'top-right':
      case 'top-left':
        style.top = `${verticalOffset}px`
        break
      case 'bottom-right':
      case 'bottom-left':
        // 从底部开始计算偏移
        const bottomOffset = window.innerHeight - (verticalOffset + height)
        style.bottom = `${bottomOffset}px`
        break
    }
    
    // 更新垂直偏移量
    verticalOffset += height
  })
}

// 移除通知
const removeNotification = (id) => {
  const instance = instances.get(id)
  
  if (!instance) return
  
  // 移除DOM元素
  if (instance.$el && instance.$el.parentNode) {
    instance.$el.parentNode.removeChild(instance.$el)
  }
  
  // 销毁实例
  instance.$destroy()
  
  // 从实例池移除
  instances.delete(id)
  
  // 重新调整同位置的其他通知
  const placement = instance.$props.placement
  adjustPosition(null, placement)
}

// 通知管理器
const NotificationManager = {
  // 成功通知
  success(options) {
    return this.open({
      ...options,
      type: 'success'
    })
  },
  
  // 警告通知
  warning(options) {
    return this.open({
      ...options,
      type: 'warning'
    })
  },
  
  // 错误通知
  error(options) {
    return this.open({
      ...options,
      type: 'error'
    })
  },
  
  // 信息通知
  info(options) {
    return this.open({
      ...options,
      type: 'info'
    })
  },
  
  // 打开通知（通用方法）
  open(options) {
    // 如果传入的是字符串，则作为消息内容处理
    if (typeof options === 'string') {
      options = {
        message: options
      }
    }
    
    // 验证必要参数
    if (!options.message && !options.title) {
      console.warn('通知必须设置message或title')
      return null
    }
    
    // 创建通知实例
    return createNotification(options)
  },
  
  // 关闭指定通知
  close(id) {
    removeNotification(id)
  },
  
  // 关闭所有通知
  closeAll() {
    const ids = Array.from(instances.keys())
    ids.forEach(id => {
      removeNotification(id)
    })
  },
  
  // 获取所有通知实例
  getAll() {
    return Array.from(instances.values())
  },
  
  // 获取指定类型的通知数量
  getCount(type = null) {
    if (type) {
      return Array.from(instances.values()).filter(
        instance => instance.$props.type === type
      ).length
    }
    
    return instances.size
  },
  
  // 获取指定位置的通知数量
  getCountByPlacement(placement) {
    return Array.from(instances.values()).filter(
      instance => instance.$props.placement === placement
    ).length
  }
}

// 插件安装方法
NotificationManager.install = (Vue) => {
  // 添加全局属性
  Vue.prototype.$notification = NotificationManager
  
  // 添加全局方法
  Vue.notification = NotificationManager
}

// 如果在Vue环境中，自动注册插件
if (typeof window !== 'undefined' && window.Vue) {
  Vue.use(NotificationManager)
}

export default NotificationManager