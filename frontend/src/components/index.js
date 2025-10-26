// 组件索引文件 - 统一导出所有组件

// 基础组件
export { default as Button } from './Button.vue'
export { default as FormInput } from './FormInput.vue'
export { default as Card } from './Card.vue'
export { default as ProgressBar } from './ProgressBar.vue'
export { default as ChartComponent } from './ChartComponent.vue'
export { default as ConfirmDialog } from './ConfirmDialog.vue'
export { default as Notification } from './Notification.vue'
export { default as NotificationManager } from './NotificationManager.js'
export { default as VoiceInput } from './VoiceInput.vue'
export { default as ConversationItem } from './ConversationItem.vue'
export { default as QuickActionButton } from './QuickActionButton.vue'

// 组件安装函数
export const install = (Vue) => {
  // 注册所有组件
  const components = {
    Button,
    FormInput,
    Card,
    ProgressBar,
    ChartComponent,
    ConfirmDialog,
    Notification,
    VoiceInput,
    ConversationItem,
    QuickActionButton
  }
  
  // 遍历注册组件
  Object.keys(components).forEach(key => {
    Vue.component(key, components[key])
  })
  
  // 注册通知管理器为全局属性
  Vue.prototype.$notification = NotificationManager
}

// 默认导出安装函数
export default { install }

// 导出组件列表
export const components = {
  Button,
  FormInput,
  Card,
  ProgressBar,
  ChartComponent,
  ConfirmDialog,
  Notification,
  VoiceInput,
  ConversationItem,
  QuickActionButton
}