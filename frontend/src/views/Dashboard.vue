<template>
  <div class="dashboard-container">
    <h2 class="page-title">仪表盘</h2>
    
    <!-- 欢迎卡片 -->
    <div class="welcome-card">
      <h3>欢迎回来，{{ user.username }}！</h3>
      <p>今天有什么旅行计划？</p>
      <el-button type="primary" @click="$router.push('/travel/generate')">
        生成旅行计划
      </el-button>
    </div>
    
    <!-- 数据概览 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-value">{{ plans.length }}</div>
        <div class="stat-label">旅行计划</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ upcomingTrips }}</div>
        <div class="stat-label">即将到来</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ completedTrips }}</div>
        <div class="stat-label">已完成</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">¥{{ totalExpenses.toFixed(2) }}</div>
        <div class="stat-label">总支出</div>
      </div>
    </div>
    
    <!-- 最近的旅行计划 -->
    <div class="recent-plans">
      <div class="section-header">
        <h3>最近的旅行计划</h3>
        <router-link to="/travel">查看全部</router-link>
      </div>
      
      <div v-if="loading" class="loading">
        <el-skeleton :rows="3" animated />
      </div>
      
      <div v-else-if="plans.length === 0" class="empty-state">
        <el-empty description="暂无旅行计划" />
        <el-button type="primary" @click="$router.push('/travel/create')">创建旅行计划</el-button>
      </div>
      
      <div v-else class="plans-list">
        <el-card v-for="plan in recentPlans" :key="plan.id" class="plan-card">
          <div class="plan-header">
            <h4>{{ plan.title }}</h4>
            <el-tag :type="getStatusType(plan.status)">
              {{ getStatusText(plan.status) }}
            </el-tag>
          </div>
          <div class="plan-info">
            <p><i class="el-icon-location"></i> {{ plan.destination }}</p>
            <p><i class="el-icon-time"></i> {{ formatDate(plan.startDate) }} - {{ formatDate(plan.endDate) }}</p>
            <p><i class="el-icon-document"></i> {{ plan.description }}</p>
          </div>
          <div class="plan-actions">
            <el-button type="primary" size="small" @click="viewPlan(plan.id)">查看详情</el-button>
            <el-button size="small" @click="editPlan(plan.id)">编辑</el-button>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 费用统计图表 -->
    <div class="expense-chart" v-if="plans.length > 0">
      <div class="section-header">
        <h3>费用统计</h3>
      </div>
      <div ref="expenseChart" class="chart-container"></div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

export default {
  name: 'Dashboard',
  data() {
    return {
      expenseChart: null
    }
  },
  computed: {
    ...mapState(['user', 'plans', 'loading']),
    recentPlans() {
      // 取最近的3个计划
      return this.plans.slice(0, 3)
    },
    upcomingTrips() {
      // 计算即将到来的旅行计划数量
      const today = new Date()
      return this.plans.filter(plan => new Date(plan.startDate) >= today).length
    },
    completedTrips() {
      // 计算已完成的旅行计划数量
      const today = new Date()
      return this.plans.filter(plan => new Date(plan.endDate) < today || plan.status === 'COMPLETED').length
    },
    totalExpenses() {
      // 计算总支出（这里只是模拟数据）
      return 2580.5
    }
  },
  methods: {
    async fetchData() {
      try {
        // 获取用户信息
        await this.$store.dispatch('fetchProfile')
        // 获取旅行计划
        await this.$store.dispatch('fetchTravelPlans')
      } catch (error) {
        console.error(error)
      }
    },
    formatDate(date) {
      return dayjs(date).format('YYYY-MM-DD')
    },
    getStatusType(status) {
      const typeMap = {
        'PENDING': 'info',
        'ACTIVE': 'success',
        'COMPLETED': 'primary',
        'CANCELLED': 'danger'
      }
      return typeMap[status] || 'default'
    },
    getStatusText(status) {
      const textMap = {
        'PENDING': '未开始',
        'ACTIVE': '进行中',
        'COMPLETED': '已完成',
        'CANCELLED': '已取消'
      }
      return textMap[status] || status
    },
    viewPlan(planId) {
      this.$router.push(`/travel/detail/${planId}`)
    },
    editPlan(planId) {
      this.$router.push(`/travel/create?id=${planId}`)
    },
    initChart() {
      // 初始化费用统计图表
      this.expenseChart = echarts.init(this.$refs.expenseChart)
      
      // 模拟数据
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['交通', '住宿', '餐饮', '景点门票', '购物']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01]
        },
        yAxis: {
          type: 'category',
          data: ['旅行计划1', '旅行计划2', '旅行计划3']
        },
        series: [
          {
            name: '交通',
            type: 'bar',
            data: [500, 800, 600]
          },
          {
            name: '住宿',
            type: 'bar',
            data: [1200, 1500, 1000]
          },
          {
            name: '餐饮',
            type: 'bar',
            data: [600, 700, 500]
          },
          {
            name: '景点门票',
            type: 'bar',
            data: [300, 400, 350]
          },
          {
            name: '购物',
            type: 'bar',
            data: [800, 1000, 700]
          }
        ]
      }
      
      this.expenseChart.setOption(option)
    },
    handleResize() {
      if (this.expenseChart) {
        this.expenseChart.resize()
      }
    }
  },
  mounted() {
    this.fetchData()
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize)
  },
  updated() {
    // 如果有旅行计划并且图表容器已经渲染，初始化图表
    if (this.plans.length > 0 && this.$refs.expenseChart && !this.expenseChart) {
      this.initChart()
    }
  },
  beforeUnmount() {
    // 销毁图表实例
    if (this.expenseChart) {
      this.expenseChart.dispose()
      this.expenseChart = null
    }
    
    // 移除事件监听器
    window.removeEventListener('resize', this.handleResize)
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  color: #303133;
}

.welcome-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.welcome-card h3 {
  margin-bottom: 10px;
  color: #303133;
}

.welcome-card p {
  margin-bottom: 20px;
  color: #606266;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  color: #606266;
}

.recent-plans {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  color: #303133;
}

.section-header a {
  color: #409eff;
  text-decoration: none;
}

.plans-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.plan-card {
  height: 100%;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.plan-header h4 {
  margin: 0;
  color: #303133;
}

.plan-info {
  margin-bottom: 20px;
}

.plan-info p {
  margin-bottom: 10px;
  color: #606266;
}

.plan-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.expense-chart {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chart-container {
  width: 100%;
  height: 400px;
}

.empty-state {
  background-color: #fff;
  border-radius: 8px;
  padding: 60px 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.loading {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>