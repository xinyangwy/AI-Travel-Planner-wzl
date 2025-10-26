<template>
  <div class="expense-container">
    <h2 class="page-title">费用管理</h2>
    
    <el-tabs v-model="activeTab" @tab-click="handleTabClick" type="border-card">
      <el-tab-pane label="我的费用" name="expense-list">
        <router-view v-if="$route.path === '/expense' || $route.path === '/expense/list'" />
      </el-tab-pane>
      <el-tab-pane label="添加费用" name="expense-create">
        <router-view v-if="$route.path === '/expense/create'" />
      </el-tab-pane>
      <el-tab-pane label="费用详情" name="expense-detail">
        <router-view v-if="$route.path.includes('/expense/detail')" />
      </el-tab-pane>
      <el-tab-pane label="费用统计" name="expense-statistics">
        <router-view v-if="$route.path === '/expense/statistics'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'Expense',
  data() {
    return {
      activeTab: 'expense-list'
    }
  },
  watch: {
    $route(to) {
      // 根据路由自动切换选项卡
      if (to.path === '/expense' || to.path === '/expense/list') {
        this.activeTab = 'expense-list'
      } else if (to.path === '/expense/create' || to.path.includes('/expense/edit')) {
        this.activeTab = 'expense-create'
      } else if (to.path.includes('/expense/detail')) {
        this.activeTab = 'expense-detail'
      } else if (to.path === '/expense/statistics') {
        this.activeTab = 'expense-statistics'
      }
    }
  },
  methods: {
    handleTabClick(tab) {
      // 根据选项卡点击切换路由
      const name = tab.name
      switch (name) {
        case 'expense-list':
          this.$router.push('/expense/list')
          break
        case 'expense-create':
          this.$router.push('/expense/create')
          break
        case 'expense-detail':
          // 如果没有指定详情页ID，则不跳转
          if (!this.$route.path.includes('/expense/detail')) {
            this.$router.push('/expense/list')
          }
          break
        case 'expense-statistics':
          this.$router.push('/expense/statistics')
          break
      }
    }
  },
  mounted() {
    // 初始化选项卡状态
    if (this.$route.path === '/expense' || this.$route.path === '/expense/list') {
      this.activeTab = 'expense-list'
    } else if (this.$route.path === '/expense/create' || this.$route.path.includes('/expense/edit')) {
      this.activeTab = 'expense-create'
    } else if (this.$route.path.includes('/expense/detail')) {
      this.activeTab = 'expense-detail'
    } else if (this.$route.path === '/expense/statistics') {
      this.activeTab = 'expense-statistics'
    }
  }
}
</script>

<style scoped>
.expense-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  color: #303133;
  font-size: 24px;
}

.el-tabs {
  width: 100%;
}
</style>