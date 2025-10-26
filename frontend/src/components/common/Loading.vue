<template>
  <transition name="loading-fade">
    <div 
      v-if="visible" 
      class="loading-container"
      :class="{ 'loading-fullscreen': fullscreen, 'loading-inline': !fullscreen }"
      @click="handleBackdropClick"
    >
      <div class="loading-backdrop" v-if="fullscreen"></div>
      <div 
        class="loading-content"
        :class="{ 
          'loading-custom-size': customSize,
          'loading-dark': dark,
          'loading-light': !dark
        }"
        @click.stop
      >
        <!-- 加载图标 -->
        <div class="loading-spinner" :style="spinnerStyle">
          <i 
            v-if="type === 'spinner'" 
            class="fas fa-spinner fa-spin"
          ></i>
          <i 
            v-else-if="type === 'circle'" 
            class="fas fa-circle-notch fa-spin"
          ></i>
          <i 
            v-else-if="type === 'sync'" 
            class="fas fa-sync-alt fa-spin"
          ></i>
          <i 
            v-else-if="type === 'hourglass'" 
            class="fas fa-hourglass-half fa-spin"
          ></i>
          <i 
            v-else-if="type === 'compass'" 
            class="fas fa-compass fa-spin"
          ></i>
          <i 
            v-else-if="type === 'cog'" 
            class="fas fa-cog fa-spin"
          ></i>
          <div v-else class="custom-spinner">
            <div class="spinner-dot"></div>
            <div class="spinner-dot"></div>
            <div class="spinner-dot"></div>
          </div>
        </div>
        
        <!-- 加载文本 -->
        <div v-if="text" class="loading-text" :style="textStyle">
          {{ text }}
        </div>
        
        <!-- 进度条 -->
        <div v-if="showProgress" class="loading-progress-container">
          <div 
            class="loading-progress-bar" 
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        
        <!-- 取消按钮 -->
        <button 
          v-if="closable" 
          class="loading-close-btn"
          @click="handleClose"
          :title="closeText || '取消'"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Loading',
  
  props: {
    // 是否显示加载组件
    visible: {
      type: Boolean,
      default: false
    },
    
    // 是否全屏显示
    fullscreen: {
      type: Boolean,
      default: true
    },
    
    // 加载文本
    text: {
      type: String,
      default: ''
    },
    
    // 加载图标类型: spinner, circle, sync, hourglass, compass, cog, dots
    type: {
      type: String,
      default: 'spinner',
      validator: (value) => ['spinner', 'circle', 'sync', 'hourglass', 'compass', 'cog', 'dots'].includes(value)
    },
    
    // 图标大小
    size: {
      type: [String, Number],
      default: 32
    },
    
    // 主题颜色
    color: {
      type: String,
      default: '#1890ff'
    },
    
    // 是否为暗色主题
    dark: {
      type: Boolean,
      default: false
    },
    
    // 是否显示进度
    showProgress: {
      type: Boolean,
      default: false
    },
    
    // 进度值 (0-100)
    progress: {
      type: Number,
      default: 0,
      validator: (value) => value >= 0 && value <= 100
    },
    
    // 是否可关闭
    closable: {
      type: Boolean,
      default: false
    },
    
    // 关闭按钮文本
    closeText: {
      type: String,
      default: '取消'
    },
    
    // 点击背景是否关闭
    closeOnClickBackdrop: {
      type: Boolean,
      default: false
    },
    
    // 自定义容器样式
    contentStyle: {
      type: Object,
      default: () => ({})
    },
    
    // 自定义文本样式
    textStyle: {
      type: Object,
      default: () => ({})
    }
  },
  
  computed: {
    // 判断是否为自定义大小
    customSize() {
      return this.size !== 32
    },
    
    // 加载图标样式
    spinnerStyle() {
      return {
        fontSize: typeof this.size === 'number' ? `${this.size}px` : this.size,
        color: this.color
      }
    }
  },
  
  methods: {
    /**
     * 处理背景点击事件
     */
    handleBackdropClick() {
      if (this.closeOnClickBackdrop) {
        this.handleClose()
      }
    },
    
    /**
     * 处理关闭事件
     */
    handleClose() {
      this.$emit('close')
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>
.loading-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.loading-inline {
  width: 100%;
  min-height: 100px;
}

.loading-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
}

.loading-dark .loading-backdrop {
  background-color: rgba(0, 0, 0, 0.6);
}

.loading-content {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 24px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  z-index: 10000;
}

.loading-dark .loading-content {
  background-color: #262626;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.loading-custom-size {
  padding: 16px 20px;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

/* 自定义点状加载动画 */
.custom-spinner {
  display: flex;
  gap: 4px;
}

.spinner-dot {
  width: 8px;
  height: 8px;
  background-color: currentColor;
  border-radius: 50%;
  animation: spinner-bounce 1.4s infinite ease-in-out;
}

.spinner-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.spinner-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes spinner-bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-text {
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
  white-space: nowrap;
}

.loading-dark .loading-text {
  color: #fff;
}

.loading-progress-container {
  width: 100%;
  height: 4px;
  background-color: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 10px;
}

.loading-dark .loading-progress-container {
  background-color: #434343;
}

.loading-progress-bar {
  height: 100%;
  background-color: currentColor;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.loading-close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 16px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 2px;
  transition: all 0.2s;
}

.loading-close-btn:hover {
  color: #333;
  background-color: #f5f5f5;
}

.loading-dark .loading-close-btn {
  color: #666;
}

.loading-dark .loading-close-btn:hover {
  color: #fff;
  background-color: #434343;
}

/* 过渡动画 */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

.loading-fade-enter-active .loading-content,
.loading-fade-leave-active .loading-content {
  transition: transform 0.3s ease;
}

.loading-fade-enter-from .loading-content {
  transform: scale(0.9);
}

.loading-fade-leave-to .loading-content {
  transform: scale(0.9);
}
</style>