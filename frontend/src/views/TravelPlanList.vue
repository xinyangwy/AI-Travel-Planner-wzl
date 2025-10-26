<template>
  <div class="travel-plan-list">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h1>我的旅行计划</h1>
      <el-button type="primary" @click="createNewPlan">创建新计划</el-button>
    </div>
    
    <!-- 筛选器 -->
    <div class="filter-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索计划名称或目的地"
        prefix-icon="el-icon-Search"
        clearable
        @input="handleSearch"
      />
      
      <el-select
        v-model="statusFilter"
        placeholder="筛选状态"
        clearable
        @change="handleFilter"
      >
        <el-option label="进行中" value="进行中" />
        <el-option label="已完成" value="已完成" />
        <el-option label="已取消" value="已取消" />
      </el-select>
      
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleFilter"
      />
    </div>
    
    <!-- 计划列表 -->
    <div class="plans-container">
      <div class="plans-grid">
        <TravelPlanCard
          v-for="(plan, index) in filteredPlans"
          :key="plan.id || index"
          :plan="plan"
        />
        
        <!-- 模拟数据 -->
        <TravelPlanCard
          v-if="filteredPlans.length === 0"
          :plan="{
            title: '上海三日游',
            startDate: '2024-12-25',
            endDate: '2024-12-27',
            destination: '上海',
            totalBudget: 5000,
            spent: 1200,
            itineraryCount: 15,
            status: '进行中'
          }"
        />
        <TravelPlanCard
          v-if="filteredPlans.length === 0"
          :plan="{
            title: '三亚度假之旅',
            startDate: '2025-02-10',
            endDate: '2025-02-16',
            destination: '三亚',
            totalBudget: 8000,
            spent: 500,
            itineraryCount: 20,
            status: '进行中'
          }"
        />
        <TravelPlanCard
          v-if="filteredPlans.length === 0"
          :plan="{
            title: '北京文化之旅',
            startDate: '2024-10-01',
            endDate: '2024-10-05',
            destination: '北京',
            totalBudget: 6000,
            spent: 6000,
            itineraryCount: 25,
            status: '已完成'
          }"
        />
      </div>
      
      <!-- 空状态 -->
      <div class="empty-state" v-if="filteredPlans.length === 0 && plans.length > 0">
        <el-empty description="没有找到符合条件的旅行计划" />
      </div>
    </div>
  </div>
</template>

<script>
import { Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import TravelPlanCard from '../components/TravelPlanCard.vue'

export default {
  name: 'TravelPlanList',
  components: {
    Search,
    TravelPlanCard
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    
    // 响应式数据
    const searchQuery = ''
    const statusFilter = ''
    const dateRange = null
    const plans = [] // 从 store 获取或模拟数据
    
    // 计算属性：筛选后的计划
    const filteredPlans = [] // 实际应用中应该根据搜索条件和筛选条件过滤 plans
    
    // 创建新计划
    const createNewPlan = () => {
      router.push('/plans/new')
    }
    
    // 搜索处理
    const handleSearch = () => {
      // TODO: 实现搜索逻辑
      console.log('搜索:', searchQuery)
    }
    
    // 筛选处理
    const handleFilter = () => {
      // TODO: 实现筛选逻辑
      console.log('筛选状态:', statusFilter)
      console.log('筛选日期范围:', dateRange)
    }
    
    return {
      searchQuery,
      statusFilter,
      dateRange,
      plans,
      filteredPlans,
      createNewPlan,
      handleSearch,
      handleFilter
    }
  }
}
</script>

<style scoped>
.travel-plan-list {
  padding: var(--space-xl);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.page-header h1 {
  font-size: var(--font-size-2xl);
  color: var(--text-primary);
  margin: 0;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
}

.filter-bar .el-input {
  width: 300px;
}

.filter-bar .el-select {
  width: 150px;
}

.filter-bar .el-date-editor {
  width: 240px;
}

/* 计划列表 */
.plans-container {
  min-height: 400px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-xl);
}

/* 空状态 */
.empty-state {
  margin-top: var(--space-3xl);
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .travel-plan-list {
    padding: var(--space-lg);
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-lg);
  }
  
  .filter-bar {
    flex-direction: column;
  }
  
  .filter-bar .el-input,
  .filter-bar .el-select,
  .filter-bar .el-date-editor {
    width: 100%;
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
  }
}
</style>