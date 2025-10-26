<template>
  <transition name="message-fade">
    <div 
      v-if="visible"
      class="message-container"
      :class="[
        type,
        position,
        { 'show-icon': showIcon },
        { 'custom-width': customWidth },
        { 'closable': showCloseButton },
        { 'multiple-line': multipleLine }
      ]"
      :style="containerStyle"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <!-- 图标 -->
      <div v-if="showIcon" class="message-icon">
        {{ getIcon() }}
      </div>

      <!-- 内容区域 -->
      <div class="message-content">
        <!-- 消息文本 -->
        <div v-if="message" class="message-text" :class="{ 'with-description': !!description }">
          {{ message }}
        </div>
        
        <!-- 描述文本 -->
        <div v-if="description" class="message-description">
          {{ description }}
        </div>
        
        <!-- 自定义内容 -->
        <div v-if="$slots.default" class="message-custom-content">
          <slot></slot>
        </div>
      </div>

      <!-- 关闭按钮 -->
      <button 
        v-if="showCloseButton" 
        class="message-close-button"
        @click="close"
        :title="closeText"
      >
        <span class="close-icon"></span>
      </button>

      <!-- 倒计时进度条 -->
      <div v-if="showProgress" class="message-progress-bar">
        <div 
          class="message-progress-inner" 
          :style="{
            width: `${progressWidth}%`,
            backgroundColor: getProgressColor()
          }"
        ></div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Message',
  
  props: {
    // 消息可见性
    visible: {
      type: Boolean,
      default: false
    },
    // 消息类型
    type: {
      type: String,
      default: 'info',
      validator: value => ['info', 'success', 'warning', 'error', 'loading'].includes(value)
    },
    // 消息内容
    message: {
      type: String,
      default: ''
    },
    // 描述文本 (用于详细信息)
    description: {
      type: String,
      default: ''
    },
    // 显示图标
    showIcon: {
      type: Boolean,
      default: true
    },
    // 显示关闭按钮
    showCloseButton: {
      type: Boolean,
      default: true
    },
    // 关闭按钮文本
    closeText: {
      type: String,
      default: '关闭'
    },
    // 自动关闭时间(毫秒)
    duration: {
      type: Number,
      default: 3000
    },
    // 位置
    position: {
      type: String,
      default: 'top-right',
      validator: value => ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'].includes(value)
    },
    // 自定义宽度
    customWidth: {
      type: [String, Number],
      default: ''
    },
    // 是否多行显示
    multipleLine: {
      type: Boolean,
      default: false
    },
    // 是否显示进度条
    showProgress: {
      type: Boolean,
      default: false
    },
    // 背景色
    backgroundColor: {
      type: String,
      default: ''
    },
    // 文本颜色
    textColor: {
      type: String,
      default: ''
    },
    // 点击消息是否关闭
    closeOnClick: {
      type: Boolean,
      default: false
    },
    // 鼠标悬停是否暂停自动关闭
    pauseOnHover: {
      type: Boolean,
      default: true
    },
    // z-index值
    zIndex: {
      type: Number,
      default: 1010
    },
    // 偏移量
    offset: {
      type: Number,
      default: 24
    }
  },
  
  data() {
    return {
      timer: null,
      startTime: null,
      remainingTime: this.duration,
      isPaused: false,
      progressWidth: 100
    }
  },
  
  computed: {
    // 容器样式
    containerStyle() {
      const style = {}
      
      // 自定义宽度
      if (this.customWidth) {
        style.width = typeof this.customWidth === 'number' ? `${this.customWidth}px` : this.customWidth
      }
      
      // 背景色
      if (this.backgroundColor) {
        style.backgroundColor = this.backgroundColor
      }
      
      // 文本颜色
      if (this.textColor) {
        style.color = this.textColor
      }
      
      // z-index
      style.zIndex = this.zIndex
      
      // 位置偏移
      if (this.position.includes('top')) {
        style.marginTop = `${this.offset}px`
      } else if (this.position.includes('bottom')) {
        style.marginBottom = `${this.offset}px`
      }
      
      return style
    }
  },
  
  watch: {
    // 监听visible变化
    visible(newVal) {
      if (newVal) {
        this.startTimer()
      } else {
        this.clearTimer()
      }
    },
    
    // 监听duration变化
    duration(newVal) {
      this.remainingTime = newVal
      if (this.visible) {
        this.restartTimer()
      }
    },
    
    // 监听进度条宽度变化
    progressWidth(newVal) {
      if (newVal <= 0) {
        this.close()
      }
    }
  },
  
  mounted() {
    // 初始化事件监听
    this.initEvents()
    
    // 如果初始可见，则开始计时
    if (this.visible) {
      this.startTimer()
    }
  },
  
  beforeDestroy() {
    this.clearTimer()
    this.removeEvents()
  },
  
  methods: {
    // 开始计时
    startTimer() {
      this.clearTimer()
      this.startTime = Date.now()
      
      if (this.duration > 0) {
        this.timer = setInterval(() => {
          if (this.isPaused) return
          
          if (this.showProgress) {
            const elapsed = Date.now() - this.startTime
            this.progressWidth = Math.max(0, 100 - (elapsed / this.duration) * 100)
          }
          
          this.remainingTime = this.duration - (Date.now() - this.startTime)
          
          if (this.remainingTime <= 0) {
            this.close()
          }
        }, 16) // 约60fps更新频率
      }
    },
    
    // 暂停计时
    pauseTimer() {
      if (this.pauseOnHover) {
        this.isPaused = true
      }
    },
    
    // 恢复计时
    resumeTimer() {
      if (this.isPaused) {
        this.isPaused = false
        this.startTime = Date.now() - (this.duration - this.remainingTime)
      }
    },
    
    // 重启计时器
    restartTimer() {
      this.clearTimer()
      this.startTimer()
    },
    
    // 清除计时器
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    
    // 关闭消息
    close() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    
    // 鼠标进入
    handleMouseEnter() {
      this.pauseTimer()
      this.$emit('mouseenter')
    },
    
    // 鼠标离开
    handleMouseLeave() {
      this.resumeTimer()
      this.$emit('mouseleave')
    },
    
    // 处理点击事件
    handleClick() {
      if (this.closeOnClick) {
        this.close()
      }
      this.$emit('click')
    },
    
    // 获取图标
    getIcon() {
      const iconMap = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        loading: '⏳'
      }
      return iconMap[this.type] || 'ℹ️'
    },
    
    // 获取进度条颜色
    getProgressColor() {
      const colorMap = {
        info: '#1890ff',
        success: '#52c41a',
        warning: '#fa8c16',
        error: '#f5222d',
        loading: '#1890ff'
      }
      return colorMap[this.type] || '#1890ff'
    },
    
    // 初始化事件
    initEvents() {
      // 可以添加一些全局事件监听
    },
    
    // 移除事件
    removeEvents() {
      // 清理事件监听
    }
  }
}
</script>

<style scoped>
.message-container {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: fixed;
  max-width: 380px;
  min-width: 300px;
  word-wrap: break-word;
  transition: all 0.3s;
  background-color: #fff;
  border: 1px solid #f0f0f0;
}

/* 类型样式 */
.message-container.info {
  border-left: 4px solid #1890ff;
}

.message-container.success {
  border-left: 4px solid #52c41a;
}

.message-container.warning {
  border-left: 4px solid #fa8c16;
}

.message-container.error {
  border-left: 4px solid #f5222d;
}

.message-container.loading {
  border-left: 4px solid #1890ff;
}

/* 位置样式 */
.message-container.top-right {
  top: 0;
  right: 0;
  transform: translateX(100%);
}

.message-container.top-left {
  top: 0;
  left: 0;
  transform: translateX(-100%);
}

.message-container.bottom-right {
  bottom: 0;
  right: 0;
  transform: translateX(100%);
}

.message-container.bottom-left {
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
}

.message-container.top-center {
  top: 0;
  left: 50%;
  transform: translateX(-50%) translateY(-100%);
}

.message-container.bottom-center {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
}

/* 进入动画后重置位置 */
.message-container.message-fade-enter-active {
  transform: translate(0);
}

/* 显示图标时的内容区域调整 */
.message-container.show-icon .message-content {
  margin-left: 8px;
}

/* 多行显示 */
.message-container.multiple-line {
  max-width: 500px;
}

/* 自定义宽度 */
.message-container.custom-width {
  width: auto;
  min-width: auto;
}

/* 图标样式 */
.message-icon {
  font-size: 18px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  margin-top: 1px;
}

/* 内容区域 */
.message-content {
  flex: 1;
  min-width: 0;
  margin-right: 8px;
}

.message-text {
  margin: 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  word-break: break-word;
}

.message-text.with-description {
  margin-bottom: 4px;
  font-weight: 500;
}

.message-description {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
  margin: 4px 0 0 0;
  word-break: break-word;
}

.message-custom-content {
  margin-top: 4px;
}

/* 关闭按钮 */
.message-close-button {
  background: transparent;
  border: none;
  padding: 0;
  margin: -4px -4px 0 4px;
  cursor: pointer;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: all 0.3s;
  flex-shrink: 0;
}

.message-close-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.65);
}

/* 进度条 */
.message-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 0 0 6px 6px;
  overflow: hidden;
}

.message-progress-inner {
  height: 100%;
  transition: width 0.1s linear;
}

/* 过渡动画 */
.message-fade-enter-active,
.message-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.message-fade-enter,
.message-fade-leave-to {
  opacity: 0;
}

/* 关闭图标 */
.close-icon::before {
  content: '✕';
}

/* 响应式样式 */
@media (max-width: 768px) {
  .message-container {
    max-width: 90%;
    min-width: auto;
    width: auto;
  }
  
  .message-container.top-right,
  .message-container.top-left,
  .message-container.bottom-right,
  .message-container.bottom-left,
  .message-container.top-center,
  .message-container.bottom-center {
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>