import { createRouter, createWebHistory } from 'vue-router';
import { ElMessage } from 'element-plus';

// 路由懒加载 - 只导入已创建的页面
const HomePage = () => import('@/views/HomePage.vue');
const Dashboard = () => import('@/views/Dashboard.vue');
const TravelPlanList = () => import('@/views/TravelPlanList.vue');
const LoginPage = () => import('@/views/LoginPage.vue');
const RegisterPage = () => import('@/views/RegisterPage.vue');

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage,
      meta: {
        title: 'AI旅行规划师 - 首页',
        requiresAuth: false,
        keepAlive: true
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginPage,
      meta: {
        title: '登录',
        requiresAuth: false,
        keepAlive: false
      }
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterPage,
      meta: {
        title: '注册',
        requiresAuth: false,
        keepAlive: false
      }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: {
        title: '仪表盘',
        requiresAuth: true,
        keepAlive: true
      }
    },
    {
      path: '/travel-plans',
      name: 'TravelPlanList',
      component: TravelPlanList,
      meta: {
        title: '旅行计划列表',
        keepAlive: true
      }
    },
    {
      // 404页面
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: '/'
    }
  ],
  // 路由滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      // 如果存在保存的位置，则恢复到该位置
      return savedPosition;
    } else {
      // 否则滚动到顶部
      return { top: 0 };
    }
  }
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 更新页面标题
  document.title = to.meta.title || 'AI旅行规划师';
  
  // 检查是否需要认证
  const requiresAuth = to.meta.requiresAuth;
  
  // 获取本地存储的认证信息
  const token = localStorage.getItem('token');
  
  // 如果路由需要认证且没有token，则重定向到登录页
  if (requiresAuth && !token) {
    ElMessage.warning('请先登录');
    next({
      path: '/login',
      query: { redirect: to.fullPath } // 保存原始访问路径，登录后可以跳转回来
    });
    return;
  }
  
  // 如果已经登录，访问登录页或注册页则重定向到首页
  if (token && (to.path === '/login' || to.path === '/register')) {
    next('/');
    return;
  }
  
  // 其他情况正常通过
  next();
});

export default router;