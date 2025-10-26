<template>
  <div class="dashboard-page">
    <!-- 欢迎信息 -->
    <div class="welcome-section">
      <h1>欢迎回来，{{ userName }}</h1>
      <p>您的旅行计划概览</p>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Collection /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ planCount }}</div>
            <div class="stat-label">旅行计划</div>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ upcomingPlanCount }}</div>
            <div class="stat-label">即将到来</div>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><WalletFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ totalBudget }}</div>
            <div class="stat-label">总预算</div>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ totalSpent }}</div>
            <div class="stat-label">已花费</div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 最近旅行计划 -->
    <div class="recent-plans">
      <div class="section-header">
        <h2>最近旅行计划</h2>
        <el-link type="primary" :underline="false" @click="viewAllPlans">查看全部</el-link>
      </div>
      
      <div class="plans-grid">
        <TravelPlanCard 
          v-for="plan in recentPlans" 
          :key="plan.id || index"
          :plan="plan"
        />
        
        <!-- 模拟数据 -->
        <TravelPlanCard 
          v-if="recentPlans.length === 0"
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
          v-if="recentPlans.length === 0"
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
      </div>
    </div>
    
    <!-- 快速操作 -->
    <div class="quick-actions">
      <h2>快速操作</h2>
      <div class="actions-grid">
        <el-button type="primary" icon="el-icon-Plus" @click="createNewPlan">创建新计划</el-button>
        <el-button type="success" icon="el-icon-EditPen" @click="editTemplate">编辑模板</el-button>
        <el-button type="info" icon="el-icon-DocumentCopy" @click="importPlan">导入计划</el-button>
        <el-button type="warning" icon="el-icon-Setting" @click="openSettings">设置</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { Collection, Calendar, WalletFilled, TrendCharts, Plus, EditPen, DocumentCopy, Setting } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import TravelPlanCard from '../components/TravelPlanCard.vue'

export default {
  name: 'DashboardPage',
  components: {
    Collection,
    Calendar,
    WalletFilled,
    TrendCharts,
    Plus,
    EditPen,
    DocumentCopy,
    Setting,
    TravelPlanCard
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    
    // 模拟数据
    const userName = '旅行者'
    const planCount = 5
    const upcomingPlanCount = 2
    const totalBudget = 25000
    const totalSpent = 8500
    const recentPlans = []
    
    const viewAllPlans = () => {
      router.push('/plans')
    }
    
    const createNewPlan = () => {
      router.push('/plans/new')
    }
    
    const editTemplate = () => {
      router.push('/templates')
    }
    
    const importPlan = () => {
      // TODO: 实现导入功能
      console.log('导入计划')
    }
    
    const openSettings = () => {
      router.push('/profile')
    }
    
    return {
      userName,
      planCount,
      upcomingPlanCount,
      totalBudget,
      totalSpent,
      recentPlans,
      viewAllPlans,
      createNewPlan,
      editTemplate,
      importPlan,
      openSettings
    }
  }
}
</script>

<style scoped>
.dashboard-page {
  padding: var(--space-xl);
}

.welcome-section {
  margin-bottom: var(--space-2xl);
}

.welcome-section h1 {
  font-size: var(--font-size-2xl);
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

.welcome-section p {
  color: var(--text-secondary);
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-xl);
  margin-bottom: var(--space-2xl);
}

.stat-card {
  height: 120px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  background-color: var(--primary-color-light);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--primary-color);
  font-size: 28px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* 最近旅行计划 */
.recent-plans {
  margin-bottom: var(--space-2xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.section-header h2 {
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin: 0;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-xl);
}

/* 快速操作 */
.quick-actions h2 {
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin-bottom: var(--space-xl);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
}

.actions-grid .el-button {
  height: 50px;
  font-size: var(--font-size-base);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-page {
    padding: var(--space-lg);
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>