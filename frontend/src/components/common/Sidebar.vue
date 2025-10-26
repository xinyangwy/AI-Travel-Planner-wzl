<template>
  <aside 
    class="sidebar"
    :class="{ 'sidebar-open': isOpen, 'sidebar-closed': !isOpen, 'dark-theme': darkMode }"
  >
    <!-- 侧边栏内容 -->
    <div class="sidebar-content">
      <!-- 用户信息区域 -->
      <div class="user-section" v-if="isAuthenticated">
        <div class="user-info">
          <img 
            v-if="userAvatar" 
            :src="userAvatar" 
            :alt="username" 
            class="user-avatar"
          />
          <div v-else class="user-avatar-placeholder">
            <span>{{ userInitials }}</span>
          </div>
          <div class="user-details">
            <div class="username">{{ username }}</div>
            <div class="user-role" v-if="userRole">{{ userRole }}</div>
          </div>
        </div>
        <router-link to="/profile" class="edit-profile-btn">
          <i class="fas fa-user-circle"></i>
        </router-link>
      </div>

      <!-- 快速访问区域 -->
      <div class="quick-access-section" v-if="activeTravelPlan">
        <div class="section-header">
          <h4>当前行程</h4>
          <button 
            class="close-plan-btn"
            @click="clearActivePlan"
            title="关闭当前行程"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="plan-info">
          <div class="plan-name">{{ activeTravelPlan.name }}</div>
          <div class="plan-date">
            {{ formatDate(activeTravelPlan.startDate) }} - {{ formatDate(activeTravelPlan.endDate) }}
          </div>
        </div>
      </div>

      <!-- 主导航菜单 -->
      <nav class="main-menu">
        <div class="menu-section">
          <h3 class="menu-section-title">主导航</h3>
          <ul class="menu-list">
            <li class="menu-item">
              <router-link 
                to="/" 
                class="menu-link"
                active-class="active"
                exact
                @click="closeSidebarOnMobile"
              >
                <i class="fas fa-home menu-icon"></i>
                <span class="menu-text">首页</span>
              </router-link>
            </li>
            <li class="menu-item">
              <router-link 
                to="/plans" 
                class="menu-link"
                active-class="active"
                @click="closeSidebarOnMobile"
              >
                <i class="fas fa-suitcase menu-icon"></i>
                <span class="menu-text">旅行计划</span>
                <span class="menu-badge" v-if="plansCount > 0">{{ plansCount }}</span>
              </router-link>
            </li>
            <li class="menu-item">
              <router-link 
                to="/favorites" 
                class="menu-link"
                active-class="active"
                @click="closeSidebarOnMobile"
              >
                <i class="fas fa-heart menu-icon"></i>
                <span class="menu-text">收藏</span>
                <span class="menu-badge" v-if="favoritesCount > 0">{{ favoritesCount }}</span>
              </router-link>
            </li>
            <li class="menu-item">
              <router-link 
                to="/destinations" 
                class="menu-link"
                active-class="active"
                @click="closeSidebarOnMobile"
              >
                <i class="fas fa-map-marker-alt menu-icon"></i>
                <span class="menu-text">目的地</span>
              </router-link>
            </li>
          </ul>
        </div>

        <div class="menu-section">
          <h3 class="menu-section-title">工具</h3>
          <ul class="menu-list">
            <li class="menu-item">
              <router-link 
                to="/ai-assistant" 
                class="menu-link"
                active-class="active"
                @click="closeSidebarOnMobile"
              >
                <i class="fas fa-robot menu-icon"></i>
                <span class="menu-text">AI助手</span>
              </router-link>
            </li>
            <li class="menu-item">
              <router-link 
                to="/statistics" 
                class="menu-link"
                active-class="active"
                @click="closeSidebarOnMobile"
              >
                <i class="fas fa-chart-pie menu-icon"></i>
                <span class="menu-text">统计分析</span>
              </router-link>
            </li>
            <li class="menu-item">
              <router-link 
                to="/currency-converter" 
                class="menu-link"
                active-class="active"
                @click="closeSidebarOnMobile"
              >
                <i class="fas fa-exchange-alt menu-icon"></i>
                <span class="menu-text">货币转换</span>
              </router-link>
            </li>
            <li class="menu-item">
              <router-link 
                to="/weather" 
                class="menu-link"
                active-class="active"
                @click="closeSidebarOnMobile"
              >
                <i class="fas fa-cloud-sun menu-icon"></i>
                <span class="menu-text">天气预报</span>
              </router-link>
            </li>
          </ul>
        </div>

        <div class="menu-section">
          <h3 class="menu-section-title">账户</h3>
          <ul class="menu-list">
            <li class="menu-item" v-if="isAuthenticated">
              <router-link 
                to="/profile" 
                class="menu-link"
                active-class="active"
                @click="closeSidebarOnMobile"
              >
                <i class="fas fa-user menu-icon"></i>
                <span class="menu-text">个人资料</span>
              </router-link>
            </li>
            <li class="menu-item">
              <router-link 
                to="/settings" 
                class="menu-link"
                active-class="active"
                @click="closeSidebarOnMobile"
              >
                <i class="fas fa-cog menu-icon"></i>
                <span class="menu-text">设置</span>
              </router-link>
            </li>
            <li class="menu-item" v-if="isAuthenticated">
              <a 
                href="#" 
                class="menu-link"
                @click.prevent="logout"
                @click="closeSidebarOnMobile"
              >
                <i class="fas fa-sign-out-alt menu-icon"></i>
                <span class="menu-text">退出登录</span>
              </a>
            </li>
            <li class="menu-item" v-else>
              <router-link 
                to="/login" 
                class="menu-link"
                active-class="active"
                @click="closeSidebarOnMobile"
              >
                <i class="fas fa-sign-in-alt menu-icon"></i>
                <span class="menu-text">登录/注册</span>
              </router-link>
            </li>
          </ul>
        </div>

        <div class="menu-section">
          <h3 class="menu-section-title">帮助</h3>
          <ul class="menu-list">
            <li class="menu-item">
              <a href="#" class="menu-link" @click.prevent="openHelpCenter">
                <i class="fas fa-question-circle menu-icon"></i>
                <span class="menu-text">帮助中心</span>
              </a>
            </li>
            <li class="menu-item">
              <a href="#" class="menu-link" @click.prevent="openFeedback">
                <i class="fas fa-comment-dots menu-icon"></i>
                <span class="menu-text">意见反馈</span>
              </a>
            </li>
            <li class="menu-item">
              <a href="#" class="menu-link" @click.prevent="openAbout">
                <i class="fas fa-info-circle menu-icon"></i>
                <span class="menu-text">关于我们</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <!-- 底部信息 -->
      <div class="sidebar-footer">
        <div class="app-info">
          <div class="app-version">v1.0.0</div>
          <div class="app-copyright">&copy; 2024 AI旅行规划助手</div>
        </div>
        <button 
          class="collapse-sidebar-btn"
          @click="toggleSidebar"
          :title="isOpen ? '收起侧边栏' : '展开侧边栏'"
        >
          <i :class="isOpen ? 'fas fa-chevron-left' : 'fas fa-chevron-right'"></i>
        </button>
      </div>
    </div>

    <!-- 背景遮罩 -->
    <div 
      v-if="isMobile && isOpen" 
      class="sidebar-backdrop"
      @click="toggleSidebar"
    ></div>
  </aside>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import eventBus from '@/utils/eventBus'

export default {
  name: 'Sidebar',
  
  computed: {
    ...mapState({
      isAuthenticated: state => state.auth.isAuthenticated,
      userAvatar: state => state.auth.user?.avatar,
      username: state => state.auth.user?.username || '用户',
      userRole: state => state.auth.user?.role || '用户',
      sidebarOpen: state => state.ui.sidebarOpen,
      isMobile: state => state.ui.isMobile,
      activeTravelPlan: state => state.travelPlan.currentPlan,
      plansCount: state => state.travelPlan.plans.length,
      darkMode: state => state.settings.appSettings.darkMode
    }),
    
    ...mapGetters('favorites', {
      favoritesCount: 'totalCount'
    }),
    
    isOpen() {
      return this.sidebarOpen
    },
    
    userInitials() {
      const name = this.username || ''
      return name.charAt(0).toUpperCase()
    }
  },
  
  mounted() {
    // 监听事件
    eventBus.on('sidebar:toggle', this.toggleSidebar)
    eventBus.on('sidebar:open', this.openSidebar)
    eventBus.on('sidebar:close', this.closeSidebar)
  },
  
  beforeDestroy() {
    // 移除事件监听
    eventBus.off('sidebar:toggle', this.toggleSidebar)
    eventBus.off('sidebar:open', this.openSidebar)
    eventBus.off('sidebar:close', this.closeSidebar)
  },
  
  methods: {
    ...mapActions('auth', ['logout']),
    ...mapActions('ui', ['toggleSidebar']),
    ...mapActions('travelPlan', ['clearCurrentPlan']),
    
    openSidebar() {
      this.$store.commit('ui/SET_SIDEBAR_OPEN', true)
    },
    
    closeSidebar() {
      this.$store.commit('ui/SET_SIDEBAR_OPEN', false)
    },
    
    closeSidebarOnMobile() {
      if (this.isMobile) {
        this.closeSidebar()
      }
    },
    
    clearActivePlan() {
      this.clearCurrentPlan()
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit'
      })
    },
    
    openHelpCenter() {
      this.$router.push('/help')
    },
    
    openFeedback() {
      this.$router.push('/feedback')
    },
    
    openAbout() {
      this.$router.push('/about')
    }
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  height: calc(100vh - 60px);
  background-color: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 998;
  transition: all 0.3s ease;
  overflow-y: auto;
}

.sidebar-open {
  width: 260px;
}

.sidebar-closed {
  width: 60px;
}

.dark-theme {
  background-color: #1f1f1f;
  color: #fff;
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 997;
}

.sidebar-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

/* 用户信息区域 */
.user-section {
  padding: 0 20px 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.dark-theme .user-section {
  border-bottom-color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-avatar,
.user-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.sidebar-closed .user-avatar,
.sidebar-closed .user-avatar-placeholder {
  margin-right: 0;
}

.user-avatar {
  object-fit: cover;
}

.user-avatar-placeholder {
  background-color: #1890ff;
  color: white;
}

.dark-theme .user-avatar-placeholder {
  background-color: #40a9ff;
}

.user-details {
  flex: 1;
}

.username {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 2px;
}

.user-role {
  font-size: 12px;
  color: #999;
}

.dark-theme .user-role {
  color: #999;
}

.edit-profile-btn {
  color: #1890ff;
  font-size: 16px;
  text-decoration: none;
  display: block;
  text-align: center;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.edit-profile-btn:hover {
  background-color: #f5f5f5;
}

.dark-theme .edit-profile-btn:hover {
  background-color: #333;
}

/* 快速访问区域 */
.quick-access-section {
  padding: 15px 20px;
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  margin: 0 20px 20px;
}

.dark-theme .quick-access-section {
  background-color: #1d2915;
  border-color: #389e0d;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header h4 {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #595959;
}

.dark-theme .section-header h4 {
  color: #ccc;
}

.close-plan-btn {
  background: none;
  border: none;
  font-size: 12px;
  cursor: pointer;
  color: #999;
  padding: 2px;
  border-radius: 2px;
  transition: color 0.2s;
}

.close-plan-btn:hover {
  color: #ff4d4f;
}

.plan-info {
  overflow: hidden;
}

.plan-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-date {
  font-size: 12px;
  color: #8c8c8c;
}

.dark-theme .plan-date {
  color: #999;
}

/* 主导航菜单 */
.main-menu {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px;
}

.menu-section {
  margin-bottom: 25px;
}

.menu-section-title {
  font-size: 12px;
  font-weight: 500;
  color: #8c8c8c;
  margin: 0 0 10px 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dark-theme .menu-section-title {
  color: #999;
}

.sidebar-closed .menu-section-title {
  display: none;
}

.menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu-item {
  margin-bottom: 2px;
}

.menu-link {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s;
  position: relative;
}

.dark-theme .menu-link {
  color: #fff;
}

.menu-link:hover {
  background-color: #f5f5f5;
}

.dark-theme .menu-link:hover {
  background-color: #333;
}

.menu-link.active {
  background-color: #e6f7ff;
  color: #1890ff;
}

.dark-theme .menu-link.active {
  background-color: #003a8c;
  color: #40a9ff;
}

.menu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
  margin-right: 12px;
}

.menu-text {
  font-size: 14px;
}

.sidebar-closed .menu-text {
  display: none;
}

.menu-badge {
  margin-left: auto;
  background-color: #ff4d4f;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.sidebar-closed .menu-badge {
  display: none;
}

/* 底部信息 */
.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dark-theme .sidebar-footer {
  border-top-color: #333;
}

.app-info {
  font-size: 12px;
  color: #8c8c8c;
}

.dark-theme .app-info {
  color: #999;
}

.app-version {
  margin-bottom: 2px;
}

.app-copyright {
  white-space: nowrap;
}

.sidebar-closed .app-info {
  display: none;
}

.collapse-sidebar-btn {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #8c8c8c;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s;
}

.collapse-sidebar-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.dark-theme .collapse-sidebar-btn:hover {
  background-color: #333;
  color: #fff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    top: 0;
    height: 100vh;
    z-index: 1000;
  }
  
  .sidebar-closed {
    transform: translateX(-100%);
    width: 260px;
  }
  
  .sidebar-open {
    transform: translateX(0);
  }
  
  .menu-icon {
    margin-right: 15px;
  }
}

/* 滚动条样式 */
.main-menu::-webkit-scrollbar,
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.main-menu::-webkit-scrollbar-track,
.sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.dark-theme .main-menu::-webkit-scrollbar-track,
.dark-theme .sidebar::-webkit-scrollbar-track {
  background: #333;
}

.main-menu::-webkit-scrollbar-thumb,
.sidebar::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.dark-theme .main-menu::-webkit-scrollbar-thumb,
.dark-theme .sidebar::-webkit-scrollbar-thumb {
  background: #666;
}

.main-menu::-webkit-scrollbar-thumb:hover,
.sidebar::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.dark-theme .main-menu::-webkit-scrollbar-thumb:hover,
.dark-theme .sidebar::-webkit-scrollbar-thumb:hover {
  background: #888;
}
</style>