<template>
  <header class="app-header">
    <!-- 左侧logo和菜单按钮 -->
    <div class="header-left">
      <button 
        class="menu-btn" 
        @click="toggleSidebar"
        :aria-expanded="sidebarOpen"
        aria-label="切换侧边栏"
      >
        <i class="fas fa-bars"></i>
      </button>
      <div class="logo">
        <router-link to="/">
          <i class="fas fa-paper-plane"></i>
          <span class="logo-text">AI旅行规划助手</span>
        </router-link>
      </div>
    </div>

    <!-- 中间导航菜单 -->
    <nav class="main-nav" v-if="!isMobile">
      <ul class="nav-list">
        <li class="nav-item">
          <router-link 
            to="/" 
            class="nav-link"
            active-class="active"
            exact
          >
            <i class="fas fa-home"></i>
            <span>首页</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link 
            to="/plans" 
            class="nav-link"
            active-class="active"
          >
            <i class="fas fa-suitcase"></i>
            <span>旅行计划</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link 
            to="/statistics" 
            class="nav-link"
            active-class="active"
          >
            <i class="fas fa-chart-pie"></i>
            <span>统计分析</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link 
            to="/ai-assistant" 
            class="nav-link"
            active-class="active"
          >
            <i class="fas fa-robot"></i>
            <span>AI助手</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- 右侧用户相关 -->
    <div class="header-right">
      <!-- 搜索按钮 -->
      <button 
        class="header-btn"
        @click="toggleSearch"
        aria-label="搜索"
      >
        <i class="fas fa-search"></i>
      </button>

      <!-- 通知按钮 -->
      <button 
        class="header-btn"
        @click="toggleNotifications"
        aria-label="通知"
      >
        <i class="fas fa-bell"></i>
        <span v-if="notificationCount > 0" class="badge">{{ notificationCount }}</span>
      </button>

      <!-- 设置按钮 -->
      <button 
        class="header-btn"
        @click="goToSettings"
        aria-label="设置"
      >
        <i class="fas fa-cog"></i>
      </button>

      <!-- 用户菜单 -->
      <div class="user-menu" v-if="isAuthenticated">
        <button 
          class="user-menu-btn"
          @click="toggleUserMenu"
          aria-label="用户菜单"
          :aria-expanded="userMenuOpen"
        >
          <img 
            v-if="userAvatar" 
            :src="userAvatar" 
            :alt="username" 
            class="user-avatar"
          />
          <div v-else class="user-avatar-placeholder">
            <span>{{ userInitials }}</span>
          </div>
          <span class="username">{{ username }}</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        <div v-if="userMenuOpen" class="user-dropdown">
          <router-link to="/profile" class="dropdown-item">
            <i class="fas fa-user"></i>
            <span>个人资料</span>
          </router-link>
          <router-link to="/settings" class="dropdown-item">
            <i class="fas fa-cog"></i>
            <span>设置</span>
          </router-link>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item logout-btn" @click="logout">
            <i class="fas fa-sign-out-alt"></i>
            <span>退出登录</span>
          </button>
        </div>
      </div>

      <!-- 登录按钮 -->
      <router-link 
        v-else 
        to="/login" 
        class="login-btn"
      >
        <i class="fas fa-sign-in-alt"></i>
        <span>登录</span>
      </router-link>
    </div>

    <!-- 搜索面板 -->
    <div class="search-panel" v-if="searchOpen">
      <div class="search-container">
        <div class="search-input-wrapper">
          <input 
            type="text" 
            class="search-input"
            placeholder="搜索旅行计划、行程、地点..."
            v-model="searchQuery"
            @keyup.enter="performSearch"
            ref="searchInput"
          />
          <button 
            class="search-btn"
            @click="performSearch"
          >
            <i class="fas fa-search"></i>
          </button>
          <button 
            class="close-search-btn"
            @click="toggleSearch"
            aria-label="关闭搜索"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="search-suggestions" v-if="searchSuggestions.length > 0">
          <div 
            v-for="suggestion in searchSuggestions" 
            :key="suggestion.id"
            class="suggestion-item"
            @click="selectSuggestion(suggestion)"
          >
            <i :class="suggestion.icon"></i>
            <span>{{ suggestion.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知面板 -->
    <div class="notifications-panel" v-if="notificationsOpen">
      <div class="notifications-header">
        <h3>通知</h3>
        <button 
          class="mark-all-read-btn"
          @click="markAllAsRead"
          :disabled="!hasUnreadNotifications"
        >
          全部已读
        </button>
      </div>
      <div class="notifications-list" v-if="notifications.length > 0">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          class="notification-item"
          :class="{ 'unread': !notification.read }"
          @click="markAsRead(notification)"
        >
          <div class="notification-icon">
            <i :class="notification.icon"></i>
          </div>
          <div class="notification-content">
            <div class="notification-text">{{ notification.message }}</div>
            <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
          </div>
          <button 
            class="delete-notification-btn"
            @click.stop="deleteNotification(notification)"
            aria-label="删除通知"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      <div class="empty-notifications" v-else>
        <i class="far fa-bell"></i>
        <p>暂无通知</p>
      </div>
    </div>
  </header>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import eventBus from '@/utils/eventBus'

export default {
  name: 'AppHeader',
  
  data() {
    return {
      searchOpen: false,
      notificationsOpen: false,
      userMenuOpen: false,
      searchQuery: '',
      searchSuggestions: []
    }
  },
  
  computed: {
    ...mapState({
      isAuthenticated: state => state.auth.isAuthenticated,
      userAvatar: state => state.auth.user?.avatar,
      username: state => state.auth.user?.username || '用户',
      sidebarOpen: state => state.ui.sidebarOpen,
      isMobile: state => state.ui.isMobile,
      notifications: state => state.ui.notifications,
      notificationCount: state => state.ui.notifications.filter(n => !n.read).length,
      hasUnreadNotifications: state => state.ui.notifications.some(n => !n.read)
    }),
    
    userInitials() {
      const name = this.username || ''
      return name.charAt(0).toUpperCase()
    }
  },
  
  mounted() {
    // 监听点击外部事件
    document.addEventListener('click', this.handleClickOutside)
    
    // 监听键盘事件
    document.addEventListener('keydown', this.handleKeyDown)
    
    // 监听通知事件
    eventBus.on('notification:new', this.handleNewNotification)
  },
  
  beforeDestroy() {
    // 移除事件监听
    document.removeEventListener('click', this.handleClickOutside)
    document.removeEventListener('keydown', this.handleKeyDown)
    eventBus.off('notification:new', this.handleNewNotification)
  },
  
  methods: {
    ...mapActions('auth', ['logout']),
    ...mapActions('ui', ['toggleSidebar', 'markNotificationAsRead', 'markAllNotificationsAsRead', 'deleteNotification']),
    
    toggleSearch() {
      this.searchOpen = !this.searchOpen
      this.notificationsOpen = false
      this.userMenuOpen = false
      
      if (this.searchOpen) {
        this.$nextTick(() => {
          this.$refs.searchInput?.focus()
        })
      } else {
        this.searchQuery = ''
        this.searchSuggestions = []
      }
    },
    
    toggleNotifications() {
      this.notificationsOpen = !this.notificationsOpen
      this.searchOpen = false
      this.userMenuOpen = false
    },
    
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen
      this.searchOpen = false
      this.notificationsOpen = false
    },
    
    goToSettings() {
      this.$router.push('/settings')
    },
    
    performSearch() {
      if (this.searchQuery.trim()) {
        // 触发搜索事件
        eventBus.emit('search:perform', this.searchQuery.trim())
        // 跳转到搜索结果页面
        this.$router.push({
          path: '/search',
          query: { q: this.searchQuery.trim() }
        })
        this.toggleSearch()
      }
    },
    
    selectSuggestion(suggestion) {
      // 根据建议类型跳转到不同页面
      if (suggestion.type === 'plan') {
        this.$router.push(`/plans/${suggestion.id}`)
      } else if (suggestion.type === 'itinerary') {
        this.$router.push(`/plans/${suggestion.planId}/itinerary/${suggestion.id}`)
      }
      this.toggleSearch()
    },
    
    markAsRead(notification) {
      if (!notification.read) {
        this.markNotificationAsRead(notification.id)
      }
    },
    
    markAllAsRead() {
      this.markAllNotificationsAsRead()
    },
    
    handleClickOutside(event) {
      const isHeader = this.$el.contains(event.target)
      if (!isHeader) {
        this.searchOpen = false
        this.notificationsOpen = false
        this.userMenuOpen = false
      }
    },
    
    handleKeyDown(event) {
      if (event.key === 'Escape') {
        this.searchOpen = false
        this.notificationsOpen = false
        this.userMenuOpen = false
      }
    },
    
    handleNewNotification(notification) {
      // 处理新通知
      console.log('New notification received:', notification)
    },
    
    formatTime(timestamp) {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMins < 1) return '刚刚'
      if (diffMins < 60) return `${diffMins}分钟前`
      if (diffHours < 24) return `${diffHours}小时前`
      if (diffDays < 7) return `${diffDays}天前`
      
      return date.toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
}

.menu-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #333;
  margin-right: 15px;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.menu-btn:hover {
  background-color: #f5f5f5;
}

.logo {
  display: flex;
  align-items: center;
}

.logo a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #1890ff;
}

.logo i {
  font-size: 24px;
  margin-right: 8px;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
}

.main-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-list {
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin: 0 10px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  text-decoration: none;
  color: #666;
  border-radius: 4px;
  transition: all 0.2s;
}

.nav-link i {
  margin-right: 5px;
  font-size: 16px;
}

.nav-link:hover,
.nav-link.active {
  color: #1890ff;
  background-color: #e6f7ff;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  margin-left: 15px;
  padding: 8px;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

.header-btn:hover {
  color: #1890ff;
  background-color: #f5f5f5;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ff4d4f;
  color: white;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.user-menu {
  position: relative;
  margin-left: 20px;
}

.user-menu-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-menu-btn:hover {
  background-color: #f5f5f5;
}

.user-avatar,
.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.user-avatar {
  object-fit: cover;
}

.user-avatar-placeholder {
  background-color: #1890ff;
  color: white;
}

.username {
  margin-right: 5px;
  font-size: 14px;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 180px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  margin-top: 5px;
  z-index: 1001;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  text-decoration: none;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  font-size: 14px;
}

.dropdown-item i {
  margin-right: 10px;
  font-size: 14px;
  color: #666;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 5px 0;
}

.logout-btn {
  color: #ff4d4f;
}

.logout-btn i {
  color: #ff4d4f;
}

.login-btn {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-left: 15px;
}

.login-btn i {
  margin-right: 5px;
}

.login-btn:hover {
  background-color: #40a9ff;
}

.search-panel,
.notifications-panel {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 999;
  animation: slideDown 0.3s ease-out;
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 10px 40px 10px 15px;
  font-size: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.search-btn {
  position: absolute;
  right: 40px;
  background: none;
  border: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
}

.close-search-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
}

.search-suggestions {
  margin-top: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

.suggestion-item i {
  margin-right: 10px;
  color: #1890ff;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.notifications-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.mark-all-read-btn {
  background: none;
  border: none;
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.mark-all-read-btn:hover {
  background-color: #f5f5f5;
}

.mark-all-read-btn:disabled {
  color: #d9d9d9;
  cursor: not-allowed;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f5f5f5;
}

.notification-item.unread {
  background-color: #e6f7ff;
}

.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 16px;
  color: #1890ff;
}

.notification-content {
  flex: 1;
}

.notification-text {
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.delete-notification-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 14px;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s;
}

.delete-notification-btn:hover {
  color: #ff4d4f;
}

.empty-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
}

.empty-notifications i {
  font-size: 32px;
  margin-bottom: 10px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .main-nav {
    display: none;
  }
  
  .username {
    display: none;
  }
  
  .logo-text {
    display: none;
  }
  
  .app-header {
    padding: 0 10px;
  }
}
</style>