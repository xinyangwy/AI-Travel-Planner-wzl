<template>
  <div class="destinations-container">
    <div class="page-header">
      <h1 class="page-title">探索目的地</h1>
      <p class="page-description">发现世界各地令人惊叹的旅行胜地</p>
    </div>
    
    <!-- 搜索和筛选区域 -->
    <div class="search-filter-section">
      <div class="search-bar">
        <FormInput 
          v-model="searchQuery"
          :placeholder="'搜索目的地...'"
          class="search-input"
          @keyup.enter="searchDestinations"
        >
          <template #prefix>
            <i class="search-icon"></i>
          </template>
          <template #suffix>
            <Button @click="clearSearch" v-if="searchQuery" class="clear-search-button">
              <i class="clear-icon"></i>
            </Button>
          </template>
        </FormInput>
        <Button @click="searchDestinations" variant="primary" class="search-button">
          搜索
        </Button>
      </div>
      
      <!-- 筛选面板 -->
      <div class="filter-panel">
        <div class="filter-group">
          <label class="filter-label">地区</label>
          <select v-model="filters.region" @change="applyFilters" class="filter-select">
            <option value="">全部地区</option>
            <option value="asia">亚洲</option>
            <option value="europe">欧洲</option>
            <option value="north-america">北美洲</option>
            <option value="south-america">南美洲</option>
            <option value="africa">非洲</option>
            <option value="oceania">大洋洲</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">旅行类型</label>
          <select v-model="filters.travelType" @change="applyFilters" class="filter-select">
            <option value="">全部类型</option>
            <option value="beach">海滩度假</option>
            <option value="city">城市观光</option>
            <option value="mountain">山地探险</option>
            <option value="culture">文化体验</option>
            <option value="adventure">冒险活动</option>
            <option value="relaxation">休闲放松</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">季节</label>
          <select v-model="filters.season" @change="applyFilters" class="filter-select">
            <option value="">全年</option>
            <option value="spring">春季</option>
            <option value="summer">夏季</option>
            <option value="fall">秋季</option>
            <option value="winter">冬季</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">预算</label>
          <select v-model="filters.budget" @change="applyFilters" class="filter-select">
            <option value="">不限</option>
            <option value="budget">经济型</option>
            <option value="mid-range">中档</option>
            <option value="luxury">豪华</option>
          </select>
        </div>
        
        <div class="filter-actions">
          <Button @click="resetFilters" variant="outline" class="reset-button">
            重置
          </Button>
        </div>
      </div>
      
      <!-- 结果统计和排序 -->
      <div class="results-header">
        <div class="results-count">找到 {{ filteredDestinations.length }} 个目的地</div>
        <div class="sort-options">
          <label class="sort-label">排序方式:</label>
          <select v-model="sortBy" @change="sortDestinations" class="sort-select">
            <option value="popularity">热门程度</option>
            <option value="name">名称</option>
            <option value="rating">评分</option>
            <option value="price-asc">价格 (低到高)</option>
            <option value="price-desc">价格 (高到低)</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- 目的地网格 -->
    <div class="destinations-grid">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">正在加载目的地...</p>
      </div>
      
      <div v-else-if="filteredDestinations.length === 0" class="empty-state">
        <div class="empty-icon"></div>
        <h3 class="empty-title">没有找到匹配的目的地</h3>
        <p class="empty-message">请尝试调整搜索条件或筛选选项</p>
        <Button @click="resetAll" variant="primary" class="reset-all-button">
          清除所有筛选
        </Button>
      </div>
      
      <div 
        v-for="destination in paginatedDestinations" 
        :key="destination.id"
        class="destination-card"
        @click="navigateToDestination(destination.id)"
      >
        <!-- 目的地图片 -->
        <div class="destination-image-container">
          <img 
            :src="destination.imageUrl" 
            :alt="destination.name"
            class="destination-image"
          />
          
          <!-- 目的地标签 -->
          <div class="destination-tags">
            <span class="destination-tag">{{ destination.country }}</span>
            <span class="destination-tag">{{ getTravelTypeLabel(destination.travelType) }}</span>
          </div>
          
          <!-- 收藏按钮 -->
          <Button 
            :class="['favorite-button', { 'favorite-active': destination.isFavorite }]"
            @click.stop="toggleFavorite(destination.id)"
            title="收藏/取消收藏"
          >
            <i class="favorite-icon"></i>
          </Button>
        </div>
        
        <!-- 目的地信息 -->
        <div class="destination-info">
          <h3 class="destination-name">{{ destination.name }}</h3>
          
          <!-- 评分和评价数 -->
          <div class="destination-rating">
            <div class="rating-stars">
              <i 
                v-for="star in 5" 
                :key="star"
                :class="['star-icon', { 'star-filled': star <= destination.rating }]"
              ></i>
            </div>
            <span class="rating-number">{{ destination.rating.toFixed(1) }}</span>
            <span class="review-count">({{ destination.reviewCount }}条评价)</span>
          </div>
          
          <!-- 简短描述 -->
          <p class="destination-description">{{ destination.shortDescription }}</p>
          
          <!-- 标签 -->
          <div class="destination-highlights">
            <span 
              v-for="(highlight, index) in destination.highlights.slice(0, 3)" 
              :key="index"
              class="highlight-tag"
            >
              {{ highlight }}
            </span>
          </div>
          
          <!-- 价格和推荐季节 -->
          <div class="destination-footer">
            <div class="destination-price">
              <span class="price-label">人均起价</span>
              <span class="price-value">¥{{ destination.price }}</span>
            </div>
            <div class="destination-seasons">
              <i class="season-icon"></i>
              <span class="season-text">{{ getBestSeasonLabel(destination.bestSeason) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分页控件 -->
    <div class="pagination-container" v-if="filteredDestinations.length > 0">
      <div class="pagination-info">
        显示 {{ currentPage * pageSize + 1 }} - {{ Math.min((currentPage + 1) * pageSize, filteredDestinations.length) }} 共 {{ filteredDestinations.length }} 个结果
      </div>
      <div class="pagination-controls">
        <Button 
          @click="prevPage" 
          :disabled="currentPage === 0"
          class="pagination-button"
        >
          上一页
        </Button>
        <div class="pagination-pages">
          <button 
            v-for="page in totalPages" 
            :key="page"
            @click="goToPage(page - 1)"
            :class="['pagination-page', { 'pagination-page-active': currentPage === page - 1 }]"
          >
            {{ page }}
          </button>
        </div>
        <Button 
          @click="nextPage" 
          :disabled="currentPage === totalPages - 1"
          class="pagination-button"
        >
          下一页
        </Button>
      </div>
    </div>
    
    <!-- 热门目的地部分 -->
    <div class="popular-destinations-section" v-if="popularDestinations.length > 0 && !searchQuery && !hasActiveFilters">
      <div class="section-header">
        <h2 class="section-title">热门目的地推荐</h2>
        <p class="section-subtitle">根据旅行者的喜好精选</p>
      </div>
      
      <div class="popular-destinations-carousel">
        <div 
          v-for="destination in popularDestinations" 
          :key="destination.id"
          class="popular-destination-card"
          @click="navigateToDestination(destination.id)"
        >
          <div class="popular-destination-image-container">
            <img 
              :src="destination.imageUrl" 
              :alt="destination.name"
              class="popular-destination-image"
            />
            <div class="popular-destination-overlay"></div>
            <div class="popular-destination-rank">{{ destination.popularityRank }}</div>
          </div>
          <div class="popular-destination-info">
            <h3 class="popular-destination-name">{{ destination.name }}</h3>
            <p class="popular-destination-country">{{ destination.country }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 旅行灵感部分 -->
    <div class="travel-inspiration-section" v-if="!searchQuery && !hasActiveFilters">
      <div class="section-header">
        <h2 class="section-title">旅行灵感</h2>
        <p class="section-subtitle">探索不同类型的旅行体验</p>
      </div>
      
      <div class="inspiration-categories">
        <div 
          v-for="category in inspirationCategories" 
          :key="category.id"
          class="inspiration-category"
          @click="filterByCategory(category.id)"
        >
          <div class="inspiration-image-container">
            <img 
              :src="category.imageUrl" 
              :alt="category.name"
              class="inspiration-image"
            />
            <div class="inspiration-overlay"></div>
          </div>
          <div class="inspiration-content">
            <h3 class="inspiration-title">{{ category.name }}</h3>
            <p class="inspiration-count">{{ category.destinationCount }} 个目的地</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Card, Button, FormInput } from '../components'

export default {
  name: 'Destinations',
  
  components: {
    Card,
    Button,
    FormInput
  },
  
  data() {
    return {
      // 搜索和筛选状态
      searchQuery: '',
      filters: {
        region: '',
        travelType: '',
        season: '',
        budget: ''
      },
      sortBy: 'popularity',
      loading: false,
      
      // 分页状态
      currentPage: 0,
      pageSize: 9,
      
      // 目的地数据 (模拟数据)
      destinations: [
        {
          id: 1,
          name: '东京',
          country: '日本',
          region: 'asia',
          imageUrl: '/assets/images/destinations/tokyo.jpg',
          rating: 4.8,
          reviewCount: 3245,
          price: 8999,
          shortDescription: '探索这座充满未来感和传统文化交融的大都市，体验独特的日本风情。',
          highlights: ['东京塔', '明治神宫', '浅草寺', '购物天堂', '美食'],
          bestSeason: 'spring,autumn',
          travelType: 'city',
          isFavorite: false,
          popularityRank: 1
        },
        {
          id: 2,
          name: '巴厘岛',
          country: '印度尼西亚',
          region: 'asia',
          imageUrl: '/assets/images/destinations/bali.jpg',
          rating: 4.7,
          reviewCount: 2856,
          price: 5999,
          shortDescription: '热带天堂，拥有壮观的海滩、神秘的寺庙和茂密的丛林。',
          highlights: ['海滩', '冲浪', '瑜伽', '文化体验', '自然景观'],
          bestSeason: 'winter,spring',
          travelType: 'beach',
          isFavorite: false,
          popularityRank: 2
        },
        {
          id: 3,
          name: '巴黎',
          country: '法国',
          region: 'europe',
          imageUrl: '/assets/images/destinations/paris.jpg',
          rating: 4.6,
          reviewCount: 4120,
          price: 9999,
          shortDescription: '浪漫之都，世界艺术与时尚的中心，拥有众多标志性建筑。',
          highlights: ['埃菲尔铁塔', '卢浮宫', '凯旋门', '美食', '购物'],
          bestSeason: 'spring,autumn',
          travelType: 'city',
          isFavorite: true,
          popularityRank: 3
        },
        {
          id: 4,
          name: '京都',
          country: '日本',
          region: 'asia',
          imageUrl: '/assets/images/destinations/kyoto.jpg',
          rating: 4.9,
          reviewCount: 2189,
          price: 7999,
          shortDescription: '千年古都，拥有众多世界文化遗产和传统日本建筑。',
          highlights: ['寺庙', '神社', '和服体验', '樱花', '传统料理'],
          bestSeason: 'spring,autumn',
          travelType: 'culture',
          isFavorite: false,
          popularityRank: 4
        },
        {
          id: 5,
          name: '马尔代夫',
          country: '马尔代夫',
          region: 'asia',
          imageUrl: '/assets/images/destinations/maldives.jpg',
          rating: 4.9,
          reviewCount: 1652,
          price: 15999,
          shortDescription: '奢华海岛度假胜地，水上屋和清澈的海水是其标志。',
          highlights: ['奢华度假村', '潜水', '浮潜', '海滩', 'SPA'],
          bestSeason: 'winter,spring',
          travelType: 'beach',
          isFavorite: false,
          popularityRank: 5
        },
        {
          id: 6,
          name: '巴塞罗那',
          country: '西班牙',
          region: 'europe',
          imageUrl: '/assets/images/destinations/barcelona.jpg',
          rating: 4.5,
          reviewCount: 2876,
          price: 6999,
          shortDescription: '高迪建筑的杰作之城，地中海的阳光和热情的加泰罗尼亚文化。',
          highlights: ['圣家堂', '高迪建筑', '海滩', '美食', '夜生活'],
          bestSeason: 'spring,summer',
          travelType: 'city',
          isFavorite: false,
          popularityRank: 6
        },
        {
          id: 7,
          name: '皇后镇',
          country: '新西兰',
          region: 'oceania',
          imageUrl: '/assets/images/destinations/queenstown.jpg',
          rating: 4.7,
          reviewCount: 1425,
          price: 12999,
          shortDescription: '极限运动和户外探险的天堂，被壮丽的山脉和湖泊环绕。',
          highlights: ['蹦极', '滑雪', '徒步', '湖泊', '风景'],
          bestSeason: 'summer,winter',
          travelType: 'adventure',
          isFavorite: false,
          popularityRank: 7
        },
        {
          id: 8,
          name: '圣托里尼',
          country: '希腊',
          region: 'europe',
          imageUrl: '/assets/images/destinations/santorini.jpg',
          rating: 4.8,
          reviewCount: 2580,
          price: 8999,
          shortDescription: '蓝白相间的爱琴海明珠，以其壮观的日落和悬崖上的白色建筑闻名。',
          highlights: ['日落', '蓝顶教堂', '海滩', '美食', '浪漫'],
          bestSeason: 'spring,summer',
          travelType: 'relaxation',
          isFavorite: false,
          popularityRank: 8
        },
        {
          id: 9,
          name: '张家界',
          country: '中国',
          region: 'asia',
          imageUrl: '/assets/images/destinations/zhangjiajie.jpg',
          rating: 4.7,
          reviewCount: 1986,
          price: 4999,
          shortDescription: '《阿凡达》电影的灵感来源，拥有世界罕见的石英砂岩峰林地貌。',
          highlights: ['天门山', '玻璃桥', '国家森林公园', '徒步', '风景'],
          bestSeason: 'spring,autumn',
          travelType: 'mountain',
          isFavorite: true,
          popularityRank: 9
        },
        {
          id: 10,
          name: '纽约',
          country: '美国',
          region: 'north-america',
          imageUrl: '/assets/images/destinations/newyork.jpg',
          rating: 4.6,
          reviewCount: 5230,
          price: 10999,
          shortDescription: '不夜城，世界金融、文化和艺术的中心，摩天大楼林立。',
          highlights: ['自由女神像', '时代广场', '中央公园', '百老汇', '博物馆'],
          bestSeason: 'spring,autumn',
          travelType: 'city',
          isFavorite: false,
          popularityRank: 10
        },
        {
          id: 11,
          name: '普吉岛',
          country: '泰国',
          region: 'asia',
          imageUrl: '/assets/images/destinations/phuket.jpg',
          rating: 4.5,
          reviewCount: 3678,
          price: 4599,
          shortDescription: '泰国最大的岛屿，以美丽的海滩、丰富的夜生活和美食闻名。',
          highlights: ['海滩', '浮潜', '美食', '夜生活', 'SPA'],
          bestSeason: 'winter,spring',
          travelType: 'beach',
          isFavorite: false,
          popularityRank: 11
        },
        {
          id: 12,
          name: '威尼斯',
          country: '意大利',
          region: 'europe',
          imageUrl: '/assets/images/destinations/venice.jpg',
          rating: 4.6,
          reviewCount: 2987,
          price: 8599,
          shortDescription: '水城，由118个小岛组成，以其独特的运河系统和历史建筑闻名。',
          highlights: ['运河', '贡多拉', '圣马可广场', '艺术', '美食'],
          bestSeason: 'spring,autumn',
          travelType: 'culture',
          isFavorite: false,
          popularityRank: 12
        },
        {
          id: 13,
          name: '长白山',
          country: '中国',
          region: 'asia',
          imageUrl: '/assets/images/destinations/changbaishan.jpg',
          rating: 4.6,
          reviewCount: 1578,
          price: 4299,
          shortDescription: '中朝边境的火山山脉，拥有壮观的天池和丰富的滑雪资源。',
          highlights: ['天池', '滑雪', '温泉', '原始森林', '火山地貌'],
          bestSeason: 'winter,summer',
          travelType: 'mountain',
          isFavorite: false,
          popularityRank: 13
        },
        {
          id: 14,
          name: '罗马',
          country: '意大利',
          region: 'europe',
          imageUrl: '/assets/images/destinations/rome.jpg',
          rating: 4.7,
          reviewCount: 3876,
          price: 7999,
          shortDescription: '永恒之城，拥有丰富的历史遗迹和世界著名的艺术珍品。',
          highlights: ['斗兽场', '罗马广场', '梵蒂冈', '艺术', '美食'],
          bestSeason: 'spring,autumn',
          travelType: 'culture',
          isFavorite: false,
          popularityRank: 14
        },
        {
          id: 15,
          name: '普吉特海湾',
          country: '美国',
          region: 'north-america',
          imageUrl: '/assets/images/destinations/pugetsound.jpg',
          rating: 4.5,
          reviewCount: 1234,
          price: 9299,
          shortDescription: '华盛顿州的美丽海湾，西雅图所在地，被雪山和森林环绕。',
          highlights: ['西雅图', '太空针塔', '国家公园', '海鲜', '咖啡文化'],
          bestSeason: 'summer,autumn',
          travelType: 'relaxation',
          isFavorite: false,
          popularityRank: 15
        },
        {
          id: 16,
          name: '阿尔卑斯山',
          country: '瑞士',
          region: 'europe',
          imageUrl: '/assets/images/destinations/alps.jpg',
          rating: 4.8,
          reviewCount: 1867,
          price: 13599,
          shortDescription: '欧洲最高大的山脉，以其壮丽的雪山、清澈的湖泊和丰富的户外活动著称。',
          highlights: ['滑雪', '徒步', '湖泊', '风景', '温泉'],
          bestSeason: 'winter,summer',
          travelType: 'mountain',
          isFavorite: false,
          popularityRank: 16
        },
        {
          id: 17,
          name: '苏梅岛',
          country: '泰国',
          region: 'asia',
          imageUrl: '/assets/images/destinations/kohsamui.jpg',
          rating: 4.6,
          reviewCount: 1587,
          price: 5299,
          shortDescription: '泰国第三大岛，以其原始海滩、椰子林和豪华度假村闻名。',
          highlights: ['海滩', 'SPA', '美食', '满月派对', '浮潜'],
          bestSeason: 'winter,spring',
          travelType: 'beach',
          isFavorite: false,
          popularityRank: 17
        },
        {
          id: 18,
          name: '冰岛',
          country: '冰岛',
          region: 'europe',
          imageUrl: '/assets/images/destinations/iceland.jpg',
          rating: 4.9,
          reviewCount: 1456,
          price: 14999,
          shortDescription: '冰与火之国，拥有壮观的冰川、火山、温泉和北极光。',
          highlights: ['北极光', '温泉', '冰川', '火山', '黑沙滩'],
          bestSeason: 'winter,autumn',
          travelType: 'adventure',
          isFavorite: false,
          popularityRank: 18
        }
      ],
      
      // 旅行灵感分类
      inspirationCategories: [
        {
          id: 'beach',
          name: '海滩度假',
          imageUrl: '/assets/images/categories/beach.jpg',
          destinationCount: 5
        },
        {
          id: 'mountain',
          name: '山地探险',
          imageUrl: '/assets/images/categories/mountain.jpg',
          destinationCount: 4
        },
        {
          id: 'city',
          name: '城市观光',
          imageUrl: '/assets/images/categories/city.jpg',
          destinationCount: 6
        },
        {
          id: 'culture',
          name: '文化体验',
          imageUrl: '/assets/images/categories/culture.jpg',
          destinationCount: 3
        }
      ]
    }
  },
  
  computed: {
    // 获取热门目的地
    popularDestinations() {
      return [...this.destinations]
        .filter(dest => dest.popularityRank && dest.popularityRank <= 8)
        .sort((a, b) => a.popularityRank - b.popularityRank)
    },
    
    // 过滤后的目的地列表
    filteredDestinations() {
      let result = [...this.destinations]
      
      // 搜索查询过滤
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        result = result.filter(dest => 
          dest.name.toLowerCase().includes(query) ||
          dest.country.toLowerCase().includes(query) ||
          dest.shortDescription.toLowerCase().includes(query) ||
          dest.highlights.some(tag => tag.toLowerCase().includes(query))
        )
      }
      
      // 地区过滤
      if (this.filters.region) {
        result = result.filter(dest => dest.region === this.filters.region)
      }
      
      // 旅行类型过滤
      if (this.filters.travelType) {
        result = result.filter(dest => dest.travelType === this.filters.travelType)
      }
      
      // 季节过滤
      if (this.filters.season) {
        result = result.filter(dest => 
          dest.bestSeason.includes(this.filters.season)
        )
      }
      
      // 预算过滤
      if (this.filters.budget) {
        switch (this.filters.budget) {
          case 'budget':
            result = result.filter(dest => dest.price < 6000)
            break
          case 'mid-range':
            result = result.filter(dest => dest.price >= 6000 && dest.price < 10000)
            break
          case 'luxury':
            result = result.filter(dest => dest.price >= 10000)
            break
        }
      }
      
      // 排序
      result = this.sortDestinationsList(result)
      
      return result
    },
    
    // 分页后的目的地列表
    paginatedDestinations() {
      const start = this.currentPage * this.pageSize
      const end = start + this.pageSize
      return this.filteredDestinations.slice(start, end)
    },
    
    // 总页数
    totalPages() {
      return Math.ceil(this.filteredDestinations.length / this.pageSize)
    },
    
    // 是否有活动的筛选条件
    hasActiveFilters() {
      return Object.values(this.filters).some(value => value !== '')
    }
  },
  
  methods: {
    // 搜索目的地
    searchDestinations() {
      this.currentPage = 0 // 重置到第一页
    },
    
    // 清除搜索
    clearSearch() {
      this.searchQuery = ''
      this.currentPage = 0
    },
    
    // 应用筛选
    applyFilters() {
      this.currentPage = 0 // 重置到第一页
    },
    
    // 重置筛选
    resetFilters() {
      this.filters = {
        region: '',
        travelType: '',
        season: '',
        budget: ''
      }
      this.currentPage = 0
    },
    
    // 重置所有
    resetAll() {
      this.searchQuery = ''
      this.resetFilters()
      this.sortBy = 'popularity'
    },
    
    // 排序目的地列表
    sortDestinationsList(destinations) {
      const sorted = [...destinations]
      
      switch (this.sortBy) {
        case 'name':
          return sorted.sort((a, b) => a.name.localeCompare(b.name))
        case 'rating':
          return sorted.sort((a, b) => b.rating - a.rating)
        case 'price-asc':
          return sorted.sort((a, b) => a.price - b.price)
        case 'price-desc':
          return sorted.sort((a, b) => b.price - a.price)
        case 'popularity':
        default:
          return sorted.sort((a, b) => {
            // 优先按热门排名排序
            if (a.popularityRank && b.popularityRank) {
              return a.popularityRank - b.popularityRank
            }
            // 如果没有热门排名，则按评分排序
            return b.rating - a.rating
          })
      }
    },
    
    // 排序目的地
    sortDestinations() {
      this.currentPage = 0 // 重置到第一页
    },
    
    // 上一页
    prevPage() {
      if (this.currentPage > 0) {
        this.currentPage--
      }
    },
    
    // 下一页
    nextPage() {
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage++
      }
    },
    
    // 跳转到指定页
    goToPage(page) {
      if (page >= 0 && page < this.totalPages) {
        this.currentPage = page
      }
    },
    
    // 切换收藏状态
    toggleFavorite(destinationId) {
      const destination = this.destinations.find(dest => dest.id === destinationId)
      if (destination) {
        destination.isFavorite = !destination.isFavorite
        
        this.$notification.success({
          title: destination.isFavorite ? '添加收藏' : '取消收藏',
          message: `${destination.name} ${destination.isFavorite ? '已添加到收藏' : '已从收藏中移除'}`,
          duration: 2000
        })
      }
    },
    
    // 导航到目的地详情页
    navigateToDestination(destinationId) {
      this.$router.push(`/destination/${destinationId}`)
    },
    
    // 按分类筛选
    filterByCategory(categoryId) {
      this.filters.travelType = categoryId
      this.applyFilters()
    },
    
    // 获取旅行类型标签
    getTravelTypeLabel(type) {
      const labels = {
        'beach': '海滩度假',
        'city': '城市观光',
        'mountain': '山地探险',
        'culture': '文化体验',
        'adventure': '冒险活动',
        'relaxation': '休闲放松'
      }
      return labels[type] || type
    },
    
    // 获取最佳季节标签
    getBestSeasonLabel(seasonStr) {
      if (!seasonStr) return '全年'
      
      const seasons = seasonStr.split(',')
      const labels = {
        'spring': '春季',
        'summer': '夏季',
        'autumn': '秋季',
        'winter': '冬季'
      }
      
      return seasons.map(s => labels[s] || s).join('、')
    }
  },
  
  mounted() {
    // 模拟加载
    this.loading = true
    setTimeout(() => {
      this.loading = false
    }, 800)
  }
}
</script>

<style scoped>
/* 目的地容器 */
.destinations-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
}

.page-description {
  font-size: 16px;
  color: #666;
}

/* 搜索和筛选区域 */
.search-filter-section {
  margin-bottom: 32px;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.search-input {
  flex: 1;
}

.search-icon::before {
  content: '🔍';
}

.clear-icon::before {
  content: '✕';
}

.search-button {
  white-space: nowrap;
}

/* 筛选面板 */
.filter-panel {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 150px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.filter-select:hover {
  border-color: #1890ff;
}

.filter-actions {
  margin-left: auto;
  display: flex;
  align-items: flex-end;
}

/* 结果标题栏 */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

.results-count {
  font-size: 14px;
  color: #666;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-label {
  font-size: 14px;
  color: #666;
}

.sort-select {
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
}

/* 目的地网格 */
.destinations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

/* 加载状态 */
.loading-state,
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text,
.empty-message {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 32px;
}

.empty-icon::before {
  content: '🔍';
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.reset-all-button {
  margin-top: 16px;
}

/* 目的地卡片 */
.destination-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.destination-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

/* 目的地图片 */
.destination-image-container {
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

/* 目的地标签 */
.destination-tags {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 8px;
}

.destination-tag {
  padding: 4px 8px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* 收藏按钮 */
.favorite-button {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d9d9d9;
  transition: all 0.3s;
}

.favorite-button:hover {
  background-color: white;
  color: #ff4d4f;
}

.favorite-active {
  color: #ff4d4f;
}

.favorite-icon::before {
  content: '❤️';
  font-size: 18px;
}

/* 目的地信息 */
.destination-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.destination-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

/* 评分 */
.destination-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star-icon::before {
  content: '☆';
  font-size: 14px;
  color: #d9d9d9;
}

.star-filled::before {
  content: '★';
  color: #faad14;
}

.rating-number {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.review-count {
  font-size: 12px;
  color: #999;
}

/* 简短描述 */
.destination-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 12px;
  flex: 1;
}

/* 亮点标签 */
.destination-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.highlight-tag {
  padding: 2px 8px;
  background-color: #f0f0f0;
  border-radius: 10px;
  font-size: 12px;
  color: #666;
}

/* 页脚 */
.destination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.destination-price {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 12px;
  color: #999;
}

.price-value {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
}

.destination-seasons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.season-icon::before {
  content: '☀️';
  font-size: 16px;
}

.season-text {
  font-size: 12px;
  color: #666;
}

/* 分页控件 */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-pages {
  display: flex;
  gap: 4px;
}

.pagination-page {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d9d9;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-page:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.pagination-page-active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

/* 热门目的地部分 */
.popular-destinations-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
  text-align: center;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.section-subtitle {
  font-size: 16px;
  color: #666;
}

.popular-destinations-carousel {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.popular-destination-card {
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.popular-destination-card:hover {
  transform: translateY(-4px);
}

.popular-destination-image-container {
  position: relative;
  height: 160px;
}

.popular-destination-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.popular-destination-card:hover .popular-destination-image {
  transform: scale(1.05);
}

.popular-destination-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
}

.popular-destination-rank {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.popular-destination-info {
  padding: 12px;
  text-align: center;
}

.popular-destination-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
}

.popular-destination-country {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 旅行灵感部分 */
.travel-inspiration-section {
  margin-bottom: 40px;
}

.inspiration-categories {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.inspiration-category {
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.inspiration-category:hover {
  transform: translateY(-4px);
}

.inspiration-image-container {
  position: relative;
  height: 160px;
}

.inspiration-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.inspiration-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7));
}

.inspiration-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  color: white;
}

.inspiration-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px;
}

.inspiration-count {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .destinations-container {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .search-bar {
    flex-direction: column;
  }
  
  .filter-panel {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
    min-width: auto;
  }
  
  .filter-actions {
    margin-left: 0;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .destinations-grid {
    grid-template-columns: 1fr;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .popular-destinations-carousel,
  .inspiration-categories {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .popular-destinations-carousel,
  .inspiration-categories {
    grid-template-columns: 1fr;
  }
}
</style>