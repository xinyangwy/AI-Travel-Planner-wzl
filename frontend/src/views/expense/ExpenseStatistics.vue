<template>
  <div class="expense-statistics-container">
    <h2 class="page-title">费用统计</h2>
    
    <!-- 筛选条件 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="旅行计划">
          <el-select v-model="filterForm.travelPlanId" placeholder="选择旅行计划" clearable>
            <el-option 
              v-for="plan in travelPlans" 
              :key="plan.id" 
              :label="plan.title" 
              :value="plan.id" 
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="时间范围">
          <el-radio-group v-model="filterForm.timeRange" @change="handleTimeRangeChange">
            <el-radio-button label="month">本月</el-radio-button>
            <el-radio-button label="quarter">本季度</el-radio-button>
            <el-radio-button label="year">本年</el-radio-button>
            <el-radio-button label="custom">自定义</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="自定义日期" v-if="filterForm.timeRange === 'custom'">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          ></el-date-picker>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="applyFilter">应用筛选</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 统计概览卡片 -->
    <div class="overview-cards">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-title">总费用</div>
          <div class="stat-value">{{ formatCurrency(totalAmount) }}</div>
          <div class="stat-desc">{{ periodDescription }}所有费用总计</div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-title">平均每日</div>
          <div class="stat-value">{{ formatCurrency(averageDaily) }}</div>
          <div class="stat-desc">{{ periodDescription }}每日平均费用</div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-title">最高支出</div>
          <div class="stat-value">{{ formatCurrency(maxAmount) }}</div>
          <div class="stat-desc">{{ periodDescription }}单笔最大支出</div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-title">支出笔数</div>
          <div class="stat-value">{{ expenseCount }}</div>
          <div class="stat-desc">{{ periodDescription }}总支出笔数</div>
        </div>
      </el-card>
    </div>
    
    <!-- 图表区域 -->
    <div class="charts-container">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>费用分类占比</span>
              </div>
            </template>
            <div ref="typeChart" class="chart"></div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>支付方式分析</span>
              </div>
            </template>
            <div ref="paymentChart" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>费用趋势</span>
              </div>
            </template>
            <div ref="trendChart" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 费用明细表格 -->
    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="card-header">
          <span>费用明细</span>
        </div>
      </template>
      
      <el-table :data="filteredExpenses" style="width: 100%">
        <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template slot-scope="scope">
            {{ formatExpenseType(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="date" label="日期" width="120">
          <template slot-scope="scope">
            {{ formatDate(scope.row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" width="120">
          <template slot-scope="scope">
            {{ formatPaymentMethod(scope.row.paymentMethod) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import dayjs from 'dayjs'
import * as echarts from 'echarts/core'
import { PieChart, LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必须的组件
echarts.use([
  PieChart,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
])

export default {
  name: 'ExpenseStatistics',
  data() {
    return {
      filterForm: {
        travelPlanId: '',
        timeRange: 'month',
        dateRange: null
      },
      // 图表实例
      typeChart: null,
      paymentChart: null,
      trendChart: null,
      // 日期范围
      startDate: '',
      endDate: ''
    }
  },
  computed: {
    ...mapState(['expenses', 'travelPlans']),
    
    filteredExpenses() {
      let result = [...this.expenses]
      
      // 按旅行计划筛选
      if (this.filterForm.travelPlanId) {
        result = result.filter(expense => expense.travelPlanId === this.filterForm.travelPlanId)
      }
      
      // 按日期范围筛选
      result = result.filter(expense => {
        const expenseDate = expense.date
        return expenseDate >= this.startDate && expenseDate <= this.endDate
      })
      
      // 按日期降序排序
      result.sort((a, b) => {
        return b.date.localeCompare(a.date)
      })
      
      return result
    },
    
    totalAmount() {
      return this.filteredExpenses.reduce((total, expense) => total + (expense.amount || 0), 0)
    },
    
    averageDaily() {
      const days = this.calculateDays()
      if (days === 0) return 0
      return this.totalAmount / days
    },
    
    maxAmount() {
      if (this.filteredExpenses.length === 0) return 0
      return Math.max(...this.filteredExpenses.map(expense => expense.amount || 0))
    },
    
    expenseCount() {
      return this.filteredExpenses.length
    },
    
    periodDescription() {
      switch (this.filterForm.timeRange) {
        case 'month':
          return `${dayjs().format('YYYY年MM月')} `
        case 'quarter':
          const quarter = Math.ceil((dayjs().month() + 1) / 3)
          return `${dayjs().format('YYYY年')}第${quarter}季度 `
        case 'year':
          return `${dayjs().format('YYYY年')} `
        case 'custom':
          return `${this.filterForm.dateRange?.[0]}至${this.filterForm.dateRange?.[1]} `
        default:
          return ''
      }
    }
  },
  methods: {
    formatCurrency(value) {
      if (typeof value !== 'number') return '¥0.00'
      return `¥${value.toFixed(2)}`
    },
    
    formatDate(date) {
      if (!date) return ''
      return dayjs(date).format('YYYY-MM-DD')
    },
    
    formatExpenseType(type) {
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
    },
    
    formatPaymentMethod(method) {
      const methodMap = {
        'CASH': '现金',
        'CREDIT_CARD': '信用卡',
        'DEBIT_CARD': '借记卡',
        'ALIPAY': '支付宝',
        'WECHAT_PAY': '微信支付',
        'BANK_TRANSFER': '银行转账',
        'OTHER': '其他'
      }
      return methodMap[method] || method
    },
    
    calculateDays() {
      const start = dayjs(this.startDate)
      const end = dayjs(this.endDate)
      return end.diff(start, 'day') + 1
    },
    
    handleTimeRangeChange() {
      this.updateDateRange()
    },
    
    updateDateRange() {
      const now = dayjs()
      
      switch (this.filterForm.timeRange) {
        case 'month':
          this.startDate = now.startOf('month').format('YYYY-MM-DD')
          this.endDate = now.endOf('month').format('YYYY-MM-DD')
          break
        case 'quarter':
          this.startDate = now.startOf('quarter').format('YYYY-MM-DD')
          this.endDate = now.endOf('quarter').format('YYYY-MM-DD')
          break
        case 'year':
          this.startDate = now.startOf('year').format('YYYY-MM-DD')
          this.endDate = now.endOf('year').format('YYYY-MM-DD')
          break
        case 'custom':
          if (this.filterForm.dateRange && this.filterForm.dateRange.length === 2) {
            this.startDate = this.filterForm.dateRange[0]
            this.endDate = this.filterForm.dateRange[1]
          } else {
            // 默认设置为当月
            this.startDate = now.startOf('month').format('YYYY-MM-DD')
            this.endDate = now.endOf('month').format('YYYY-MM-DD')
          }
          break
      }
    },
    
    applyFilter() {
      this.updateDateRange()
      this.$nextTick(() => {
        this.initCharts()
      })
    },
    
    initCharts() {
      this.initTypeChart()
      this.initPaymentChart()
      this.initTrendChart()
    },
    
    initTypeChart() {
      if (this.typeChart) {
        this.typeChart.dispose()
      }
      
      const chartDom = this.$refs.typeChart
      this.typeChart = echarts.init(chartDom)
      
      // 按费用类型统计
      const typeData = this.getExpenseTypeData()
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
          formatter: (params) => {
            return `${params.name}: ${this.formatCurrency(params.value)} (${params.percent}%)`
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: typeData.map(item => item.name)
        },
        series: [
          {
            name: '费用类型',
            type: 'pie',
            radius: '50%',
            data: typeData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      
      option && this.typeChart.setOption(option)
    },
    
    initPaymentChart() {
      if (this.paymentChart) {
        this.paymentChart.dispose()
      }
      
      const chartDom = this.$refs.paymentChart
      this.paymentChart = echarts.init(chartDom)
      
      // 按支付方式统计
      const paymentData = this.getPaymentMethodData()
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
          formatter: (params) => {
            return `${params.name}: ${this.formatCurrency(params.value)} (${params.percent}%)`
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: paymentData.map(item => item.name)
        },
        series: [
          {
            name: '支付方式',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
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
                fontSize: '16',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: paymentData
          }
        ]
      }
      
      option && this.paymentChart.setOption(option)
    },
    
    initTrendChart() {
      if (this.trendChart) {
        this.trendChart.dispose()
      }
      
      const chartDom = this.$refs.trendChart
      this.trendChart = echarts.init(chartDom)
      
      // 按日期统计费用趋势
      const trendData = this.getTrendData()
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            return `${params[0].axisValue}<br/>${params[0].seriesName}: ${this.formatCurrency(params[0].value)}`
          }
        },
        xAxis: {
          type: 'category',
          data: trendData.map(item => item.date),
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value) => {
              return `¥${value}`
            }
          }
        },
        series: [
          {
            name: '费用',
            type: 'line',
            data: trendData.map(item => item.amount),
            smooth: true,
            areaStyle: {},
            markPoint: {
              data: [
                { type: 'max', name: '最大值' },
                { type: 'min', name: '最小值' }
              ]
            }
          }
        ]
      }
      
      option && this.trendChart.setOption(option)
    },
    
    getExpenseTypeData() {
      const typeMap = {}
      
      this.filteredExpenses.forEach(expense => {
        const type = this.formatExpenseType(expense.type)
        if (!typeMap[type]) {
          typeMap[type] = 0
        }
        typeMap[type] += expense.amount || 0
      })
      
      return Object.keys(typeMap).map(key => ({
        name: key,
        value: typeMap[key]
      }))
    },
    
    getPaymentMethodData() {
      const methodMap = {}
      
      this.filteredExpenses.forEach(expense => {
        const method = this.formatPaymentMethod(expense.paymentMethod)
        if (!methodMap[method]) {
          methodMap[method] = 0
        }
        methodMap[method] += expense.amount || 0
      })
      
      return Object.keys(methodMap).map(key => ({
        name: key,
        value: methodMap[key]
      }))
    },
    
    getTrendData() {
      const dateMap = {}
      
      // 初始化日期范围内的所有日期
      const start = dayjs(this.startDate)
      const end = dayjs(this.endDate)
      const days = end.diff(start, 'day') + 1
      
      for (let i = 0; i < days; i++) {
        const date = start.add(i, 'day').format('YYYY-MM-DD')
        dateMap[date] = 0
      }
      
      // 统计每日费用
      this.filteredExpenses.forEach(expense => {
        if (dateMap.hasOwnProperty(expense.date)) {
          dateMap[expense.date] += expense.amount || 0
        }
      })
      
      return Object.keys(dateMap).map(date => ({
        date: date,
        amount: dateMap[date]
      })).sort((a, b) => a.date.localeCompare(b.date))
    },
    
    handleResize() {
      if (this.typeChart) this.typeChart.resize()
      if (this.paymentChart) this.paymentChart.resize()
      if (this.trendChart) this.trendChart.resize()
    }
  },
  mounted() {
    this.updateDateRange()
    this.$store.dispatch('fetchExpenses')
    this.$store.dispatch('fetchTravelPlans')
    
    // 延迟初始化图表，确保DOM已经渲染完成
    setTimeout(() => {
      this.initCharts()
      window.addEventListener('resize', this.handleResize)
    }, 100)
  },
  beforeDestroy() {
    // 销毁图表实例
    if (this.typeChart) {
      this.typeChart.dispose()
    }
    if (this.paymentChart) {
      this.paymentChart.dispose()
    }
    if (this.trendChart) {
      this.trendChart.dispose()
    }
    window.removeEventListener('resize', this.handleResize)
  },
  updated() {
    // 数据更新后重新初始化图表
    this.$nextTick(() => {
      this.initCharts()
    })
  }
}
</script>

<style scoped>
.expense-statistics-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  color: #303133;
  font-size: 24px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 0;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  text-align: center;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-desc {
  font-size: 12px;
  color: #909399;
}

.charts-container {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart {
  height: 300px;
}

.table-card {
  margin-bottom: 20px;
}
</style>