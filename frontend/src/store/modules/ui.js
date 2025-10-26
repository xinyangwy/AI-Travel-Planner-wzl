/**
 * UI模块
 * 管理用户界面相关的状态
 */

import { storage } from '@/utils/storage'

export default {
  namespaced: true,
  
  state: {
    // 侧边栏状态
    sidebar: {
      collapsed: false,
      pinned: true
    },
    
    // 导航栏状态
    navbar: {
      hidden: false
    },
    
    // 主题配置
    theme: {
      // 亮色/暗色模式
      mode: 'light', // 'light' or 'dark'
      // 主题颜色
      primaryColor: '#1890ff',
      // 主题色调
      colorScheme: 'blue',
      // 是否使用紧凑模式
      compact: false
    },
    
    // 布局配置
    layout: {
      // 内容区域宽度类型：'fixed' 或 'fluid'
      contentWidth: 'fixed',
      // 是否启用多标签页
      multiTab: true,
      // 当前激活的标签页
      activeTab: null,
      // 标签页列表
      tabs: []
    },
    
    // 全屏状态
    fullscreen: false,
    
    // 加载遮罩
    loadingMask: {
      visible: false,
      text: '加载中...'
    },
    
    // 右侧抽屉
    rightDrawer: {
      visible: false,
      width: 300,
      title: '',
      component: null,
      props: {}
    },
    
    // 面包屑导航
    breadcrumb: [],
    
    // 响应式断点状态
    responsive: {
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      isDesktop: window.innerWidth >= 1024
    },
    
    // 上次访问的路由
    lastVisitedRoute: null,
    
    // 动画效果配置
    animation: {
      enabled: true,
      transitionDuration: 300
    }
  },
  
  getters: {
    /**
     * 获取侧边栏状态
     */
    sidebar: state => state.sidebar,
    
    /**
     * 获取导航栏状态
     */
    navbar: state => state.navbar,
    
    /**
     * 获取主题配置
     */
    theme: state => state.theme,
    
    /**
     * 获取布局配置
     */
    layout: state => state.layout,
    
    /**
     * 获取全屏状态
     */
    fullscreen: state => state.fullscreen,
    
    /**
     * 获取加载遮罩状态
     */
    loadingMask: state => state.loadingMask,
    
    /**
     * 获取右侧抽屉状态
     */
    rightDrawer: state => state.rightDrawer,
    
    /**
     * 获取面包屑导航
     */
    breadcrumb: state => state.breadcrumb,
    
    /**
     * 获取响应式断点状态
     */
    responsive: state => state.responsive,
    
    /**
     * 获取上次访问的路由
     */
    lastVisitedRoute: state => state.lastVisitedRoute,
    
    /**
     * 获取动画配置
     */
    animation: state => state.animation,
    
    /**
     * 判断是否为暗色模式
     */
    isDarkMode: state => state.theme.mode === 'dark',
    
    /**
     * 判断是否为移动设备
     */
    isMobile: state => state.responsive.isMobile,
    
    /**
     * 判断是否为平板设备
     */
    isTablet: state => state.responsive.isTablet,
    
    /**
     * 判断是否为桌面设备
     */
    isDesktop: state => state.responsive.isDesktop
  },
  
  mutations: {
    /**
     * 设置侧边栏折叠状态
     */
    SET_SIDEBAR_COLLAPSED(state, collapsed) {
      state.sidebar.collapsed = collapsed
      storage.set('sidebar_collapsed', collapsed)
    },
    
    /**
     * 设置侧边栏固定状态
     */
    SET_SIDEBAR_PINNED(state, pinned) {
      state.sidebar.pinned = pinned
      storage.set('sidebar_pinned', pinned)
    },
    
    /**
     * 设置导航栏隐藏状态
     */
    SET_NAVBAR_HIDDEN(state, hidden) {
      state.navbar.hidden = hidden
    },
    
    /**
     * 设置主题模式
     */
    SET_THEME_MODE(state, mode) {
      state.theme.mode = mode
      storage.set('theme_mode', mode)
      // 更新HTML根元素的class，用于CSS主题切换
      document.documentElement.classList.toggle('dark-theme', mode === 'dark')
    },
    
    /**
     * 设置主题颜色
     */
    SET_PRIMARY_COLOR(state, color) {
      state.theme.primaryColor = color
      storage.set('primary_color', color)
      // 更新CSS变量
      document.documentElement.style.setProperty('--primary-color', color)
    },
    
    /**
     * 设置主题配置
     */
    SET_THEME(state, theme) {
      state.theme = { ...state.theme, ...theme }
      storage.set('theme', state.theme)
      // 应用主题设置
      if (theme.mode) {
        document.documentElement.classList.toggle('dark-theme', theme.mode === 'dark')
      }
      if (theme.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', theme.primaryColor)
      }
      if (theme.compact !== undefined) {
        document.documentElement.classList.toggle('compact-mode', theme.compact)
      }
    },
    
    /**
     * 设置布局配置
     */
    SET_LAYOUT(state, layout) {
      state.layout = { ...state.layout, ...layout }
      storage.set('layout', state.layout)
    },
    
    /**
     * 设置全屏状态
     */
    SET_FULLSCREEN(state, fullscreen) {
      state.fullscreen = fullscreen
      
      if (fullscreen) {
        // 进入全屏
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen()
        } else if (document.documentElement.mozRequestFullScreen) { // Firefox
          document.documentElement.mozRequestFullScreen()
        } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
          document.documentElement.webkitRequestFullscreen()
        } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
          document.documentElement.msRequestFullscreen()
        }
      } else {
        // 退出全屏
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.mozCancelFullScreen) { // Firefox
          document.mozCancelFullScreen()
        } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
          document.webkitExitFullscreen()
        } else if (document.msExitFullscreen) { // IE/Edge
          document.msExitFullscreen()
        }
      }
    },
    
    /**
     * 设置加载遮罩
     */
    SET_LOADING_MASK(state, { visible = false, text = '加载中...' }) {
      state.loadingMask = { visible, text }
    },
    
    /**
     * 设置右侧抽屉
     */
    SET_RIGHT_DRAWER(state, drawer) {
      state.rightDrawer = { ...state.rightDrawer, ...drawer }
    },
    
    /**
     * 设置面包屑导航
     */
    SET_BREADCRUMB(state, breadcrumb) {
      state.breadcrumb = breadcrumb
    },
    
    /**
     * 设置响应式断点状态
     */
    SET_RESPONSIVE(state, responsive) {
      state.responsive = { ...state.responsive, ...responsive }
    },
    
    /**
     * 设置上次访问的路由
     */
    SET_LAST_VISITED_ROUTE(state, route) {
      state.lastVisitedRoute = route
    },
    
    /**
     * 设置动画配置
     */
    SET_ANIMATION(state, animation) {
      state.animation = { ...state.animation, ...animation }
      storage.set('animation', state.animation)
    },
    
    /**
     * 添加标签页
     */
    ADD_TAB(state, tab) {
      // 检查是否已存在相同路径的标签页
      const existingTab = state.layout.tabs.find(t => t.path === tab.path)
      if (!existingTab) {
        state.layout.tabs.push({
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          ...tab
        })
      }
      // 激活当前标签页
      state.layout.activeTab = tab.path
    },
    
    /**
     * 移除标签页
     */
    REMOVE_TAB(state, tabPath) {
      const index = state.layout.tabs.findIndex(t => t.path === tabPath)
      if (index !== -1) {
        state.layout.tabs.splice(index, 1)
        
        // 如果移除的是当前激活的标签页，则激活上一个标签页
        if (state.layout.activeTab === tabPath && state.layout.tabs.length > 0) {
          state.layout.activeTab = state.layout.tabs[index > 0 ? index - 1 : 0].path
        } else if (state.layout.tabs.length === 0) {
          state.layout.activeTab = null
        }
      }
    },
    
    /**
     * 清空所有标签页
     */
    CLEAR_TABS(state) {
      state.layout.tabs = []
      state.layout.activeTab = null
    },
    
    /**
     * 激活标签页
     */
    ACTIVATE_TAB(state, tabPath) {
      state.layout.activeTab = tabPath
    }
  },
  
  actions: {
    /**
     * 初始化UI状态
     */
    initUI({ commit }) {
      // 从本地存储恢复UI状态
      const sidebarCollapsed = storage.get('sidebar_collapsed')
      if (sidebarCollapsed !== null) {
        commit('SET_SIDEBAR_COLLAPSED', sidebarCollapsed)
      }
      
      const sidebarPinned = storage.get('sidebar_pinned')
      if (sidebarPinned !== null) {
        commit('SET_SIDEBAR_PINNED', sidebarPinned)
      }
      
      const theme = storage.get('theme')
      if (theme) {
        commit('SET_THEME', theme)
      }
      
      const layout = storage.get('layout')
      if (layout) {
        commit('SET_LAYOUT', layout)
      }
      
      const animation = storage.get('animation')
      if (animation) {
        commit('SET_ANIMATION', animation)
      }
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        commit('SET_RESPONSIVE', {
          isMobile: window.innerWidth < 768,
          isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
          isDesktop: window.innerWidth >= 1024
        })
        
        // 在移动设备上自动折叠侧边栏
        if (window.innerWidth < 768) {
          commit('SET_SIDEBAR_COLLAPSED', true)
        }
      })
      
      // 监听全屏状态变化
      document.addEventListener('fullscreenchange', () => {
        commit('SET_FULLSCREEN', !!document.fullscreenElement)
      })
    },
    
    /**
     * 切换侧边栏折叠状态
     */
    toggleSidebar({ commit, state }) {
      commit('SET_SIDEBAR_COLLAPSED', !state.sidebar.collapsed)
    },
    
    /**
     * 切换侧边栏固定状态
     */
    toggleSidebarPin({ commit, state }) {
      commit('SET_SIDEBAR_PINNED', !state.sidebar.pinned)
    },
    
    /**
     * 切换主题模式
     */
    toggleThemeMode({ commit, state }) {
      const newMode = state.theme.mode === 'light' ? 'dark' : 'light'
      commit('SET_THEME_MODE', newMode)
    },
    
    /**
     * 切换全屏状态
     */
    toggleFullscreen({ commit, state }) {
      commit('SET_FULLSCREEN', !state.fullscreen)
    },
    
    /**
     * 打开右侧抽屉
     */
    openRightDrawer({ commit }, drawerConfig) {
      commit('SET_RIGHT_DRAWER', { ...drawerConfig, visible: true })
    },
    
    /**
     * 关闭右侧抽屉
     */
    closeRightDrawer({ commit }) {
      commit('SET_RIGHT_DRAWER', { visible: false })
    },
    
    /**
     * 显示加载遮罩
     */
    showLoadingMask({ commit }, text) {
      commit('SET_LOADING_MASK', { visible: true, text: text || '加载中...' })
    },
    
    /**
     * 隐藏加载遮罩
     */
    hideLoadingMask({ commit }) {
      commit('SET_LOADING_MASK', { visible: false })
    },
    
    /**
     * 添加标签页
     */
    addTab({ commit }, tab) {
      commit('ADD_TAB', tab)
    },
    
    /**
     * 移除标签页
     */
    removeTab({ commit }, tabPath) {
      commit('REMOVE_TAB', tabPath)
    },
    
    /**
     * 清空所有标签页
     */
    clearTabs({ commit }) {
      commit('CLEAR_TABS')
    },
    
    /**
     * 更新面包屑导航
     */
    updateBreadcrumb({ commit }, route) {
      // 根据路由生成面包屑
      const breadcrumb = []
      
      if (route.matched && route.matched.length > 0) {
        route.matched.forEach((record, index) => {
          // 跳过根路由
          if (index > 0) {
            breadcrumb.push({
              name: record.meta.title || record.name,
              path: record.path
            })
          }
        })
      }
      
      commit('SET_BREADCRUMB', breadcrumb)
    },
    
    /**
     * 记录路由访问
     */
    recordRouteVisit({ commit }, route) {
      // 保存当前路由为上次访问的路由（排除登录、注册等页面）
      const excludedRoutes = ['login', 'register', 'forgot-password']
      if (!excludedRoutes.includes(route.name)) {
        commit('SET_LAST_VISITED_ROUTE', {
          name: route.name,
          path: route.path,
          params: route.params,
          query: route.query
        })
      }
    }
  }
}