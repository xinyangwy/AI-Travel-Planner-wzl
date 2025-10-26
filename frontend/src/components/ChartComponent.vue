<template>
  <div 
    class="chart-container"
    :class="{
      'chart-container-loading': loading,
      'chart-container-error': error,
      'chart-container-responsive': responsive
    }"
    :style="containerStyle"
  >
    <!-- 图表标题 -->
    <div v-if="title || subtitle" class="chart-header">
      <h3 v-if="title" class="chart-title">{{ title }}</h3>
      <p v-if="subtitle" class="chart-subtitle">{{ subtitle }}</p>
    </div>
    
    <!-- 图表主体 -->
    <div class="chart-wrapper">
      <!-- 加载状态 -->
      <div v-if="loading" class="chart-loading">
        <div class="chart-loading-spinner"></div>
        <p class="chart-loading-text">{{ loadingText || '加载中...' }}</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="chart-error">
        <div class="chart-error-icon"></div>
        <p class="chart-error-text">{{ errorText || '图表加载失败' }}</p>
        <button v-if="retryable" class="chart-retry-button" @click="handleRetry">
          {{ retryText || '重试' }}
        </button>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="isEmptyData" class="chart-empty">
        <div class="chart-empty-icon"></div>
        <p class="chart-empty-text">{{ emptyText || '暂无数据' }}</p>
      </div>
      
      <!-- 图表容器 -->
      <div v-else class="chart-canvas-container">
        <canvas 
          ref="chartCanvas"
          :width="canvasWidth"
          :height="canvasHeight"
          :style="canvasStyle"
        ></canvas>
      </div>
    </div>
    
    <!-- 图表图例 -->
    <div v-if="showLegend && !loading && !error && !isEmptyData" class="chart-legend">
      <div 
        v-for="(legendItem, index) in legendItems" 
        :key="index"
        class="chart-legend-item"
        :class="{'chart-legend-item-active': legendItem.active !== false}"
        @click="handleLegendClick(legendItem, index)"
      >
        <div 
          class="chart-legend-color"
          :style="{backgroundColor: legendItem.color || getDefaultColor(index)}"
          :class="`chart-legend-color-${chartType}`"
        ></div>
        <span class="chart-legend-text">{{ legendItem.label || `系列 ${index + 1}` }}</span>
      </div>
    </div>
    
    <!-- 图表备注 -->
    <div v-if="note" class="chart-note">
      {{ note }}
    </div>
    
    <!-- 图表工具提示 -->
    <div 
      v-if="tooltip.show && tooltip.content"
      class="chart-tooltip"
      :class="tooltip.position"
      :style="tooltipStyle"
    >
      <div class="chart-tooltip-content">
        <div v-if="tooltip.title" class="chart-tooltip-title">{{ tooltip.title }}</div>
        <div v-for="(item, index) in tooltip.items" :key="index" class="chart-tooltip-item">
          <span class="chart-tooltip-color" :style="{backgroundColor: item.color}"></span>
          <span class="chart-tooltip-label">{{ item.label }}:</span>
          <span class="chart-tooltip-value">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChartComponent',
  
  props: {
    // 图表类型
    chartType: {
      type: String,
      default: 'bar',
      validator: (value) => [
        'bar', 'line', 'pie', 'doughnut', 'radar', 
        'polarArea', 'bubble', 'scatter', 'mixed'
      ].includes(value)
    },
    
    // 图表数据
    data: {
      type: Object,
      default: () => ({
        labels: [],
        datasets: []
      })
    },
    
    // 图表配置选项
    options: {
      type: Object,
      default: () => ({})
    },
    
    // 图表标题
    title: {
      type: String,
      default: ''
    },
    
    // 图表副标题
    subtitle: {
      type: String,
      default: ''
    },
    
    // 是否显示图例
    showLegend: {
      type: Boolean,
      default: true
    },
    
    // 图例数据
    legendItems: {
      type: Array,
      default: () => []
    },
    
    // 是否响应式
    responsive: {
      type: Boolean,
      default: true
    },
    
    // 画布宽度
    canvasWidth: {
      type: Number,
      default: null
    },
    
    // 画布高度
    canvasHeight: {
      type: Number,
      default: null
    },
    
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    
    // 加载文本
    loadingText: {
      type: String,
      default: '加载中...'
    },
    
    // 错误状态
    error: {
      type: Boolean,
      default: false
    },
    
    // 错误文本
    errorText: {
      type: String,
      default: '图表加载失败'
    },
    
    // 是否可重试
    retryable: {
      type: Boolean,
      default: true
    },
    
    // 重试按钮文本
    retryText: {
      type: String,
      default: '重试'
    },
    
    // 空数据文本
    emptyText: {
      type: String,
      default: '暂无数据'
    },
    
    // 备注信息
    note: {
      type: String,
      default: ''
    },
    
    // 工具提示配置
    tooltip: {
      type: Object,
      default: () => ({
        show: false,
        content: null,
        title: '',
        items: [],
        position: 'top'
      })
    },
    
    // 自定义容器样式
    containerStyle: {
      type: Object,
      default: () => ({})
    },
    
    // 自定义画布样式
    canvasStyle: {
      type: Object,
      default: () => ({})
    },
    
    // 主题颜色
    colors: {
      type: Array,
      default: () => [
        '#1890ff', '#52c41a', '#fa8c16', '#f5222d', 
        '#722ed1', '#13c2c2', '#eb2f96', '#faad14'
      ]
    },
    
    // 唯一标识
    id: {
      type: String,
      default: () => `chart-${Date.now()}`
    }
  },
  
  data() {
    return {
      // 图表实例
      chartInstance: null,
      // 响应式调整的监听器
      resizeObserver: null
    }
  },
  
  computed: {
    // 是否为空数据
    isEmptyData() {
      if (!this.data || (!this.data.labels && !this.data.datasets)) {
        return true
      }
      
      const hasLabels = Array.isArray(this.data.labels) && this.data.labels.length > 0
      const hasDatasets = Array.isArray(this.data.datasets) && 
        this.data.datasets.some(dataset => 
          Array.isArray(dataset.data) && dataset.data.length > 0
        )
      
      return !hasLabels && !hasDatasets
    },
    
    // 工具提示样式
    tooltipStyle() {
      const position = this.tooltip.position || 'top'
      const baseStyle = {}
      
      switch (position) {
        case 'top':
          baseStyle.top = '-10px'
          break
        case 'bottom':
          baseStyle.bottom = '-10px'
          break
        case 'left':
          baseStyle.left = '-10px'
          break
        case 'right':
          baseStyle.right = '-10px'
          break
      }
      
      return baseStyle
    }
  },
  
  watch: {
    // 监听数据变化
    data: {
      handler(newData) {
        this.updateChart()
      },
      deep: true
    },
    
    // 监听配置项变化
    options: {
      handler(newOptions) {
        this.updateChartOptions(newOptions)
      },
      deep: true
    },
    
    // 监听图表类型变化
    chartType(newType) {
      this.destroyChart()
      this.initChart()
    }
  },
  
  mounted() {
    // 初始化图表
    if (!this.loading && !this.error && !this.isEmptyData) {
      this.initChart()
    }
    
    // 设置响应式监听
    if (this.responsive) {
      this.setupResponsiveListener()
    }
  },
  
  beforeUnmount() {
    // 清理图表实例和监听器
    this.destroyChart()
    this.cleanupResponsiveListener()
  },
  
  methods: {
    // 初始化图表
    initChart() {
      if (!this.$refs.chartCanvas) return
      
      // 获取画布上下文
      const ctx = this.$refs.chartCanvas.getContext('2d')
      
      // 合并默认配置和用户配置
      const mergedOptions = this.mergeChartOptions()
      
      // 这里应该使用实际的图表库创建图表实例
      // 这里只是一个示例，具体实现会根据使用的图表库不同而不同
      // 例如使用 Chart.js: new Chart(ctx, { type: this.chartType, data: this.data, options: mergedOptions })
      
      // 模拟图表初始化
      this.$emit('chart-ready', { ctx, options: mergedOptions })
    },
    
    // 更新图表数据
    updateChart() {
      if (!this.chartInstance || !this.$refs.chartCanvas) return
      
      // 这里应该使用实际的图表库更新图表数据
      // 例如使用 Chart.js: this.chartInstance.data = this.data; this.chartInstance.update()
      
      this.$emit('chart-updated')
    },
    
    // 更新图表配置
    updateChartOptions(newOptions) {
      if (!this.chartInstance) return
      
      // 这里应该使用实际的图表库更新图表配置
      // 例如使用 Chart.js: this.chartInstance.options = { ...this.chartInstance.options, ...newOptions }; this.chartInstance.update()
      
      this.$emit('chart-options-updated', newOptions)
    },
    
    // 销毁图表
    destroyChart() {
      if (this.chartInstance) {
        // 这里应该使用实际的图表库销毁图表实例
        // 例如使用 Chart.js: this.chartInstance.destroy()
        this.chartInstance = null
      }
    },
    
    // 合并图表配置
    mergeChartOptions() {
      const defaultOptions = {
        responsive: this.responsive,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: this.showLegend
          }
        }
      }
      
      return { ...defaultOptions, ...this.options }
    },
    
    // 获取默认颜色
    getDefaultColor(index) {
      return this.colors[index % this.colors.length]
    },
    
    // 处理图例点击
    handleLegendClick(item, index) {
      this.$emit('legend-click', item, index)
    },
    
    // 处理重试
    handleRetry() {
      this.$emit('retry')
    },
    
    // 设置响应式监听
    setupResponsiveListener() {
      if (window.ResizeObserver && this.$refs.chartCanvas) {
        this.resizeObserver = new ResizeObserver(() => {
          this.$nextTick(() => {
            this.updateChart()
          })
        })
        
        this.resizeObserver.observe(this.$refs.chartCanvas.parentElement)
      } else {
        // 降级使用窗口大小变化监听
        window.addEventListener('resize', this.handleResize)
      }
    },
    
    // 清理响应式监听
    cleanupResponsiveListener() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
        this.resizeObserver = null
      } else {
        window.removeEventListener('resize', this.handleResize)
      }
    },
    
    // 处理窗口大小变化
    handleResize() {
      this.$nextTick(() => {
        this.updateChart()
      })
    },
    
    // 导出图表为图片
    exportChart() {
      if (!this.$refs.chartCanvas) return null
      
      try {
        return this.$refs.chartCanvas.toDataURL('image/png')
      } catch (e) {
        console.error('导出图表失败:', e)
        this.$emit('export-error', e)
        return null
      }
    },
    
    // 刷新图表
    refreshChart() {
      this.destroyChart()
      this.$nextTick(() => {
        this.initChart()
      })
    }
  }
}
</script>

<style scoped>
/* 图表容器 */
.chart-container {
  position: relative;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 16px;
  transition: all 0.3s ease;
}

/* 响应式容器 */
.chart-container-responsive {
  width: 100%;
}

/* 图表头部 */
.chart-header {
  margin-bottom: 16px;
  text-align: center;
}

.chart-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0 0 4px 0;
}

.chart-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 图表包装器 */
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 300px; /* 默认高度 */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 画布容器 */
.chart-canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 加载状态 */
.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #999;
}

.chart-loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #1890ff;
  animation: spin 0.8s linear infinite;
}

.chart-loading-text {
  font-size: 14px;
  margin: 0;
}

/* 错误状态 */
.chart-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #f5222d;
}

.chart-error-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #fff2f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-error-icon::before {
  content: '!';
  font-size: 20px;
  font-weight: bold;
  color: #f5222d;
}

.chart-error-text {
  font-size: 14px;
  margin: 0;
}

.chart-retry-button {
  padding: 6px 16px;
  background-color: #f5222d;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.chart-retry-button:hover {
  background-color: #ff4d4f;
}

/* 空状态 */
.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #999;
}

.chart-empty-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-empty-icon::before {
  content: '📊';
  font-size: 20px;
}

.chart-empty-text {
  font-size: 14px;
  margin: 0;
}

/* 图例 */
.chart-legend {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.chart-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  user-select: none;
}

.chart-legend-item:hover {
  background-color: #f5f5f5;
}

.chart-legend-item-active {
  opacity: 1;
}

.chart-legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.chart-legend-color-pie,
.chart-legend-color-doughnut {
  border-radius: 50%;
}

.chart-legend-text {
  font-size: 14px;
  color: #666;
}

/* 备注 */
.chart-note {
  margin-top: 12px;
  font-size: 12px;
  color: #999;
  text-align: center;
  font-style: italic;
}

/* 工具提示 */
.chart-tooltip {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
  pointer-events: none;
  white-space: nowrap;
}

.chart-tooltip-title {
  font-weight: 500;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 4px;
}

.chart-tooltip-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.chart-tooltip-color {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.chart-tooltip-label {
  font-weight: 400;
}

.chart-tooltip-value {
  font-weight: 500;
}

/* 动画 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .chart-container {
    padding: 12px;
  }
  
  .chart-wrapper {
    height: 250px;
  }
  
  .chart-legend {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
}
</style>