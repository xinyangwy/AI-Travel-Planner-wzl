<template>
  <div v-if="visible" class="confirm-dialog-overlay" @click.self="handleOverlayClick">
    <div 
      class="confirm-dialog"
      :class="{
        'confirm-dialog-small': size === 'small',
        'confirm-dialog-large': size === 'large',
        [`confirm-dialog-${type}`]: type !== 'default'
      }"
      :style="customStyle"
      ref="dialog"
    >
      <!-- 对话框标题 -->
      <div class="confirm-dialog-header">
        <div v-if="showIcon" class="confirm-dialog-icon" :class="iconClass"></div>
        <div class="confirm-dialog-title">{{ title || getDefaultTitle() }}</div>
        <button 
          v-if="closable" 
          class="confirm-dialog-close" 
          @click="handleCancel"
          type="button"
          aria-label="关闭"
        >
          <i class="confirm-dialog-close-icon"></i>
        </button>
      </div>
      
      <!-- 对话框内容 -->
      <div class="confirm-dialog-body">
        <div class="confirm-dialog-message" v-html="message"></div>
        
        <!-- 自定义内容插槽 -->
        <slot name="content"></slot>
      </div>
      
      <!-- 对话框底部按钮 -->
      <div class="confirm-dialog-footer">
        <!-- 自定义底部插槽 -->
        <template v-if="$slots.footer">
          <slot name="footer"></slot>
        </template>
        <!-- 默认按钮 -->
        <template v-else>
          <button 
            class="confirm-dialog-button confirm-dialog-button-cancel"
            :disabled="loading.cancel"
            @click="handleCancel"
            :type="buttonType"
          >
            {{ cancelText }}
          </button>
          <button 
            class="confirm-dialog-button confirm-dialog-button-confirm"
            :disabled="loading.confirm"
            :class="{
              'confirm-dialog-button-primary': type === 'primary',
              'confirm-dialog-button-success': type === 'success',
              'confirm-dialog-button-warning': type === 'warning',
              'confirm-dialog-button-error': type === 'error',
              'confirm-dialog-button-loading': loading.confirm
            }"
            @click="handleConfirm"
            :type="buttonType"
          >
            <i v-if="loading.confirm" class="confirm-dialog-loading-icon"></i>
            {{ confirmText }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  
  props: {
    // 对话框是否可见
    visible: {
      type: Boolean,
      default: false
    },
    
    // 对话框类型
    type: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'primary', 'success', 'warning', 'error'].includes(value)
    },
    
    // 对话框标题
    title: {
      type: String,
      default: ''
    },
    
    // 对话框消息内容
    message: {
      type: String,
      default: ''
    },
    
    // 确认按钮文本
    confirmText: {
      type: String,
      default: '确定'
    },
    
    // 取消按钮文本
    cancelText: {
      type: String,
      default: '取消'
    },
    
    // 对话框大小
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    
    // 是否显示图标
    showIcon: {
      type: Boolean,
      default: true
    },
    
    // 是否可关闭
    closable: {
      type: Boolean,
      default: true
    },
    
    // 是否点击遮罩层关闭对话框
    closeOnClickOverlay: {
      type: Boolean,
      default: false
    },
    
    // 是否点击ESC键关闭对话框
    closeOnPressEscape: {
      type: Boolean,
      default: true
    },
    
    // 确认按钮是否为危险操作
    danger: {
      type: Boolean,
      default: false
    },
    
    // 自动聚焦按钮类型
    autoFocusButton: {
      type: String,
      default: 'confirm',
      validator: (value) => ['confirm', 'cancel', null].includes(value)
    },
    
    // 按钮类型（button/submit/reset）
    buttonType: {
      type: String,
      default: 'button'
    },
    
    // 自定义样式
    customStyle: {
      type: Object,
      default: () => ({})
    },
    
    // 加载状态
    loading: {
      type: Object,
      default: () => ({
        confirm: false,
        cancel: false
      })
    },
    
    // 唯一标识
    id: {
      type: String,
      default: () => `confirm-dialog-${Date.now()}`
    }
  },
  
  data() {
    return {
      // 焦点管理
      focusedButton: null,
      // ESC键监听器
      escKeyHandler: null
    }
  },
  
  computed: {
    // 根据类型获取图标类名
    iconClass() {
      const iconMap = {
        success: 'confirm-dialog-icon-success',
        warning: 'confirm-dialog-icon-warning',
        error: 'confirm-dialog-icon-error',
        primary: 'confirm-dialog-icon-primary'
      }
      return iconMap[this.type] || ''
    }
  },
  
  watch: {
    // 监听visible变化，处理ESC键监听和焦点管理
    visible(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.handleVisibleChange(true)
        })
      } else {
        this.handleVisibleChange(false)
      }
    }
  },
  
  mounted() {
    // 如果初始状态是可见的，则初始化
    if (this.visible) {
      this.handleVisibleChange(true)
    }
  },
  
  beforeUnmount() {
    // 移除事件监听
    this.handleVisibleChange(false)
  },
  
  methods: {
    // 处理可见性变化
    handleVisibleChange(visible) {
      if (visible) {
        // 添加ESC键监听
        if (this.closeOnPressEscape) {
          this.escKeyHandler = (e) => {
            if (e.key === 'Escape') {
              this.handleCancel()
            }
          }
          document.addEventListener('keydown', this.escKeyHandler)
        }
        
        // 防止背景滚动
        this.preventScroll()
        
        // 设置焦点
        this.setFocus()
      } else {
        // 移除ESC键监听
        if (this.escKeyHandler) {
          document.removeEventListener('keydown', this.escKeyHandler)
          this.escKeyHandler = null
        }
        
        // 恢复背景滚动
        this.restoreScroll()
      }
    },
    
    // 设置焦点到按钮
    setFocus() {
      if (!this.autoFocusButton) return
      
      this.$nextTick(() => {
        const confirmBtn = this.$el?.querySelector('.confirm-dialog-button-confirm')
        const cancelBtn = this.$el?.querySelector('.confirm-dialog-button-cancel')
        
        if (this.autoFocusButton === 'confirm' && confirmBtn) {
          confirmBtn.focus()
          this.focusedButton = confirmBtn
        } else if (this.autoFocusButton === 'cancel' && cancelBtn) {
          cancelBtn.focus()
          this.focusedButton = cancelBtn
        }
      })
    },
    
    // 防止背景滚动
    preventScroll() {
      document.body.style.overflow = 'hidden'
    },
    
    // 恢复背景滚动
    restoreScroll() {
      document.body.style.overflow = ''
    },
    
    // 处理点击遮罩层
    handleOverlayClick() {
      if (this.closeOnClickOverlay) {
        this.handleCancel()
      }
    },
    
    // 处理确认按钮点击
    handleConfirm(event) {
      if (this.loading.confirm) return
      
      // 触发确认事件
      this.$emit('confirm', event)
      this.$emit('update:visible', false)
      this.$emit('close', 'confirm')
    },
    
    // 处理取消按钮点击
    handleCancel(event) {
      if (this.loading.cancel) return
      
      // 触发取消事件
      this.$emit('cancel', event)
      this.$emit('update:visible', false)
      this.$emit('close', 'cancel')
    },
    
    // 获取默认标题
    getDefaultTitle() {
      const titleMap = {
        success: '成功',
        warning: '警告',
        error: '错误',
        primary: '提示'
      }
      return titleMap[this.type] || '确认'
    },
    
    // 手动显示对话框
    show() {
      this.$emit('update:visible', true)
    },
    
    // 手动隐藏对话框
    hide() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>
/* 遮罩层样式 */
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  animation: fadeIn 0.3s ease;
}

/* 对话框样式 */
.confirm-dialog {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 400px;
  max-width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

/* 对话框大小 */
.confirm-dialog-small {
  width: 300px;
}

.confirm-dialog-large {
  width: 600px;
}

/* 对话框类型样式 */
.confirm-dialog-primary {
  border: 1px solid #e6f7ff;
}

.confirm-dialog-success {
  border: 1px solid #f6ffed;
}

.confirm-dialog-warning {
  border: 1px solid #fffbe6;
}

.confirm-dialog-error {
  border: 1px solid #fff2f0;
}

/* 对话框头部 */
.confirm-dialog-header {
  padding: 16px 24px 12px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

/* 图标样式 */
.confirm-dialog-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-dialog-icon-success {
  background-color: #f6ffed;
  color: #52c41a;
}

.confirm-dialog-icon-success::before {
  content: '✓';
}

.confirm-dialog-icon-warning {
  background-color: #fffbe6;
  color: #fa8c16;
}

.confirm-dialog-icon-warning::before {
  content: '!';
  font-weight: bold;
}

.confirm-dialog-icon-error {
  background-color: #fff2f0;
  color: #f5222d;
}

.confirm-dialog-icon-error::before {
  content: '×';
  font-weight: bold;
}

.confirm-dialog-icon-primary {
  background-color: #e6f7ff;
  color: #1890ff;
}

.confirm-dialog-icon-primary::before {
  content: 'i';
  font-style: italic;
  font-weight: bold;
}

/* 标题样式 */
.confirm-dialog-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  flex: 1;
}

/* 关闭按钮 */
.confirm-dialog-close {
  background: transparent;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  line-height: 1;
}

.confirm-dialog-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #666;
}

.confirm-dialog-close-icon::before {
  content: '×';
}

/* 对话框内容 */
.confirm-dialog-body {
  padding: 16px 24px;
  flex: 1;
  overflow-y: auto;
}

.confirm-dialog-message {
  font-size: 14px;
  line-height: 1.5;
  color: #666;
  word-break: break-word;
}

/* 对话框底部 */
.confirm-dialog-footer {
  padding: 16px 24px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

/* 按钮样式 */
.confirm-dialog-button {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #d9d9d9;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-dialog-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 取消按钮 */
.confirm-dialog-button-cancel {
  background-color: #fff;
  color: #333;
}

.confirm-dialog-button-cancel:hover:not(:disabled) {
  color: #1890ff;
  border-color: #1890ff;
}

/* 确认按钮 */
.confirm-dialog-button-confirm {
  background-color: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

.confirm-dialog-button-confirm:hover:not(:disabled) {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

/* 按钮类型变体 */
.confirm-dialog-button-success {
  background-color: #52c41a;
  border-color: #52c41a;
}

.confirm-dialog-button-success:hover:not(:disabled) {
  background-color: #73d13d;
  border-color: #73d13d;
}

.confirm-dialog-button-warning {
  background-color: #fa8c16;
  border-color: #fa8c16;
}

.confirm-dialog-button-warning:hover:not(:disabled) {
  background-color: #ffa940;
  border-color: #ffa940;
}

.confirm-dialog-button-error {
  background-color: #f5222d;\d;\;
  border-color: #f5222d;
}

.confirm-dialog-button-error:hover:not(:disabled) {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
}

/* 加载图标 */
.confirm-dialog-loading-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .confirm-dialog {
    width: 90%;
    margin: 0 16px;
  }
  
  .confirm-dialog-header,
  .confirm-dialog-body,
  .confirm-dialog-footer {
    padding: 12px 16px;
  }
  
  .confirm-dialog-footer {
    flex-direction: column-reverse;
  }
  
  .confirm-dialog-button {
    width: 100%;
  }
}
</style>