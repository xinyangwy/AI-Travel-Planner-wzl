<template>
  <button
    class="quick-action-button"
    :class="{
      'primary': type === 'primary',
      'secondary': type === 'secondary',
      'outline': type === 'outline',
      'text': type === 'text',
      'success': type === 'success',
      'warning': type === 'warning',
      'error': type === 'error',
      'info': type === 'info',
      'disabled': disabled || loading,
      'loading': loading
    }"
    @click="handleClick"
    :disabled="disabled || loading"
    :title="tooltip"
  >
    <!-- 图标 -->
    <i 
      v-if="icon && !loading" 
      class="action-icon"
      :class="icon"
    ></i>
    
    <!-- 加载图标 -->
    <i v-else-if="loading" class="loading-icon"></i>
    
    <!-- 文本 -->
    <span v-if="text" class="action-text">{{ text }}</span>
  </button>
</template>

<script>
export default {
  name: 'QuickActionButton',
  
  props: {
    // 按钮类型
    type: {
      type: String,
      default: 'primary',
      validator: (value) => [
        'primary', 'secondary', 'outline', 'text',
        'success', 'warning', 'error', 'info'
      ].includes(value)
    },
    
    // 按钮文本
    text: {
      type: String,
      default: ''
    },
    
    // 按钮图标
    icon: {
      type: String,
      default: ''
    },
    
    // 按钮提示文本
    tooltip: {
      type: String,
      default: ''
    },
    
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    
    // 是否显示加载状态
    loading: {
      type: Boolean,
      default: false
    },
    
    // 按钮大小
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    
    // 是否显示为圆角按钮
    rounded: {
      type: Boolean,
      default: true
    },
    
    // 自动聚焦
    autofocus: {
      type: Boolean,
      default: false
    },
    
    // 唯一标识符（用于测试）
    testId: {
      type: String,
      default: ''
    }
  },
  
  computed: {
    // 根据类型计算按钮样式类名
    buttonClass() {
      return {
        [`quick-action-${this.type}`]: true,
        [`quick-action-${this.size}`]: true,
        'quick-action-rounded': this.rounded
      }
    }
  },
  
  mounted() {
    // 如果设置了自动聚焦，则聚焦按钮
    if (this.autofocus) {
      this.$el.focus()
    }
  },
  
  methods: {
    // 处理点击事件
    handleClick(event) {
      if (!this.disabled && !this.loading) {
        // 触发点击事件
        this.$emit('click', event)
        
        // 触发自定义事件，传递按钮信息
        this.$emit('action', {
          type: this.type,
          text: this.text,
          event
        })
      }
    },
    
    // 手动聚焦
    focus() {
      this.$el.focus()
    },
    
    // 手动失焦
    blur() {
      this.$el.blur()
    }
  }
}
</script>

<style scoped>
.quick-action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  outline: none;
  position: relative;
  white-space: nowrap;
  user-select: none;
}

/* 按钮大小 */
.quick-action-button.small {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 16px;
}

.quick-action-button.medium {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 20px;
}

.quick-action-button.large {
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 24px;
}

/* 主要按钮样式 */
.quick-action-button.primary {
  background-color: #1890ff;
  color: white;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.quick-action-button.primary:hover:not(:disabled) {
  background-color: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.quick-action-button.primary:active {
  transform: translateY(0);
}

/* 次要按钮样式 */
.quick-action-button.secondary {
  background-color: #f0f0f0;
  color: #333;
}

.quick-action-button.secondary:hover:not(:disabled) {
  background-color: #e0e0e0;
}

/* 轮廓按钮样式 */
.quick-action-button.outline {
  background-color: transparent;
  border: 1px solid #d9d9d9;
  color: #333;
}

.quick-action-button.outline:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

/* 文本按钮样式 */
.quick-action-button.text {
  background-color: transparent;
  color: #1890ff;
}

.quick-action-button.text:hover:not(:disabled) {
  background-color: rgba(24, 144, 255, 0.1);
}

/* 成功按钮样式 */
.quick-action-button.success {
  background-color: #52c41a;
  color: white;
}

.quick-action-button.success:hover:not(:disabled) {
  background-color: #73d13d;
}

/* 警告按钮样式 */
.quick-action-button.warning {
  background-color: #fa8c16;
  color: white;
}

.quick-action-button.warning:hover:not(:disabled) {
  background-color: #ffa940;
}

/* 错误按钮样式 */
.quick-action-button.error {
  background-color: #f5222d;
  color: white;
}

.quick-action-button.error:hover:not(:disabled) {
  background-color: #ff4d4f;
}

/* 信息按钮样式 */
.quick-action-button.info {
  background-color: #13c2c2;
  color: white;
}

.quick-action-button.info:hover:not(:disabled) {
  background-color: #36cfc9;
}

/* 禁用状态 */
.quick-action-button.disabled,
.quick-action-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
}

/* 加载状态 */
.quick-action-button.loading {
  cursor: wait;
}

/* 图标样式 */
.action-icon {
  display: inline-block;
  margin-right: 6px;
  font-size: 16px;
}

.small .action-icon {
  font-size: 14px;
  margin-right: 4px;
}

.large .action-icon {
  font-size: 18px;
  margin-right: 8px;
}

/* 加载图标 */
.loading-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 6px;
}

/* 为非白色背景的按钮调整加载图标颜色 */
.outline .loading-icon,
.secondary .loading-icon,
.text .loading-icon {
  border-color: rgba(0, 0, 0, 0.3);
  border-top-color: #333;
}

.small .loading-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.large .loading-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

/* 文本样式 */
.action-text {
  display: inline-block;
}

/* 动画效果 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 按钮点击效果 */
.quick-action-button:active:not(:disabled) {
  transform: scale(0.98);
  transition-duration: 0.1s;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .quick-action-button.medium {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .quick-action-button.large {
    padding: 8px 16px;
    font-size: 14px;
  }
}

/* 焦点样式 */
.quick-action-button:focus-visible {
  outline: 2px solid #1890ff;
  outline-offset: 2px;
}
</style>