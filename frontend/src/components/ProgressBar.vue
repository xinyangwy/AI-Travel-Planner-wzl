<template>
  <div 
    class="progress-container"
    :class="{
      'progress-container-inverse': inverse,
      'progress-container-stacked': stacked,
      [`progress-container-${size}`]: size !== 'medium'
    }"
    :style="containerStyle"
  >
    <!-- 标签文本 -->
    <div v-if="showLabel || label" class="progress-label">
      <span v-if="label" class="progress-label-text">{{ label }}</span>
      <span v-if="showPercent" class="progress-percent">
        {{ formattedPercent }}
      </span>
    </div>
    
    <!-- 进度条容器 -->
    <div 
      class="progress-bar"
      :class="{
        [`progress-bar-${status}`]: status !== 'default',
        'progress-bar-striped': striped,
        'progress-bar-animated': animated && !loading,
        'progress-bar-loading': loading
      }"
      :style="{
        ...barStyle,
        height: `${height}px`
      }"
      :role="'progressbar'"
      :aria-valuenow="currentPercent"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-label="`进度 ${currentPercent}%`"
    >
      <!-- 单进度条模式 -->
      <div 
        v-if="!stacked"
        class="progress-bar-fill"
        :class="{
          [`progress-bar-fill-${status}`]: status !== 'default',
          'progress-bar-fill-striped': striped,
          'progress-bar-fill-animated': animated && !loading,
          'progress-bar-fill-loading': loading
        }"
        :style="fillStyle"
      >
        <!-- 内部标签 -->
        <div v-if="showInnerLabel" class="progress-inner-label">
          {{ formattedPercent }}
        </div>
      </div>
      
      <!-- 堆叠进度条模式 -->
      <div v-else class="progress-stacked-bars">
        <div
          v-for="(item, index) in stackedItems"
          :key="index"
          class="progress-stacked-bar"
          :class="{
            [`progress-stacked-bar-${item.status || 'default'}`]: true,
            'progress-stacked-bar-striped': item.striped || striped,
            'progress-stacked-bar-animated': item.animated || (animated && !loading)
          }"
          :style="{
            width: `${item.percent}%`,
            backgroundColor: item.color
          }"
          :aria-valuenow="item.percent"
          :aria-label="`子进度 ${index + 1}: ${item.percent}%`"
        >
          <div 
            v-if="showInnerLabel" 
            class="progress-stacked-bar-label"
          >
            {{ item.label || `${item.percent}%` }}
          </div>
        </div>
      </div>
      
      <!-- 加载指示器 -->
      <div v-if="loading" class="progress-loading-indicator">
        <div class="progress-loading-dots">
          <span class="progress-loading-dot"></span>
          <span class="progress-loading-dot"></span>
          <span class="progress-loading-dot"></span>
        </div>
      </div>
    </div>
    
    <!-- 描述文本 -->
    <div v-if="description" class="progress-description">
      {{ description }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',
  
  props: {
    // 当前进度值 (0-100)
    percent: {
      type: Number,
      default: 0,
      validator: (value) => value >= 0 && value <= 100
    },
    
    // 进度条状态
    status: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'success', 'warning', 'error', 'info'].includes(value)
    },
    
    // 进度条高度
    height: {
      type: Number,
      default: 8
    },
    
    // 是否显示百分比
    showPercent: {
      type: Boolean,
      default: false
    },
    
    // 是否显示标签
    showLabel: {
      type: Boolean,
      default: false
    },
    
    // 自定义标签文本
    label: {
      type: String,
      default: ''
    },
    
    // 描述文本
    description: {
      type: String,
      default: ''
    },
    
    // 是否为加载状态
    loading: {
      type: Boolean,
      default: false
    },
    
    // 是否显示条纹
    striped: {
      type: Boolean,
      default: false
    },
    
    // 是否为动画进度条
    animated: {
      type: Boolean,
      default: false
    },
    
    // 是否反转颜色
    inverse: {
      type: Boolean,
      default: false
    },
    
    // 是否堆叠模式
    stacked: {
      type: Boolean,
      default: false
    },
    
    // 堆叠项目列表
    stackedItems: {
      type: Array,
      default: () => []
    },
    
    // 是否显示内部标签
    showInnerLabel: {
      type: Boolean,
      default: false
    },
    
    // 进度条大小
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    
    // 自定义容器样式
    containerStyle: {
      type: Object,
      default: () => ({})
    },
    
    // 自定义进度条样式
    barStyle: {
      type: Object,
      default: () => ({})
    },
    
    // 自定义填充样式
    fillStyle: {
      type: Object,
      default: () => ({})
    },
    
    // 动画持续时间
    animationDuration: {
      type: Number,
      default: 0.3
    },
    
    // 是否可点击交互
    interactive: {
      type: Boolean,
      default: false
    },
    
    // 唯一标识
    id: {
      type: String,
      default: () => `progress-bar-${Date.now()}`
    }
  },
  
  data() {
    return {
      // 当前显示的进度值（用于动画过渡）
      displayPercent: 0
    }
  },
  
  computed: {
    // 当前进度值
    currentPercent() {
      // 限制在0-100之间
      return Math.min(Math.max(Number(this.percent) || 0, 0), 100)
    },
    
    // 格式化的百分比文本
    formattedPercent() {
      return `${Math.round(this.currentPercent)}%`
    },
    
    // 计算填充样式
    computedFillStyle() {
      const baseStyle = {
        width: `${this.displayPercent}%`,
        transition: `width ${this.animationDuration}s ease-in-out`
      }
      
      // 合并用户自定义样式
      return { ...baseStyle, ...this.fillStyle }
    }
  },
  
  watch: {
    // 监听进度值变化，实现平滑过渡动画
    currentPercent(newVal) {
      this.animateProgress(newVal)
    }
  },
  
  mounted() {
    // 初始化进度条
    this.$nextTick(() => {
      this.displayPercent = this.currentPercent
    })
  },
  
  methods: {
    // 动画过渡到目标进度
    animateProgress(targetPercent) {
      const startPercent = this.displayPercent
      const diff = targetPercent - startPercent
      const duration = this.animationDuration * 1000 // 转换为毫秒
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // 使用缓动函数
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        this.displayPercent = startPercent + diff * easeOutQuart
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          this.displayPercent = targetPercent
        }
      }
      
      requestAnimationFrame(animate)
    },
    
    // 处理点击事件
    handleClick(event) {
      if (this.interactive && !this.loading) {
        const rect = this.$el.querySelector('.progress-bar').getBoundingClientRect()
        const x = event.clientX - rect.left
        const width = rect.width
        const newPercent = Math.min(Math.max(Math.round((x / width) * 100), 0), 100)
        
        this.$emit('update:percent', newPercent)
        this.$emit('change', newPercent, event)
      }
    },
    
    // 重置进度条
    reset() {
      this.displayPercent = 0
      this.$emit('update:percent', 0)
    },
    
    // 设置进度条到指定值
    setProgress(value) {
      const validValue = Math.min(Math.max(Number(value) || 0, 0), 100)
      this.$emit('update:percent', validValue)
    },
    
    // 增加进度
    increment(amount = 1) {
      const newValue = Math.min(this.currentPercent + amount, 100)
      this.$emit('update:percent', newValue)
    },
    
    // 减少进度
    decrement(amount = 1) {
      const newValue = Math.max(this.currentPercent - amount, 0)
      this.$emit('update:percent', newValue)
    }
  }
}
</script>

<style scoped>
/* 进度条容器 */
.progress-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

/* 尺寸变体 */
.progress-container-small {
  gap: 4px;
}

.progress-container-large {
  gap: 12px;
}

/* 反向模式 */
.progress-container-inverse {
  --progress-bg: rgba(255, 255, 255, 0.1);
  --progress-text: #fff;
}

/* 标签样式 */
.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--progress-text, #333);
}

.progress-label-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}

.progress-percent {
  font-weight: 600;
  color: var(--progress-text, #666);
}

/* 进度条基础样式 */
.progress-bar {
  position: relative;
  width: 100%;
  background-color: var(--progress-bg, #f0f0f0);
  border-radius: calc(var(--progress-height, 8px) / 2);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

/* 进度条状态颜色 */
.progress-bar-default .progress-bar-fill {
  background-color: #1890ff;
}

.progress-bar-success .progress-bar-fill {
  background-color: #52c41a;
}

.progress-bar-warning .progress-bar-fill {
  background-color: #fa8c16;
}

.progress-bar-error .progress-bar-fill {
  background-color: #f5222d;
}

.progress-bar-info .progress-bar-fill {
  background-color: #722ed1;
}

/* 进度条填充 */
.progress-bar-fill {
  position: relative;
  height: 100%;
  min-width: 2px;
  border-radius: inherit;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  transition: width 0.3s ease;
}

/* 条纹样式 */
.progress-bar-striped .progress-bar-fill {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 20px 20px;
}

/* 动画条纹 */
.progress-bar-animated .progress-bar-fill {
  animation: progress-stripes 1s linear infinite;
}

/* 内部标签 */
.progress-inner-label {
  position: absolute;
  right: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

/* 堆叠进度条 */
.progress-stacked-bars {
  display: flex;
  height: 100%;
}

.progress-stacked-bar {
  position: relative;
  height: 100%;
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-stacked-bar-label {
  font-size: 10px;
  font-weight: 500;
  color: #fff;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}

/* 堆叠进度条状态颜色 */
.progress-stacked-bar-default {
  background-color: #d9d9d9;
}

.progress-stacked-bar-success {
  background-color: #52c41a;
}

.progress-stacked-bar-warning {
  background-color: #fa8c16;
}

.progress-stacked-bar-error {
  background-color: #f5222d;
}

.progress-stacked-bar-info {
  background-color: #722ed1;
}

/* 加载状态 */
.progress-bar-loading .progress-bar-fill {
  opacity: 0.6;
}

.progress-loading-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-loading-dots {
  display: flex;
  gap: 4px;
}

.progress-loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  animation: progress-loading-bounce 1.4s ease-in-out infinite both;
}

.progress-loading-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.progress-loading-dot:nth-child(2) {
  animation-delay: -0.16s;
}

/* 描述文本 */
.progress-description {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

/* 动画效果 */
@keyframes progress-stripes {
  0% {
    background-position: 20px 0;
  }
  100% {
    background-position: 0 0;
  }
}

@keyframes progress-loading-bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .progress-label {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .progress-label-text {
    max-width: 100%;
  }
  
  .progress-inner-label {
    display: none;
  }
}
</style>