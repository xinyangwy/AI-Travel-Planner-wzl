<template>
  <transition-group name="notification" tag="div" class="notification-container" :class="positionClass">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="notification-item"
      :class="[
        `notification-${notification.type}`,
        { 'notification-closable': notification.closable },
        { 'notification-with-icon': notification.showIcon },
        { 'notification-custom-width': notification.customWidth },
        { 'notification-dark': darkTheme }
      ]"
      :style="{
        width: notification.width || 'auto',
        zIndex: notification.zIndex || 1010
      }"
      @mouseenter="clearAutoCloseTimer(notification.id)"
      @mouseleave="startAutoCloseTimer(notification.id)"
    >
      <!-- 关闭按钮 -->
      <button
        v-if="notification.closable"
        class="notification-close-btn"
        @click="close(notification.id)"
        type="button"
        aria-label="关闭"
      >
        <i class="fas fa-times"></i>
      </button>

      <div class="notification-content">
        <!-- 通知图标 -->
        <div v-if="notification.showIcon" class="notification-icon">
          <i v-if="notification.icon" :class="notification.icon"></i>
          <i v-else-if="notification.type === 'success'" class="fas fa-check-circle"></i>
          <i v-else-if="notification.type === 'error'" class="fas fa-exclamation-circle"></i>
          <i v-else-if="notification.type === 'warning'" class="fas fa-exclamation-triangle"></i>
          <i v-else-if="notification.type === 'info'" class="fas fa-info-circle"></i>
          <i v-else-if="notification.type === 'question'" class="fas fa-question-circle"></i>
          <i v-else class="fas fa-bell"></i>
        </div>

        <!-- 通知文本内容 -->
        <div class="notification-message">
          <div v-if="notification.title" class="notification-title">
            {{ notification.title }}
          </div>
          <div class="notification-description" v-html="notification.message"></div>

          <!-- 操作按钮 -->
          <div v-if="notification.actions && notification.actions.length > 0" class="notification-actions">
            <button
              v-for="(action, index) in notification.actions"
              :key="index"
              class="notification-action-btn"
              :class="{
                'notification-action-primary': action.primary,
                'notification-action-danger': action.danger
              }"
              @click="handleAction(notification.id, action)"
            >
              {{ action.text }}
            </button>
          </div>
        </div>
      </div>

      <!-- 进度条 -->
      <div
        v-if="notification.showProgress"
        class="notification-progress-bar"
        :style="{ width: `${notification.progress}%` }"
      ></div>
    </div>
  </transition-group>
</template>

<script>
export default {
  name: 'Notification',
  
  props: {
    // 通知集合
    notifications: {
      type: Array,
      default: () => []
    },
    
    // 位置：top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
    position: {
      type: String,
      default: 'top-right',
      validator: (value) => [
        'top-right', 
        'top-left', 
        'bottom-right', 
        'bottom-left',
        'top-center',
        'bottom-center'
      ].includes(value)
    },
    
    // 是否为暗色主题
    darkTheme: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      // 存储自动关闭定时器
      timers: {}
    }
  },
  
  computed: {
    // 位置样式类
    positionClass() {
      return `notification-${this.position}`
    }
  },
  
  watch: {
    // 监听通知集合变化，处理新添加的通知
    notifications: {
      handler(newNotifications) {
        newNotifications.forEach(notification => {
          if (notification.autoClose !== false && !this.timers[notification.id]) {
            this.startAutoCloseTimer(notification.id, notification.duration || 4500)
          }
        })
      },
      deep: true
    }
  },
  
  beforeDestroy() {
    // 清理所有定时器
    Object.values(this.timers).forEach(timer => {
      if (timer) clearTimeout(timer)
    })
  },
  
  methods: {
    /**
     * 关闭通知
     */
    close(id) {
      this.clearAutoCloseTimer(id)
      this.$emit('close', id)
    },
    
    /**
     * 处理操作按钮点击
     */
    handleAction(notificationId, action) {
      if (typeof action.handler === 'function') {
        action.handler()
      }
      if (action.close !== false) {
        this.close(notificationId)
      }
    },
    
    /**
     * 开始自动关闭定时器
     */
    startAutoCloseTimer(id, duration = 4500) {
      // 清除已存在的定时器
      this.clearAutoCloseTimer(id)
      
      // 设置新的定时器
      this.timers[id] = setTimeout(() => {
        this.close(id)
      }, duration)
    },
    
    /**
     * 清除自动关闭定时器
     */
    clearAutoCloseTimer(id) {
      if (this.timers[id]) {
        clearTimeout(this.timers[id])
        delete this.timers[id]
      }
    }
  }
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 384px;
  z-index: 1010;
}

/* 位置样式 */
.notification-top-right {
  top: 20px;
  right: 20px;
}

.notification-top-left {
  top: 20px;
  left: 20px;
}

.notification-bottom-right {
  bottom: 20px;
  right: 20px;
}

.notification-bottom-left {
  bottom: 20px;
  left: 20px;
}

.notification-top-center {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.notification-bottom-center {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.notification-item {
  position: relative;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 12px 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.notification-dark .notification-item {
  background-color: #262626;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.notification-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.16);
}

.notification-dark .notification-item:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.notification-closable {
  padding-right: 40px;
}

.notification-with-icon {
  padding-left: 44px;
}

.notification-custom-width {
  width: auto !important;
}

/* 通知类型样式 */
.notification-success {
  border-left-color: #52c41a;
}

.notification-error {
  border-left-color: #ff4d4f;
}

.notification-warning {
  border-left-color: #faad14;
}

.notification-info {
  border-left-color: #1890ff;
}

.notification-question {
  border-left-color: #722ed1;
}

/* 关闭按钮 */
.notification-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 14px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 2px;
  transition: all 0.2s;
  opacity: 0;
}

.notification-item:hover .notification-close-btn {
  opacity: 1;
}

.notification-close-btn:hover {
  color: #333;
  background-color: #f5f5f5;
}

.notification-dark .notification-close-btn:hover {
  color: #fff;
  background-color: #434343;
}

/* 通知内容 */
.notification-content {
  display: flex;
}

.notification-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
}

.notification-success .notification-icon {
  color: #52c41a;
}

.notification-error .notification-icon {
  color: #ff4d4f;
}

.notification-warning .notification-icon {
  color: #faad14;
}

.notification-info .notification-icon {
  color: #1890ff;
}

.notification-question .notification-icon {
  color: #722ed1;
}

.notification-message {
  flex: 1;
}

.notification-title {
  font-weight: 500;
  font-size: 15px;
  margin-bottom: 4px;
  color: #333;
}

.notification-dark .notification-title {
  color: #fff;
}

.notification-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
}

.notification-dark .notification-description {
  color: #ccc;
}

/* 操作按钮 */
.notification-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.notification-action-btn {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background-color: #f0f0f0;
  color: #333;
}

.notification-action-btn:hover {
  background-color: #e6f7ff;
  color: #1890ff;
}

.notification-action-primary {
  background-color: #1890ff !important;
  color: white !important;
}

.notification-action-primary:hover {
  background-color: #40a9ff !important;
}

.notification-action-danger {
  background-color: #ff4d4f !important;
  color: white !important;
}

.notification-action-danger:hover {
  background-color: #ff7875 !important;
}

.notification-dark .notification-action-btn {
  background-color: #434343;
  color: #fff;
}

.notification-dark .notification-action-btn:hover {
  background-color: #595959;
}

/* 进度条 */
.notification-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: currentColor;
  transition: width 0.3s linear;
}

.notification-success .notification-progress-bar {
  background-color: #52c41a;
}

.notification-error .notification-progress-bar {
  background-color: #ff4d4f;
}

.notification-warning .notification-progress-bar {
  background-color: #faad14;
}

.notification-info .notification-progress-bar {
  background-color: #1890ff;
}

.notification-question .notification-progress-bar {
  background-color: #722ed1;
}

/* 过渡动画 */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* 不同位置的入场动画 */
.notification-top-left .notification-enter-from,
.notification-bottom-left .notification-enter-from {
  transform: translateX(-100%);
}

.notification-top-left .notification-leave-to,
.notification-bottom-left .notification-leave-to {
  transform: translateX(-100%);
}

.notification-top-center .notification-enter-from,
.notification-bottom-center .notification-enter-from {
  transform: translateX(-50%) translateY(-20px);
}

.notification-top-center .notification-leave-to,
.notification-bottom-center .notification-leave-to {
  transform: translateX(-50%) translateY(-20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-container {
    max-width: calc(100% - 40px);
  }
  
  .notification-top-center,
  .notification-bottom-center {
    transform: translateX(-50%);
    width: calc(100% - 40px);
    max-width: none;
  }
}
</style>