<template>
  <div class="expense-list-container">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <h1 class="page-title">费用管理</h1>
      <el-button type="primary" icon="el-icon-plus" size="large" @click="navigateToCreate">添加费用</el-button>
    </div>
    
    <!-- 搜索和筛选区域 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="旅行计划">
          <el-select 
            v-model="filterForm.travelPlanId" 
            placeholder="选择旅行计划" 
            clearable
            size="large"
          >
            <el-option 
              v-for="plan in travelPlans" 
              :key="plan.id" 
              :label="plan.title" 
              :value="plan.id" 
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="费用类型">
          <el-select 
            v-model="filterForm.type" 
            placeholder="选择费用类型" 
            clearable
            size="large"
            filterable
          >
            <el-option label="交通" value="TRANSPORTATION"></el-option>
            <el-option label="住宿" value="ACCOMMODATION"></el-option>
            <el-option label="餐饮" value="FOOD"></el-option>
            <el-option label="景点门票" value="ATTRACTION"></el-option>
            <el-option label="购物" value="SHOPPING"></el-option>
            <el-option label="娱乐" value="ENTERTAINMENT"></el-option>
            <el-option label="其他" value="OTHER"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="支付方式">
          <el-select 
            v-model="filterForm.paymentMethod" 
            placeholder="选择支付方式" 
            clearable
            size="large"
          >
            <el-option label="现金" value="CASH"></el-option>
            <el-option label="信用卡" value="CREDIT_CARD"></el-option>
            <el-option label="借记卡" value="DEBIT_CARD"></el-option>
            <el-option label="支付宝" value="ALIPAY"></el-option>
            <el-option label="微信支付" value="WECHAT_PAY"></el-option>
            <el-option label="银行转账" value="BANK_TRANSFER"></el-option>
            <el-option label="其他" value="OTHER"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
            size="large"
            :picker-options="{
              shortcuts: [
                { text: '最近一周', onClick(picker) { picker.$emit('pick', [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]) } },
                { text: '最近一月', onClick(picker) { picker.$emit('pick', [dayjs().subtract(30, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]) } },
                { text: '最近三月', onClick(picker) { picker.$emit('pick', [dayjs().subtract(3, 'month').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]) } },
                { text: '本年', onClick(picker) { picker.$emit('pick', [dayjs().startOf('year').format('YYYY-MM-DD'), dayjs().endOf('year').format('YYYY-MM-DD')]) } }
              ]
            }"
          ></el-date-picker>
        </el-form-item>
        
        <el-form-item>
          <el-input
            v-model="filterForm.description"
            placeholder="描述关键词搜索"
            prefix-icon="el-icon-search"
            size="large"
          ></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleFilter" size="large" icon="el-icon-search">查询</el-button>
          <el-button @click="resetFilter" size="large" icon="el-icon-refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 数据概览和图表区域 -->
    <div class="overview-section">
      <!-- 统计卡片 -->
      <div class="statistics-cards">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon el-icon-money"></div>
            <div class="stat-info">
              <div class="stat-title">总费用</div>
              <div class="stat-value">{{ formatCurrency(filteredExpensesTotal) }}</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon el-icon-calendar"></div>
            <div class="stat-info">
              <div class="stat-title">本月费用</div>
              <div class="stat-value">{{ formatCurrency(currentMonthAmount) }}</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon el-icon-document"></div>
            <div class="stat-info">
              <div class="stat-title">记录数量</div>
              <div class="stat-value">{{ filteredExpensesCount }}</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon el-icon-s-operation"></div>
            <div class="stat-info">
              <div class="stat-title">平均费用</div>
              <div class="stat-value">{{ formatCurrency(averageExpenseAmount) }}</div>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 图表展示 -->
      <div class="charts-container">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="card-header">
            <span>费用类型分布</span>
            <el-select v-model="chartTimeRange" size="small" style="width: 120px;">
              <el-option label="全部" value="all"></el-option>
              <el-option label="本月" value="month"></el-option>
              <el-option label="季度" value="quarter"></el-option>
            </el-select>
          </div>
          <div class="chart-content">
            <ExpenseChart 
              type="expenseType"
              :data="filteredExpenses"
              :timeRange="chartTimeRange"
            />
          </div>
        </el-card>
        
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="card-header">
            <span>费用趋势</span>
            <el-select v-model="chartTrendType" size="small" style="width: 120px;">
              <el-option label="按月" value="month"></el-option>
              <el-option label="按日" value="day"></el-option>
            </el-select>
          </div>
          <div class="chart-content">
            <ExpenseChart 
              type="expenseTrend"
              :data="filteredExpenses"
              :timeRange="chartTimeRange"
              :trendType="chartTrendType"
            />
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 费用表格 -->
    <el-card shadow="hover" class="table-card">
      <div class="table-header">
        <h2>费用列表</h2>
        <div class="table-actions">
          <el-button-group>
            <el-button size="small" type="info" @click="toggleView('table')" :icon="viewMode === 'table' ? 'el-icon-check' : ''">
              表格视图
            </el-button>
            <el-button size="small" type="info" @click="toggleView('list')" :icon="viewMode === 'list' ? 'el-icon-check' : ''">
              列表视图
            </el-button>
          </el-button-group>
          <el-button type="success" size="small" @click="exportExpenses">导出CSV</el-button>
        </div>
      </div>
      
      <!-- 表格视图 -->
      <el-table 
        v-if="viewMode === 'table'"
        v-loading="loading" 
        :data="paginatedExpenses" 
        style="width: 100%"
        @sort-change="handleSort"
        stripe
        highlight-current-row
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80" sortable="custom"></el-table-column>
        <el-table-column prop="description" label="描述" min-width="200">
          <template slot-scope="scope">
            <div class="description-cell">
              <strong>{{ scope.row.description }}</strong>
              <div v-if="scope.row.note" class="description-note">{{ scope.row.note }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120" align="right" sortable="custom">
          <template slot-scope="scope">
            <div class="amount-cell" :class="{ 'high-amount': scope.row.amount > 1000 }">
              {{ formatCurrency(scope.row.amount) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template slot-scope="scope">
            <el-tag :type="getTagType(scope.row.type)">
              {{ formatExpenseType(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="日期" width="120" sortable="custom">
          <template slot-scope="scope">
            {{ formatDate(scope.row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" width="120">
          <template slot-scope="scope">
            <el-tag size="small" :type="getPaymentMethodType(scope.row.paymentMethod)">
              {{ formatPaymentMethod(scope.row.paymentMethod) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="travelPlan" label="旅行计划" min-width="180">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.travelPlan?.destination || ''" placement="top">
              <span class="travel-plan-cell">{{ scope.row.travelPlan?.title || '-' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="viewExpense(scope.row.id)"
              icon="el-icon-view"
            >
              查看
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="confirmDelete(scope.row.id)"
              icon="el-icon-delete"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 列表视图 -->
      <div v-else-if="viewMode === 'list'" class="expense-list-view">
        <div v-for="expense in paginatedExpenses" :key="expense.id" class="expense-list-item">
          <div class="expense-list-header">
            <h3>{{ expense.description }}</h3>
            <div class="expense-list-amount" :class="{ 'high-amount': expense.amount > 1000 }">
              {{ formatCurrency(expense.amount) }}
            </div>
          </div>
          <div class="expense-list-info">
            <el-tag size="small" :type="getTagType(expense.type)">{{ formatExpenseType(expense.type) }}</el-tag>
            <span>{{ formatDate(expense.date) }}</span>
            <el-tag size="small" :type="getPaymentMethodType(expense.paymentMethod)">{{ formatPaymentMethod(expense.paymentMethod) }}</el-tag>
            <span v-if="expense.travelPlan">{{ expense.travelPlan.title }}</span>
          </div>
          <div v-if="expense.note" class="expense-list-note">{{ expense.note }}</div>
          <div class="expense-list-actions">
            <el-button size="mini" type="primary" @click="viewExpense(expense.id)" icon="el-icon-view">查看</el-button>
            <el-button size="mini" type="danger" @click="confirmDelete(expense.id)" icon="el-icon-delete">删除</el-button>
          </div>
        </div>
        <div v-if="paginatedExpenses.length === 0" class="empty-list">
          <el-empty description="暂无费用记录" :image-size="120"></el-empty>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <div class="pagination-info">
          共 {{ filteredExpensesCount }} 条费用记录
        </div>
        <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredExpensesCount"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
    
    <!-- 删除确认对话框 -->
    <el-dialog
      title="确认删除"
      :visible.sync="deleteDialogVisible"
      width="400px"
      center
    >
      <div class="dialog-content">
        <i class="el-icon-warning-outline icon-warning"></i>
        <p>确定要删除这条费用记录吗？此操作无法撤销。</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="deleteExpense">确定删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import dayjs from 'dayjs'
import ExpenseChart from '@/components/charts/ExpenseChart.vue'

export default {
  name: 'ExpenseList',
  components: {
    ExpenseChart
  },
  data() {
    return {
      filterForm: {
        travelPlanId: '',
        type: '',
        paymentMethod: '',
        dateRange: null,
        description: ''
      },
      pageSize: 10,
      currentPage: 1,
      sortField: '',
      sortOrder: '',
      deleteDialogVisible: false,
      expenseIdToDelete: null,
      viewMode: 'table', // 'table' 或 'list'
      chartTimeRange: 'all',
      chartTrendType: 'month',
      chartInstances: {}
    }
  },
  computed: {
    ...mapState(['expenses', 'travelPlans', 'loading']),
    
    // 筛选后的费用列表
    filteredExpenses() {
      // 筛选逻辑
      let result = [...this.expenses]
      
      // 按旅行计划筛选
      if (this.filterForm.travelPlanId) {
        result = result.filter(expense => expense.travelPlanId === this.filterForm.travelPlanId)
      }
      
      // 按费用类型筛选
      if (this.filterForm.type) {
        result = result.filter(expense => expense.type === this.filterForm.type)
      }
      
      // 按支付方式筛选
      if (this.filterForm.paymentMethod) {
        result = result.filter(expense => expense.paymentMethod === this.filterForm.paymentMethod)
      }
      
      // 按日期范围筛选
      if (this.filterForm.dateRange && this.filterForm.dateRange.length === 2) {
        const startDate = this.filterForm.dateRange[0]
        const endDate = this.filterForm.dateRange[1]
        result = result.filter(expense => {
          const expenseDate = expense.date
          return expenseDate >= startDate && expenseDate <= endDate
        })
      }
      
      // 按描述关键词搜索
      if (this.filterForm.description.trim()) {
        const keyword = this.filterForm.description.toLowerCase().trim()
        result = result.filter(expense => {
          const desc = (expense.description || '').toLowerCase()
          const note = (expense.note || '').toLowerCase()
          return desc.includes(keyword) || note.includes(keyword)
        })
      }
      
      // 排序
      if (this.sortField && this.sortOrder) {
        result.sort((a, b) => {
          if (this.sortOrder === 'ascending') {
            return a[this.sortField] > b[this.sortField] ? 1 : -1
          } else {
            return a[this.sortField] < b[this.sortField] ? 1 : -1
          }
        })
      }
      
      return result
    },
    
    // 分页后的费用列表
    paginatedExpenses() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredExpenses.slice(start, end)
    },
    
    // 筛选后的费用总数
    filteredExpensesCount() {
      return this.filteredExpenses.length
    },
    
    // 筛选后的费用总金额
    filteredExpensesTotal() {
      return this.filteredExpenses.reduce((total, expense) => total + (expense.amount || 0), 0)
    },
    
    // 平均费用
    averageExpenseAmount() {
      if (this.filteredExpensesCount === 0) return 0
      return this.filteredExpensesTotal / this.filteredExpensesCount
    },
    
    // 本月费用
    currentMonthAmount() {
      const currentMonth = dayjs().format('YYYY-MM')
      return this.expenses
        .filter(expense => expense.date.startsWith(currentMonth))
        .reduce((total, expense) => total + (expense.amount || 0), 0)
    }
  },
  methods: {
    // 格式化货币
    formatCurrency(value) {
      if (typeof value !== 'number') return '¥0.00'
      return `¥${value.toFixed(2)}`
    },
    
    // 格式化日期
    formatDate(date) {
      if (!date) return ''
      return dayjs(date).format('YYYY-MM-DD')
    },
    
    // 格式化费用类型
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
    
    // 获取标签类型
    getTagType(type) {
      const typeMap = {
        'TRANSPORTATION': 'primary',
        'ACCOMMODATION': 'success',
        'FOOD': 'warning',
        'ATTRACTION': 'danger',
        'SHOPPING': 'info',
        'ENTERTAINMENT': 'purple',
        'OTHER': 'gray'
      }
      return typeMap[type] || 'gray'
    },
    
    // 格式化支付方式
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
    
    // 获取支付方式标签类型
    getPaymentMethodType(method) {
      const methodMap = {
        'CASH': 'gold',
        'CREDIT_CARD': 'primary',
        'DEBIT_CARD': 'info',
        'ALIPAY': 'success',
        'WECHAT_PAY': 'warning',
        'BANK_TRANSFER': 'danger',
        'OTHER': 'gray'
      }
      return methodMap[method] || 'gray'
    },
    
    // 处理筛选
    handleFilter() {
      this.currentPage = 1 // 重置为第一页
      this.$nextTick(() => {
        this.initCharts()
      })
    },
    
    // 重置筛选
    resetFilter() {
      this.filterForm = {
        travelPlanId: '',
        type: '',
        paymentMethod: '',
        dateRange: null,
        description: ''
      }
      this.currentPage = 1
      this.sortField = ''
      this.sortOrder = ''
      this.$nextTick(() => {
        this.initCharts()
      })
    },
    
    // 处理排序
    handleSort({ prop, order }) {
      this.sortField = prop
      this.sortOrder = order
    },
    
    // 切换视图模式
    toggleView(mode) {
      this.viewMode = mode
    },
    
    // 处理页面大小变化
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
    },
    
    // 处理当前页面变化
    handleCurrentChange(current) {
      this.currentPage = current
    },
    
    // 跳转到创建页面
    navigateToCreate() {
      this.$router.push('/expense/create')
    },
    
    // 查看费用详情
    viewExpense(id) {
      this.$router.push(`/expense/detail/${id}`)
    },
    
    // 确认删除
    confirmDelete(id) {
      this.expenseIdToDelete = id
      this.deleteDialogVisible = true
    },
    
    // 删除费用
    async deleteExpense() {
      try {
        await this.$store.dispatch('deleteExpense', this.expenseIdToDelete)
        this.$message.success('费用记录已成功删除')
        this.deleteDialogVisible = false
        this.$nextTick(() => {
          this.initCharts()
        })
      } catch (error) {
        console.error('删除费用失败:', error)
        this.$message.error('删除失败，请稍后再试')
      }
    },
    
    // 初始化图表
    initCharts() {
      // 图表初始化逻辑由ExpenseChart组件内部处理
      console.log('图表已通过组件方式加载')
    },
    
    // 导出CSV
    exportExpenses() {
      if (this.filteredExpenses.length === 0) {
        this.$message.warning('没有数据可以导出')
        return
      }
      
      // 构建CSV内容
      let csvContent = 'ID,描述,金额,类型,日期,支付方式,旅行计划,备注\n'
      this.filteredExpenses.forEach(expense => {
        const row = [
          expense.id,
          `"${expense.description || ''}"`,
          expense.amount,
          this.formatExpenseType(expense.type),
          expense.date,
          this.formatPaymentMethod(expense.paymentMethod),
          `"${expense.travelPlan?.title || ''}"`,
          `"${expense.note || ''}"`
        ]
        csvContent += row.join(',') + '\n'
      })
      
      // 创建并下载文件
      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `费用记录_${dayjs().format('YYYY-MM-DD')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      this.$message.success('导出成功')
    }
  },
  mounted() {
    // 加载费用数据和旅行计划数据
    this.$store.dispatch('fetchExpenses')
    this.$store.dispatch('fetchTravelPlans')
    
    // 初始化图表
    this.$nextTick(() => {
      this.initCharts()
    })
  },
  
  watch: {
    // 监听图表时间范围变化
    chartTimeRange() {
      this.$nextTick(() => {
        this.initCharts()
      })
    },
    
    // 监听图表趋势类型变化
    chartTrendType() {
      this.$nextTick(() => {
        this.initCharts()
      })
    },
    
    // 监听费用数据变化
    expenses: {
      handler() {
        this.$nextTick(() => {
          this.initCharts()
        })
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.expense-list-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.filter-card {
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.filter-form {
  margin-bottom: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-form .el-form-item {
  margin-right: 10px;
  margin-bottom: 15px;
}

.overview-section {
  margin-bottom: 20px;
}

.statistics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 15px 0;
}

.stat-icon {
  font-size: 32px;
  color: #409eff;
  margin-right: 15px;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.chart-content {
  height: 300px;
  margin-top: 20px;
}

.table-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.table-header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.table-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.pagination-info {
  color: #606266;
}

/* 表格单元格样式 */
.description-cell strong {
  display: block;
  margin-bottom: 4px;
}

.description-note {
  font-size: 12px;
  color: #909399;
}

.amount-cell {
  font-weight: bold;
}

.high-amount {
  color: #f56c6c;
}

.travel-plan-cell {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

/* 列表视图样式 */
.expense-list-view {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.expense-list-item {
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.expense-list-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.expense-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.expense-list-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.expense-list-amount {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.expense-list-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.expense-list-info span {
  display: flex;
  align-items: center;
}

.expense-list-note {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
  padding-left: 10px;
  border-left: 3px solid #dcdfe6;
}

.expense-list-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.empty-list {
  padding: 40px 0;
}

/* 对话框样式 */
.dialog-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-warning {
  font-size: 20px;
  color: #f7ba2a;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
  }
  
  .filter-form .el-form-item {
    width: 100%;
    margin-right: 0;
  }
  
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .statistics-cards {
    grid-template-columns: 1fr;
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .table-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }
  
  .expense-list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .expense-list-info {
    flex-wrap: wrap;
  }
}
</style>