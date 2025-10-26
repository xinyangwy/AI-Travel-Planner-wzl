<template>
  <div
    v-show="visible"
    class="notification"
    :class="{
      'notification-top-left': placement === 'top-left',
      'notification-top-right': placement === 'top-right',
      'notification-bottom-left': placement === 'bottom-left',
      'notification-bottom-right': placement === 'bottom-right',
      'notification-top-center': placement === 'top-center',
      'notification-bottom-center': placement === 'bottom-center',
      [`notification-${type}`]: true,
      'notification-closable': closable,
      'notification-with-icon': showIcon
    }"
    :style="customStyle"
  >
    <!-- 图标 -->
    <i v-if="showIcon" class="notification-icon" :class="iconClass"></i>
    
    <!-- 内容区域 -->
    <div class="notification-content">
      <!-- 标题 -->
      <div v-if="title" class="notification-title">{{ title }}</div>
      
      <!-- 消息内容 -->
      <div class="notification-message" v-html="message"></div>
      
      <!-- 进度条（用于显示自动关闭倒计时） -->
      <div v-if="showProgress" class="notification-progress-wrapper">
        <div 
          class="notification-progress-bar"
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>
    </div>
    
    <!-- 关闭按钮 -->
    <button
      v-if="closable"
      class="notification-close"
      @click="close"
      type="button"
      aria-label="关闭"
    >
      <i class="notification-close-icon"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'Notification',
  
  props: {
    // 通知类型
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'warning', 'error', 'info'].includes(value)
    },
    
    // 通知标题
    title: {
      type: String,
      default: ''
    },
    
    // 通知内容
    message: {
      type: String,
      required: true
    },
    
    // 显示位置
    placement: {
      type: String,
      default: 'top-right',
      validator: (value) => [
        'top-right', 'top-left', 'bottom-right', 'bottom-left',
        'top-center', 'bottom-center'
      ].includes(value)
    },
    
    // 自动关闭时间（毫秒），0表示不自动关闭
    duration: {
      type: Number,
      default: 3000
    },
    
    // 是否可关闭
    closable: {
      type: Boolean,
      default: true
    },
    
    // 是否显示图标
    showIcon: {
      type: Boolean,
      default: true
    },
    
    // 是否显示进度条
    showProgress: {
      type: Boolean,
      default: false
    },
    
    // 自定义样式
    customStyle: {
      type: Object,
      default: () => ({})
    },
    
    // 唯一ID
    id: {
      type: String,
      default: () => `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    },
    
    // 是否显示
    visible: {
      type: Boolean,
      default: true
    },
    
    // 是否显示动画
    animation: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      // 定时器
      timer: null,
      // 进度条百分比
      progressPercent: 100,
      // 进度条定时器
      progressTimer: null,
      // 开始时间
      startTime: 0
    }
  },
  
  computed: {
    // 根据类型获取图标类名
    iconClass() {
      const iconMap = {
        success: 'icon-success',
        warning: 'icon-warning',
        error: 'icon-error',
        info: 'icon-info'
      }
      return iconMap[this.type] || 'icon-info'
    }
  },
  
  mounted() {
    // 设置自动关闭
    this.startAutoClose()
    
    // 设置进度条
    if (this.showProgress && this.duration > 0) {
      this.startProgress()
    }
    
    // 添加点击外部关闭（可选）
    document.addEventListener('click', this.handleDocumentClick)
  },
  
  beforeUnmount() {
    // 清理定时器
    this.clearTimer()
    this.clearProgressTimer()
    
    // 移除事件监听
    document.removeEventListener('click', this.handleDocumentClick)
  },
  
  methods: {
    // 开始自动关闭计时器
    startAutoClose() {
      if (this.duration > 0) {
        this.startTime = Date.now()
        this.timer = setTimeout(() => {
          this.close()
        }, this.duration)
      }
    },
    
    // 开始进度条动画
    startProgress() {
      if (this.duration <= 0) return
      
      // 每10ms更新一次进度
      this.progressTimer = setInterval(() => {
        const elapsed = Date.now() - this.startTime
        const percent = Math.max(0, 100 - (elapsed / this.duration) * 100)
        this.progressPercent = percent
        
        // 进度完成时清除定时器
        if (percent <= 0) {
          this.clearProgressTimer()
        }
      }, 10)
    },
    
    // 清除定时器
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
    
    // 清除进度条定时器
    clearProgressTimer() {
      if (this.progressTimer) {
        clearInterval(this.progressTimer)
        this.progressTimer = null
      }
    },
    
    // 关闭通知
    close() {
      // 清除定时器
      this.clearTimer()
      this.clearProgressTimer()
      
      // 触发关闭事件
      this.$emit('close', { id: this.id, type: this.type })
    },
    
    // 处理文档点击事件（可选）
    handleDocumentClick(event) {
      // 可以添加点击外部关闭的逻辑
    },
    
    // 手动显示通知
    show() {
      this.$emit('update:visible', true)
      this.startAutoClose()
      if (this.showProgress) {
        this.startProgress()
      }
    },
    
    // 手动隐藏通知
    hide() {
      this.$emit('update:visible', false)
      this.close()
    },
    
    // 重置定时器
    resetTimer() {
      this.clearTimer()
      this.startAutoClose()
      
      if (this.showProgress) {
        this.clearProgressTimer()
        this.progressPercent = 100
        this.startProgress()
      }
    }
  }
}
</script>

<style scoped>
.notification {
  position: fixed;
  z-index: 2000;
  width: 320px;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: flex-start;
  transition: all 0.3s ease;
  pointer-events: auto;
}

/* 位置样式 */
.notification-top-right {
  top: 24px;
  right: 24px;
  transform: translateX(100%);
}

.notification-top-left {
  top: 24px;
  left: 24px;
  transform: translateX(-100%);
}

.notification-bottom-right {
  bottom: 24px;
  right: 24px;
  transform: translateX(100%);
}

.notification-bottom-left {
  bottom: 24px;
  left: 24px;
  transform: translateX(-100%);
}

.notification-top-center {
  top: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(-100%);
}

.notification-bottom-center {
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
}

/* 显示状态 */
.notification[style*="visible: true"] {
  transform: translateX(0) translateY(0);
}

/* 通知类型样式 */
.notification-success {
  border-left: 4px solid #52c41a;
}

.notification-warning {
  border-left: 4px solid #fa8c16;
}

.notification-error {
  border-left: 4px solid #f5222d;
}

.notification-info {
  border-left: 4px solid #1890ff;
}

/* 图标样式 */
.notification-icon {
  font-size: 18px;
  margin-right: 12px;
  flex-shrink: 0;
  margin-top: 2px;
}

.icon-success {
  color: #52c41a;
}

.icon-warning {
  color: #fa8c16;
}

.icon-error {
  color: #f5222d;
}

.icon-info {
  color: #1890ff;
}

/* 内容区域 */
.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  word-wrap: break-word;
}

/* 可关闭样式 */
.notification-closable .notification-content {
  margin-right: 20px;
}

/* 关闭按钮 */
.notification-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #ccc;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  line-height: 1;
}

.notification-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #666;
}

.notification-close-icon::before {
  content: '×';
}

/* 进度条 */
.notification-progress-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 0 0 0 8px;
  overflow: hidden;
}

.notification-progress-bar {
  height: 100%;
  background-color: currentColor;
  border-radius: 0 0 0 8px;
  transition: width 0.1s linear;
}

.notification-success .notification-progress-bar {
  background-color: #52c41a;
}

.notification-warning .notification-progress-bar {
  background-color: #fa8c16;
}

.notification-error .notification-progress-bar {
  background-color: #f5222d;
}

.notification-info .notification-progress-bar {
  background-color: #1890ff;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .notification {
    width: 90%;
    max-width: 320px;
  }
  
  .notification-top-right,
  .notification-top-left {
    top: 16px;
  }
  
  .notification-bottom-right,
  .notification-bottom-left {
    bottom: 16px;
  }
  
  .notification-top-center,
  .notification-bottom-center {
    width: 90%;
    left: 5%;
    transform: none;
  }
}

/* 鼠标悬停效果 */
.notification:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* 过渡动画 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* 为不同位置定义不同的入场动画 */
.notification-top-right,
.notification-bottom-right {
  animation: slideIn 0.3s ease forwards;
}

.notification-top-left,
.notification-bottom-left {
  animation: slideIn 0.3s ease forwards;
}

.notification-top-left,
.notification-bottom-left {
  animation-name: slideInLeft;
}

.notification-top-center {
  animation-name: slideInTop;
}

.notification-bottom-center {
  animation-name: slideInBottom;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInTop {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes slideInBottom {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>