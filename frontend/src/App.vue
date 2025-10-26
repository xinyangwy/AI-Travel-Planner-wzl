<template>
  <div class="app-container">
    <!-- 导航栏 -->
    <nav class="app-navbar" v-if="isAuthenticated">
      <div class="navbar-container">
        <div class="navbar-brand" @click="navigateTo('/')">
          <el-icon><Van /></el-icon>
          <span>AI旅行规划师</span>
        </div>
        
        <div class="navbar-menu">
          <router-link 
            to="/" 
            class="menu-item" 
            active-class="active"
          >
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </router-link>
          
          <router-link 
            to="/dashboard" 
            class="menu-item" 
            active-class="active"
          >
            <el-icon><DataAnalysis /></el-icon>
            <span>仪表盘</span>
          </router-link>
          
          <router-link 
            to="/plans" 
            class="menu-item" 
            active-class="active"
          >
            <el-icon><Collection /></el-icon>
            <span>我的旅行</span>
          </router-link>
          
          <router-link 
            to="/templates" 
            class="menu-item" 
            active-class="active"
          >
            <el-icon><DocumentCopy /></el-icon>
            <span>旅行模板</span>
          </router-link>
        </div>
        
        <div class="navbar-actions">
          <el-badge :value="notificationCount" class="notification-badge">
            <el-button circle @click="showNotifications = true">
              <el-icon><Bell /></el-icon>
            </el-button>
          </el-badge>
          
          <el-dropdown @command="handleUserMenuCommand">
            <div class="user-menu" @click.stop>
              <el-avatar :size="32" :src="userAvatar || defaultAvatar" />
              <span class="user-name">{{ userName }}</span>
              <el-icon class="arrow-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="settings">设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </nav>
    
    <!-- 移动端底部导航 -->
    <div class="mobile-nav" v-if="isAuthenticated && isMobile">
      <router-link to="/" class="mobile-nav-item" active-class="active">
        <el-icon><HomeFilled /></el-icon>
        <span>首页</span>
      </router-link>
      
      <router-link to="/plans" class="mobile-nav-item" active-class="active">
        <el-icon><Collection /></el-icon>
        <span>我的旅行</span>
      </router-link>
      
      <router-link to="/plans/new" class="mobile-nav-item create-btn">
        <el-icon><Plus /></el-icon>
      </router-link>
      
      <router-link to="/dashboard" class="mobile-nav-item" active-class="active">
        <el-icon><DataAnalysis /></el-icon>
        <span>仪表盘</span>
      </router-link>
      
      <router-link to="/profile" class="mobile-nav-item" active-class="active">
        <el-icon><User /></el-icon>
        <span>我的</span>
      </router-link>
    </div>
    
    <!-- 主内容区 -->
    <main class="main-content" :class="{ 'with-nav': isAuthenticated }">
      <!-- 页面过渡动画 -->
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </main>
    
    <!-- 通知抽屉 -->
    <el-drawer
      v-model="showNotifications"
      title="通知中心"
      size="320px"
      direction="rtl"
    >
      <div class="notification-content">
        <div v-if="notifications.length === 0" class="empty-notifications">
          <el-empty description="暂无通知" :image-size="80" />
        </div>
        
        <div v-else class="notification-list">
          <div 
            v-for="notification in notifications" 
            :key="notification.id" 
            class="notification-item"
            :class="{ 'unread': !notification.read }"
            @click="markNotificationAsRead(notification.id)"
          >
            <div class="notification-icon">
              <el-icon v-if="notification.type === 'system'"><Message /></el-icon>
              <el-icon v-else-if="notification.type === 'reminder'"><Bell /></el-icon>
              <el-icon v-else-if="notification.type === 'update'"><Refresh /></el-icon>
              <el-icon v-else><InfoFilled /></el-icon>
            </div>
            <div class="notification-body">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatNotificationTime(notification.time) }}</div>
            </div>
          </div>
        </div>
        
        <div class="notification-actions" v-if="notifications.length > 0">
          <el-button @click="markAllAsRead">全部标为已读</el-button>
          <el-button type="primary" @click="clearAllNotifications">清空通知</el-button>
        </div>
      </div>
    </el-drawer>
    
    <!-- 遮罩层 -->
    <div 
      v-if="showNotifications && isMobile" 
      class="drawer-overlay"
      @click="showNotifications = false"
    ></div>
    
    <!-- 回到顶部按钮 -->
    <el-backtop :right="40" :bottom="80" v-if="showBacktop" />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { 
  Van, HomeFilled, DataAnalysis, Collection, DocumentCopy, 
  Bell, ArrowDown, User, Plus, Message, Refresh, 
  InfoFilled
} from '@element-plus/icons-vue';
import { formatRelativeTime } from './utils/helper';

export default {
  name: 'App',
  components: {
    Van,
    HomeFilled,
    DataAnalysis,
    Collection,
    DocumentCopy,
    Bell,
    ArrowDown,
    User,
    Plus,
    Message,
    Refresh,
    InfoFilled
  },
  setup() {
    const router = useRouter();
    
    // 响应式数据
    const isAuthenticated = ref(true); // 实际应该从Vuex或本地存储获取
    const userName = ref('旅行者'); // 实际应该从Vuex或本地存储获取
    const userAvatar = ref(''); // 实际应该从Vuex或本地存储获取
    const showNotifications = ref(false);
    const showBacktop = ref(false);
    const isMobile = ref(false);
    
    // 默认头像
    const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
    
    // 模拟通知数据
    const notifications = ref([
      {
        id: 1,
        type: 'reminder',
        title: '行程提醒',
        message: '您的东京之旅将在3天后开始',
        time: new Date(Date.now() - 3600000).toISOString(), // 1小时前
        read: false
      },
      {
        id: 2,
        type: 'system',
        title: '系统通知',
        message: 'AI旅行规划师已更新到最新版本',
        time: new Date(Date.now() - 86400000).toISOString(), // 1天前
        read: false
      },
      {
        id: 3,
        type: 'update',
        title: '行程更新',
        message: '您的「京都三日游」行程已更新',
        time: new Date(Date.now() - 172800000).toISOString(), // 2天前
        read: true
      }
    ]);
    
    // 计算未读通知数量
    const notificationCount = computed(() => {
      return notifications.value.filter(n => !n.read).length;
    });
    
    // 方法
    const navigateTo = (path) => {
      router.push(path);
    };
    
    // 处理用户菜单命令
    const handleUserMenuCommand = (command) => {
      switch (command) {
        case 'profile':
          router.push('/profile');
          break;
        case 'settings':
          router.push('/settings');
          break;
        case 'logout':
          handleLogout();
          break;
        default:
          break;
      }
    };
    
    // 处理登出
    const handleLogout = async () => {
      try {
        // 实际应该调用API进行登出
        isAuthenticated.value = false;
        // 清除本地存储的认证信息
        // localStorage.removeItem('token');
        // localStorage.removeItem('user');
        
        ElMessage.success('已成功退出登录');
        router.push('/login');
      } catch (error) {
        console.error('登出失败:', error);
        ElMessage.error('登出失败，请重试');
      }
    };
    
    // 标记通知为已读
    const markNotificationAsRead = (id) => {
      const index = notifications.value.findIndex(n => n.id === id);
      if (index !== -1) {
        notifications.value[index].read = true;
      }
    };
    
    // 标记所有通知为已读
    const markAllAsRead = () => {
      notifications.value.forEach(notification => {
        notification.read = true;
      });
      ElMessage.success('已全部标为已读');
    };
    
    // 清空所有通知
    const clearAllNotifications = () => {
      notifications.value = [];
      ElMessage.success('通知已清空');
    };
    
    // 格式化通知时间
    const formatNotificationTime = (time) => {
      return formatRelativeTime(new Date(time));
    };
    
    // 检测窗口滚动位置
    const handleScroll = () => {
      showBacktop.value = window.pageYOffset > 300;
    };
    
    // 检测屏幕尺寸
    const checkScreenSize = () => {
      isMobile.value = window.innerWidth < 768;
    };
    
    // 路由变化时关闭通知抽屉
    watch(
      () => router.currentRoute.value.path,
      () => {
        showNotifications.value = false;
      }
    );
    
    // 生命周期钩子
    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', checkScreenSize);
      
      // 初始化屏幕尺寸
      checkScreenSize();
      
      // 实际应该从localStorage或API获取用户信息
      // const userInfo = localStorage.getItem('user');
      // if (userInfo) {
      //   const user = JSON.parse(userInfo);
      //   userName.value = user.name;
      //   userAvatar.value = user.avatar;
      // }
    });
    
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScreenSize);
    });
    
    return {
      // 数据
      isAuthenticated,
      userName,
      userAvatar,
      defaultAvatar,
      showNotifications,
      showBacktop,
      isMobile,
      notifications,
      
      // 计算属性
      notificationCount,
      
      // 方法
      navigateTo,
      handleUserMenuCommand,
      handleLogout,
      markNotificationAsRead,
      markAllAsRead,
      clearAllNotifications,
      formatNotificationTime
    };
  }
};
</script>

<style>
@import './assets/styles/theme.css';

/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  background-color: var(--background-color);
}

/* 应用容器 */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.app-navbar {
  background-color: var(--white-color);
  box-shadow: var(--box-shadow-light);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 60px;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--primary-color);
  font-size: var(--font-size-large);
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition-time);
}

.navbar-brand:hover {
  opacity: 0.8;
}

.navbar-menu {
  display: flex;
  gap: var(--space-md);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  color: var(--text-primary);
  text-decoration: none;
  border-radius: var(--border-radius);
  transition: all var(--transition-time);
}

.menu-item:hover {
  background-color: var(--hover-color);
}

.menu-item.active {
  color: var(--primary-color);
  background-color: var(--primary-color-light);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.notification-badge {
  position: relative;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color var(--transition-time);
}

.user-menu:hover {
  background-color: var(--hover-color);
}

.user-name {
  font-size: var(--font-size-medium);
  color: var(--text-primary);
}

.arrow-icon {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 主内容区 */
.main-content {
  flex: 1;
  padding: var(--space-lg);
  padding-bottom: var(--space-xl);
  transition: padding-top var(--transition-time);
}

.main-content.with-nav {
  padding-top: calc(60px + var(--space-lg));
}

/* 移动端底部导航 */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--white-color);
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 60px;
  box-shadow: var(--box-shadow-up);
  z-index: 1000;
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 12px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-time);
}

.mobile-nav-item.active {
  color: var(--primary-color);
}

.create-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: var(--box-shadow);
  transition: transform var(--transition-time);
}

.create-btn:hover {
  transform: scale(1.05);
}

/* 通知样式 */
.notification-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.notification-list {
  flex: 1;
  overflow-y: auto;
  padding-right: var(--space-sm);
}

.notification-item {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color var(--transition-time);
}

.notification-item:hover {
  background-color: var(--hover-color);
}

.notification-item.unread {
  background-color: var(--primary-color-light);
}

.notification-icon {
  font-size: var(--font-size-large);
  color: var(--primary-color);
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.notification-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-title {
  font-weight: 500;
  color: var(--text-primary);
}

.notification-message {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.notification-time {
  font-size: var(--font-size-extra-small);
  color: var(--text-placeholder);
}

.notification-actions {
  margin-top: var(--space-lg);
  display: flex;
  gap: var(--space-sm);
}

.empty-notifications {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 999;
}

/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-time);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .navbar-menu {
    display: none;
  }
  
  .user-name {
    display: none;
  }
  
  .main-content {
    padding: var(--space-md);
    padding-bottom: calc(60px + var(--space-md));
  }
  
  .main-content.with-nav {
    padding-top: calc(60px + var(--space-md));
  }
}
</style>