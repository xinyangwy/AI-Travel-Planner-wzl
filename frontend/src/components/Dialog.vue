<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="dialog-wrapper" @click.self="handleWrapperClick">
      <!-- 遮罩层 -->
      <div class="dialog-overlay" :style="overlayStyle"></div>
      
      <!-- 对话框容器 -->
      <div 
        class="dialog-container"
        :class="[
          size,
          { 'has-header': showHeader },
          { 'has-footer': showFooter },
          { 'draggable': draggable && !destroyOnClose },
          { 'custom-width': !!customWidth },
          { 'custom-height': !!customHeight },
          { 'full-screen': fullScreen }
        ]"
        :style="containerStyle"
        @click="handleContainerClick"
      >
        <!-- 对话框头部 -->
        <div v-if="showHeader" class="dialog-header" :class="{ 'with-drag-handle': draggable && !destroyOnClose }">
          <!-- 拖拽手柄 -->
          <div 
            v-if="draggable && !destroyOnClose" 
            class="dialog-drag-handle" 
            @mousedown="handleDragStart"
            @touchstart="handleTouchStart"
          ></div>
          
          <!-- 标题区域 -->
          <div class="dialog-title-container">
            <div v-if="showIcon" class="dialog-icon">
              {{ getIcon() }}
            </div>
            <h3 class="dialog-title">
              <slot name="title">{{ title }}</slot>
            </h3>
          </div>
          
          <!-- 关闭按钮 -->
          <button 
            v-if="showCloseButton" 
            class="dialog-close-button"
            @click="handleClose"
            :title="closeButtonText"
          >
            <span class="close-icon"></span>
          </button>
        </div>
        
        <!-- 对话框主体 -->
        <div class="dialog-body" :class="{ 'no-padding': !padding }">
          <div v-if="loading" class="dialog-loading">
            <Loading :size="'small'" :show-text="false" />
          </div>
          <div v-else-if="$slots.default" class="dialog-content">
            <slot></slot>
          </div>
          <div v-else class="dialog-content">
            <slot name="content">{{ content }}</slot>
          </div>
        </div>
        
        <!-- 对话框底部 -->
        <div v-if="showFooter" class="dialog-footer" :class="{ 'center-footer': footerCenter }">
          <div class="dialog-footer-left">
            <slot name="footer-left"></slot>
          </div>
          <div class="dialog-footer-center">
            <slot name="footer-center"></slot>
          </div>
          <div class="dialog-footer-right">
            <!-- 取消按钮 -->
            <button 
              v-if="showCancelButton"
              class="dialog-button cancel-button"
              :class="{ 'disabled': cancelButtonLoading }"
              @click="handleCancel"
              :disabled="cancelButtonLoading"
            >
              <slot name="cancelText">{{ cancelButtonText }}</slot>
            </button>
            
            <!-- 确认按钮 -->
            <button 
              v-if="showConfirmButton"
              class="dialog-button confirm-button"
              :class="[type, { 'disabled': confirmButtonLoading }]"
              @click="handleConfirm"
              :disabled="confirmButtonLoading"
            >
              <Loading 
                v-if="confirmButtonLoading" 
                :size="'small'" 
                :show-text="false" 
                :spinner-type="'dots'" 
              />
              <span v-else><slot name="confirmText">{{ confirmButtonText }}</slot></span>
            </button>
            
            <!-- 自定义底部按钮 -->
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Loading from './Loading.vue'

export default {
  name: 'Dialog',
  components: {
    Loading
  },
  
  props: {
    // 对话框可见性
    visible: {
      type: Boolean,
      default: false
    },
    // 对话框标题
    title: {
      type: String,
      default: '对话框'
    },
    // 对话框内容
    content: {
      type: String,
      default: ''
    },
    // 对话框类型
    type: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'success', 'warning', 'error', 'info'].includes(value)
    },
    // 对话框尺寸
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large', 'xlarge'].includes(value)
    },
    // 是否全屏显示
    fullScreen: {
      type: Boolean,
      default: false
    },
    // 自定义宽度
    customWidth: {
      type: [String, Number],
      default: ''
    },
    // 自定义高度
    customHeight: {
      type: [String, Number],
      default: ''
    },
    // 是否显示头部
    showHeader: {
      type: Boolean,
      default: true
    },
    // 是否显示底部
    showFooter: {
      type: Boolean,
      default: true
    },
    // 是否显示关闭按钮
    showCloseButton: {
      type: Boolean,
      default: true
    },
    // 是否显示图标
    showIcon: {
      type: Boolean,
      default: true
    },
    // 是否显示取消按钮
    showCancelButton: {
      type: Boolean,
      default: true
    },
    // 是否显示确认按钮
    showConfirmButton: {
      type: Boolean,
      default: true
    },
    // 确认按钮文本
    confirmButtonText: {
      type: String,
      default: '确定'
    },
    // 取消按钮文本
    cancelButtonText: {
      type: String,
      default: '取消'
    },
    // 关闭按钮文本
    closeButtonText: {
      type: String,
      default: '关闭'
    },
    // 是否可拖拽
    draggable: {
      type: Boolean,
      default: true
    },
    // 点击遮罩层是否关闭
    closeOnClickModal: {
      type: Boolean,
      default: true
    },
    // 按ESC键是否关闭
    closeOnPressEscape: {
      type: Boolean,
      default: true
    },
    // 是否在关闭时销毁组件
    destroyOnClose: {
      type: Boolean,
      default: false
    },
    // 是否显示加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 确认按钮是否加载中
    confirmButtonLoading: {
      type: Boolean,
      default: false
    },
    // 取消按钮是否加载中
    cancelButtonLoading: {
      type: Boolean,
      default: false
    },
    // 底部按钮是否居中
    footerCenter: {
      type: Boolean,
      default: false
    },
    // 是否有内边距
    padding: {
      type: Boolean,
      default: true
    },
    // 遮罩层背景色
    overlayBackground: {
      type: String,
      default: 'rgba(0, 0, 0, 0.5)'
    },
    // 遮罩层是否模糊
    overlayBlur: {
      type: Boolean,
      default: false
    },
    // z-index值
    zIndex: {
      type: Number,
      default: 1000
    }
  },
  
  data() {
    return {
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      dialogStartX: 0,
      dialogStartY: 0,
      currentZIndex: this.zIndex
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
      
      // 自定义高度
      if (this.customHeight) {
        style.height = typeof this.customHeight === 'number' ? `${this.customHeight}px` : this.customHeight
      }
      
      // z-index
      style.zIndex = this.currentZIndex + 1
      
      return style
    },
    
    // 遮罩层样式
    overlayStyle() {
      const style = {
        backgroundColor: this.overlayBackground,
        zIndex: this.currentZIndex
      }
      
      // 模糊效果
      if (this.overlayBlur) {
        style.backdropFilter = 'blur(2px)'
      }
      
      return style
    }
  },
  
  watch: {
    // 监听可见性变化
    visible(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.addKeydownEvent()
          this.preventBodyScroll()
        })
      } else {
        this.removeKeydownEvent()
        this.restoreBodyScroll()
        
        if (this.destroyOnClose) {
          this.$emit('update:visible', false)
        }
      }
    }
  },
  
  mounted() {
    if (this.visible) {
      this.addKeydownEvent()
      this.preventBodyScroll()
    }
  },
  
  beforeDestroy() {
    this.removeKeydownEvent()
    this.restoreBodyScroll()
  },
  
  methods: {
    // 获取图标
    getIcon() {
      const iconMap = {
        primary: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️'
      }
      return iconMap[this.type] || 'ℹ️'
    },
    
    // 处理遮罩层点击
    handleWrapperClick() {
      if (this.closeOnClickModal) {
        this.handleClose()
      }
    },
    
    // 处理容器点击
    handleContainerClick(e) {
      e.stopPropagation()
    },
    
    // 处理关闭
    handleClose() {
      if (this.loading || this.confirmButtonLoading || this.cancelButtonLoading) return
      
      this.$emit('update:visible', false)
      this.$emit('close')
      this.$emit('cancel')
    },
    
    // 处理取消
    handleCancel() {
      if (this.loading || this.confirmButtonLoading || this.cancelButtonLoading) return
      
      this.$emit('update:visible', false)
      this.$emit('cancel')
    },
    
    // 处理确认
    handleConfirm() {
      if (this.loading || this.confirmButtonLoading || this.cancelButtonLoading) return
      
      this.$emit('update:visible', false)
      this.$emit('confirm')
    },
    
    // 处理拖拽开始
    handleDragStart(e) {
      this.startDrag(e.clientX, e.clientY)
      document.addEventListener('mousemove', this.handleDragMove)
      document.addEventListener('mouseup', this.handleDragEnd)
    },
    
    // 处理触摸开始
    handleTouchStart(e) {
      const touch = e.touches[0]
      this.startDrag(touch.clientX, touch.clientY)
      document.addEventListener('touchmove', this.handleTouchMove)
      document.addEventListener('touchend', this.handleTouchEnd)
    },
    
    // 开始拖拽
    startDrag(clientX, clientY) {
      this.isDragging = true
      this.dragStartX = clientX
      this.dragStartY = clientY
      
      const dialogEl = this.$el.querySelector('.dialog-container')
      if (dialogEl) {
        const rect = dialogEl.getBoundingClientRect()
        this.dialogStartX = rect.left
        this.dialogStartY = rect.top
      }
    },
    
    // 处理拖拽移动
    handleDragMove(e) {
      this.moveDrag(e.clientX, e.clientY)
    },
    
    // 处理触摸移动
    handleTouchMove(e) {
      const touch = e.touches[0]
      this.moveDrag(touch.clientX, touch.clientY)
    },
    
    // 移动拖拽
    moveDrag(clientX, clientY) {
      if (!this.isDragging) return
      
      const dialogEl = this.$el.querySelector('.dialog-container')
      if (dialogEl) {
        const deltaX = clientX - this.dragStartX
        const deltaY = clientY - this.dragStartY
        
        dialogEl.style.left = `${this.dialogStartX + deltaX}px`
        dialogEl.style.top = `${this.dialogStartY + deltaY}px`
        dialogEl.style.margin = '0'
      }
    },
    
    // 处理拖拽结束
    handleDragEnd() {
      this.endDrag()
    },
    
    // 处理触摸结束
    handleTouchEnd() {
      this.endDrag()
    },
    
    // 结束拖拽
    endDrag() {
      this.isDragging = false
      document.removeEventListener('mousemove', this.handleDragMove)
      document.removeEventListener('mouseup', this.handleDragEnd)
      document.removeEventListener('touchmove', this.handleTouchMove)
      document.removeEventListener('touchend', this.handleTouchEnd)
    },
    
    // 添加键盘事件
    addKeydownEvent() {
      document.addEventListener('keydown', this.handleKeydown)
    },
    
    // 移除键盘事件
    removeKeydownEvent() {
      document.removeEventListener('keydown', this.handleKeydown)
    },
    
    // 处理键盘事件
    handleKeydown(e) {
      if (this.closeOnPressEscape && e.key === 'Escape') {
        this.handleClose()
      }
    },
    
    // 阻止页面滚动
    preventBodyScroll() {
      document.body.style.overflow = 'hidden'
    },
    
    // 恢复页面滚动
    restoreBodyScroll() {
      document.body.style.overflow = ''
    },
    
    // 手动关闭对话框
    close() {
      this.handleClose()
    },
    
    // 手动确认对话框
    confirm() {
      this.handleConfirm()
    },
    
    // 手动取消对话框
    cancel() {
      this.handleCancel()
    }
  }
}
</script>

<style scoped>
.dialog-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.dialog-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: opacity 0.3s;
}

.dialog-container {
  position: relative;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  max-width: 90vw;
  width: 520px;
  outline: none;
}

/* 尺寸变体 */
.dialog-container.small {
  width: 300px;
}

.dialog-container.medium {
  width: 520px;
}

.dialog-container.large {
  width: 720px;
}

.dialog-container.xlarge {
  width: 920px;
}

/* 全屏模式 */
.dialog-container.full-screen {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  border-radius: 0;
  margin: 0;
}

/* 自定义宽高 */
.dialog-container.custom-width {
  width: auto;
}

.dialog-container.custom-height {
  height: auto;
}

/* 头部样式 */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  cursor: default;
}

.dialog-header.with-drag-handle {
  cursor: move;
}

.dialog-drag-handle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  z-index: 1;
  cursor: move;
}

.dialog-title-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.dialog-icon {
  font-size: 18px;
}

.dialog-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dialog-close-button {
  background: transparent;
  border: none;
  padding: 0;
  margin: -4px;
  cursor: pointer;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: all 0.3s;
  z-index: 2;
}

.dialog-close-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.65);
}

/* 主体样式 */
.dialog-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.5715;
  color: rgba(0, 0, 0, 0.65);
  min-height: 40px;
}

.dialog-body.no-padding {
  padding: 0;
}

.dialog-content {
  word-break: break-word;
}

.dialog-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

/* 底部样式 */
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
  border-radius: 0 0 8px 8px;
  gap: 12px;
}

.dialog-footer.center-footer {
  justify-content: center;
}

.dialog-footer-left {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  gap: 8px;
}

.dialog-footer-center {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dialog-footer-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.dialog-button {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #d9d9d9;
  background-color: #fff;
  color: rgba(0, 0, 0, 0.65);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  gap: 4px;
}

.dialog-button:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

.dialog-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #fff;
}

.confirm-button.primary {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.confirm-button.primary:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
  color: #fff;
}

.confirm-button.success {
  background-color: #52c41a;
  border-color: #52c41a;
  color: #fff;
}

.confirm-button.success:hover {
  background-color: #73d13d;
  border-color: #73d13d;
  color: #fff;
}

.confirm-button.warning {
  background-color: #fa8c16;
  border-color: #fa8c16;
  color: #fff;
}

.confirm-button.warning:hover {
  background-color: #ffa940;
  border-color: #ffa940;
  color: #fff;
}

.confirm-button.error {
  background-color: #f5222d;
  border-color: #f5222d;
  color: #fff;
}

.confirm-button.error:hover {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
  color: #fff;
}

.confirm-button.info {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.confirm-button.info:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
  color: #fff;
}

/* 过渡动画 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s;
}

.dialog-fade-enter,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-active .dialog-container,
.dialog-fade-leave-active .dialog-container {
  transition: transform 0.3s;
}

.dialog-fade-enter .dialog-container {
  transform: scale(0.9);
}

.dialog-fade-leave-to .dialog-container {
  transform: scale(0.9);
}

.dialog-fade-enter-active .dialog-overlay,
.dialog-fade-leave-active .dialog-overlay {
  transition: opacity 0.3s;
}

.dialog-fade-enter .dialog-overlay,
.dialog-fade-leave-to .dialog-overlay {
  opacity: 0;
}

/* 关闭图标 */
.close-icon::before {
  content: '✕';
}

/* 响应式样式 */
@media (max-width: 768px) {
  .dialog-wrapper {
    padding: 10px;
  }
  
  .dialog-container {
    width: 100%;
    margin: 0;
    max-height: 100vh;
  }
  
  .dialog-container.small,
  .dialog-container.medium,
  .dialog-container.large,
  .dialog-container.xlarge {
    width: 100%;
  }
  
  .dialog-header,
  .dialog-body,
  .dialog-footer {
    padding: 12px 16px;
  }
  
  .dialog-footer {
    flex-direction: column;
  }
  
  .dialog-footer-left,
  .dialog-footer-center,
  .dialog-footer-right {
    flex: none;
    width: 100%;
  }
}
</style>