<template>
  <div class="travel-container">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="我的旅行计划" name="list">
        <router-view />
      </el-tab-pane>
      <el-tab-pane label="创建/编辑" name="create">
        <router-view />
      </el-tab-pane>
      <el-tab-pane label="行程详情" name="detail">
        <router-view />
      </el-tab-pane>
      <el-tab-pane label="智能生成" name="generate">
        <router-view />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'Travel',
  data() {
    return {
      activeTab: 'list'
    }
  },
  watch: {
    $route(to) {
      if (to.path.includes('create')) {
        this.activeTab = 'create'
      } else if (to.path.includes('detail')) {
        this.activeTab = 'detail'
      } else if (to.path.includes('generate')) {
        this.activeTab = 'generate'
      } else {
        this.activeTab = 'list'
      }
    }
  },
  mounted() {
    // 初始化当前激活的标签
    this.$nextTick(() => {
      if (this.$route.path.includes('create')) {
        this.activeTab = 'create'
      } else if (this.$route.path.includes('detail')) {
        this.activeTab = 'detail'
      } else if (this.$route.path.includes('generate')) {
        this.activeTab = 'generate'
      }
    })
  }
}
</script>

<style scoped>
.travel-container {
  padding: 20px;
}
</style>