<template>
  <button
    :id="id"
    :type="type"
    :disabled="isDisabled"
    :class="{
      'button': true,
      [`button-${variant}`]: variant !== 'default',
      [`button-${size}`]: size !== 'medium',
      'button-block': block,
      'button-loading': loading,
      'button-disabled': isDisabled,
      'button-active': active,
      'button-icon-only': isIconOnly,
      'button-circle': circle,
      'button-round': round,
      'button-plain': plain,
      'button-text': text,
      'button-link': link,
      'button-dashed': dashed
    }"
    :style="buttonStyle"
    @click="handleClick"
    @mousedown="handleMousedown"
    @mouseup="handleMouseup"
    @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeydown"
    @keyup="handleKeyup"
    :tabindex="isDisabled ? -1 : 0"
    :aria-disabled="isDisabled"
    :aria-busy="loading"
    :aria-label="ariaLabel"
  >
    <!-- 加载图标 -->
    <span v-if="loading" class="button-loading-icon"></span>
    
    <!-- 图标 -->
    <span 
      v-if="icon && !loading" 
      class="button-icon"
      :class="{
        'button-icon-left': $slots.default,
        'button-icon-right': !$slots.default && iconPosition === 'right'
      }"
    >
      <slot name="icon">{{ icon }}</slot>
    </span>
    
    <!-- 按钮内容 -->
    <span v-if="$slots.default" class="button-content">
      <slot></slot>
    </span>
    
    <!-- 右侧图标 -->
    <span 
      v-if="rightIcon && !loading" 
      class="button-icon button-icon-right"
    >
      <slot name="right-icon">{{ rightIcon }}</slot>
    </span>
  </button>
</template>

<script>
export default {
  name: 'Button',
  
  props: {
    // 按钮类型
    type: {
      type: String,
      default: 'button',
      validator: (value) => ['button', 'submit', 'reset'].includes(value)
    },
    
    // 按钮变体样式
    variant: {
      type: String,
      default: 'default',
      validator: (value) => [
        'default', 'primary', 'success', 'warning', 
        'error', 'info', 'secondary', 'light', 'dark'
      ].includes(value)
    },
    
    // 按钮大小
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'mini'].includes(value)
    },
    
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    
    // 是否加载中
    loading: {
      type: Boolean,
      default: false
    },
    
    // 是否激活状态
    active: {
      type: Boolean,
      default: false
    },
    
    // 是否块级按钮
    block: {
      type: Boolean,
      default: false
    },
    
    // 是否圆形按钮
    circle: {
      type: Boolean,
      default: false
    },
    
    // 是否圆角按钮
    round: {
      type: Boolean,
      default: false
    },
    
    // 是否朴素按钮
    plain: {
      type: Boolean,
      default: false
    },
    
    // 是否文本按钮
    text: {
      type: Boolean,
      default: false
    },
    
    // 是否链接按钮
    link: {
      type: Boolean,
      default: false
    },
    
    // 是否虚线按钮
    dashed: {
      type: Boolean,
      default: false
    },
    
    // 图标
    icon: {
      type: String,
      default: ''
    },
    
    // 右侧图标
    rightIcon: {
      type: String,
      default: ''
    },
    
    // 图标位置
    iconPosition: {
      type: String,
      default: 'left',
      validator: (value) => ['left', 'right'].includes(value)
    },
    
    // 自定义样式
    buttonStyle: {
      type: Object,
      default: () => ({})
    },
    
    // 唯一标识
    id: {
      type: String,
      default: () => `button-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    },
    
    // ARIA标签
    ariaLabel: {
      type: String,
      default: ''
    },
    
    // 点击防抖延迟（毫秒）
    debounce: {
      type: Number,
      default: 0
    },
    
    // 键盘快捷键
    shortcut: {
      type: String,
      default: ''
    }
  },
  
  data() {
    return {
      // 防抖定时器
      debounceTimer: null,
      // 是否已按下
      isPressed: false
    }
  },
  
  computed: {
    // 是否禁用（考虑加载状态）
    isDisabled() {
      return this.disabled || this.loading
    },
    
    // 是否仅包含图标
    isIconOnly() {
      return !this.$slots.default && (this.icon || this.rightIcon || this.$slots.icon || this.$slots['right-icon'])
    }
  },
  
  mounted() {
    // 设置键盘快捷键监听
    if (this.shortcut && !this.isDisabled) {
      this.setupKeyboardShortcut()
    }
  },
  
  beforeUnmount() {
    // 清理定时器和事件监听
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    this.removeKeyboardShortcut()
  },
  
  watch: {
    // 监听快捷键变化
    shortcut(newVal, oldVal) {
      if (oldVal) {
        this.removeKeyboardShortcut()
      }
      if (newVal && !this.isDisabled) {
        this.setupKeyboardShortcut()
      }
    },
    
    // 监听禁用状态变化
    isDisabled(newVal) {
      if (newVal) {
        this.removeKeyboardShortcut()
      } else if (this.shortcut) {
        this.setupKeyboardShortcut()
      }
    }
  },
  
  methods: {
    // 处理点击事件
    handleClick(event) {
      if (this.isDisabled) return
      
      // 阻止默认行为
      if (this.stopPropagation) {
        event.stopPropagation()
      }
      
      // 防抖处理
      if (this.debounce > 0) {
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer)
        }
        
        this.debounceTimer = setTimeout(() => {
          this.emitClickEvent(event)
        }, this.debounce)
      } else {
        this.emitClickEvent(event)
      }
    },
    
    // 发射点击事件
    emitClickEvent(event) {
      this.$emit('click', event)
      this.$emit('update:active', !this.active)
    },
    
    // 处理鼠标按下事件
    handleMousedown(event) {
      this.isPressed = true
      this.$emit('mousedown', event)
    },
    
    // 处理鼠标释放事件
    handleMouseup(event) {
      this.isPressed = false
      this.$emit('mouseup', event)
    },
    
    // 处理鼠标进入事件
    handleMouseenter(event) {
      this.$emit('mouseenter', event)
    },
    
    // 处理鼠标离开事件
    handleMouseleave(event) {
      this.isPressed = false
      this.$emit('mouseleave', event)
    },
    
    // 处理聚焦事件
    handleFocus(event) {
      this.$emit('focus', event)
    },
    
    // 处理失焦事件
    handleBlur(event) {
      this.$emit('blur', event)
    },
    
    // 处理键盘按下事件
    handleKeydown(event) {
      this.$emit('keydown', event)
      
      // 处理空格键和回车键
      if ([' ', 'Enter'].includes(event.key)) {
        event.preventDefault()
        this.isPressed = true
      }
      
      // 处理Escape键
      if (event.key === 'Escape') {
        this.$emit('escape', event)
      }
    },
    
    // 处理键盘释放事件
    handleKeyup(event) {
      this.$emit('keyup', event)
      
      // 处理空格键和回车键释放
      if ([' ', 'Enter'].includes(event.key)) {
        this.isPressed = false
        this.handleClick(event)
      }
    },
    
    // 设置键盘快捷键
    setupKeyboardShortcut() {
      this.keyboardHandler = (event) => {
        // 检查快捷键组合
        const shortcutParts = this.shortcut.toLowerCase().split('+')
        const hasCtrl = shortcutParts.includes('ctrl') && (event.ctrlKey || event.metaKey)
        const hasAlt = shortcutParts.includes('alt') && event.altKey
        const hasShift = shortcutParts.includes('shift') && event.shiftKey
        
        // 检查最后一个按键
        const key = shortcutParts[shortcutParts.length - 1]
        const keyMatch = event.key.toLowerCase() === key || event.code.toLowerCase() === `key${key.toUpperCase()}`
        
        if (hasCtrl && hasAlt && hasShift && keyMatch || 
            hasCtrl && hasAlt && !hasShift && keyMatch && !shortcutParts.includes('shift') ||
            hasCtrl && !hasAlt && hasShift && keyMatch && !shortcutParts.includes('alt') ||
            !hasCtrl && hasAlt && hasShift && keyMatch && !shortcutParts.includes('ctrl')) {
          event.preventDefault()
          this.handleClick(new Event('click'))
        }
      }
      
      document.addEventListener('keydown', this.keyboardHandler)
    },
    
    // 移除键盘快捷键
    removeKeyboardShortcut() {
      if (this.keyboardHandler) {
        document.removeEventListener('keydown', this.keyboardHandler)
        this.keyboardHandler = null
      }
    },
    
    // 手动触发点击
    trigger() {
      if (!this.isDisabled) {
        const event = new Event('click')
        this.handleClick(event)
      }
    },
    
    // 获取焦点
    focus() {
      this.$el.focus()
    },
    
    // 失去焦点
    blur() {
      this.$el.blur()
    }
  }
}
</script>

<style scoped>
/* 按钮基础样式 */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  background-color: #fff;
  color: #333;
}

.button:hover:not(.button-disabled):not(.button-loading) {
  border-color: #40a9ff;
  color: #40a9ff;
}

.button:active:not(.button-disabled):not(.button-loading) {
  border-color: #096dd9;
  color: #096dd9;
}

/* 禁用状态 */
.button-disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background-color: #f5f5f5;
  color: rgba(0, 0, 0, 0.25);
  border-color: #d9d9d9;
}

/* 激活状态 */
.button-active {
  background-color: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
}

/* 变体样式 */
.button-primary {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.button-primary:hover:not(.button-disabled):not(.button-loading) {
  background-color: #40a9ff;
  border-color: #40a9ff;
  color: #fff;
}

.button-success {
  background-color: #52c41a;
  border-color: #52c41a;
  color: #fff;
}

.button-success:hover:not(.button-disabled):not(.button-loading) {
  background-color: #73d13d;
  border-color: #73d13d;
  color: #fff;
}

.button-warning {
  background-color: #fa8c16;
  border-color: #fa8c16;
  color: #fff;
}

.button-warning:hover:not(.button-disabled):not(.button-loading) {
  background-color: #ffa940;
  border-color: #ffa940;
  color: #fff;
}

.button-error {
  background-color: #f5222d;
  border-color: #f5222d;
  color: #fff;
}

.button-error:hover:not(.button-disabled):not(.button-loading) {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
  color: #fff;
}

.button-info {
  background-color: #13c2c2;
  border-color: #13c2c2;
  color: #fff;
}

.button-info:hover:not(.button-disabled):not(.button-loading) {
  background-color: #36cfc9;
  border-color: #36cfc9;
  color: #fff;
}

.button-secondary {
  background-color: #722ed1;
  border-color: #722ed1;
  color: #fff;
}

.button-secondary:hover:not(.button-disabled):not(.button-loading) {
  background-color: #9254de;
  border-color: #9254de;
  color: #fff;
}

.button-light {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #333;
}

.button-dark {
  background-color: #1f1f1f;
  border-color: #1f1f1f;
  color: #fff;
}

/* 朴素按钮 */
.button-plain {
  background-color: transparent;
  border-color: transparent;
  color: #333;
}

.button-plain:hover:not(.button-disabled):not(.button-loading) {
  background-color: #f0f0f0;
}

/* 文本按钮 */
.button-text {
  background-color: transparent;
  border-color: transparent;
  color: #1890ff;
  padding: 4px 15px;
}

.button-text:hover:not(.button-disabled):not(.button-loading) {
  background-color: #e6f7ff;
  color: #40a9ff;
}

/* 链接按钮 */
.button-link {
  background-color: transparent;
  border-color: transparent;
  color: #1890ff;
  padding: 0;
  height: auto;
  font-size: inherit;
  text-decoration: underline;
}

.button-link:hover:not(.button-disabled):not(.button-loading) {
  color: #40a9ff;
}

/* 虚线按钮 */
.button-dashed {
  border-style: dashed;
}

/* 大小变体 */
.button-mini {
  padding: 2px 8px;
  font-size: 12px;
}

.button-small {
  padding: 6px 12px;
  font-size: 14px;
}

.button-medium {
  padding: 8px 16px;
  font-size: 14px;
}

.button-large {
  padding: 10px 24px;
  font-size: 16px;
}

/* 块级按钮 */
.button-block {
  width: 100%;
}

/* 圆形按钮 */
.button-circle {
  padding: 8px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
}

.button-mini.button-circle {
  width: 24px;
  height: 24px;
  padding: 2px;
}

.button-small.button-circle {
  width: 28px;
  height: 28px;
  padding: 4px;
}

.button-large.button-circle {
  width: 40px;
  height: 40px;
  padding: 10px;
}

/* 圆角按钮 */
.button-round {
  border-radius: 20px;
}

/* 仅图标按钮 */
.button-icon-only {
  padding: 8px;
  width: 32px;
  height: 32px;
}

.button-mini.button-icon-only {
  width: 24px;
  height: 24px;
  padding: 2px;
}

.button-small.button-icon-only {
  width: 28px;
  height: 28px;
  padding: 4px;
}

.button-large.button-icon-only {
  width: 40px;
  height: 40px;
  padding: 10px;
}

/* 图标样式 */
.button-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: inherit;
  line-height: 1;
}

.button-icon-left {
  margin-right: 6px;
}

.button-icon-right {
  margin-left: 6px;
}

/* 按钮内容 */
.button-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 加载图标 */
.button-loading-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

.button-default .button-loading-icon,
.button-plain .button-loading-icon,
.button-text .button-loading-icon,
.button-light .button-loading-icon {
  border-color: rgba(0, 0, 0, 0.1);
  border-top-color: #1890ff;
}

/* 动画效果 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .button {
    font-size: 16px; /* 防止iOS缩放 */
  }
  
  .button-large {
    padding: 12px 20px;
  }
}
</style>