<template>
  <div class="expense-chart-container">
    <!-- 费用类型分布图表 -->
    <div v-if="type === 'expenseType'" class="type-chart">
      <canvas :ref="chartRef"></canvas>
      <div v-if="data.length === 0" class="empty-chart">
        <el-empty description="暂无数据" :image-size="80"></el-empty>
      </div>
    </div>
    
    <!-- 费用趋势图表 -->
    <div v-else-if="type === 'expenseTrend'" class="trend-chart">
      <canvas :ref="chartRef"></canvas>
      <div v-if="data.length === 0" class="empty-chart">
        <el-empty description="暂无数据" :image-size="80"></el-empty>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'ExpenseChart',
  props: {
    // 图表类型: 'expenseType' | 'expenseTrend'
    type: {
      type: String,
      required: true,
      validator: value => ['expenseType', 'expenseTrend'].includes(value)
    },
    // 费用数据
    data: {
      type: Array,
      default: () => []
    },
    // 时间范围: 'all' | 'month' | 'quarter'
    timeRange: {
      type: String,
      default: 'all'
    },
    // 趋势类型: 'month' | 'day'
    trendType: {
      type: String,
      default: 'month'
    }
  },
  data() {
    return {
      chartRef: 'expenseChart' + Math.random().toString(36).substring(2, 9),
      chart: null,
      // 颜色配置
      colors: [
        '#409EFF', '#67C23A', '#E6A23C', '#F56C6C',
        '#909399', '#C0C4CC', '#909399', '#F0F9EB'
      ]
    }
  },
  computed: {
    // 处理后的图表数据
    chartData() {
      if (!this.data || this.data.length === 0) return []
      
      let filteredData = [...this.data]
      
      // 根据时间范围筛选数据
      if (this.timeRange !== 'all') {
        const now = dayjs()
        if (this.timeRange === 'month') {
          const startOfMonth = now.startOf('month').format('YYYY-MM-DD')
          filteredData = filteredData.filter(item => item.date >= startOfMonth)
        } else if (this.timeRange === 'quarter') {
          const startOfQuarter = now.subtract(3, 'month').format('YYYY-MM-DD')
          filteredData = filteredData.filter(item => item.date >= startOfQuarter)
        }
      }
      
      return filteredData
    }
  },
  watch: {
    // 监听数据变化
    data: {
      handler() {
        this.$nextTick(() => {
          this.renderChart()
        })
      },
      deep: true
    },
    
    // 监听图表类型变化
    type() {
      this.$nextTick(() => {
        this.renderChart()
      })
    },
    
    // 监听时间范围变化
    timeRange() {
      this.$nextTick(() => {
        this.renderChart()
      })
    },
    
    // 监听趋势类型变化
    trendType() {
      if (this.type === 'expenseTrend') {
        this.$nextTick(() => {
          this.renderChart()
        })
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.renderChart()
    })
  },
  beforeDestroy() {
    // 清理图表实例
    if (this.chart) {
      this.chart = null
    }
  },
  methods: {
    // 渲染图表
    renderChart() {
      const canvas = this.$refs[this.chartRef]
      if (!canvas) return
      
      // 获取绘图上下文
      const ctx = canvas.getContext('2d')
      
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 根据图表类型渲染
      if (this.type === 'expenseType') {
        this.renderTypeChart(ctx, canvas.width, canvas.height)
      } else if (this.type === 'expenseTrend') {
        this.renderTrendChart(ctx, canvas.width, canvas.height)
      }
    },
    
    // 渲染费用类型分布图表（饼图）
    renderTypeChart(ctx, width, height) {
      const typeData = this.calculateTypeData()
      if (typeData.length === 0) return
      
      // 设置画布大小
      this.setCanvasSize(ctx.canvas, width, height)
      
      // 饼图参数
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) / 3
      
      let currentAngle = 0
      const total = typeData.reduce((sum, item) => sum + item.value, 0)
      
      // 绘制饼图扇形
      typeData.forEach((item, index) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI
        
        // 绘制扇形
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
        ctx.closePath()
        
        // 设置扇形颜色
        ctx.fillStyle = this.colors[index % this.colors.length]
        ctx.fill()
        
        // 绘制边框
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
        
        // 计算标签位置
        const labelAngle = currentAngle + sliceAngle / 2
        const labelX = centerX + Math.cos(labelAngle) * radius * 0.7
        const labelY = centerY + Math.sin(labelAngle) * radius * 0.7
        
        // 绘制标签文本
        ctx.font = '12px Arial'
        ctx.fillStyle = '#333'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // 只显示大于3%的标签
        const percentage = Math.round((item.value / total) * 100)
        if (percentage >= 3) {
          ctx.fillText(`${percentage}%`, labelX, labelY)
        }
        
        currentAngle += sliceAngle
      })
      
      // 绘制图例
      this.drawTypeLegend(ctx, typeData, width, height)
    },
    
    // 绘制费用类型图例
    drawTypeLegend(ctx, typeData, width, height) {
      const legendX = 20
      const legendY = height - 20 - typeData.length * 25
      const itemHeight = 20
      
      typeData.forEach((item, index) => {
        const y = legendY + index * itemHeight
        
        // 绘制颜色块
        ctx.fillStyle = this.colors[index % this.colors.length]
        ctx.fillRect(legendX, y, 15, 15)
        
        // 绘制边框
        ctx.strokeStyle = '#ddd'
        ctx.lineWidth = 1
        ctx.strokeRect(legendX, y, 15, 15)
        
        // 绘制标签文本
        const total = typeData.reduce((sum, i) => sum + i.value, 0)
        const percentage = Math.round((item.value / total) * 100)
        const label = `${this.getTypeName(item.name)}: ¥${item.value.toFixed(2)} (${percentage}%)`
        
        ctx.font = '12px Arial'
        ctx.fillStyle = '#606266'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, legendX + 25, y + 7)
      })
    },
    
    // 渲染费用趋势图表（折线图）
    renderTrendChart(ctx, width, height) {
      const trendData = this.calculateTrendData()
      if (trendData.length === 0) return
      
      // 设置画布大小
      this.setCanvasSize(ctx.canvas, width, height)
      
      // 图表边距
      const padding = { top: 30, right: 30, bottom: 40, left: 60 }
      const chartWidth = width - padding.left - padding.right
      const chartHeight = height - padding.top - padding.bottom
      
      // 找出最大值
      const maxValue = Math.max(...trendData.map(item => item.value), 100)
      
      // 绘制坐标轴
      this.drawAxis(ctx, width, height, padding, chartWidth, chartHeight, maxValue)
      
      // 绘制网格线
      this.drawGrid(ctx, width, height, padding, chartWidth, chartHeight, maxValue, trendData.length)
      
      // 绘制折线
      this.drawTrendLine(ctx, padding, chartWidth, chartHeight, trendData, maxValue)
      
      // 绘制数据点
      this.drawTrendPoints(ctx, padding, chartWidth, chartHeight, trendData, maxValue)
      
      // 绘制标签
      this.drawTrendLabels(ctx, width, height, padding, chartWidth, chartHeight, trendData)
    },
    
    // 绘制坐标轴
    drawAxis(ctx, width, height, padding, chartWidth, chartHeight, maxValue) {
      // X轴
      ctx.beginPath()
      ctx.moveTo(padding.left, height - padding.bottom)
      ctx.lineTo(width - padding.right, height - padding.bottom)
      ctx.strokeStyle = '#909399'
      ctx.lineWidth = 1
      ctx.stroke()
      
      // Y轴
      ctx.beginPath()
      ctx.moveTo(padding.left, padding.top)
      ctx.lineTo(padding.left, height - padding.bottom)
      ctx.stroke()
      
      // Y轴刻度和标签
      const stepCount = 5
      const stepValue = Math.ceil(maxValue / stepCount)
      
      ctx.font = '10px Arial'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#606266'
      
      for (let i = 0; i <= stepCount; i++) {
        const y = height - padding.bottom - (i / stepCount) * chartHeight
        const value = i * stepValue
        
        // 刻度线
        ctx.beginPath()
        ctx.moveTo(padding.left - 5, y)
        ctx.lineTo(padding.left, y)
        ctx.strokeStyle = '#909399'
        ctx.stroke()
        
        // 标签
        ctx.fillText(`¥${value}`, padding.left - 10, y)
      }
    },
    
    // 绘制网格线
    drawGrid(ctx, width, height, padding, chartWidth, chartHeight, maxValue, dataLength) {
      ctx.strokeStyle = '#f0f0f0'
      ctx.lineWidth = 1
      
      // 水平网格线
      const stepCount = 5
      for (let i = 0; i < stepCount; i++) {
        const y = height - padding.bottom - ((i + 1) / stepCount) * chartHeight
        
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(width - padding.right, y)
        ctx.stroke()
      }
      
      // 垂直网格线
      for (let i = 1; i < dataLength - 1; i++) {
        const x = padding.left + (i / (dataLength - 1)) * chartWidth
        
        ctx.beginPath()
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, height - padding.bottom)
        ctx.stroke()
      }
    },
    
    // 绘制趋势线
    drawTrendLine(ctx, padding, chartWidth, chartHeight, data, maxValue) {
      if (data.length < 2) return
      
      ctx.beginPath()
      
      data.forEach((item, index) => {
        const x = padding.left + (index / (data.length - 1)) * chartWidth
        const y = padding.top + chartHeight - (item.value / maxValue) * chartHeight
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      
      ctx.strokeStyle = '#409EFF'
      ctx.lineWidth = 2
      ctx.stroke()
    },
    
    // 绘制趋势数据点
    drawTrendPoints(ctx, padding, chartWidth, chartHeight, data, maxValue) {
      data.forEach((item, index) => {
        const x = padding.left + (index / (data.length - 1)) * chartWidth
        const y = padding.top + chartHeight - (item.value / maxValue) * chartHeight
        
        // 绘制点
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fillStyle = '#fff'
        ctx.fill()
        ctx.strokeStyle = '#409EFF'
        ctx.lineWidth = 2
        ctx.stroke()
        
        // 绘制悬停提示
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.font = '10px Arial'
        ctx.textAlign = 'center'
        
        // 显示金额
        const tooltipY = y - 15
        ctx.fillRect(x - 30, tooltipY - 10, 60, 20)
        ctx.fillStyle = '#fff'
        ctx.fillText(`¥${item.value.toFixed(2)}`, x, tooltipY + 3)
      })
    },
    
    // 绘制趋势图表标签
    drawTrendLabels(ctx, width, height, padding, chartWidth, chartHeight, data) {
      // X轴标签
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#606266'
      
      data.forEach((item, index) => {
        const x = padding.left + (index / (data.length - 1)) * chartWidth
        const y = height - padding.bottom + 5
        
        // 旋转标签以防重叠
        if (data.length > 6) {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(-Math.PI / 4)
          ctx.fillText(item.label, 0, 0)
          ctx.restore()
        } else {
          ctx.fillText(item.label, x, y)
        }
      })
      
      // 图表标题
      const title = this.trendType === 'month' ? '月度费用趋势' : '日度费用趋势'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(title, width / 2, 10)
    },
    
    // 设置画布尺寸以确保清晰度
    setCanvasSize(canvas, width, height) {
      const devicePixelRatio = window.devicePixelRatio || 1
      canvas.width = width * devicePixelRatio
      canvas.height = height * devicePixelRatio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      
      const ctx = canvas.getContext('2d')
      ctx.scale(devicePixelRatio, devicePixelRatio)
    },
    
    // 计算费用类型数据
    calculateTypeData() {
      const typeMap = {}
      
      this.chartData.forEach(expense => {
        const type = expense.type
        if (!typeMap[type]) {
          typeMap[type] = 0
        }
        typeMap[type] += expense.amount
      })
      
      // 转换为数组并排序
      return Object.keys(typeMap)
        .map(key => ({
          name: key,
          value: typeMap[key]
        }))
        .sort((a, b) => b.value - a.value)
    },
    
    // 计算费用趋势数据
    calculateTrendData() {
      const dateMap = {}
      const formatStr = this.trendType === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD'
      
      this.chartData.forEach(expense => {
        const dateKey = dayjs(expense.date).format(formatStr)
        if (!dateMap[dateKey]) {
          dateMap[dateKey] = 0
        }
        dateMap[dateKey] += expense.amount
      })
      
      // 转换为数组并排序
      return Object.keys(dateMap)
        .map(key => {
          // 格式化标签显示
          let label
          if (this.trendType === 'month') {
            label = key.substring(5) + '月'
          } else {
            const month = parseInt(key.substring(5, 7))
            const day = parseInt(key.substring(8))
            label = `${month}/${day}`
          }
          
          return {
            date: key,
            label: label,
            value: dateMap[key]
          }
        })
        .sort((a, b) => a.date.localeCompare(b.date))
    },
    
    // 获取费用类型的中文名称
    getTypeName(type) {
      const typeMap = {
        'TRANSPORTATION': '交通',
        'ACCOMMODATION': '住宿',
        'FOOD': '餐饮',
        'ATTRACTION': '景点门票',
        'SHOPPING': '购物',
        'ENTERTAINMENT': '娱乐',
        'OTHER': '其他'
      }
      return typeMap[type] || type
    }
  }
}
</script>

<style scoped>
.expense-chart-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.type-chart,
.trend-chart {
  width: 100%;
  height: 100%;
}

canvas {
  width: 100%;
  height: 100%;
}

.empty-chart {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
}
</style>