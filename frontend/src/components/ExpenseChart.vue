<template>
  <div class="expense-chart-container">
    <!-- 图表标题 -->
    <div v-if="title" class="chart-title">
      {{ title }}
      <!-- 图表类型切换 -->
      <div v-if="chartTypes && chartTypes.length > 1" class="chart-type-switcher">
        <button
          v-for="type in chartTypes"
          :key="type.value"
          class="type-button"
          :class="{ active: currentType === type.value }"
          @click="switchChartType(type.value)"
        >
          {{ type.label }}
        </button>
      </div>
    </div>

    <!-- 图表容器 -->
    <div 
      class="chart-wrapper"
      :class="{
        'loading': loading,
        'error': hasError
      }"
      ref="chartContainer"
    >
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <div class="loading-text">{{ loadingText || '加载中...' }}</div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="hasError" class="error-state">
        <div class="error-icon"></div>
        <div class="error-text">{{ errorMessage || '图表加载失败' }}</div>
        <button v-if="showRetry" class="retry-button" @click="$emit('retry')">
          重试
        </button>
      </div>

      <!-- 空数据状态 -->
      <div v-else-if="!hasData" class="empty-state">
        <div class="empty-icon"></div>
        <div class="empty-text">{{ emptyText || '暂无数据' }}</div>
      </div>

      <!-- 图表主体 -->
      <div v-else class="chart-content">
        <div 
          :style="{ width: chartWidth, height: chartHeight }"
          ref="chartCanvas"
        ></div>

        <!-- 图例 -->
        <div v-if="showLegend" class="chart-legend">
          <div 
            v-for="(item, index) in legendData" 
            :key="index"
            class="legend-item"
          >
            <div 
              class="legend-color"
              :style="{ backgroundColor: item.color }"
            ></div>
            <div class="legend-label">{{ item.name }}</div>
            <div v-if="item.value" class="legend-value">{{ formatValue(item.value) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表提示信息 -->
    <div v-if="tooltip" class="chart-tooltip">
      {{ tooltip }}
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts/core'
import {
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  VisualMapComponent,
  ToolboxComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { formatCurrency } from '../utils/formatters'

// 注册必须的组件
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  VisualMapComponent,
  ToolboxComponent,
  CanvasRenderer
])

export default {
  name: 'ExpenseChart',
  
  props: {
    // 图表类型：pie, bar, line, radar, scatter
    type: {
      type: String,
      default: 'pie',
      validator: (value) => ['pie', 'bar', 'line', 'radar', 'scatter'].includes(value)
    },
    
    // 图表数据
    data: {
      type: [Array, Object],
      default: () => []
    },
    
    // 图表标题
    title: {
      type: String,
      default: ''
    },
    
    // 图表宽度
    width: {
      type: [Number, String],
      default: '100%'
    },
    
    // 图表高度
    height: {
      type: [Number, String],
      default: 300
    },
    
    // 是否显示图例
    showLegend: {
      type: Boolean,
      default: true
    },
    
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    
    // 错误状态
    error: {
      type: Boolean,
      default: false
    },
    
    // 错误信息
    errorMessage: {
      type: String,
      default: ''
    },
    
    // 加载文本
    loadingText: {
      type: String,
      default: ''
    },
    
    // 空数据文本
    emptyText: {
      type: String,
      default: ''
    },
    
    // 提示信息
    tooltip: {
      type: String,
      default: ''
    },
    
    // 是否显示重试按钮
    showRetry: {
      type: Boolean,
      default: true
    },
    
    // 图表配置项
    options: {
      type: Object,
      default: () => ({})
    },
    
    // 图表类型切换选项
    chartTypes: {
      type: Array,
      default: () => []
    },
    
    // 是否响应式
    responsive: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      // 图表实例
      chart: null,
      // 当前图表类型
      currentType: this.type,
      // 颜色配置
      chartColors: [
        '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
        '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#fadb14'
      ],
      // 响应式监听器
      resizeObserver: null
    }
  },
  
  computed: {
    // 图表宽度
    chartWidth() {
      return typeof this.width === 'number' ? `${this.width}px` : this.width
    },
    
    // 图表高度
    chartHeight() {
      return typeof this.height === 'number' ? `${this.height}px` : this.height
    },
    
    // 是否有数据
    hasData() {
      if (Array.isArray(this.data)) {
        return this.data.length > 0
      } else if (typeof this.data === 'object') {
        return Object.keys(this.data).length > 0
      }
      return false
    },
    
    // 是否有错误
    hasError() {
      return this.error
    },
    
    // 图例数据
    legendData() {
      if (!this.hasData) return []
      
      if (this.currentType === 'pie') {
        return this.data.map((item, index) => ({
          name: item.name || item.label || `项目${index + 1}`,
          value: item.value,
          color: this.chartColors[index % this.chartColors.length]
        }))
      }
      
      return []
    }
  },
  
  watch: {
    // 监听数据变化
    data: {
      handler() {
        this.$nextTick(() => {
          this.updateChart()
        })
      },
      deep: true
    },
    
    // 监听类型变化
    currentType(newType) {
      this.$nextTick(() => {
        this.updateChart()
      })
    },
    
    // 监听配置项变化
    options: {
      handler() {
        this.$nextTick(() => {
          this.updateChart()
        })
      },
      deep: true
    },
    
    // 监听尺寸变化
    width() {
      this.$nextTick(() => {
        this.resizeChart()
      })
    },
    height() {
      this.$nextTick(() => {
        this.resizeChart()
      })
    }
  },
  
  mounted() {
    this.$nextTick(() => {
      this.initChart()
      this.setupResponsive()
    })
  },
  
  beforeUnmount() {
    this.destroyChart()
    this.cleanupResponsive()
  },
  
  methods: {
    // 初始化图表
    initChart() {
      if (!this.$refs.chartCanvas) return
      
      try {
        // 创建图表实例
        this.chart = echarts.init(this.$refs.chartCanvas)
        
        // 设置初始配置
        this.updateChart()
        
        // 监听点击事件
        this.chart.on('click', (params) => {
          this.$emit('click', params)
        })
        
        // 监听hover事件
        this.chart.on('mouseover', (params) => {
          this.$emit('hover', params)
        })
        
        this.chart.on('mouseout', (params) => {
          this.$emit('mouseout', params)
        })
      } catch (error) {
        console.error('初始化图表失败:', error)
        this.$emit('error', error)
      }
    },
    
    // 更新图表
    updateChart() {
      if (!this.chart || this.loading || this.hasError || !this.hasData) return
      
      try {
        const options = this.generateChartOptions()
        this.chart.setOption(options, true)
      } catch (error) {
        console.error('更新图表失败:', error)
        this.$emit('error', error)
      }
    },
    
    // 生成图表配置项
    generateChartOptions() {
      let options = {
        color: this.chartColors,
        ...this.options
      }
      
      // 根据图表类型生成不同的配置
      switch (this.currentType) {
        case 'pie':
          options = this.generatePieOptions(options)
          break
        case 'bar':
          options = this.generateBarOptions(options)
          break
        case 'line':
          options = this.generateLineOptions(options)
          break
        case 'radar':
          options = this.generateRadarOptions(options)
          break
        case 'scatter':
          options = this.generateScatterOptions(options)
          break
      }
      
      return options
    },
    
    // 生成饼图配置
    generatePieOptions(baseOptions) {
      return {
        ...baseOptions,
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          show: this.showLegend
        },
        series: [
          {
            name: this.title || '费用统计',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 4,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
                fontWeight: 'bold'
              },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            labelLine: {
              show: false
            },
            data: this.data
          }
        ]
      }
    },
    
    // 生成柱状图配置
    generateBarOptions(baseOptions) {
      // 提取数据
      const categories = this.data.map(item => item.name || item.label)
      const values = this.data.map(item => item.value)
      
      return {
        ...baseOptions,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: categories,
          axisLabel: {
            interval: 0,
            rotate: categories.length > 6 ? 30 : 0
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: this.title || '费用统计',
            type: 'bar',
            barWidth: '60%',
            data: values,
            itemStyle: {
              borderRadius: [4, 4, 0, 0]
            }
          }
        ]
      }
    },
    
    // 生成折线图配置
    generateLineOptions(baseOptions) {
      // 提取数据
      const categories = this.data.map(item => item.name || item.label)
      const values = this.data.map(item => item.value)
      
      return {
        ...baseOptions,
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: categories
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: this.title || '费用统计',
            type: 'line',
            smooth: true,
            data: values,
            areaStyle: {
              opacity: 0.3
            },
            lineStyle: {
              width: 3
            },
            itemStyle: {
              borderRadius: 4
            }
          }
        ]
      }
    },
    
    // 生成雷达图配置
    generateRadarOptions(baseOptions) {
      // 提取数据
      const indicators = this.data.map(item => ({
        name: item.name || item.label,
        max: this.calculateMaxValue()
      }))
      const values = this.data.map(item => item.value)
      
      return {
        ...baseOptions,
        tooltip: {},
        radar: {
          indicator: indicators,
          radius: '65%'
        },
        series: [
          {
            name: this.title || '费用统计',
            type: 'radar',
            data: [
              {
                value: values,
                name: '费用分布',
                areaStyle: {
                  opacity: 0.3
                }
              }
            ]
          }
        ]
      }
    },
    
    // 生成散点图配置
    generateScatterOptions(baseOptions) {
      return {
        ...baseOptions,
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            return `${params.data[0]}, ${params.data[1]}`
          }
        },
        xAxis: {
          type: 'value',
          scale: true
        },
        yAxis: {
          type: 'value',
          scale: true
        },
        series: [
          {
            name: this.title || '费用统计',
            type: 'scatter',
            symbolSize: 8,
            data: this.data
          }
        ]
      }
    },
    
    // 切换图表类型
    switchChartType(type) {
      this.currentType = type
      this.$emit('type-change', type)
    },
    
    // 调整图表大小
    resizeChart() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    
    // 设置响应式
    setupResponsive() {
      if (!this.responsive) return
      
      if (window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver(() => {
          this.resizeChart()
        })
        this.resizeObserver.observe(this.$refs.chartContainer)
      } else {
        // 降级方案：使用窗口大小变化事件
        window.addEventListener('resize', this.resizeChart)
      }
    },
    
    // 清理响应式
    cleanupResponsive() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
        this.resizeObserver = null
      } else {
        window.removeEventListener('resize', this.resizeChart)
      }
    },
    
    // 销毁图表
    destroyChart() {
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
    },
    
    // 格式化数值
    formatValue(value) {
      if (typeof value === 'number') {
        // 尝试作为货币格式化
        return formatCurrency(value)
      }
      return value
    },
    
    // 计算最大值（用于雷达图等）
    calculateMaxValue() {
      if (!this.data || this.data.length === 0) return 100
      
      const max = Math.max(...this.data.map(item => item.value || 0))
      // 返回略大的整数值
      return Math.ceil(max * 1.2)
    },
    
    // 导出图表数据
    exportData() {
      if (!this.chart) return null
      
      try {
        return {
          type: this.currentType,
          data: this.data,
          options: this.chart.getOption()
        }
      } catch (error) {
        console.error('导出图表数据失败:', error)
        return null
      }
    },
    
    // 重新渲染图表
    reRender() {
      this.destroyChart()
      this.$nextTick(() => {
        this.initChart()
      })
    },
    
    // 聚焦到特定数据项
    focusOn(index) {
      if (!this.chart) return
      
      try {
        this.chart.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          dataIndex: index
        })
      } catch (error) {
        console.error('聚焦数据项失败:', error)
      }
    },
    
    // 取消聚焦
    cancelFocus() {
      if (!this.chart) return
      
      try {
        this.chart.dispatchAction({
          type: 'downplay',
          seriesIndex: 0
        })
      } catch (error) {
        console.error('取消聚焦失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.expense-chart-container {
  width: 100%;
  position: relative;
}

.chart-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.chart-type-switcher {
  display: flex;
  gap: 8px;
}

.type-button {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  background-color: #fff;
  color: rgba(0, 0, 0, 0.65);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.type-button:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

.type-button.active {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.chart-wrapper {
  position: relative;
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.chart-wrapper.loading,
.chart-wrapper.error {
  border: 1px dashed #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-content {
  width: 100%;
  height: 100%;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-label {
  color: rgba(0, 0, 0, 0.65);
}

.legend-value {
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
}

.chart-tooltip {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.loading-text {
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  padding: 20px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 12px;
  color: #f5222d;
}

.error-text {
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
}

.retry-button {
  padding: 4px 16px;
  border: 1px solid #d9d9d9;
  background-color: #fff;
  color: #1890ff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.retry-button:hover {
  border-color: #1890ff;
  background-color: #e6f7ff;
}

/* 空数据状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  color: #d9d9d9;
}

.empty-text {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 图标样式 */
.error-icon::before {
  content: '⚠️';
}

.empty-icon::before {
  content: '📊';
}
</style>