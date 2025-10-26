<template>
  <div 
    class="loading-container"
    :class="{
      'full-screen': fullScreen,
      'overlay': overlay,
      'inline': !fullScreen && !overlay,
      [size]: true
    }"
  >
    <!-- 加载图标 -->
    <div class="loading-spinner" :class="{
      'custom-color': !!color,
      'custom-size': !!customSize
    }" :style="spinnerStyle">
      <div v-if="spinnerType === 'circular'" class="circular-spinner">
        <svg class="circular" viewBox="25 25 50 50">
          <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4"/>
        </svg>
      </div>
      <div v-else-if="spinnerType === 'dots'" class="dots-spinner">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
      <div v-else-if="spinnerType === 'wave'" class="wave-spinner">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </div>
      <div v-else-if="spinnerType === 'cube'" class="cube-spinner">
        <div class="cube"></div>
      </div>
      <div v-else-if="spinnerType === 'pulse'" class="pulse-spinner"></div>
      <div v-else-if="spinnerType === 'custom' && customSpinner" class="custom-spinner">
        <slot name="spinner"></slot>
      </div>
      <div v-else class="default-spinner">
        <svg class="circular" viewBox="25 25 50 50">
          <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4"/>
        </svg>
      </div>
    </div>

    <!-- 加载文本 -->
    <div v-if="showText && text" class="loading-text" :style="{
      color: color || '#1890ff',
      fontSize: customTextSize ? `${customTextSize}px` : null
    }">
      {{ text }}
    </div>

    <!-- 加载百分比 -->
    <div v-if="showPercentage" class="loading-percentage" :style="{
      color: color || '#1890ff',
      fontSize: customPercentageSize ? `${customPercentageSize}px` : null
    }">
      {{ percentage }}%
    </div>

    <!-- 自定义内容 -->
    <div v-if="$slots.default" class="loading-content">
      <slot></slot>
    </div>

    <!-- 关闭按钮 (仅overlay模式显示) -->
    <button 
      v-if="overlay && showCloseButton" 
      class="close-button" 
      @click="handleClose"
      :style="{
        color: color || '#1890ff'
      }"
    >
      <i class="close-icon"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  
  props: {
    // 是否全屏显示
    fullScreen: {
      type: Boolean,
      default: false
    },
    // 是否显示遮罩层
    overlay: {
      type: Boolean,
      default: false
    },
    // 加载图标颜色
    color: {
      type: String,
      default: ''
    },
    // 加载文本
    text: {
      type: String,
      default: '加载中...'
    },
    // 是否显示文本
    showText: {
      type: Boolean,
      default: true
    },
    // 尺寸 (small, medium, large)
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    // 自定义尺寸 (覆盖size属性)
    customSize: {
      type: Number,
      default: 0
    },
    // 自定义文本尺寸
    customTextSize: {
      type: Number,
      default: 0
    },
    // 自定义百分比尺寸
    customPercentageSize: {
      type: Number,
      default: 0
    },
    // 加载动画类型
    spinnerType: {
      type: String,
      default: 'circular',
      validator: value => ['circular', 'dots', 'wave', 'cube', 'pulse', 'custom'].includes(value)
    },
    // 是否使用自定义加载图标
    customSpinner: {
      type: Boolean,
      default: false
    },
    // 是否显示百分比
    showPercentage: {
      type: Boolean,
      default: false
    },
    // 当前百分比
    percentage: {
      type: Number,
      default: 0,
      validator: value => value >= 0 && value <= 100
    },
    // 是否显示关闭按钮 (仅overlay模式有效)
    showCloseButton: {
      type: Boolean,
      default: false
    },
    // 背景色 (仅overlay/fullScreen模式有效)
    backgroundColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.8)'
    },
    // z-index值 (仅overlay/fullScreen模式有效)
    zIndex: {
      type: Number,
      default: 1000
    }
  },
  
  computed: {
    // 加载图标样式
    spinnerStyle() {
      const style = {}
      
      // 设置自定义尺寸
      if (this.customSize) {
        style.width = `${this.customSize}px`
        style.height = `${this.customSize}px`
      }
      
      // 设置颜色
      if (this.color) {
        style.color = this.color
      }
      
      return style
    },
    
    // 容器样式
    containerStyle() {
      const style = {}
      
      // 仅在overlay或fullScreen模式下应用
      if (this.overlay || this.fullScreen) {
        style.backgroundColor = this.backgroundColor
        style.zIndex = this.zIndex
      }
      
      return style
    }
  },
  
  methods: {
    // 处理关闭事件
    handleClose() {
      this.$emit('close')
    },
    
    // 设置百分比
    setPercentage(value) {
      if (value >= 0 && value <= 100) {
        this.$emit('update:percentage', value)
      }
    },
    
    // 完成加载 (触发complete事件)
    complete() {
      this.$emit('complete')
    }
  },
  
  mounted() {
    // 可以在这里添加一些初始化逻辑
  },
  
  beforeDestroy() {
    // 清理逻辑
  }
}
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 全屏模式 */
.loading-container.full-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: rgba(255, 255, 255, 0.8);
}

/* 遮罩模式 */
.loading-container.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.8);
}

/* 行内模式 */
.loading-container.inline {
  padding: 20px;
}

/* 尺寸变体 */
.loading-container.small .loading-spinner {
  width: 20px;
  height: 20px;
}

.loading-container.medium .loading-spinner {
  width: 32px;
  height: 32px;
}

.loading-container.large .loading-spinner {
  width: 48px;
  height: 48px;
}

/* 加载文本样式 */
.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #1890ff;
  white-space: nowrap;
}

/* 百分比样式 */
.loading-percentage {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #1890ff;
}

/* 自定义内容样式 */
.loading-content {
  margin-top: 16px;
  text-align: center;
  max-width: 300px;
}

/* 关闭按钮 */
.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #1890ff;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* 圆形加载动画 */
.circular-spinner {
  width: 100%;
  height: 100%;
}

.circular {
  animation: rotate 2s linear infinite;
  width: 100%;
  height: 100%;
}

.path {
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;
  animation: dash 1.5s ease-in-out infinite;
  stroke-linecap: round;
  stroke: #1890ff;
}

/* 点加载动画 */
.dots-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  width: 100%;
  height: 100%;
}

.dots-spinner .dot {
  width: 25%;
  height: 25%;
  background-color: #1890ff;
  border-radius: 50%;
  animation: dots 1.4s infinite ease-in-out both;
}

.dots-spinner .dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dots-spinner .dot:nth-child(2) {
  animation-delay: -0.16s;
}

/* 波浪加载动画 */
.wave-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
  width: 100%;
  height: 100%;
}

.wave-spinner .bar {
  width: 15%;
  height: 100%;
  background-color: #1890ff;
  animation: wave 1.2s ease-in-out infinite;
}

.wave-spinner .bar:nth-child(1) { animation-delay: -1.2s; }
.wave-spinner .bar:nth-child(2) { animation-delay: -1.1s; }
.wave-spinner .bar:nth-child(3) { animation-delay: -1.0s; }
.wave-spinner .bar:nth-child(4) { animation-delay: -0.9s; }
.wave-spinner .bar:nth-child(5) { animation-delay: -0.8s; }

/* 立方体加载动画 */
.cube-spinner {
  width: 100%;
  height: 100%;
}

.cube-spinner .cube {
  width: 100%;
  height: 100%;
  background-color: #1890ff;
  animation: cube 2s infinite ease-in-out;
}

/* 脉冲加载动画 */
.pulse-spinner {
  width: 100%;
  height: 100%;
  background-color: #1890ff;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

/* 自定义加载图标 */
.custom-spinner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 自定义颜色 */
.loading-spinner.custom-color .path,
.loading-spinner.custom-color .dot,
.loading-spinner.custom-color .bar,
.loading-spinner.custom-color .cube,
.loading-spinner.custom-color.pulse-spinner {
  color: inherit !important;
  background-color: inherit !important;
  stroke: inherit !important;
}

/* 动画定义 */
@keyframes rotate {
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 100, 200;
    stroke-dashoffset: -15;
  }
  100% {
    stroke-dasharray: 100, 200;
    stroke-dashoffset: -120;
  }
}

@keyframes dots {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

@keyframes wave {
  0%, 40%, 100% { transform: scaleY(0.4); }
  20% { transform: scaleY(1); }
}

@keyframes cube {
  0% { transform: perspective(120px) rotateX(0deg) rotateY(0deg); }
  50% { transform: perspective(120px) rotateX(-180deg) rotateY(0deg); }
  100% { transform: perspective(120px) rotateX(-180deg) rotateY(-180deg); }
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 1; }
  50% { transform: scale(1); opacity: 0.7; }
  100% { transform: scale(0.8); opacity: 1; }
}

/* 图标样式 */
.close-icon::before { content: '✕'; }
</style>