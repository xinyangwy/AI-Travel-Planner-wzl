<template>
  <div class="error-container">
    <!-- 错误代码区域 -->
    <div class="error-code">
      {{ errorCode }}
    </div>
    
    <!-- 错误消息区域 -->
    <div class="error-message">
      {{ errorMessage }}
    </div>
    
    <!-- 错误描述 -->
    <div class="error-description">
      {{ errorDescription }}
    </div>
    
    <!-- 按钮区域 -->
    <div class="error-actions">
      <el-button type="primary" @click="goHome">
        <el-icon><HomeFilled /></el-icon>
        返回首页
      </el-button>
      <el-button @click="goBack" v-if="canGoBack">
        <el-icon><ArrowLeft /></el-icon>
        返回上一页
      </el-button>
    </div>
    
    <!-- 相关链接 -->
    <div class="error-related" v-if="relatedLinks.length > 0">
      <div class="related-title">您可以尝试访问这些页面：</div>
      <div class="related-links">
        <el-link 
          v-for="link in relatedLinks" 
          :key="link.path"
          :to="link.path"
          class="related-link"
        >
          {{ link.title }}
        </el-link>
      </div>
    </div>
    
    <!-- 装饰元素 -->
    <div class="error-decor" v-if="showDecor">
      <div class="decor-element decor-1"></div>
      <div class="decor-element decor-2"></div>
      <div class="decor-element decor-3"></div>
      <div class="decor-element decor-4"></div>
    </div>
  </div>
</template>

<script>
import { HomeFilled, ArrowLeft } from '@element-plus/icons-vue'

export default {
  name: 'ErrorPage',
  components: {
    HomeFilled,
    ArrowLeft
  },
  props: {
    // 错误代码，默认为404
    code: {
      type: Number,
      default: 404
    },
    // 自定义错误消息
    message: {
      type: String,
      default: ''
    },
    // 自定义错误描述
    description: {
      type: String,
      default: ''
    },
    // 是否显示装饰元素
    showDecorElements: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      // 默认错误配置
      errorConfigs: {
        400: {
          message: '请求错误',
          description: '服务器无法理解您的请求，请检查输入是否正确。'
        },
        401: {
          message: '未授权访问',
          description: '请先登录后再访问该页面。'
        },
        403: {
          message: '禁止访问',
          description: '您没有权限访问该页面。'
        },
        404: {
          message: '页面未找到',
          description: '抱歉，您访问的页面不存在或已被移除。'
        },
        500: {
          message: '服务器错误',
          description: '服务器内部发生错误，请稍后再试。'
        },
        503: {
          message: '服务暂时不可用',
          description: '服务器当前无法处理请求，请稍后再试。'
        }
      }
    }
  },
  computed: {
    // 错误代码
    errorCode() {
      return this.code || 404
    },
    
    // 错误消息
    errorMessage() {
      if (this.message) {
        return this.message
      }
      return this.errorConfigs[this.errorCode]?.message || '未知错误'
    },
    
    // 错误描述
    errorDescription() {
      if (this.description) {
        return this.description
      }
      return this.errorConfigs[this.errorCode]?.description || '发生了一些意外的情况。'
    },
    
    // 是否可以返回上一页
    canGoBack() {
      return window.history.length > 1
    },
    
    // 是否显示装饰元素
    showDecor() {
      return this.showDecorElements
    },
    
    // 相关链接
    relatedLinks() {
      // 根据错误类型显示不同的相关链接
      if (this.errorCode === 404) {
        return [
          { path: '/dashboard', title: '仪表盘' },
          { path: '/travel/list', title: '旅行计划' },
          { path: '/expense/list', title: '费用管理' }
        ]
      } else if ([401, 403].includes(this.errorCode)) {
        return [
          { path: '/dashboard', title: '仪表盘' },
          { path: '/settings/profile', title: '个人资料' }
        ]
      }
      return [
        { path: '/dashboard', title: '仪表盘' }
      ]
    }
  },
  methods: {
    // 返回首页
    goHome() {
      this.$router.push('/dashboard')
    },
    
    // 返回上一页
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
/* 错误页面容器 */
.error-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-xl);
  background-color: var(--bg-light);
  overflow: hidden;
}

/* 错误代码 */
.error-code {
  font-size: 150px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: var(--spacing-lg);
  color: var(--primary-color);
  opacity: 0.9;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 错误消息 */
.error-message {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

/* 错误描述 */
.error-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  max-width: 500px;
  margin-bottom: var(--spacing-xl);
  line-height: 1.5;
}

/* 按钮区域 */
.error-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

/* 相关链接 */
.error-related {
  max-width: 600px;
  margin-top: var(--spacing-xl);
}

.related-title {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.related-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-md);
}

.related-link {
  color: var(--primary-color);
  transition: color 0.3s ease;
}

.related-link:hover {
  color: var(--primary-dark);
}

/* 装饰元素 */
.error-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.decor-element {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.decor-1 {
  width: 300px;
  height: 300px;
  background-color: var(--primary-color);
  top: -150px;
  left: -100px;
}

.decor-2 {
  width: 200px;
  height: 200px;
  background-color: var(--success-color);
  bottom: -100px;
  right: 10%;
}

.decor-3 {
  width: 150px;
  height: 150px;
  background-color: var(--warning-color);
  top: 30%;
  right: -75px;
}

.decor-4 {
  width: 100px;
  height: 100px;
  background-color: var(--info-color);
  bottom: 20%;
  left: 5%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-code {
    font-size: 100px;
  }
  
  .error-message {
    font-size: var(--font-size-xl);
  }
  
  .error-actions {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
  
  .related-links {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
  }
  
  .decor-element {
    display: none;
  }
}
</style>