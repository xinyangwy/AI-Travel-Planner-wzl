<template>
  <div class="travel-detail-container">
    <div class="travel-header">
      <div class="travel-title-section">
        <h1 class="travel-title">{{ plan.title }}</h1>
        <div class="travel-meta">
          <span class="travel-status">
            <el-tag :type="getStatusType(plan.status)">{{ getStatusText(plan.status) }}</el-tag>
          </span>
          <span class="travel-date">
            <i class="el-icon-time"></i>
            {{ formatDate(plan.startDate) }} - {{ formatDate(plan.endDate) }}
            <span class="travel-duration">({{ getDurationDays(plan.startDate, plan.endDate) }}天)</span>
          </span>
          <span class="travel-destination">
            <i class="el-icon-location"></i>
            {{ plan.destination }}
          </span>
        </div>
      </div>
      
      <div class="travel-actions">
        <el-button type="primary" @click="editPlan">
          <i class="el-icon-edit"></i>
          编辑计划
        </el-button>
        <el-button type="success" @click="generateItinerary">
          <i class="el-icon-magic-stick"></i>
          智能生成行程
        </el-button>
        <el-dropdown trigger="click">
          <el-button>
            更多操作 <i class="el-icon-arrow-down"></i>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="duplicatePlan">
                <i class="el-icon-copy-document"></i> 复制计划
              </el-dropdown-item>
              <el-dropdown-item @click="sharePlan">
                <i class="el-icon-share"></i> 分享计划
              </el-dropdown-item>
              <el-dropdown-item divided @click="deletePlan" class="danger-item">
                <i class="el-icon-delete"></i> 删除计划
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button @click="backToList">
          <i class="el-icon-arrow-left"></i>
          返回列表
        </el-button>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else-if="plan">
      <el-tabs v-model="activeTab" class="travel-tabs">
        <el-tab-pane label="概览" name="overview">
          <div class="travel-overview">
            <!-- 旅行统计卡片 -->
            <div class="overview-stats">
              <el-card class="stat-card">
                <div class="stat-icon money">
                  <i class="el-icon-money"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">¥{{ formatCurrency(plan.budget || 0) }}</div>
                  <div class="stat-label">预算</div>
                </div>
              </el-card>
              
              <el-card class="stat-card">
                <div class="stat-icon users">
                  <i class="el-icon-user"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ plan.travelers || 1 }}</div>
                  <div class="stat-label">旅行者</div>
                </div>
              </el-card>
              
              <el-card class="stat-card">
                <div class="stat-icon type">
                  <i class="el-icon-s-operation"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ getTypeText(plan.type) }}</div>
                  <div class="stat-label">旅行类型</div>
                </div>
              </el-card>
              
              <el-card class="stat-card">
                <div class="stat-icon expense">
                  <i class="el-icon-bank-card"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">¥{{ formatCurrency(totalExpenses) }}</div>
                  <div class="stat-label">已花费</div>
                </div>
              </el-card>
            </div>
            
            <!-- 旅行描述 -->
            <el-card class="travel-description-card">
              <template #header>
                <div class="card-header">
                  <span>旅行描述</span>
                </div>
              </template>
              <p>{{ plan.description || '暂无描述' }}</p>
            </el-card>
            
            <!-- 旅行标签 -->
            <div v-if="plan.tags && plan.tags.length > 0" class="travel-tags">
              <el-tag v-for="tag in plan.tags" :key="tag" class="travel-tag">
                #{{ tag }}
              </el-tag>
            </div>
            
            <!-- 最近费用记录 -->
            <div v-if="expenses.length > 0" class="recent-expenses">
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>最近费用记录</span>
                    <el-button type="text" @click="viewAllExpenses">查看全部</el-button>
                  </div>
                </template>
                
                <el-table :data="recentExpenses" style="width: 100%;">
                  <el-table-column prop="expenseDate" label="日期" width="120">
                    <template #default="{row}">{{ formatDate(row.expenseDate) }}</template>
                  </el-table-column>
                  <el-table-column prop="category" label="分类">
                    <template #default="{row}">{{ getCategoryText(row.category) }}</template>
                  </el-table-column>
                  <el-table-column prop="description" label="描述" min-width="200" />
                  <el-table-column prop="amount" label="金额" width="100">
                    <template #default="{row}">
                      <span class="amount">¥{{ formatCurrency(row.amount) }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="行程安排" name="itinerary">
          <div class="itinerary-container">
            <div class="itinerary-header">
              <h3>行程安排</h3>
              <el-button type="primary" @click="openItineraryDialog">
                <i class="el-icon-plus"></i>
                添加行程项
              </el-button>
            </div>
            
            <div v-if="!plan.itinerary" class="empty-state">
              <el-empty description="暂无行程安排" />
              <el-button type="primary" style="margin-top: 20px;" @click="generateItinerary">
                <i class="el-icon-magic-stick"></i>
                智能生成行程
              </el-button>
            </div>
            
            <div v-else class="itinerary-content">
              <div class="itinerary-editor">
                <el-input 
                  v-model="itineraryText" 
                  type="textarea" 
                  :rows="15" 
                  placeholder="请输入行程安排内容"
                />
                <div class="itinerary-actions">
                  <el-button type="primary" @click="saveItinerary">保存行程</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="费用管理" name="expenses">
          <div class="expenses-container">
            <div class="expenses-header">
              <h3>费用管理</h3>
              <el-button type="primary" @click="addExpense">
                <i class="el-icon-plus"></i>
                添加费用
              </el-button>
            </div>
            
            <div class="expense-stats" v-if="expenses.length > 0">
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>费用统计</span>
                  </div>
                </template>
                <div class="stats-row">
                  <div class="stat-item">
                    <span class="stat-label">总支出：</span>
                    <span class="stat-value">¥{{ formatCurrency(totalExpenses) }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">预算剩余：</span>
                    <span class="stat-value" :class="{ 'over-budget': remainingBudget < 0 }">
                      ¥{{ formatCurrency(remainingBudget) }}
                    </span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">预算使用：</span>
                    <span class="stat-value">{{ budgetUsagePercentage }}%</span>
                  </div>
                </div>
              </el-card>
            </div>
            
            <el-table 
              v-if="expenses.length > 0" 
              :data="expenses" 
              style="width: 100%; margin-top: 20px;"
              stripe
              border
            >
              <el-table-column prop="expenseDate" label="日期" width="120">
                <template #default="{row}">{{ formatDate(row.expenseDate) }}</template>
              </el-table-column>
              <el-table-column prop="category" label="分类" width="120">
                <template #default="{row}">{{ getCategoryText(row.category) }}</template>
              </el-table-column>
              <el-table-column prop="description" label="描述" min-width="200" />
              <el-table-column prop="amount" label="金额" width="100">
                <template #default="{row}">
                  <span class="amount">¥{{ formatCurrency(row.amount) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="paymentMethod" label="支付方式" width="120" />
              <el-table-column prop="location" label="地点" width="120" />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{row}">
                  <el-button size="small" @click="editExpense(row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteExpense(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div v-else class="empty-state">
              <el-empty description="暂无费用记录" />
              <el-button type="primary" style="margin-top: 20px;" @click="addExpense">
                <i class="el-icon-plus"></i>
                添加费用
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <el-empty v-else description="未找到旅行计划" />
    
    <!-- 行程编辑对话框 -->
    <el-dialog
      v-model="itineraryDialogVisible"
      title="添加行程项"
      width="500px"
    >
      <el-form :model="itineraryForm" label-width="80px">
        <el-form-item label="日期">
          <el-select v-model="itineraryForm.day" placeholder="选择第几天">
            <el-option 
              v-for="day in getDurationDays(plan.startDate, plan.endDate)" 
              :key="day" 
              :label="`第${day}天`" 
              :value="day" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间">
          <el-input v-model="itineraryForm.time" placeholder="如: 14:30" />
        </el-form-item>
        <el-form-item label="活动">
          <el-input v-model="itineraryForm.activity" placeholder="活动名称" />
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="itineraryForm.location" placeholder="活动地点" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="itineraryForm.notes" 
            type="textarea" 
            :rows="3" 
            placeholder="备注信息" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="itineraryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addItineraryItem">添加</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import dayjs from 'dayjs'

export default {
  name: 'TravelDetail',
  data() {
    return {
      activeTab: 'overview',
      expenses: [],
      itineraryText: '',
      itineraryDialogVisible: false,
      itineraryForm: {
        day: 1,
        time: '',
        activity: '',
        location: '',
        notes: ''
      }
    }
  },
  computed: {
    ...mapState(['loading', 'currentPlan']),
    plan() {
      return this.currentPlan || {
        title: '旅行计划',
        description: '',
        startDate: '',
        endDate: '',
        destination: '',
        status: 'PENDING',
        budget: 0,
        travelers: 1,
        tags: [],
        itinerary: ''
      }
    },
    totalExpenses() {
      return this.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
    },
    remainingBudget() {
      return (this.plan.budget || 0) - this.totalExpenses
    },
    budgetUsagePercentage() {
      if (!this.plan.budget) return 0
      return Math.min(Math.round((this.totalExpenses / this.plan.budget) * 100), 100)
    },
    recentExpenses() {
      return this.expenses.slice(0, 5).sort((a, b) => {
        return new Date(b.expenseDate) - new Date(a.expenseDate)
      })
    }
  },
  async mounted() {
    // 加载数据
    await this.fetchData()
    
    // 初始化行程文本
    if (this.plan.itinerary) {
      this.itineraryText = this.plan.itinerary
    }
  },
  methods: {
    // 获取旅行计划详情
    async fetchData() {
      try {
        const planId = Number(this.$route.params.id)
        await this.$store.dispatch('fetchTravelPlanById', planId)
        await this.fetchExpenses(planId)
      } catch (error) {
        console.error('获取数据失败:', error)
        this.$message.error('获取数据失败')
      }
    },
    
    // 获取费用列表
    async fetchExpenses(planId) {
      try {
        const response = await this.$store.dispatch('fetchExpenses', planId)
        this.expenses = response || []
      } catch (error) {
        console.error('获取费用记录失败:', error)
      }
    },
    
    // 返回列表
    backToList() {
      this.$router.push('/travel')
    },
    
    // 编辑旅行计划
    editPlan() {
      this.$router.push(`/travel/create?id=${this.plan.id}`)
    },
    
    // 删除旅行计划
    async deletePlan() {
      try {
        await this.$confirm('确定要删除这个旅行计划吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await this.$store.dispatch('deleteTravelPlan', this.plan.id)
        this.$message.success('删除成功')
        this.$router.push('/travel')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }
    },
    
    // 复制旅行计划
    duplicatePlan() {
      // TODO: 实现复制旅行计划功能
      this.$message.info('复制功能开发中')
    },
    
    // 分享旅行计划
    sharePlan() {
      // TODO: 实现分享旅行计划功能
      this.$message.info('分享功能开发中')
    },
    
    // 生成智能行程
    async generateItinerary() {
      try {
        this.$message.info('正在生成智能行程，请稍候...')
        // 保存当前行程文本
        this.saveItinerary()
        
        // 跳转到生成页面
        this.$router.push({
          path: '/travel/generate',
          query: {
            planId: this.plan.id
          }
        })
      } catch (error) {
        console.error('生成行程失败:', error)
        this.$message.error('生成行程失败')
      }
    },
    
    // 打开行程对话框
    openItineraryDialog() {
      this.itineraryForm = {
        day: 1,
        time: '',
        activity: '',
        location: '',
        notes: ''
      }
      this.itineraryDialogVisible = true
    },
    
    // 添加行程项
    addItineraryItem() {
      // 构建行程项文本
      const { day, time, activity, location, notes } = this.itineraryForm
      let itemText = `\n第${day}天 ${time}\n`
      itemText += `${activity}\n`
      if (location) itemText += `地点: ${location}\n`
      if (notes) itemText += `备注: ${notes}\n`
      itemText += '---------------------'
      
      // 添加到现有行程文本
      this.itineraryText = (this.itineraryText || '') + itemText
      this.itineraryDialogVisible = false
      
      // 保存行程
      this.saveItinerary()
    },
    
    // 保存行程
    async saveItinerary() {
      try {
        // 更新行程安排
        const updatedPlan = { ...this.plan, itinerary: this.itineraryText }
        await this.$store.dispatch('updateTravelPlan', {
          planId: this.plan.id,
          planData: updatedPlan
        })
        this.$message.success('行程已更新')
      } catch (error) {
        console.error('保存行程失败:', error)
        this.$message.error('保存行程失败')
      }
    },
    
    // 添加费用
    addExpense() {
      this.$router.push(`/expense/add/${this.plan.id}`)
    },
    
    // 编辑费用
    editExpense(expense) {
      this.$router.push({
        path: `/expense/edit/${expense.id}`,
        query: { planId: this.plan.id }
      })
    },
    
    // 删除费用
    async deleteExpense(expenseId) {
      try {
        await this.$confirm('确定要删除这条费用记录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await this.$store.dispatch('deleteExpense', expenseId)
        this.$message.success('删除成功')
        // 重新加载费用列表
        await this.fetchExpenses(this.plan.id)
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }
    },
    
    // 查看全部费用
    viewAllExpenses() {
      this.$router.push(`/expense?planId=${this.plan.id}`)
    },
    
    // 查看费用统计
    viewExpenseStatistics() {
      this.$router.push(`/expense/statistics/${this.plan.id}`)
    },
    
    // 格式化日期
    formatDate(date) {
      if (!date) return ''
      return dayjs(date).format('YYYY-MM-DD')
    },
    
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return ''
      return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss')
    },
    
    // 计算持续天数
    getDurationDays(startDate, endDate) {
      if (!startDate || !endDate) return 1
      const start = dayjs(startDate)
      const end = dayjs(endDate)
      return end.diff(start, 'day') + 1
    },
    
    // 格式化货币
    formatCurrency(amount) {
      if (typeof amount !== 'number') return '0'
      return amount.toLocaleString('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
    },
    
    // 获取状态类型
    getStatusType(status) {
      const typeMap = {
        'PENDING': 'info',
        'ACTIVE': 'success',
        'COMPLETED': 'primary',
        'CANCELLED': 'danger'
      }
      return typeMap[status] || 'default'
    },
    
    // 获取状态文本
    getStatusText(status) {
      const textMap = {
        'PENDING': '未开始',
        'ACTIVE': '进行中',
        'COMPLETED': '已完成',
        'CANCELLED': '已取消'
      }
      return textMap[status] || status
    },
    
    // 获取旅行类型文本
    getTypeText(type) {
      const typeMap = {
        'VACATION': '休闲度假',
        'BUSINESS': '商务出差',
        'ADVENTURE': '探险旅行',
        'CULTURE': '文化体验',
        'ROAD_TRIP': '自驾游',
        'BACKPACKING': '背包客',
        'FAMILY': '亲子游',
        'HONEYMOON': '蜜月旅行'
      }
      return typeMap[type] || type || '未知类型'
    },
    
    // 获取费用类别文本
    getCategoryText(category) {
      const categoryMap = {
        'FOOD': '餐饮',
        'ACCOMMODATION': '住宿',
        'TRANSPORTATION': '交通',
        'ATTRACTION': '景点门票',
        'SHOPPING': '购物',
        'ENTERTAINMENT': '娱乐',
        'OTHER': '其他'
      }
      return categoryMap[category] || category || '未分类'
    }
  },
  
  // 监听路由参数变化
  watch: {
    '$route.params.id'(newId, oldId) {
      if (newId && newId !== oldId) {
        this.fetchData()
      }
    },
    
    // 监听计划变化，更新行程文本
    'plan.itinerary'(newItinerary) {
      if (newItinerary && newItinerary !== this.itineraryText) {
        this.itineraryText = newItinerary
      }
    }
  }
}
</script>

<style scoped>
.travel-detail-container {
  padding: 20px;
}

/* 头部样式 */
.travel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.travel-title {
  margin: 0 0 10px;
  font-size: 24px;
  color: #303133;
}

.travel-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  font-size: 14px;
}

.travel-date,
.travel-destination {
  display: flex;
  align-items: center;
  color: #606266;
}

.travel-date i,
.travel-destination i {
  margin-right: 5px;
}

.travel-duration {
  color: #909399;
  font-size: 12px;
  margin-left: 5px;
}

.travel-actions {
  display: flex;
  gap: 10px;
}

/* 标签样式 */
.travel-tags {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.travel-tag {
  background-color: #f0f9ff;
  color: #1890ff;
  border-color: #91d5ff;
}

/* 标签页样式 */
.travel-tabs {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 概览样式 */
.travel-overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 15px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: #fff;
}

.stat-icon.money {
  background-color: #67c23a;
}

.stat-icon.users {
  background-color: #409eff;
}

.stat-icon.type {
  background-color: #e6a23c;
}

.stat-icon.expense {
  background-color: #f56c6c;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.travel-description-card {
  background-color: #fff;
}

.card-header {
  font-weight: bold;
  color: #303133;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 行程样式 */
.itinerary-container,
.expenses-container {
  padding: 20px;
}

.itinerary-header,
.expenses-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.itinerary-editor {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.itinerary-actions {
  display: flex;
  justify-content: flex-end;
}

/* 费用样式 */
.expense-stats {
  margin-bottom: 20px;
}

.stats-row {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.stat-item .stat-label {
  color: #606266;
  margin-right: 5px;
  font-size: 14px;
}

.stat-item .stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.over-budget {
  color: #f56c6c;
}

/* 最近费用样式 */
.recent-expenses {
  margin-top: 15px;
}

.amount {
  color: #f56c6c;
  font-weight: bold;
}

/* 加载状态 */
.loading {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .travel-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .travel-meta {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .travel-actions {
    width: 100%;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  
  .overview-stats {
    grid-template-columns: 1fr;
  }
  
  .stats-row {
    flex-direction: column;
    gap: 15px;
  }
}
</style>