<template>
  <div class="destination-detail-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">正在加载目的地信息...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon"></div>
      <h3 class="error-title">无法加载目的地信息</h3>
      <p class="error-message">{{ error }}</p>
      <Button @click="fetchDestinationDetail" variant="primary" class="retry-button">
        重试
      </Button>
    </div>
    
    <!-- 目的地详情 -->
    <div v-else-if="destination" class="destination-content">
      <!-- 顶部横幅 -->
      <div class="destination-banner">
        <div class="banner-image-container">
          <img 
            :src="destination.mainImageUrl || destination.imageUrl" 
            :alt="destination.name"
            class="banner-image"
          />
          <div class="banner-overlay"></div>
        </div>
        
        <div class="banner-content">
          <div class="destination-meta">
            <h1 class="destination-name">{{ destination.name }}</h1>
            <div class="destination-location">
              <i class="location-icon"></i>
              <span>{{ destination.country }}</span>
            </div>
            
            <!-- 评分和评价 -->
            <div class="destination-rating">
              <div class="rating-main">
                <span class="rating-number">{{ destination.rating.toFixed(1) }}</span>
                <div class="rating-stars">
                  <i 
                    v-for="star in 5" 
                    :key="star"
                    :class="['star-icon', { 'star-filled': star <= destination.rating }]"
                  ></i>
                </div>
              </div>
              <div class="review-info">
                <span class="review-count">{{ destination.reviewCount }}条评价</span>
                <span class="review-label">· 极好</span>
              </div>
            </div>
            
            <!-- 标签 -->
            <div class="destination-tags">
              <span 
                v-for="(tag, index) in destination.tags" 
                :key="index"
                class="destination-tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="destination-actions">
            <Button 
              :class="['favorite-button', { 'favorite-active': destination.isFavorite }]"
              @click="toggleFavorite"
              variant="secondary"
              size="large"
              class="action-button"
            >
              <i class="favorite-icon"></i>
              {{ destination.isFavorite ? '已收藏' : '收藏' }}
            </Button>
            
            <Button 
              @click="shareDestination"
              variant="outline"
              size="large"
              class="action-button"
            >
              <i class="share-icon"></i>
              分享
            </Button>
            
            <Button 
              @click="createTrip"
              variant="primary"
              size="large"
              class="action-button primary-button"
            >
              开始规划
            </Button>
          </div>
        </div>
      </div>
      
      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 左侧内容 -->
        <div class="left-column">
          <!-- 描述部分 -->
          <Card class="content-section">
            <template #header>
              <h2 class="section-title">目的地介绍</h2>
            </template>
            <div class="description-content">
              <p class="destination-description">{{ destination.description }}</p>
              
              <!-- 最佳游玩季节 -->
              <div class="season-info">
                <h3 class="season-title">最佳游玩季节</h3>
                <div class="season-options">
                  <div 
                    v-for="season in seasons" 
                    :key="season.value"
                    :class="['season-option', { 'season-active': destination.bestSeason.includes(season.value) }]"
                  >
                    <span class="season-icon">{{ season.icon }}</span>
                    <span class="season-name">{{ season.name }}</span>
                    <span v-if="destination.bestSeason.includes(season.value)" class="season-badge">推荐</span>
                  </div>
                </div>
                <p class="season-description">{{ destination.seasonDescription }}</p>
              </div>
            </div>
          </Card>
          
          <!-- 必游景点 -->
          <Card class="content-section" v-if="destination.attractions && destination.attractions.length > 0">
            <template #header>
              <h2 class="section-title">必游景点</h2>
            </template>
            <div class="attractions-list">
              <div 
                v-for="attraction in destination.attractions" 
                :key="attraction.id"
                class="attraction-item"
              >
                <img 
                  :src="attraction.imageUrl" 
                  :alt="attraction.name"
                  class="attraction-image"
                />
                <div class="attraction-info">
                  <h3 class="attraction-name">{{ attraction.name }}</h3>
                  <div class="attraction-rating">
                    <div class="attraction-stars">
                      <i 
                        v-for="star in 5" 
                        :key="star"
                        :class="['star-icon', { 'star-filled': star <= attraction.rating }]"
                      ></i>
                    </div>
                    <span class="attraction-rating-number">{{ attraction.rating.toFixed(1) }}</span>
                    <span class="attraction-review-count">({{ attraction.reviewCount }}条评价)</span>
                  </div>
                  <p class="attraction-description">{{ attraction.description }}</p>
                  <div class="attraction-meta">
                    <span class="attraction-price">{{ attraction.price }}</span>
                    <span class="attraction-duration">{{ attraction.duration }}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          <!-- 旅行攻略 -->
          <Card class="content-section" v-if="destination.travelGuides && destination.travelGuides.length > 0">
            <template #header>
              <h2 class="section-title">旅行攻略</h2>
            </template>
            <div class="guides-list">
              <div 
                v-for="guide in destination.travelGuides" 
                :key="guide.id"
                class="guide-item"
              >
                <h3 class="guide-title">{{ guide.title }}</h3>
                <ul class="guide-content">
                  <li v-for="(item, index) in guide.content" :key="index" class="guide-point">
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </Card>
          
          <!-- 用户评价 -->
          <Card class="content-section" v-if="destination.reviews && destination.reviews.length > 0">
            <template #header>
              <h2 class="section-title">用户评价</h2>
              <div class="review-sort">
                <select v-model="reviewSortBy" @change="sortReviews" class="review-sort-select">
                  <option value="newest">最新</option>
                  <option value="highest">评分最高</option>
                  <option value="lowest">评分最低</option>
                </select>
              </div>
            </template>
            <div class="reviews-list">
              <div 
                v-for="review in sortedReviews" 
                :key="review.id"
                class="review-item"
              >
                <div class="review-header">
                  <div class="review-user">
                    <img 
                      :src="review.userAvatar" 
                      :alt="review.userName"
                      class="user-avatar"
                    />
                    <div class="user-info">
                      <div class="user-name">{{ review.userName }}</div>
                      <div class="review-date">{{ formatDate(review.date) }}</div>
                    </div>
                  </div>
                  <div class="review-rating">
                    <i 
                      v-for="star in 5" 
                      :key="star"
                      :class="['star-icon', { 'star-filled': star <= review.rating }]"
                    ></i>
                  </div>
                </div>
                <div class="review-content">
                  {{ review.content }}
                </div>
                <div class="review-footer">
                  <div class="review-actions">
                    <button class="review-action">
                      <i class="like-icon"></i>
                      {{ review.likes }}
                    </button>
                    <button class="review-action">
                      <i class="dislike-icon"></i>
                    </button>
                  </div>
                  <div class="review-tags">
                    <span 
                      v-for="(tag, index) in review.tags" 
                      :key="index"
                      class="review-tag"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="load-more-reviews">
              <Button @click="loadMoreReviews" variant="outline" class="load-more-button">
                加载更多评价
              </Button>
            </div>
          </Card>
        </div>
        
        <!-- 右侧边栏 -->
        <div class="right-column">
          <!-- 行程推荐 -->
          <Card class="sidebar-section">
            <template #header>
              <h3 class="sidebar-title">推荐行程</h3>
            </template>
            <div class="trip-recommendations">
              <div 
                v-for="trip in destination.recommendedTrips" 
                :key="trip.id"
                class="trip-item"
                @click="viewTripDetail(trip.id)"
              >
                <div class="trip-image-container">
                  <img 
                    :src="trip.imageUrl" 
                    :alt="trip.title"
                    class="trip-image"
                  />
                  <div class="trip-duration">
                    {{ trip.duration }}天
                  </div>
                </div>
                <div class="trip-info">
                  <h4 class="trip-title">{{ trip.title }}</h4>
                  <div class="trip-price">
                    ¥{{ trip.price }}<span class="price-unit">/人起</span>
                  </div>
                  <div class="trip-features">
                    <span 
                      v-for="(feature, index) in trip.features.slice(0, 3)" 
                      :key="index"
                      class="trip-feature"
                    >
                      {{ feature }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="view-all-trips">
              <Button 
                @click="viewAllTrips"
                variant="link" 
                class="view-all-button"
              >
                查看全部行程 →
              </Button>
            </div>
          </Card>
          
          <!-- 实用信息 -->
          <Card class="sidebar-section">
            <template #header>
              <h3 class="sidebar-title">实用信息</h3>
            </template>
            <div class="practical-info">
              <div class="info-item">
                <div class="info-icon money-icon"></div>
                <div class="info-content">
                  <div class="info-label">货币</div>
                  <div class="info-value">{{ destination.currency }}</div>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon language-icon"></div>
                <div class="info-content">
                  <div class="info-label">语言</div>
                  <div class="info-value">{{ destination.language }}</div>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon time-icon"></div>
                <div class="info-content">
                  <div class="info-label">时差</div>
                  <div class="info-value">{{ destination.timeDifference }}</div>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon weather-icon"></div>
                <div class="info-content">
                  <div class="info-label">当前天气</div>
                  <div class="info-value">{{ destination.currentWeather }}</div>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon transport-icon"></div>
                <div class="info-content">
                  <div class="info-label">交通</div>
                  <div class="info-value">{{ destination.transportation }}</div>
                </div>
              </div>
            </div>
          </Card>
          
          <!-- 附近目的地 -->
          <Card class="sidebar-section" v-if="destination.nearbyDestinations && destination.nearbyDestinations.length > 0">
            <template #header>
              <h3 class="sidebar-title">附近目的地</h3>
            </template>
            <div class="nearby-destinations">
              <div 
                v-for="nearby in destination.nearbyDestinations" 
                :key="nearby.id"
                class="nearby-item"
                @click="navigateToDestination(nearby.id)"
              >
                <img 
                  :src="nearby.imageUrl" 
                  :alt="nearby.name"
                  class="nearby-image"
                />
                <div class="nearby-info">
                  <div class="nearby-name">{{ nearby.name }}</div>
                  <div class="nearby-distance">{{ nearby.distance }}</div>
                </div>
              </div>
            </div>
          </Card>
          
          <!-- 问答区域 -->
          <Card class="sidebar-section">
            <template #header>
              <h3 class="sidebar-title">热门问答</h3>
            </template>
            <div class="faq-section">
              <div 
                v-for="faq in destination.faq" 
                :key="faq.id"
                class="faq-item"
              >
                <div class="faq-question" @click="toggleFaq(faq.id)">
                  <span class="faq-question-text">{{ faq.question }}</span>
                  <span 
                    :class="['faq-toggle-icon', { 'faq-toggle-open': openFaqId === faq.id }]"
                  >
                    ▼
                  </span>
                </div>
                <div 
                  v-if="openFaqId === faq.id"
                  class="faq-answer"
                >
                  {{ faq.answer }}
                </div>
              </div>
            </div>
            <div class="ask-question">
              <Button @click="showAskQuestion" variant="primary" class="ask-question-button">
                提问
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Card, Button } from '../components'
import dayjs from 'dayjs'

export default {
  name: 'DestinationDetail',
  
  components: {
    Card,
    Button
  },
  
  data() {
    return {
      // 页面状态
      loading: true,
      error: null,
      destination: null,
      
      // 评价相关状态
      reviewSortBy: 'newest',
      displayedReviews: 5,
      
      // FAQ状态
      openFaqId: null,
      
      // 季节选项
      seasons: [
        { value: 'spring', name: '春季', icon: '🌸' },
        { value: 'summer', name: '夏季', icon: '☀️' },
        { value: 'autumn', name: '秋季', icon: '🍂' },
        { value: 'winter', name: '冬季', icon: '❄️' }
      ]
    }
  },
  
  computed: {
    // 排序后的评价列表
    sortedReviews() {
      if (!this.destination || !this.destination.reviews) return []
      
      const reviews = [...this.destination.reviews].slice(0, this.displayedReviews)
      
      switch (this.reviewSortBy) {
        case 'highest':
          return reviews.sort((a, b) => b.rating - a.rating)
        case 'lowest':
          return reviews.sort((a, b) => a.rating - b.rating)
        case 'newest':
        default:
          return reviews.sort((a, b) => new Date(b.date) - new Date(a.date))
      }
    }
  },
  
  methods: {
    // 获取目的地详情
    fetchDestinationDetail() {
      const id = this.$route.params.id
      if (!id) {
        this.error = '无效的目的地ID'
        this.loading = false
        return
      }
      
      this.loading = true
      this.error = null
      
      // 模拟API请求
      setTimeout(() => {
        // 这里应该是从API获取数据，现在使用模拟数据
        const destinationData = this.getMockDestinationData(id)
        
        if (destinationData) {
          this.destination = destinationData
        } else {
          this.error = '找不到该目的地信息'
        }
        
        this.loading = false
      }, 1000)
    },
    
    // 获取模拟目的地数据
    getMockDestinationData(id) {
      const mockData = {
        1: {
          id: 1,
          name: '东京',
          country: '日本',
          imageUrl: '/assets/images/destinations/tokyo.jpg',
          mainImageUrl: '/assets/images/destinations/tokyo-main.jpg',
          rating: 4.8,
          reviewCount: 3245,
          price: 8999,
          description: '东京是一座充满活力的现代大都市，融合了传统文化与未来科技。这座城市拥有令人惊叹的摩天大楼、繁华的购物区、宁静的寺庙和世界级的美食。无论你是喜欢购物、美食、文化还是夜生活，东京都能满足你的所有期待。从东京塔到明治神宫，从涩谷十字路口到浅草寺，每一个角落都充满了独特的魅力。',
          shortDescription: '探索这座充满未来感和传统文化交融的大都市，体验独特的日本风情。',
          highlights: ['东京塔', '明治神宫', '浅草寺', '购物天堂', '美食'],
          bestSeason: 'spring,autumn',
          seasonDescription: '春季（3-5月）樱花盛开，气温宜人；秋季（9-11月）红叶绚烂，天气凉爽。这两个季节是游览东京的最佳时间。',
          travelType: 'city',
          isFavorite: false,
          tags: ['城市观光', '文化体验', '美食', '购物', '科技'],
          currency: '日元 (JPY)',
          language: '日语',
          timeDifference: '+1小时（比北京时间）',
          currentWeather: '18°C，多云',
          transportation: '地铁、JR线、出租车',
          attractions: [
            {
              id: 101,
              name: '东京塔',
              imageUrl: '/assets/images/attractions/tokyo-tower.jpg',
              rating: 4.7,
              reviewCount: 892,
              description: '东京的地标性建筑，仿照巴黎埃菲尔铁塔建造，高332.9米。',
              price: '门票: 900日元',
              duration: '建议游览2-3小时'
            },
            {
              id: 102,
              name: '明治神宫',
              imageUrl: '/assets/images/attractions/meiji-shrine.jpg',
              rating: 4.8,
              reviewCount: 765,
              description: '位于繁华的涩谷区，是祭祀明治天皇和昭宪皇太后的神宫，被茂密的森林环绕。',
              price: '免费',
              duration: '建议游览1-2小时'
            },
            {
              id: 103,
              name: '浅草寺',
              imageUrl: '/assets/images/attractions/asakusa.jpg',
              rating: 4.6,
              reviewCount: 1234,
              description: '东京最古老的寺庙，建于628年，寺前的雷门和仲见世商店街非常热闹。',
              price: '免费',
              duration: '建议游览2-3小时'
            },
            {
              id: 104,
              name: '涩谷十字路口',
              imageUrl: '/assets/images/attractions/shibuya-crossing.jpg',
              rating: 4.5,
              reviewCount: 678,
              description: '世界上最繁忙的人行横道，每次绿灯可以同时通行数千人。',
              price: '免费',
              duration: '建议游览30分钟'
            },
            {
              id: 105,
              name: '东京迪士尼乐园',
              imageUrl: '/assets/images/attractions/disneyland.jpg',
              rating: 4.9,
              reviewCount: 2103,
              description: '亚洲第一座迪士尼主题公园，充满了欢乐和梦想。',
              price: '门票: 7500日元',
              duration: '建议游览一整天'
            }
          ],
          travelGuides: [
            {
              id: 201,
              title: '交通指南',
              content: [
                '购买西瓜卡(Suica)或PASMO卡，可用于乘坐各种公共交通工具和便利店购物',
                '东京地铁是游览城市的最佳选择，覆盖面广且准时',
                'JR山手线环绕东京主要区域，非常方便',
                '在高峰期尽量避免乘坐地铁，会非常拥挤',
                '出租车费用较高，但夜间出行较为方便'
              ]
            },
            {
              id: 202,
              title: '住宿建议',
              content: [
                '新宿：交通便利，购物和夜生活丰富',
                '涩谷：年轻人聚集地，时尚潮流中心',
                '银座：高端购物和美食区，价格较贵',
                '浅草：传统氛围浓厚，价格相对亲民',
                '六本木：国际化区域，艺术和文化设施丰富'
              ]
            },
            {
              id: 203,
              title: '美食推荐',
              content: [
                '寿司：推荐筑地市场周边或高级寿司店',
                '拉面：一蘭拉面、一风堂等连锁店品质稳定',
                '烧肉：叙々苑、牛角等知名连锁',
                '居酒屋：体验地道的日本小酒馆文化',
                '甜点：各种精致的日式和西式甜点'
              ]
            },
            {
              id: 204,
              title: '购物指南',
              content: [
                '银座：高端品牌和百货公司聚集地',
                '新宿：伊势丹、高岛屋等大型百货',
                '涩谷：109、涩谷PARCO等时尚购物中心',
                '秋叶原：电子产品和动漫周边天堂',
                '原宿：潮流服饰和街头时尚'
              ]
            }
          ],
          reviews: [
            {
              id: 301,
              userName: '旅行爱好者',
              userAvatar: '/assets/images/avatars/user1.jpg',
              rating: 5,
              date: '2023-04-15',
              content: '东京真的是一个令人惊叹的城市！从传统的寺庙到现代的摩天大楼，从宁静的公园到繁华的购物区，这里有着丰富多彩的体验。我特别喜欢浅草寺的传统氛围和明治神宫的宁静环境。美食也非常棒，尤其是寿司和拉面，简直是天堂！',
              likes: 128,
              tags: ['美食', '文化', '购物']
            },
            {
              id: 302,
              userName: '摄影师小王',
              userAvatar: '/assets/images/avatars/user2.jpg',
              rating: 4,
              date: '2023-03-22',
              content: '东京是摄影师的天堂，无论哪个角度都是美景。春季的樱花、秋季的红叶、冬季的雪景，每个季节都有独特的魅力。唯一的缺点是地铁在高峰期真的太拥挤了，建议错峰出行。',
              likes: 95,
              tags: ['风景', '摄影', '樱花']
            },
            {
              id: 303,
              userName: '吃货小李',
              userAvatar: '/assets/images/avatars/user3.jpg',
              rating: 5,
              date: '2023-02-18',
              content: '作为一个吃货，东京绝对是我最喜欢的城市之一！从高级餐厅到街边小吃，每一样都令人难忘。强烈推荐大家尝试筑地市场的寿司、一蘭拉面，还有各种居酒屋的小料理。价格虽然不便宜，但绝对值得！',
              likes: 156,
              tags: ['美食', '寿司', '拉面']
            },
            {
              id: 304,
              userName: '购物达人',
              userAvatar: '/assets/images/avatars/user4.jpg',
              rating: 5,
              date: '2023-01-10',
              content: '东京的购物体验无与伦比！银座、新宿、涩谷、秋叶原...每个区域都有自己的特色。无论是奢侈品还是平价商品，都能找到心仪的东西。而且服务态度非常好，让人感觉很舒服。',
              likes: 89,
              tags: ['购物', '银座', '涩谷']
            },
            {
              id: 305,
              userName: '文化探索者',
              userAvatar: '/assets/images/avatars/user5.jpg',
              rating: 4,
              date: '2022-12-05',
              content: '我对日本文化非常感兴趣，东京有很多值得探索的文化景点。除了知名的浅草寺和明治神宫外，还有很多小众但很有特色的寺庙和博物馆。不过，语言障碍确实存在，建议下载翻译软件。',
              likes: 76,
              tags: ['文化', '寺庙', '博物馆']
            },
            {
              id: 306,
              userName: '商务旅行者',
              userAvatar: '/assets/images/avatars/user6.jpg',
              rating: 4,
              date: '2022-11-20',
              content: '作为一个经常来东京出差的人，我觉得这个城市非常适合商务旅行。交通便利，酒店设施完善，服务也很好。不过消费水平确实比较高，尤其是住宿和餐饮方面。',
              likes: 62,
              tags: ['商务', '交通', '酒店']
            },
            {
              id: 307,
              userName: '亲子游家庭',
              userAvatar: '/assets/images/avatars/user7.jpg',
              rating: 5,
              date: '2022-10-08',
              content: '带孩子来东京旅游是一个绝佳的选择！迪士尼乐园、东京晴空塔、上野动物园...孩子们玩得非常开心。而且东京的公共设施对儿童非常友好，很多餐厅都有儿童餐和儿童座椅。',
              likes: 103,
              tags: ['亲子', '迪士尼', '儿童友好']
            }
          ],
          recommendedTrips: [
            {
              id: 401,
              title: '东京经典5日游',
              imageUrl: '/assets/images/trips/tokyo-classic.jpg',
              duration: 5,
              price: 7999,
              features: ['东京塔', '迪士尼', '购物', '美食']
            },
            {
              id: 402,
              title: '东京文化深度游',
              imageUrl: '/assets/images/trips/tokyo-cultural.jpg',
              duration: 4,
              price: 6599,
              features: ['寺庙', '博物馆', '传统茶道', '和服体验']
            },
            {
              id: 403,
              title: '东京购物狂欢3日游',
              imageUrl: '/assets/images/trips/tokyo-shopping.jpg',
              duration: 3,
              price: 5999,
              features: ['银座', '涩谷', '新宿', '秋叶原']
            }
          ],
          nearbyDestinations: [
            {
              id: 4,
              name: '京都',
              imageUrl: '/assets/images/destinations/kyoto-thumb.jpg',
              distance: '约2.5小时车程'
            },
            {
              id: 30,
              name: '镰仓',
              imageUrl: '/assets/images/destinations/kamakura-thumb.jpg',
              distance: '约1小时车程'
            },
            {
              id: 31,
              name: '箱根',
              imageUrl: '/assets/images/destinations/hakone-thumb.jpg',
              distance: '约1.5小时车程'
            }
          ],
          faq: [
            {
              id: 501,
              question: '什么时候去东京旅游最好？',
              answer: '春季（3-5月）和秋季（9-11月）是去东京旅游的最佳时间。春季樱花盛开，气温宜人；秋季红叶绚烂，天气凉爽。夏季（6-8月）比较炎热潮湿，冬季（12-2月）较冷但干燥。'
            },
            {
              id: 502,
              question: '在东京需要兑换日元吗？',
              answer: '是的，虽然东京的大型商场和部分餐厅可以使用信用卡，但很多小店、出租车和自动售货机只接受现金。建议在出发前或到达东京的机场兑换一些日元现金。'
            },
            {
              id: 503,
              question: '东京的交通卡怎么购买和使用？',
              answer: '可以在机场、主要车站的售票处或自动售票机购买西瓜卡(Suica)或PASMO卡。购买时需要支付500日元押金（退卡时可返还），然后充值使用。这些卡在乘坐地铁、JR线、公交车时非常方便，还可以在便利店购物。'
            },
            {
              id: 504,
              question: '在东京有语言障碍怎么办？',
              answer: '东京的主要旅游景点、大型商场和酒店的工作人员通常会说一些英语。建议下载翻译软件，如Google翻译、有道翻译等，这些软件支持离线翻译和拍照翻译功能。也可以准备一些常用的日语短语卡片。'
            },
            {
              id: 505,
              question: '东京的消费水平如何？',
              answer: '东京是世界上消费水平最高的城市之一。住宿方面，普通酒店每晚约10000-20000日元，高级酒店则更贵。餐饮方面，一顿简单的午餐约1000-1500日元，晚餐则需要3000-5000日元。交通费用相对合理，可以通过购买交通卡来节省开支。'
            }
          ]
        }
        // 可以添加更多目的地数据...
      }
      
      return mockData[id] || null
    },
    
    // 切换收藏状态
    toggleFavorite() {
      if (!this.destination) return
      
      this.destination.isFavorite = !this.destination.isFavorite
      
      this.$notification.success({
        title: this.destination.isFavorite ? '添加收藏' : '取消收藏',
        message: `${this.destination.name} ${this.destination.isFavorite ? '已添加到收藏' : '已从收藏中移除'}`,
        duration: 2000
      })
    },
    
    // 分享目的地
    shareDestination() {
      if (!this.destination) return
      
      // 模拟分享功能
      const shareText = `我在AI旅行助手发现了${this.destination.name}，快来看看吧！`
      
      // 检查浏览器是否支持分享API
      if (navigator.share) {
        navigator.share({
          title: this.destination.name,
          text: shareText,
          url: window.location.href
        }).catch(err => {
          console.log('分享失败:', err)
          this.copyShareLink(shareText)
        })
      } else {
        // 不支持分享API，复制链接
        this.copyShareLink(shareText)
      }
    },
    
    // 复制分享链接
    copyShareLink(text) {
      const fullText = `${text} - ${window.location.href}`
      
      navigator.clipboard.writeText(fullText).then(() => {
        this.$notification.success({
          title: '复制成功',
          message: '分享链接已复制到剪贴板',
          duration: 2000
        })
      }).catch(() => {
        this.$notification.error({
          title: '复制失败',
          message: '请手动复制分享内容',
          duration: 2000
        })
      })
    },
    
    // 创建行程
    createTrip() {
      if (!this.destination) return
      
      // 导航到行程规划页面，并预填目的地信息
      this.$router.push({
        path: '/trip-planner',
        query: { destination: this.destination.name }
      })
    },
    
    // 查看行程详情
    viewTripDetail(tripId) {
      this.$router.push(`/trip/${tripId}`)
    },
    
    // 查看全部行程
    viewAllTrips() {
      if (!this.destination) return
      
      this.$router.push({
        path: '/trips',
        query: { destination: this.destination.id }
      })
    },
    
    // 导航到其他目的地
    navigateToDestination(destinationId) {
      this.$router.push(`/destination/${destinationId}`)
    },
    
    // 排序评价
    sortReviews() {
      // 排序逻辑在computed属性中实现
    },
    
    // 加载更多评价
    loadMoreReviews() {
      this.displayedReviews += 5
    },
    
    // 切换FAQ展开/收起
    toggleFaq(faqId) {
      this.openFaqId = this.openFaqId === faqId ? null : faqId
    },
    
    // 显示提问弹窗
    showAskQuestion() {
      this.$notification.info({
        title: '提问功能',
        message: '提问功能即将上线，敬请期待！',
        duration: 2000
      })
    },
    
    // 格式化日期
    formatDate(dateString) {
      return dayjs(dateString).format('YYYY年MM月DD日')
    }
  },
  
  watch: {
    // 监听路由参数变化，重新加载数据
    '$route.params.id': {
      immediate: true,
      handler() {
        this.fetchDestinationDetail()
      }
    }
  }
}
</script>

<style scoped>
/* 目的地详情容器 */
.destination-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 加载状态 */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text,
.error-message {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.error-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #fff2f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 32px;
}

.error-icon::before {
  content: '⚠️';
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  color: #ff4d4f;
  margin-bottom: 8px;
}

.retry-button {
  margin-top: 16px;
}

/* 顶部横幅 */
.destination-banner {
  position: relative;
  background-color: #333;
  color: white;
  padding-bottom: 40px;
}

.banner-image-container {
  position: relative;
  height: 400px;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7);
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.8));
}

.banner-content {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  transform: translateY(-100px);
}

.destination-meta {
  margin-bottom: 24px;
}

.destination-name {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 12px;
  color: white;
}

.destination-location {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  margin-bottom: 16px;
  opacity: 0.9;
}

.location-icon::before {
  content: '📍';
  font-size: 18px;
}

/* 评分 */
.destination-rating {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.rating-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-number {
  font-size: 32px;
  font-weight: 700;
  color: #ffd700;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star-icon::before {
  content: '☆';
  font-size: 18px;
  color: rgba(255, 255, 255, 0.6);
}

.star-filled::before {
  content: '★';
  color: #ffd700;
}

.review-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.review-count {
  font-size: 16px;
  opacity: 0.9;
}

.review-label {
  font-size: 14px;
  opacity: 0.8;
}

/* 标签 */
.destination-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.destination-tag {
  padding: 6px 12px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  font-size: 14px;
}

/* 操作按钮 */
.destination-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.favorite-icon::before {
  content: '❤️';
  font-size: 16px;
}

.favorite-button.favorite-active .favorite-icon::before {
  content: '❤️';
}

.share-icon::before {
  content: '📤';
  font-size: 16px;
}

.primary-button {
  min-width: 120px;
}

/* 主要内容区域 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  transform: translateY(-40px);
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
}

/* 左侧内容 */
.left-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 右侧边栏 */
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 内容区块 */
.content-section,
.sidebar-section {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.content-section .section-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 描述内容 */
.description-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
}

.destination-description {
  margin-bottom: 24px;
}

/* 季节信息 */
.season-info {
  margin-top: 32px;
}

.season-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.season-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.season-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s;
  text-align: center;
}

.season-option:hover {
  border-color: #1890ff;
}

.season-active {
  border-color: #1890ff;
  background-color: #e6f7ff;
}

.season-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.season-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.season-badge {
  margin-top: 8px;
  padding: 2px 8px;
  background-color: #1890ff;
  color: white;
  border-radius: 10px;
  font-size: 12px;
}

.season-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

/* 景点列表 */
.attractions-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.attraction-item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.attraction-item:last-child {
  border-bottom: none;
}

.attraction-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.attraction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attraction-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.attraction-rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.attraction-stars {
  display: flex;
  gap: 2px;
}

.attraction-rating-number {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.attraction-review-count {
  font-size: 12px;
  color: #999;
}

.attraction-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.attraction-meta {
  display: flex;
  gap: 16px;
  margin-top: auto;
}

.attraction-price,
.attraction-duration {
  font-size: 12px;
  color: #666;
}

/* 旅行攻略 */
.guides-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.guide-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.guide-item:last-child {
  border-bottom: none;
}

.guide-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
}

.guide-content {
  margin: 0;
  padding-left: 20px;
}

.guide-point {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 8px;
}

.guide-point:last-child {
  margin-bottom: 0;
}

/* 评价部分 */
.review-sort {
  display: flex;
  align-items: center;
}

.review-sort-select {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.review-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.review-date {
  font-size: 12px;
  color: #999;
}

.review-rating {
  display: flex;
  gap: 2px;
}

.review-content {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 12px;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-actions {
  display: flex;
  gap: 16px;
}

.review-action {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #999;
  font-size: 12px;
  cursor: pointer;
}

.review-action:hover {
  color: #1890ff;
}

.like-icon::before {
  content: '👍';
}

.dislike-icon::before {
  content: '👎';
}

.review-tags {
  display: flex;
  gap: 6px;
}

.review-tag {
  padding: 2px 8px;
  background-color: #f0f0f0;
  border-radius: 10px;
  font-size: 12px;
  color: #666;
}

.load-more-reviews {
  text-align: center;
  margin-top: 24px;
}

/* 行程推荐 */
.trip-recommendations {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trip-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.trip-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.trip-image-container {
  position: relative;
  height: 120px;
}

.trip-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trip-duration {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.trip-info {
  padding: 12px;
}

.trip-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.trip-price {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 8px;
}

.price-unit {
  font-size: 12px;
  color: #666;
  font-weight: normal;
}

.trip-features {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.trip-feature {
  padding: 2px 6px;
  background-color: #f0f0f0;
  border-radius: 8px;
  font-size: 11px;
  color: #666;
}

.view-all-trips {
  text-align: center;
  margin-top: 8px;
}

/* 实用信息 */
.practical-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.money-icon::before { content: '💰'; }
.language-icon::before { content: '🗣️'; }
.time-icon::before { content: '⏰'; }
.weather-icon::before { content: '🌤️'; }
.transport-icon::before { content: '🚇'; }

.info-content {
  flex: 1;
}

.info-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 2px;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 附近目的地 */
.nearby-destinations {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nearby-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.nearby-item:hover {
  transform: translateX(4px);
}

.nearby-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.nearby-info {
  flex: 1;
}

.nearby-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.nearby-distance {
  font-size: 12px;
  color: #666;
}

/* FAQ部分 */
.faq-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  border-bottom: 1px solid #f0f0f0;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  cursor: pointer;
}

.faq-question-text {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  flex: 1;
  padding-right: 8px;
}

.faq-toggle-icon {
  font-size: 12px;
  color: #999;
  transition: transform 0.3s;
}

.faq-toggle-open {
  transform: rotate(180deg);
}

.faq-answer {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  padding: 0 0 12px;
}

.ask-question {
  text-align: center;
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .right-column {
    order: -1;
  }
  
  .banner-image-container {
    height: 300px;
  }
  
  .destination-name {
    font-size: 32px;
  }
  
  .destination-rating {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .banner-content {
    padding: 0 16px;
    transform: translateY(-80px);
  }
  
  .main-content {
    padding: 0 16px;
    transform: translateY(-30px);
  }
  
  .destination-name {
    font-size: 28px;
  }
  
  .season-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .attraction-item {
    flex-direction: column;
  }
  
  .attraction-image {
    width: 100%;
    height: 200px;
  }
}

@media (max-width: 480px) {
  .banner-image-container {
    height: 200px;
  }
  
  .banner-content {
    transform: translateY(-60px);
  }
  
  .destination-actions {
    flex-direction: column;
  }
  
  .action-button {
    width: 100%;
    justify-content: center;
  }
  
  .season-options {
    grid-template-columns: 1fr;
  }
}
</style>