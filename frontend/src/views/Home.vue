<template>
  <div class="home-container">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="hero-title-highlight">AI</span> 旅行规划助手
        </h1>
        <p class="hero-subtitle">让AI为您定制完美的旅行计划，轻松探索世界各地</p>
        
        <!-- 搜索区域 -->
        <div class="search-container">
          <div class="search-input-wrapper">
            <input 
              type="text" 
              class="search-input"
              placeholder="您想去哪里旅行？"
              v-model="searchQuery"
              @keyup.enter="handleSearch"
            />
            <button class="search-button" @click="handleSearch">
              <i class="search-icon"></i> 搜索
            </button>
          </div>
          <div class="search-tags">
            <span 
              v-for="tag in popularTags" 
              :key="tag"
              class="search-tag"
              @click="selectTag(tag)"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 背景图片 -->
      <div class="hero-background">
        <div class="hero-overlay"></div>
      </div>
    </section>
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 功能卡片区域 -->
      <section class="features-section">
        <div class="section-header">
          <h2 class="section-title">探索我们的功能</h2>
          <p class="section-subtitle">智能旅行助手，让您的旅程更加便捷</p>
        </div>
        
        <div class="features-grid">
          <!-- 功能卡片1：语音助手 -->
          <Card class="feature-card" shadow="hover" @click="navigateTo('/voice-assistant')">
            <div class="feature-card-content">
              <div class="feature-icon voice-icon"></div>
              <h3 class="feature-title">智能语音助手</h3>
              <p class="feature-description">通过语音对话，让AI为您规划旅行路线、推荐景点和餐厅</p>
            </div>
          </Card>
          
          <!-- 功能卡片2：行程规划 -->
          <Card class="feature-card" shadow="hover" @click="navigateTo('/trip-planner')">
            <div class="feature-card-content">
              <div class="feature-icon planner-icon"></div>
              <h3 class="feature-title">智能行程规划</h3>
              <p class="feature-description">根据您的偏好、时间和预算，自动生成最佳旅行方案</p>
            </div>
          </Card>
          
          <!-- 功能卡片3：目的地推荐 -->
          <Card class="feature-card" shadow="hover" @click="navigateTo('/destination-finder')">
            <div class="feature-card-content">
              <div class="feature-icon destination-icon"></div>
              <h3 class="feature-title">个性化目的地推荐</h3>
              <p class="feature-description">基于您的兴趣爱好，推荐适合的旅行目的地和体验</p>
            </div>
          </Card>
          
          <!-- 功能卡片4：实时资讯 -->
          <Card class="feature-card" shadow="hover" @click="navigateTo('/travel-news')">
            <div class="feature-icon news-icon"></div>
            <h3 class="feature-title">旅行实时资讯</h3>
            <p class="feature-description">获取目的地最新天气、旅游政策和实用信息</p>
          </Card>
        </div>
      </section>
      
      <!-- 热门目的地 -->
      <section class="popular-destinations-section">
        <div class="section-header">
          <h2 class="section-title">热门目的地</h2>
          <p class="section-subtitle">发现令人惊叹的旅游胜地</p>
          <Button 
            variant="link" 
            class="view-all-button"
            @click="navigateTo('/destinations')"
          >
            查看全部 <i class="view-all-icon"></i>
          </Button>
        </div>
        
        <div class="destinations-carousel">
          <div 
            v-for="destination in popularDestinations" 
            :key="destination.id"
            class="destination-card"
            @click="navigateTo(`/destination/${destination.id}`)"
          >
            <div class="destination-image-wrapper">
              <img 
                :src="destination.imageUrl" 
                :alt="destination.name"
                class="destination-image"
              />
              <div class="destination-overlay"></div>
              <div class="destination-rating">
                <i class="rating-icon"></i> {{ destination.rating }}
              </div>
            </div>
            <div class="destination-info">
              <h3 class="destination-name">{{ destination.name }}</h3>
              <p class="destination-location">{{ destination.location }}</p>
              <div class="destination-tags">
                <span 
                  v-for="tag in destination.tags.slice(0, 3)" 
                  :key="tag"
                  class="destination-tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 用户体验 -->
      <section class="testimonials-section">
        <div class="section-header">
          <h2 class="section-title">用户的体验</h2>
          <p class="section-subtitle">看看其他旅行者如何评价我们的服务</p>
        </div>
        
        <div class="testimonials-grid">
          <div 
            v-for="testimonial in testimonials" 
            :key="testimonial.id"
            class="testimonial-card"
          >
            <div class="testimonial-header">
              <img 
                :src="testimonial.avatar" 
                :alt="testimonial.name"
                class="testimonial-avatar"
              />
              <div class="testimonial-user">
                <h4 class="testimonial-name">{{ testimonial.name }}</h4>
                <p class="testimonial-location">{{ testimonial.location }}</p>
              </div>
              <div class="testimonial-rating">
                <i 
                  v-for="star in 5" 
                  :key="star"
                  :class="['star-icon', { 'star-icon-filled': star <= testimonial.rating }]"
                ></i>
              </div>
            </div>
            <p class="testimonial-content">{{ testimonial.content }}</p>
          </div>
        </div>
      </section>
      
      <!-- 旅行资讯 -->
      <section class="travel-news-section">
        <div class="section-header">
          <h2 class="section-title">旅行资讯</h2>
          <p class="section-subtitle">获取最新的旅行攻略和技巧</p>
          <Button 
            variant="link" 
            class="view-all-button"
            @click="navigateTo('/news')"
          >
            查看全部 <i class="view-all-icon"></i>
          </Button>
        </div>
        
        <div class="news-grid">
          <div 
            v-for="news in recentNews" 
            :key="news.id"
            class="news-card"
            @click="navigateTo(`/news/${news.id}`)"
          >
            <div class="news-image-wrapper">
              <img 
                :src="news.imageUrl" 
                :alt="news.title"
                class="news-image"
              />
            </div>
            <div class="news-content">
              <div class="news-meta">
                <span class="news-category">{{ news.category }}</span>
                <span class="news-date">{{ formatDate(news.publishDate) }}</span>
              </div>
              <h3 class="news-title">{{ news.title }}</h3>
              <p class="news-excerpt">{{ news.excerpt }}</p>
              <Button 
                variant="link" 
                class="news-read-more"
                @click.stop="navigateTo(`/news/${news.id}`)"
              >
                阅读更多 <i class="news-read-more-icon"></i>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 订阅区域 -->
      <section class="subscribe-section">
        <div class="subscribe-container">
          <div class="subscribe-content">
            <h2 class="subscribe-title">订阅我们的旅行灵感</h2>
            <p class="subscribe-description">获取最新的旅行优惠、季节性推荐和专属旅行建议</p>
            <form @submit.prevent="handleSubscribe" class="subscribe-form">
              <FormInput
                v-model="subscribeEmail"
                type="email"
                :placeholder="'您的邮箱地址'"
                :required="true"
                class="subscribe-input"
              >
                <template #prefix>
                  <i class="subscribe-icon-email"></i>
                </template>
              </FormInput>
              <Button 
                type="submit" 
                variant="primary" 
                class="subscribe-button"
                :loading="subscribing"
              >
                订阅
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { Card, Button, FormInput } from '../components'
import dayjs from 'dayjs'

export default {
  name: 'Home',
  
  components: {
    Card,
    Button,
    FormInput
  },
  
  data() {
    return {
      // 搜索相关
      searchQuery: '',
      popularTags: ['日本', '泰国', '欧洲', '海岛', '美食', '文化', '冒险'],
      
      // 热门目的地（模拟数据）
      popularDestinations: [
        {
          id: 1,
          name: '东京',
          location: '日本',
          imageUrl: '/assets/images/tokyo.jpg',
          rating: 4.8,
          tags: ['现代都市', '购物天堂', '美食文化']
        },
        {
          id: 2,
          name: '巴厘岛',
          location: '印度尼西亚',
          imageUrl: '/assets/images/bali.jpg',
          rating: 4.7,
          tags: ['海滩度假', '自然风光', '冲浪胜地']
        },
        {
          id: 3,
          name: '巴黎',
          location: '法国',
          imageUrl: '/assets/images/paris.jpg',
          rating: 4.6,
          tags: ['浪漫之都', '艺术文化', '美食天堂']
        },
        {
          id: 4,
          name: '京都',
          location: '日本',
          imageUrl: '/assets/images/kyoto.jpg',
          rating: 4.9,
          tags: ['历史古迹', '传统文化', '樱花胜地']
        }
      ],
      
      // 用户评价（模拟数据）
      testimonials: [
        {
          id: 1,
          name: '张先生',
          location: '北京',
          avatar: '/assets/images/avatar1.jpg',
          rating: 5,
          content: 'AI助手帮我规划了一次完美的日本之旅，推荐的景点和餐厅都非常棒，比我自己做的攻略还要贴心！'
        },
        {
          id: 2,
          name: '李女士',
          location: '上海',
          avatar: '/assets/images/avatar2.jpg',
          rating: 4,
          content: '使用这个工具规划了我的蜜月旅行，行程安排得很合理，省了很多时间和精力。'
        },
        {
          id: 3,
          name: '王先生',
          location: '广州',
          avatar: '/assets/images/avatar3.jpg',
          rating: 5,
          content: '语音助手功能太方便了，在开车的时候也能轻松规划行程，强烈推荐给所有喜欢旅行的朋友！'
        }
      ],
      
      // 最新资讯（模拟数据）
      recentNews: [
        {
          id: 1,
          title: '2024年十大热门旅行目的地预测',
          excerpt: '随着旅游业的复苏，这些目的地将成为明年最受欢迎的旅行热点...',
          category: '旅行趋势',
          publishDate: '2023-11-15',
          imageUrl: '/assets/images/news1.jpg'
        },
        {
          id: 2,
          title: '如何在旅行中拍出专业级照片',
          excerpt: '不需要昂贵的设备，掌握这些技巧，让你的旅行照片惊艳朋友圈...',
          category: '旅行技巧',
          publishDate: '2023-11-10',
          imageUrl: '/assets/images/news2.jpg'
        },
        {
          id: 3,
          title: '预算旅行的10个实用省钱技巧',
          excerpt: '即使预算有限，也能享受精彩的旅行体验，从交通到住宿全面省钱攻略...',
          category: '旅行攻略',
          publishDate: '2023-11-05',
          imageUrl: '/assets/images/news3.jpg'
        }
      ],
      
      // 订阅相关
      subscribeEmail: '',
      subscribing: false
    }
  },
  
  methods: {
    // 处理搜索
    handleSearch() {
      if (!this.searchQuery.trim()) return
      
      // 跳转到搜索结果页面
      this.$router.push({
        path: '/search',
        query: { q: this.searchQuery.trim() }
      })
    },
    
    // 选择热门标签
    selectTag(tag) {
      this.searchQuery = tag
      this.handleSearch()
    },
    
    // 导航到指定页面
    navigateTo(path) {
      this.$router.push(path)
    },
    
    // 处理订阅
    async handleSubscribe() {
      if (!this.validateEmail(this.subscribeEmail)) {
        this.$notification.warning({
          title: '邮箱格式错误',
          message: '请输入有效的邮箱地址',
          duration: 3000
        })
        return
      }
      
      this.subscribing = true
      
      try {
        // TODO: 实现订阅API调用
        await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
        
        this.$notification.success({
          title: '订阅成功',
          message: '感谢您的订阅！我们将定期发送旅行灵感和优惠信息',
          duration: 3000
        })
        
        // 清空输入框
        this.subscribeEmail = ''
      } catch (error) {
        console.error('订阅失败:', error)
        this.$notification.error({
          title: '订阅失败',
          message: '请稍后再试或联系客服',
          duration: 3000
        })
      } finally {
        this.subscribing = false
      }
    },
    
    // 验证邮箱格式
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },
    
    // 格式化日期
    formatDate(dateString) {
      return dayjs(dateString).format('YYYY-MM-DD')
    }
  }
}
</script>

<style scoped>
/* 首页容器 */
.home-container {
  overflow-x: hidden;
}

/* 英雄区域 */
.hero-section {
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  padding: 0 20px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
}

.hero-title-highlight {
  color: #1890ff;
}

.hero-subtitle {
  font-size: 20px;
  margin-bottom: 32px;
  opacity: 0.9;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/assets/images/hero-bg.jpg');
  background-size: cover;
  background-position: center;
  z-index: 1;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
}

/* 搜索区域 */
.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-input-wrapper {
  display: flex;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
}

.search-input {
  flex: 1;
  padding: 16px 20px;
  font-size: 16px;
  border: none;
  outline: none;
}

.search-button {
  padding: 16px 24px;
  background-color: #1890ff;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.search-button:hover {
  background-color: #40a9ff;
}

.search-icon::before {
  content: '🔍';
  margin-right: 8px;
}

.search-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
}

.search-tag {
  padding: 6px 12px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.search-tag:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* 主要内容区域 */
.main-content {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 通用区块样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
}

.section-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.section-subtitle {
  font-size: 16px;
  color: #666;
}

.view-all-button {
  font-size: 16px;
}

.view-all-icon::before {
  content: '→';
  margin-left: 4px;
}

/* 功能卡片区域 */
.features-section {
  margin-bottom: 64px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.feature-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.feature-card-content {
  text-align: center;
  padding: 32px 24px;
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-icon {
  background-color: #e6f7ff;
}

.voice-icon::before {
  content: '🎤';
  font-size: 40px;
}

.planner-icon {
  background-color: #f6ffed;
}

.planner-icon::before {
  content: '📅';
  font-size: 40px;
}

.destination-icon {
  background-color: #fff7e6;
}

.destination-icon::before {
  content: '🌍';
  font-size: 40px;
}

.news-icon {
  background-color: #f0f5ff;
}

.news-icon::before {
  content: '📰';
  font-size: 40px;
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.feature-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

/* 热门目的地 */
.popular-destinations-section {
  margin-bottom: 64px;
}

.destinations-carousel {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.destination-card {
  border-radius: 12px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
}

.destination-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.destination-image-wrapper {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.destination-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.destination-card:hover .destination-image {
  transform: scale(1.05);
}

.destination-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
}

.destination-rating {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.rating-icon::before {
  content: '⭐';
  margin-right: 4px;
}

.destination-info {
  padding: 16px;
}

.destination-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.destination-location {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.destination-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.destination-tag {
  padding: 2px 8px;
  background-color: #f0f0f0;
  border-radius: 10px;
  font-size: 12px;
  color: #666;
}

/* 用户体验 */
.testimonials-section {
  margin-bottom: 64px;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.testimonial-card {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.testimonial-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.testimonial-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
}

.testimonial-user {
  flex: 1;
}

.testimonial-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.testimonial-location {
  font-size: 14px;
  color: #666;
}

.testimonial-rating {
  display: flex;
  gap: 2px;
}

.star-icon::before {
  content: '☆';
  color: #d9d9d9;
  font-size: 16px;
}

.star-icon-filled::before {
  content: '★';
  color: #faad14;
}

.testimonial-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

/* 旅行资讯 */
.travel-news-section {
  margin-bottom: 64px;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.news-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
}

.news-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.news-image-wrapper {
  height: 200px;
  overflow: hidden;
}

.news-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.news-card:hover .news-image {
  transform: scale(1.05);
}

.news-content {
  padding: 20px;
}

.news-meta {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
  color: #999;
}

.news-category {
  padding: 2px 8px;
  background-color: #f0f0f0;
  border-radius: 10px;
  margin-right: 12px;
}

.news-date {
  font-size: 12px;
}

.news-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
  line-height: 1.4;
}

.news-excerpt {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-read-more {
  font-size: 14px;
  padding: 0;
  height: auto;
}

.news-read-more-icon::before {
  content: '→';
  margin-left: 4px;
}

/* 订阅区域 */
.subscribe-section {
  background-color: #f0f9ff;
  padding: 64px 0;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.subscribe-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.subscribe-content {
  text-align: center;
}

.subscribe-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.subscribe-description {
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
}

.subscribe-form {
  display: flex;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
}

.subscribe-input {
  flex: 1;
}

.subscribe-button {
  min-width: 120px;
}

.subscribe-icon-email::before {
  content: '📧';
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }
  
  .hero-subtitle {
    font-size: 18px;
  }
  
  .search-input-wrapper {
    flex-direction: column;
  }
  
  .search-button {
    width: 100%;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .features-grid,
  .destinations-carousel,
  .testimonials-grid,
  .news-grid {
    grid-template-columns: 1fr;
  }
  
  .subscribe-form {
    flex-direction: column;
  }
  
  .main-content {
    padding: 32px 16px;
  }
  
  .feature-card-content {
    padding: 24px 16px;
  }
}
</style>