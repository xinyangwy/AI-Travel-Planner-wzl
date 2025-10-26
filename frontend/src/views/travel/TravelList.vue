<template>
  <div class="travel-list-container">
    <!-- TripAdvisor风格的页面标题 -->
    <div class="page-header">
      <h1 class="section-title">我的旅行计划</h1>
      <p class="section-subtitle">发现、规划和管理您的完美旅程</p>
    </div>
    
    <!-- 搜索和操作区域 -->
    <div class="search-actions-bar">
      <div class="search-container">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索旅行计划、目的地或标签..." 
          clearable 
          class="search-input"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      
      <el-button 
        type="primary" 
        class="create-plan-btn"
        @click="$router.push('/travel/create')"
      >
        <el-icon><Plus /></el-icon>
        创建旅行计划
      </el-button>
    </div>
    
    <!-- 筛选器区域 - TripAdvisor风格 -->
    <div class="filters-container">
      <div class="filters-section">
        <div class="filter-group">
          <el-select 
            v-model="statusFilter" 
            placeholder="筛选状态" 
            clearable 
            class="filter-select"
          >
            <el-option label="全部状态" value="" />
            <el-option label="未开始" value="PENDING" />
            <el-option label="进行中" value="ACTIVE" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
          
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="filter-date-picker"
          ></el-date-picker>
        </div>
        
        <!-- 视图切换 -->
        <div class="view-controls">
          <div class="view-toggle">
            <span class="view-label">视图：</span>
            <el-radio-group v-model="viewMode" size="small" class="view-radio-group">
              <el-radio-button label="grid" class="view-radio-btn">
                <el-icon><Grid /></el-icon>
                <span class="view-text">网格</span>
              </el-radio-button>
              <el-radio-button label="list" class="view-radio-btn">
                <el-icon><List /></el-icon>
                <span class="view-text">列表</span>
              </el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 内容区域 - TripAdvisor风格 -->
    <div class="plans-container">
      <!-- 加载状态 -->
      <template v-if="loading">
        <div class="loading-card">
          <el-skeleton :rows="6" animated :throttle="500" />
        </div>
      </template>
      
      <!-- 空状态 -->
      <template v-else-if="filteredPlans.length === 0">
        <div class="empty-state">
          <div class="empty-state-content">
            <el-icon class="empty-icon"><Document /></el-icon>
            <h3>您还没有旅行计划</h3>
            <p>创建您的第一个旅行计划，开始规划完美的旅程！</p>
            <el-button 
              type="primary" 
              class="create-first-plan-btn"
              @click="$router.push('/travel/create')"
            >
              <el-icon><Plus /></el-icon>
              创建旅行计划
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索无结果状态 -->
      <template v-else-if="paginatedPlans.length === 0">
        <div class="empty-state">
          <div class="empty-state-content">
            <el-icon class="empty-icon"><Search /></el-icon>
            <h3>未找到匹配的旅行计划</h3>
            <p>尝试使用不同的搜索词或筛选条件</p>
            <el-button 
              @click="resetFilters"
            >
              重置筛选条件
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 内容展示 -->
      <template v-else>
        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="plan-cards-grid">
          <div 
            v-for="plan in paginatedPlans" 
            :key="plan.id" 
            class="plan-card-wrapper"
          >
            <plan-card 
              :plan="convertToPlanCardFormat(plan)"
              @click="viewPlan(plan.id)"
            />
            
            <!-- 卡片操作按钮 -->
            <div class="card-actions">
              <el-tooltip content="编辑计划">
                <el-button 
                  circle 
                  size="small" 
                  class="action-btn edit-btn"
                  @click.stop="editPlan(plan.id)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除计划">
                <el-button 
                  circle 
                  size="small" 
                  class="action-btn delete-btn"
                  @click.stop="deletePlan(plan.id)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
        </div>
        
        <!-- 列表视图 - TripAdvisor风格 -->
        <div v-else class="list-view-container">
          <div 
            v-for="plan in paginatedPlans" 
            :key="plan.id" 
            class="list-view-item"
            @click="viewPlan(plan.id)"
          >
            <!-- 左侧内容区 -->
            <div class="list-content">
              <div class="list-header">
                <h3 class="list-plan-title">{{ plan.title }}</h3>
                <el-tag 
                  :type="getStatusType(plan.status)"
                  class="list-status-tag"
                >
                  {{ getStatusText(plan.status) }}
                </el-tag>
              </div>
              
              <div class="list-meta">
                <div class="list-location">
                  <el-icon class="meta-icon"><Position /></el-icon>
                  {{ plan.destination }}
                </div>
                <div class="list-date">
                  <el-icon class="meta-icon"><Calendar /></el-icon>
                  {{ formatDate(plan.startDate) }} 至 {{ formatDate(plan.endDate) }}
                </div>
              </div>
              
              <p v-if="plan.description" class="list-description">
                {{ plan.description.length > 120 ? plan.description.substring(0, 120) + '...' : plan.description }}
              </p>
            </div>
            
            <!-- 右侧操作区 -->
            <div class="list-actions" @click.stop>
              <el-button 
                type="primary" 
                size="small" 
                class="list-edit-btn"
                @click="editPlan(plan.id)"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                class="list-delete-btn"
                @click="deletePlan(plan.id)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </div>
      </template>
    </div>
    
    <!-- 分页区域 - TripAdvisor风格 -->
    <div class="pagination-container">
      <div v-if="filteredPlans.length > 0" class="pagination-wrapper">
        <!-- 结果统计 -->
        <div class="results-count">
          显示 {{ (currentPage - 1) * pageSize + 1 }} 至 {{ Math.min(currentPage * pageSize, filteredPlans.length) }} 条，共 {{ filteredPlans.length }} 条旅行计划
        </div>
        
        <!-- 分页控件 -->
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[6, 12, 24]"
          layout="prev, pager, next, sizes"
          :total="filteredPlans.length"
          class="trip-pagination"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import dayjs from 'dayjs'
import PlanCard from '@/components/travel/PlanCard.vue'
import { Search, Plus, Grid, List, Document, Delete, Edit, Position, Calendar } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const store = useStore()

// 响应式数据
const searchQuery = ref('')
const statusFilter = ref('')
const dateRange = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const viewMode = ref('grid')

// 计算属性
const plans = computed(() => store.state.plans || [])
const loading = computed(() => store.state.loading)

// 过滤后的旅行计划
const filteredPlans = computed(() => {
  let result = [...plans.value]
  
  // 按标题搜索
  if (searchQuery.value) {
    result = result.filter(plan => 
      plan.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      plan.destination.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (plan.description && plan.description.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  }
  
  // 按状态筛选
  if (statusFilter.value) {
    result = result.filter(plan => plan.status === statusFilter.value)
  }
  
  // 按日期范围筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const start = dateRange.value[0]
    const end = dateRange.value[1]
    result = result.filter(plan => {
      const planStart = new Date(plan.startDate)
      const planEnd = new Date(plan.endDate)
      return planStart <= end && planEnd >= start
    })
  }
  
  return result
})

// 分页后的计划
const paginatedPlans = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredPlans.value.slice(start, end)
})

// 方法
const fetchTravelPlans = async () => {
  try {
    await store.dispatch('fetchTravelPlans')
  } catch (error) {
    console.error('获取旅行计划失败:', error)
  }
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const getStatusType = (status) => {
  const typeMap = {
    'PENDING': 'info',
    'ACTIVE': 'success',
    'COMPLETED': 'primary',
    'CANCELLED': 'danger'
  }
  return typeMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    'PENDING': '未开始',
    'ACTIVE': '进行中',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return textMap[status] || status
}

const viewPlan = (planId) => {
  router.push(`/travel/detail/${planId}`)
}

const editPlan = (planId) => {
  router.push(`/travel/create?id=${planId}`)
}

const deletePlan = async (planId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个旅行计划吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await store.dispatch('deleteTravelPlan', planId)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const convertToPlanCardFormat = (plan) => {
  return {
    id: plan.id,
    name: plan.title,
    description: plan.description,
    startDate: plan.startDate,
    endDate: plan.endDate,
    destination: plan.destination,
    status: plan.status.toLowerCase(),
    budget: plan.budget,
    travelers: plan.travelers || 1,
    itineraryCount: plan.itineraryCount || 0,
    tags: plan.tags || [],
    pinned: plan.pinned || false,
    updatedAt: plan.updateTime || plan.createTime,
    createdBy: {
      username: store.state.user?.username || '未知用户',
      avatar: store.state.user?.avatar || null
    }
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (current) => {
  currentPage.value = current
}

// 重置筛选条件
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  dateRange.value = null
  currentPage.value = 1
}

// 组件挂载时获取数据
onMounted(() => {
  fetchTravelPlans()
})
</script>

<style scoped>
/* TripAdvisor风格的旅行计划列表样式 */
.travel-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
}

/* 页面标题区域 */
.page-header {
  margin-bottom: 30px;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.section-subtitle {
  font-size: 1rem;
  color: #606266;
  margin-bottom: 0;
}

/* 搜索和操作区域 */
.search-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  height: 44px;
  border-radius: 24px;
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.search-input:focus {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  border-color: #409eff;
}

.create-plan-btn {
  height: 44px;
  border-radius: 24px;
  background-color: #1890ff;
  border: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.create-plan-btn:hover {
  background-color: #40a9ff;
  transform: translateY(-1px);
}

/* 筛选器区域 */
.filters-container {
  background-color: #f7f8fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-group {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  min-width: 160px;
  border-radius: 8px;
}

.filter-date-picker {
  min-width: 280px;
  border-radius: 8px;
}

/* 视图切换控件 */
.view-controls {
  display: flex;
  align-items: center;
}

.view-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-label {
  color: #606266;
  font-weight: 500;
}

.view-radio-group {
  background-color: white;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  overflow: hidden;
}

.view-radio-btn {
  border-right: 1px solid #dcdfe6;
}

.view-radio-btn:last-child {
  border-right: none;
}

.view-text {
  font-size: 0.9rem;
  font-weight: 500;
}

/* 加载状态 */
.loading {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 网格视图样式 */
.plan-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.plan-card-wrapper {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.plan-card-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

/* 加载卡片 */
.loading-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 空状态样式 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background-color: #f7f8fa;
  border-radius: 12px;
  padding: 40px 20px;
}

.empty-state-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  font-size: 48px;
  color: #dcdfe6;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.empty-state p {
  color: #606266;
  margin-bottom: 20px;
}

.create-first-plan-btn {
  border-radius: 24px;
  padding: 10px 24px;
  font-weight: 500;
}

/* 卡片操作按钮 */
.card-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.plan-card-wrapper:hover .card-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.edit-btn {
  color: #1890ff;
}

.delete-btn {
  color: #ff4d4f;
}

/* 列表视图样式 */
.list-view-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-view-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  cursor: pointer;
}

.list-view-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.list-content {
  flex: 1;
  min-width: 0;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.list-plan-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #303133;
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-status-tag {
  flex-shrink: 0;
}

.list-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 10px;
  color: #606266;
  font-size: 0.9rem;
}

.meta-icon {
  margin-right: 5px;
  font-size: 14px;
}

.list-description {
  color: #606266;
  line-height: 1.5;
  margin: 0;
}

.list-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.list-edit-btn, .list-delete-btn {
  border-radius: 20px;
  padding: 6px 12px;
}

/* 分页控件 */
.pagination-container {
  margin-top: 30px;
}

.pagination-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background-color: #f7f8fa;
  border-radius: 12px;
  padding: 20px;
}

.results-count {
  font-size: 0.9rem;
  color: #606266;
}

.trip-pagination {
  --el-pagination-border-radius: var(--border-radius-md);
}

/* 响应式设计增强 */
@media (max-width: 576px) {
  .pagination-wrapper {
    padding: 15px;
  }
  
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .list-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .list-view-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .list-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .travel-list-container {
    padding: 15px;
  }
  
  .search-actions-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    max-width: 100%;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    flex-direction: column;
  }
  
  .filter-select,
  .filter-date-picker {
    width: 100%;
  }
  
  .plan-cards-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1199px) {
  .plan-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .plan-cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>