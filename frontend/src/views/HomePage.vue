<template>
  <div class="home-page">
    <!-- 欢迎横幅 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1>AI旅行规划师</h1>
        <p>让AI为您规划完美旅程，智能生成行程，轻松管理预算</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="goToLogin">开始使用</el-button>
          <el-button size="large" @click="learnMore">了解更多</el-button>
        </div>
      </div>
    </section>

    <!-- 功能特点 -->
    <section class="features-section">
      <h2 class="section-title">智能旅行规划，从此变得简单</h2>
      <div class="features-grid">
        <div class="feature-card">
          <el-icon class="feature-icon"><DataAnalysis /></el-icon>
          <h3>AI行程生成</h3>
          <p>基于您的偏好和目的地，智能生成个性化旅行行程</p>
        </div>
        
        <div class="feature-card">
          <el-icon class="feature-icon"><WalletFilled /></el-icon>
          <h3>预算追踪管理</h3>
          <p>实时记录和分析旅行支出，智能控制旅行预算</p>
        </div>
        
        <div class="feature-card">
          <el-icon class="feature-icon"><Timer /></el-icon>
          <h3>智能时间规划</h3>
          <p>合理安排行程时间，避免不必要的等待和浪费</p>
        </div>
        
        <div class="feature-card">
          <el-icon class="feature-icon"><BellFilled /></el-icon>
          <h3>行程提醒</h3>
          <p>重要行程节点智能提醒，不错过任何精彩体验</p>
        </div>
      </div>
    </section>

    <!-- 示例展示 -->
    <section class="demo-section">
      <h2 class="section-title">为您提供全方位的旅行体验</h2>
      <div class="demo-content">
        <div class="demo-image">
          <el-image :src="demoImage" fit="cover" />
        </div>
        <div class="demo-text">
          <ul>
            <li>
              <el-icon><Check /></el-icon>
              <span>智能行程规划，一键生成完整旅行方案</span>
            </li>
            <li>
              <el-icon><Check /></el-icon>
              <span>费用实时统计，多种图表直观展示</span>
            </li>
            <li>
              <el-icon><Check /></el-icon>
              <span>离线访问行程，旅行无忧</span>
            </li>
            <li>
              <el-icon><Check /></el-icon>
              <span>旅行笔记和照片管理，记录美好回忆</span>
            </li>
            <li>
              <el-icon><Check /></el-icon>
              <span>多端同步，随时随地访问您的旅行计划</span>
            </li>
          </ul>
          <el-button type="primary" class="demo-btn" @click="createPlan">创建您的第一个旅行计划</el-button>
        </div>
      </div>
    </section>

    <!-- 底部CTA -->
    <section class="cta-section">
      <div class="cta-content">
        <h2>准备好开启您的智能旅行了吗？</h2>
        <p>加入我们，让每一次旅行都更加精彩</p>
        <div class="cta-actions">
          <el-button type="primary" size="large" @click="goToRegister">免费注册</el-button>
          <el-button size="large" @click="goToLogin">立即登录</el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { DataAnalysis, WalletFilled, Timer, BellFilled, Check } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

export default {
  name: 'HomePage',
  components: {
    DataAnalysis,
    WalletFilled,
    Timer,
    BellFilled,
    Check
  },
  setup() {
    const router = useRouter()
    
    const demoImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    
    const goToLogin = () => {
      router.push('/login')
    }
    
    const goToRegister = () => {
      router.push('/register')
    }
    
    const createPlan = () => {
      // 检查是否登录
      const token = localStorage.getItem('token')
      if (token) {
        router.push('/plans/new')
      } else {
        router.push('/login?redirect=/plans/new')
      }
    }
    
    const learnMore = () => {
      // 滚动到功能特点区域
      document.querySelector('.features-section')?.scrollIntoView({ behavior: 'smooth' })
    }
    
    return {
      demoImage,
      goToLogin,
      goToRegister,
      createPlan,
      learnMore
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: var(--background-color);
}

/* 欢迎横幅 */
.hero-section {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark) 100%);
  color: white;
  padding: var(--space-3xl) 0;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-content h1 {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-lg);
  font-weight: 700;
}

.hero-content p {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-xl);
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
}

/* 功能特点 */
.features-section {
  padding: var(--space-3xl) 0;
  text-align: center;
}

.section-title {
  font-size: var(--font-size-2xl);
  color: var(--text-primary);
  margin-bottom: var(--space-2xl);
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background-color: var(--primary-color);
  border-radius: 2px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-xl);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.feature-card {
  background-color: var(--white-color);
  padding: var(--space-xl);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  transition: transform var(--transition-time), box-shadow var(--transition-time);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-lg);
}

.feature-icon {
  font-size: 48px;
  color: var(--primary-color);
  margin-bottom: var(--space-lg);
}

.feature-card h3 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-md);
  color: var(--text-primary);
}

.feature-card p {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 示例展示 */
.demo-section {
  background-color: var(--background-color-light);
  padding: var(--space-3xl) 0;
}

.demo-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2xl);
}

.demo-image {
  width: 100%;
  max-width: 600px;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--box-shadow-lg);
}

.demo-image img {
  width: 100%;
  height: auto;
  display: block;
}

.demo-text {
  flex: 1;
  max-width: 600px;
}

.demo-text ul {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-xl) 0;
}

.demo-text li {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  color: var(--text-primary);
  font-size: var(--font-size-lg);
}

.demo-text .el-icon {
  color: var(--success-color);
  font-size: var(--font-size-xl);
}

.demo-btn {
  margin-top: var(--space-md);
}

/* 底部CTA */
.cta-section {
  background-color: var(--primary-color);
  color: white;
  padding: var(--space-3xl) 0;
  text-align: center;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
}

.cta-content h2 {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-md);
}

.cta-content p {
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-xl);
  opacity: 0.9;
}

.cta-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
}

/* 响应式设计 */
@media (min-width: 992px) {
  .demo-content {
    flex-direction: row;
    align-items: center;
  }
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: var(--font-size-3xl);
  }
  
  .hero-content p {
    font-size: var(--font-size-lg);
  }
  
  .hero-actions,
  .cta-actions {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .demo-text li {
    font-size: var(--font-size-base);
  }
}
</style>