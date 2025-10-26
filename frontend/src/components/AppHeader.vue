<template>
  <header class="app-header">
    <div class="header-container">
      <!-- 左侧 Logo 和标题 -->
      <div class="header-left">
        <router-link to="/" class="logo-container">
          <div class="logo">
            <el-icon class="logo-icon"><Map /></el-icon>
          </div>
          <div class="title">
            <h1 class="main-title">AI 旅行规划助手</h1>
            <p class="sub-title">智能规划，轻松旅行</p>
          </div>
        </router-link>
      </div>
      
      <!-- 中间导航菜单（桌面端） -->
      <nav class="nav-container desktop-only">
        <ul class="nav-menu">
          <li 
            v-for="item in navItems" 
            :key="item.path"
            class="nav-item"
            :class="{ 'active': isActive(item) }"
          >
            <router-link 
              :to="item.path" 
              class="nav-link"
              @click="handleNavClick(item)"
            >
              <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
              <span class="nav-text">{{ item.label }}</span>
              <!-- 子菜单 -->
              <div v-if="item.children && item.children.length > 0" class="sub-menu">
                <div 
                  v-for="child in item.children" 
                  :key="child.path"
                  class="sub-menu-item"
                  :class="{ 'active': isActive(child) }"
                >
                  <router-link 
                    :to="child.path" 
                    class="sub-menu-link"
                    @click="handleNavClick(child)"
                  >
                    {{ child.label }}
                  </router-link>
                </div>
              </div>
            </router-link>
          </li>
        </ul>
      </nav>
      
      <!-- 右侧用户区域 -->
      <div class="header-right">
        <!-- 搜索框（可选） -->
        <div v-if="showSearch" class="search-container">
          <el-input
            v-model="searchQuery"
            placeholder="搜索旅行计划..."
            prefix-icon="Search"
            clearable
            size="small"
            class="search-input"
            @keyup.enter="handleSearch"
          ></el-input>
        </div>
        
        <!-- 通知图标 -->
        <div v-if="showNotifications" class="notification-container">
          <el-popover
            placement="bottom"
            width="300"
            trigger="click"
            popper-class="notification-popover"
          >
            <template #reference>
              <el-button 
                circle 
                plain 
                size="small"
                class="notification-btn"
              >
                <el-icon><Bell /></el-icon>
                <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
              </el-button>
            </template>
            <div class="notification-content">
              <div class="notification-header">
                <h3>通知</h3>
                <el-button size="text" @click="clearNotifications">全部标为已读</el-button>
              </div>
              <div class="notification-list">
                <div v-if="notifications && notifications.length > 0" class="notification-items">
                  <div 
                    v-for="notification in notifications" 
                    :key="notification.id"
                    class="notification-item"
                    :class="{ 'unread': !notification.read }"
                  >
                    <div class="notification-icon">
                      <el-icon><component :is="notification.icon" /></el-icon>
                    </div>
                    <div class="notification-body">
                      <p class="notification-title">{{ notification.title }}</p>
                      <p class="notification-time">{{ formatNotificationTime(notification.time) }}</p>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-notifications">
                  暂无通知
                </div>
              </div>
            </div>
          </el-popover>
        </div>
        
        <!-- 用户头像 -->
        <div v-if="showUser" class="user-container">
          <el-dropdown trigger="click" class="user-dropdown">
            <div class="user-info" @click.stop>
              <el-avatar 
                :src="userAvatar" 
                :size="avatarSize"
                :icon="defaultAvatar"
                class="user-avatar"
              ></el-avatar>
              <span v-if="showUserName" class="user-name">{{ userName }}</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="user-dropdown-menu">
                <el-dropdown-item @click="handleProfile">
                  <el-icon><User /></el-icon>
                  <span>个人资料</span>
                </el-dropdown-item>
                <el-dropdown-item @click="handleSettings">
                  <el-icon><Setting /></el-icon>
                  <span>设置</span>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        
        <!-- 移动端菜单按钮 -->
        <div class="mobile-menu-btn mobile-only" @click="toggleMobileMenu">
          <el-button circle plain>
            <el-icon><component :is="mobileMenuIcon" /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 移动端导航菜单 -->
    <div v-if="showMobileMenu" class="mobile-menu-container">
      <nav class="mobile-nav">
        <ul class="mobile-nav-menu">
          <li 
            v-for="item in navItems" 
            :key="item.path"
            class="mobile-nav-item"
            :class="{ 'active': isActive(item) }"
          >
            <router-link 
              :to="item.path" 
              class="mobile-nav-link"
              @click="handleMobileNavClick(item)"
            >
              <el-icon class="mobile-nav-icon"><component :is="item.icon" /></el-icon>
              <span class="mobile-nav-text">{{ item.label }}</span>
            </router-link>
            
            <!-- 移动端子菜单 -->
            <div 
              v-if="item.children && item.children.length > 0"
              class="mobile-sub-menu"
              :class="{ 'expanded': expandedMobileSubMenu === item.path }"
            >
              <div 
                v-for="child in item.children" 
                :key="child.path"
                class="mobile-sub-menu-item"
                :class="{ 'active': isActive(child) }"
              >
                <router-link 
                  :to="child.path" 
                  class="mobile-sub-menu-link"
                  @click="handleMobileNavClick(child)"
                >
                  {{ child.label }}
                </router-link>
              </div>
            </div>
            
            <!-- 移动端子菜单展开/折叠按钮 -->
            <div 
              v-if="item.children && item.children.length > 0"
              class="mobile-sub-menu-toggle"
              @click="toggleMobileSubMenu(item.path)"
            >
              <el-icon :class="{ 'rotated': expandedMobileSubMenu === item.path }">
                <ArrowDown />
              </el-icon>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script>
import { Map, Search, Bell, User, Setting, SwitchButton, ArrowDown, Menu, Close } from '@element-plus/icons-vue'
import { dateFormatter } from '../utils/formatters'
import { ROUTES } from '../constants/appConstants'

export default {
  name: 'AppHeader',
  components: {
    Map,
    Search,
    Bell,
    User,
    Setting,
    SwitchButton,
    ArrowDown,
    Menu,
    Close
  },
  props: {
    // 是否显示搜索框
    showSearch: {
      type: Boolean,
      default: true
    },
    // 是否显示通知
    showNotifications: {
      type: Boolean,
      default: true
    },
    // 是否显示用户信息
    showUser: {
      type: Boolean,
      default: true
    },
    // 是否显示用户名
    showUserName: {
      type: Boolean,
      default: true
    },
    // 头像大小
    avatarSize: {
      type: [Number, String],
      default: 36
    },
    // 用户头像
    userAvatar: {
      type: String,
      default: ''
    },
    // 用户名
    userName: {
      type: String,
      default: '用户'
    },
    // 通知列表
    notifications: {
      type: Array,
      default: () => []
    },
    // 导航栏背景色
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    // 导航栏高度
    height: {
      type: [Number, String],
      default: 60
    },
    // 是否固定在顶部
    fixed: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      // 搜索查询
      searchQuery: '',
      // 移动端菜单显示状态
      showMobileMenu: false,
      // 展开的移动端子菜单
      expandedMobileSubMenu: null,
      // 默认头像图标
      defaultAvatar: 'User'
    }
  },
  computed: {
    // 导航菜单项
    navItems() {
      return [
        {
          path: ROUTES.DASHBOARD || '/dashboard',
          label: '首页',
          icon: Map
        },
        {
          path: ROUTES.TRAVEL.LIST || '/travel/list',
          label: '旅行计划',
          icon: Map,
          children: [
            { path: ROUTES.TRAVEL.LIST || '/travel/list', label: '计划列表' },
            { path: ROUTES.TRAVEL.CREATE || '/travel/create', label: '创建计划' }
          ]
        },
        {
          path: ROUTES.EXPENSE.LIST || '/expense/list',
          label: '费用管理',
          icon: Setting,
          children: [
            { path: ROUTES.EXPENSE.LIST || '/expense/list', label: '费用列表' },
            { path: ROUTES.EXPENSE.CREATE || '/expense/create', label: '添加费用' }
          ]
        },
        {
          path: ROUTES.SETTINGS || '/settings',
          label: '设置',
          icon: Setting
        }
      ]
    },
    
    // 未读通知数量
    notificationCount() {
      return this.notifications.filter(n => !n.read).length
    },
    
    // 移动端菜单图标
    mobileMenuIcon() {
      return this.showMobileMenu ? Close : Menu
    }
  },
  mounted() {
    // 监听滚动事件，更新导航栏样式
    if (this.fixed) {
      window.addEventListener('scroll', this.handleScroll)
    }
    
    // 监听点击外部区域关闭移动端菜单
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    // 移除事件监听
    window.removeEventListener('scroll', this.handleScroll)
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    // 检查路由是否激活
    isActive(item) {
      return this.$route.path === item.path || (item.children && item.children.some(child => this.$route.path === child.path))
    },
    
    // 处理导航点击
    handleNavClick(item) {
      // 触发导航点击事件
      this.$emit('nav-click', item)
    },
    
    // 处理移动端导航点击
    handleMobileNavClick(item) {
      // 触发导航点击事件
      this.$emit('nav-click', item)
      // 关闭移动端菜单
      this.showMobileMenu = false
    },
    
    // 处理搜索
    handleSearch() {
      // 触发搜索事件
      this.$emit('search', this.searchQuery)
    },
    
    // 处理个人资料点击
    handleProfile() {
      // 触发个人资料点击事件
      this.$emit('profile-click')
    },
    
    // 处理设置点击
    handleSettings() {
      // 触发设置点击事件
      this.$emit('settings-click')
    },
    
    // 处理退出登录点击
    handleLogout() {
      // 触发退出登录点击事件
      this.$emit('logout-click')
    },
    
    // 切换移动端菜单显示
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu
      // 重置展开的子菜单
      if (!this.showMobileMenu) {
        this.expandedMobileSubMenu = null
      }
    },
    
    // 切换移动端子菜单显示
    toggleMobileSubMenu(path) {
      this.expandedMobileSubMenu = this.expandedMobileSubMenu === path ? null : path
    },
    
    // 格式化通知时间
    formatNotificationTime(time) {
      return dateFormatter.formatRelativeTime(time)
    },
    
    // 清空通知
    clearNotifications() {
      // 触发清空通知事件
      this.$emit('clear-notifications')
    },
    
    // 处理滚动事件
    handleScroll() {
      // 触发滚动事件，可以用来改变导航栏样式
      this.$emit('scroll', window.scrollY)
    },
    
    // 处理点击外部区域
    handleClickOutside(event) {
      // 检查点击是否在导航栏内部
      const header = this.$el
      if (header && !header.contains(event.target)) {
        // 如果不是点击移动端菜单按钮，则关闭移动端菜单
        const mobileMenuBtn = header.querySelector('.mobile-menu-btn')
        if (mobileMenuBtn && !mobileMenuBtn.contains(event.target)) {
          this.showMobileMenu = false
          this.expandedMobileSubMenu = null
        }
      }
    }
  }
}
</script>

<style scoped>
/* 导航栏容器 */
.app-header {
  background-color: var(--bg-base);
  box-shadow: var(--shadow-light);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: var(--transition-base);
}

.header-container {
  height: 60px;
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Logo 和标题 */
.header-left {
  display: flex;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-primary);
  transition: var(--transition-base);
}

.logo-container:hover {
  color: var(--primary-color);
}

.logo {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-light);
  border-radius: var(--border-radius-small);
  margin-right: var(--spacing-sm);
}

.logo-icon {
  font-size: 20px;
  color: var(--primary-color);
}

.title .main-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0;
}

.title .sub-title {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin: 2px 0 0 0;
}

/* 导航菜单（桌面端） */
.nav-container {
  flex: 1;
  max-width: 600px;
  margin: 0 var(--spacing-xl);
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
  margin-right: var(--spacing-lg);
}

.nav-link {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm);
  color: var(--text-regular);
  text-decoration: none;
  transition: var(--transition-base);
  border-radius: var(--border-radius-small);
}

.nav-link:hover {
  color: var(--primary-color);
  background-color: var(--primary-light);
}

.nav-item.active .nav-link {
  color: var(--primary-color);
  font-weight: 500;
}

.nav-icon {
  margin-right: var(--spacing-xs);
  font-size: 16px;
}

/* 子菜单 */
.sub-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 160px;
  background-color: var(--bg-base);
  box-shadow: var(--shadow-base);
  border-radius: var(--border-radius-small);
  padding: var(--spacing-xs) 0;
  margin-top: var(--spacing-xs);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-5px);
  transition: var(--transition-base);
  z-index: 10;
}

.nav-item:hover .sub-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.sub-menu-item {
  padding: 0;
}

.sub-menu-link {
  display: block;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-regular);
  text-decoration: none;
  transition: var(--transition-base);
  white-space: nowrap;
}

.sub-menu-link:hover {
  color: var(--primary-color);
  background-color: var(--primary-light);
}

.sub-menu-item.active .sub-menu-link {
  color: var(--primary-color);
  background-color: var(--primary-light);
}

/* 右侧用户区域 */
.header-right {
  display: flex;
  align-items: center;
}

/* 搜索框 */
.search-container {
  margin-right: var(--spacing-md);
}

.search-input {
  width: 200px;
}

/* 通知图标 */
.notification-container {
  margin-right: var(--spacing-md);
}

.notification-btn {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background-color: var(--danger-color);
  color: white;
  font-size: var(--font-size-xs);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(50%, -50%);
}

.notification-popover {
  padding: 0;
}

.notification-content {
  padding: var(--spacing-sm) 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-md) var(--spacing-sm);
  border-bottom: 1px solid var(--border-lighter);
}

.notification-header h3 {
  font-size: var(--font-size-sm);
  font-weight: 600;
  margin: 0;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-items {
  padding: 0;
}

.notification-item {
  display: flex;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--border-lighter);
  cursor: pointer;
  transition: var(--transition-base);
}

.notification-item:hover {
  background-color: var(--bg-lighter);
}

.notification-item.unread {
  background-color: var(--primary-light);
}

.notification-icon {
  margin-right: var(--spacing-sm);
  color: var(--primary-color);
}

.notification-body {
  flex: 1;
}

.notification-title {
  font-size: var(--font-size-sm);
  margin: 0 0 4px;
  color: var(--text-primary);
}

.notification-time {
  font-size: var(--font-size-xs);
  margin: 0;
  color: var(--text-secondary);
}

.empty-notifications {
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--text-secondary);
}

/* 用户信息 */
.user-container {
  margin-right: var(--spacing-md);
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  margin-right: var(--spacing-xs);
}

.user-name {
  margin-right: var(--spacing-xs);
  font-size: var(--font-size-sm);
}

.dropdown-icon {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
}

/* 移动端导航菜单 */
.mobile-menu-container {
  display: none;
  background-color: var(--bg-base);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-nav-menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-nav-item {
  position: relative;
  border-bottom: 1px solid var(--border-lighter);
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  color: var(--text-regular);
  text-decoration: none;
  transition: var(--transition-base);
}

.mobile-nav-link:hover {
  color: var(--primary-color);
  background-color: var(--primary-light);
}

.mobile-nav-item.active .mobile-nav-link {
  color: var(--primary-color);
  font-weight: 500;
}

.mobile-nav-icon {
  margin-right: var(--spacing-sm);
  font-size: 18px;
}

.mobile-sub-menu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background-color: var(--bg-lighter);
}

.mobile-sub-menu.expanded {
  max-height: 500px;
}

.mobile-sub-menu-item {
  border-bottom: 1px solid var(--border-lighter);
}

.mobile-sub-menu-link {
  display: block;
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) calc(var(--spacing-md) * 2 + 18px + var(--spacing-sm));
  color: var(--text-regular);
  text-decoration: none;
  transition: var(--transition-base);
}

.mobile-sub-menu-link:hover {
  color: var(--primary-color);
  background-color: var(--primary-light);
}

.mobile-sub-menu-item.active .mobile-sub-menu-link {
  color: var(--primary-color);
  background-color: var(--primary-light);
}

.mobile-sub-menu-toggle {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.mobile-sub-menu-toggle .el-icon {
  transition: transform 0.3s ease;
}

.mobile-sub-menu-toggle .el-icon.rotated {
  transform: rotate(180deg);
}

/* 响应式设计 */
@media (max-width: 992px) {
  .search-input {
    width: 160px;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 var(--spacing-md);
  }
  
  .nav-container {
    display: none;
  }
  
  .search-container {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-menu-container {
    display: block;
  }
  
  .title .main-title {
    font-size: var(--font-size-base);
  }
  
  .title .sub-title {
    display: none;
  }
}

/* 显示/隐藏类 */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
  
  .mobile-only {
    display: block;
  }
}
</style>