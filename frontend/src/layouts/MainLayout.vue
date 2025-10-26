<template>
  <div class="main-layout">
    <!-- 侧边栏 - TripAdvisor风格 -->
    <div 
      class="sidebar" 
      :class="{ 'sidebar-collapsed': isSidebarCollapsed }"
    >
      <!-- Logo区域 -->
      <div class="logo-area">
        <div class="logo-container">
          <el-icon class="logo-icon"><Map /></el-icon>
          <span class="logo-text" v-if="!isSidebarCollapsed">AI旅行助手</span>
        </div>
        <el-icon class="collapse-icon" @click="toggleSidebar">
          <ChevronLeft v-if="!isSidebarCollapsed" />
          <ChevronRight v-else />
        </el-icon>
      </div>
      
      <!-- 导航菜单 - TripAdvisor风格 -->
      <el-menu
        :collapse="isSidebarCollapsed"
        :default-active="activeMenuIndex"
        class="sidebar-menu"
        router
        @select="handleMenuSelect"
        background-color="#ffffff"
        text-color="#666666"
        active-text-color="#00a680"
        :unique-opened="true"
      >
        <!-- 主导航项 -->
        <el-menu-item index="/dashboard" class="nav-item">
          <el-icon><HomeFilled /></el-icon>
          <template #title v-if="!isSidebarCollapsed">仪表盘</template>
        </el-menu-item>
        
        <!-- 旅行管理子菜单 -->
        <el-sub-menu index="/travel" class="nav-item">
          <template #title>
            <el-icon><MapLocation /></el-icon>
            <template v-if="!isSidebarCollapsed">旅行计划</template>
          </template>
          <el-menu-item index="/travel/list" class="sub-nav-item">
            <el-icon><List /></el-icon>
            <template #title v-if="!isSidebarCollapsed">全部计划</template>
          </el-menu-item>
          <el-menu-item index="/travel/create" class="sub-nav-item">
            <el-icon><Plus /></el-icon>
            <template #title v-if="!isSidebarCollapsed">创建计划</template>
          </el-menu-item>
          <el-menu-item index="/travel/generate" class="sub-nav-item">
            <el-icon><MagicStick /></el-icon>
            <template #title v-if="!isSidebarCollapsed">智能生成</template>
          </el-menu-item>
          <el-menu-item index="/travel/templates" class="sub-nav-item">
            <el-icon><Collection /></el-icon>
            <template #title v-if="!isSidebarCollapsed">模板管理</template>
          </el-menu-item>
        </el-sub-menu>
        
        <!-- 费用管理子菜单 -->
        <el-sub-menu index="/expense" class="nav-item">
          <template #title>
            <el-icon><Wallet /></el-icon>
            <template v-if="!isSidebarCollapsed">费用管理</template>
          </template>
          <el-menu-item index="/expense/list" class="sub-nav-item">
            <el-icon><List /></el-icon>
            <template #title v-if="!isSidebarCollapsed">所有费用</template>
          </el-menu-item>
          <el-menu-item index="/expense/report" class="sub-nav-item">
            <el-icon><Document /></el-icon>
            <template #title v-if="!isSidebarCollapsed">费用报表</template>
          </el-menu-item>
          <el-menu-item index="/expense/categories" class="sub-nav-item">
            <el-icon><Grid /></el-icon>
            <template #title v-if="!isSidebarCollapsed">费用分类</template>
          </el-menu-item>
        </el-sub-menu>
        
        <!-- 统计分析 -->
        <el-menu-item index="/statistics" class="nav-item">
          <el-icon><TrendCharts /></el-icon>
          <template #title v-if="!isSidebarCollapsed">统计分析</template>
        </el-menu-item>
        
        <!-- 设置 -->
        <el-sub-menu index="/settings" class="nav-item">
          <template #title>
            <el-icon><Setting /></el-icon>
            <template v-if="!isSidebarCollapsed">设置</template>
          </template>
          <el-menu-item index="/settings/profile" class="sub-nav-item">
            <el-icon><User /></el-icon>
            <template #title v-if="!isSidebarCollapsed">个人资料</template>
          </el-menu-item>
          <el-menu-item index="/settings/app" class="sub-nav-item">
            <el-icon><Setting /></el-icon>
            <template #title v-if="!isSidebarCollapsed">应用设置</template>
          </el-menu-item>
          <el-menu-item index="/settings/account" class="sub-nav-item">
            <el-icon><User /></el-icon>
            <template #title v-if="!isSidebarCollapsed">账户安全</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
      
      <!-- 用户信息 -->
      <div class="user-info" v-if="!isSidebarCollapsed">
        <el-avatar :size="40" src="@/assets/images/avatar-default.png" />
        <div class="user-details">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-email">{{ user.email }}</div>
        </div>
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <app-header />
      
      <!-- 内容区域 -->
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
    
    <!-- 移动端遮罩 -->
    <div 
      v-if="isMobile && !isSidebarCollapsed" 
      class="mobile-overlay"
      @click="toggleSidebar"
    ></div>
  </div>
</template>

<script>
import { 
  Map, ChevronLeft, ChevronRight, HomeFilled, MapLocation, 
  List, Plus, MagicStick, Collection, Wallet, Document, 
  Grid, TrendCharts, Setting, User
} from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'

export default {
  name: 'MainLayout',
  components: {
    Map,
    ChevronLeft,
    ChevronRight,
    HomeFilled,
    MapLocation,
    List,
    Plus,
    MagicStick,
    Collection,
    Wallet,
    Document,
    Grid,
    TrendCharts,
    Setting,
    User,
    AppHeader
  },
  data() {
    return {
      isSidebarCollapsed: false,
      isMobile: window.innerWidth < 768,
      user: {
        name: '旅行者',
        email: 'traveler@example.com'
      }
    }
  },
  computed: {
    // 获取当前活动菜单索引
    activeMenuIndex() {
      const path = this.$route.path
      // 处理嵌套路径，确保高亮显示父级菜单
      if (path.startsWith('/travel/') && path !== '/travel') {
        return '/travel'
      } else if (path.startsWith('/expense/') && path !== '/expense') {
        return '/expense'
      } else if (path.startsWith('/settings/') && path !== '/settings') {
        return '/settings'
      }
      return path
    }
  },
  mounted() {
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize)
    
    // 移动端默认收起侧边栏
    if (this.isMobile) {
      this.isSidebarCollapsed = true
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    // 切换侧边栏展开/收起状态
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed
    },
    
    // 处理菜单选择
    handleMenuSelect(key, keyPath) {
      console.log('Selected menu:', key, keyPath)
      // 在移动端选择菜单项后自动收起侧边栏
      if (this.isMobile) {
        this.isSidebarCollapsed = true
      }
    },
    
    // 处理窗口大小变化
    handleResize() {
      const wasMobile = this.isMobile
      this.isMobile = window.innerWidth < 768
      
      // 从桌面模式切换到移动模式时自动收起侧边栏
      if (!wasMobile && this.isMobile) {
        this.isSidebarCollapsed = true
      }
    }
  }
}
</script>

<style scoped>
/* 主布局容器 - TripAdvisor风格 */
.main-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 侧边栏样式 - TripAdvisor风格 */
.sidebar {
  width: 260px;
  background-color: #ffffff;
  transition: width 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

/* 侧边栏收起状态 */
.sidebar-collapsed {
  width: 64px;
}

/* Logo区域 */
.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #eeeeee;
  cursor: pointer;
  background-color: #ffffff;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 24px;
  color: #00a680; /* TripAdvisor绿色 */
  transition: transform 0.2s ease;
}

.logo-container:hover .logo-icon {
  transform: scale(1.1);
}

.logo-text {
  margin-left: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  transition: color 0.2s ease;
}

.logo-container:hover .logo-text {
  color: #00a680;
}

.collapse-icon {
  font-size: 18px;
  color: #666666;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.collapse-icon:hover {
  background-color: #f0f0f0;
  color: #00a680;
}

/* 菜单样式 */
.sidebar-menu {
  flex: 1;
  border-right: none;
  padding: 16px 0;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
  padding: 0;
  position: relative;
  transition: all 0.2s ease;
}

:deep(.nav-item) {
  border-radius: 0 8px 8px 0;
  margin-bottom: 4px;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: #f8f8f8 !important;
}

:deep(.el-menu-item.is-active),
:deep(.el-sub-menu__title.is-active) {
  color: #00a680 !important;
  background-color: rgba(0, 166, 128, 0.1) !important;
  font-weight: 500;
}

:deep(.el-menu-item.is-active::before),
:deep(.el-sub-menu__title.is-active::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background-color: #00a680;
  border-radius: 0 4px 4px 0;
}

:deep(.el-sub-menu__title) {
  display: flex;
  align-items: center;
}

:deep(.el-sub-menu__icon-arrow) {
  top: 50%;
  transform: translateY(-50%);
  right: 10px;
}

:deep(.el-menu--collapse .el-sub-menu__title .el-sub-menu__icon-arrow) {
  display: none;
}

:deep(.el-menu--collapse .el-sub-menu .el-menu) {
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.sub-nav-item) {
  padding-left: 36px !important;
  transition: all 0.2s ease;
}

:deep(.sub-nav-item:hover) {
  background-color: #f8f8f8 !important;
}

:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  margin-right: 10px;
  font-size: 16px;
}

/* 用户信息区域 */
.user-info {
  padding: 16px;
  border-top: 1px solid #eeeeee;
  display: flex;
  align-items: center;
  background-color: #ffffff;
}

.user-details {
  margin-left: 12px;
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 4px;
}

.user-email {
  font-size: 12px;
  color: #666666;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background-color: #f5f7fa;
}

/* 内容包装器 */
.content-wrapper {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移动端遮罩 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    height: 100vh;
    left: 0;
    top: 0;
    transition: transform 0.3s ease;
  }
  
  .sidebar.sidebar-collapsed {
    transform: translateX(-100%);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  }
  
  .main-content {
    width: 100%;
  }
  
  .content-wrapper {
    padding: 16px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }
  
  .sidebar-collapsed {
    width: 64px;
  }
}
</style>