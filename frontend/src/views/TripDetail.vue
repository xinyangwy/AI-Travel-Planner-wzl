<template>
  <div class="trip-detail-container">
    <!-- 顶部横幅 -->
    <div class="trip-hero" v-if="trip">
      <div class="trip-hero-image" :style="{ backgroundImage: `url(${trip.coverImage})` }">
        <div class="trip-hero-overlay"></div>
        <div class="trip-hero-content">
          <!-- 行程标题和状态 -->
          <div class="trip-title-section">
            <h1 class="trip-main-title">{{ trip.title }}</h1>
            <div :class="['trip-status-badge', `status-${trip.status}`]">
              {{ getStatusLabel(trip.status) }}
            </div>
          </div>
          
          <!-- 行程基本信息 -->
          <div class="trip-basic-info">
            <div class="trip-info-item">
              <i class="location-icon"></i>
              <span>{{ trip.destination }}</span>
            </div>
            <div class="trip-info-item">
              <i class="calendar-icon"></i>
              <span>{{ formatDateRange(trip.startDate, trip.endDate) }}</span>
            </div>
            <div class="trip-info-item">
              <i class="clock-icon"></i>
              <span>{{ calculateDuration(trip.startDate, trip.endDate) }}天</span>
            </div>
            <div class="trip-info-item">
              <i class="activity-icon"></i>
              <span>{{ trip.totalActivities }}个活动</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <div class="trip-content">
      <!-- 左侧主内容 -->
      <div class="trip-main">
        <!-- 操作按钮 -->
        <div class="trip-actions" v-if="trip">
          <Button 
            @click="editTrip" 
            variant="primary" 
            class="action-button"
          >
            <i class="edit-icon"></i>
            编辑行程
          </Button>
          <Button 
            @click="shareTrip" 
            variant="outline" 
            class="action-button"
          >
            <i class="share-icon"></i>
            分享
          </Button>
          <Button 
            @click="exportTrip" 
            variant="outline" 
            class="action-button"
          >
            <i class="export-icon"></i>
            导出
          </Button>
          <Button 
            @click="deleteTripConfirm" 
            variant="outline" 
            class="action-button delete-button"
          >
            <i class="delete-icon"></i>
            删除
          </Button>
        </div>
        
        <!-- 行程描述 -->
        <Card v-if="trip && trip.description" class="trip-section">
          <template #header>
            <h2 class="section-title">行程描述</h2>
          </template>
          <div class="trip-description">
            {{ trip.description }}
          </div>
        </Card>
        
        <!-- 行程地图 -->
        <Card v-if="trip && trip.destination" class="trip-section">
          <template #header>
            <h2 class="section-title">旅行地图</h2>
          </template>
          <div class="trip-map-container">
            <div class="map-placeholder" v-if="!showMap">
              <div class="map-icon"></div>
              <p class="map-placeholder-text">地图加载中...</p>
              <Button @click="showMap = true" variant="primary" class="load-map-button">
                加载地图
              </Button>
            </div>
            <div v-else class="map-container">
              <!-- 实际项目中这里应该集成地图组件 -->
              <div class="map-simulation">
                <div class="map-simulation-text">{{ trip.destination }} 地图</div>
                <div class="map-marker"></div>
              </div>
            </div>
          </div>
        </Card>
        
        <!-- 每日计划 -->
        <Card v-if="trip && trip.dayPlans && trip.dayPlans.length > 0" class="trip-section">
          <template #header>
            <div class="section-header">
              <h2 class="section-title">每日计划</h2>
              <Button 
                @click="addDayPlan" 
                variant="outline" 
                size="small"
                class="add-day-button"
              >
                + 添加日程
              </Button>
            </div>
          </template>
          
          <!-- 每日计划切换 -->
          <div class="day-tabs">
            <div 
              v-for="(dayPlan, index) in trip.dayPlans" 
              :key="dayPlan.id"
              @click="activeDay = index"
              :class="['day-tab', { 'active': activeDay === index }]"
            >
              <div class="day-number">第{{ index + 1 }}天</div>
              <div class="day-date">{{ formatDayDate(dayPlan.date) }}</div>
              <div class="day-activity-count">{{ dayPlan.activities }}个活动</div>
            </div>
          </div>
          
          <!-- 当日活动列表 -->
          <div class="day-activities" v-if="activeDayPlan">
            <div 
              v-for="activity in activeDayPlan.activityList" 
              :key="activity.id"
              class="activity-item"
            >
              <!-- 活动时间线 -->
              <div class="activity-timeline">
                <div class="timeline-dot"></div>
                <div class="timeline-line"></div>
              </div>
              
              <!-- 活动内容 -->
              <div class="activity-content">
                <!-- 活动时间和标题 -->
                <div class="activity-header">
                  <div class="activity-time">{{ formatTime(activity.startTime) }}</div>
                  <div class="activity-title">{{ activity.title }}</div>
                  <div :class="['activity-type', `type-${activity.type}`]">
                    {{ getActivityTypeLabel(activity.type) }}
                  </div>
                </div>
                
                <!-- 活动图片 -->
                <div class="activity-images" v-if="activity.images && activity.images.length > 0">
                  <img 
                    v-for="(image, imgIndex) in activity.images" 
                    :key="imgIndex"
                    :src="image.url" 
                    :alt="image.alt"
                    class="activity-image"
                    @click="showImagePreview(image)"
                  />
                </div>
                
                <!-- 活动描述 -->
                <p class="activity-description" v-if="activity.description">
                  {{ activity.description }}
                </p>
                
                <!-- 活动详细信息 -->
                <div class="activity-details">
                  <div class="detail-item" v-if="activity.location">
                    <i class="location-icon"></i>
                    <span>{{ activity.location }}</span>
                    <Button 
                      @click="showActivityLocation(activity)" 
                      variant="text" 
                      size="small"
                      class="map-button"
                    >
                      <i class="view-map-icon"></i>
                    </Button>
                  </div>
                  
                  <div class="detail-item" v-if="activity.price">
                    <i class="price-icon"></i>
                    <span>¥{{ activity.price }}</span>
                  </div>
                  
                  <div class="detail-item" v-if="activity.duration">
                    <i class="duration-icon"></i>
                    <span>{{ activity.duration }}</span>
                  </div>
                </div>
                
                <!-- 活动标签 -->
                <div class="activity-tags" v-if="activity.tags && activity.tags.length > 0">
                  <span 
                    v-for="(tag, tagIndex) in activity.tags" 
                    :key="tagIndex"
                    class="activity-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
                
                <!-- 活动操作按钮 -->
                <div class="activity-actions">
                  <Button 
                    @click="editActivity(activeDay, activity.id)" 
                    variant="text" 
                    size="small"
                  >
                    编辑
                  </Button>
                  <Button 
                    @click="deleteActivity(activeDay, activity.id)" 
                    variant="text" 
                    size="small"
                    class="delete-activity-button"
                  >
                    删除
                  </Button>
                </div>
              </div>
            </div>
            
            <!-- 添加活动按钮 -->
            <div class="add-activity-container">
              <Button 
                @click="addActivity(activeDay)" 
                variant="outline" 
                class="add-activity-button"
              >
                <i class="add-icon"></i>
                添加活动
              </Button>
            </div>
          </div>
        </Card>
        
        <!-- 费用预算 -->
        <Card v-if="trip" class="trip-section">
          <template #header>
            <h2 class="section-title">费用预算</h2>
          </template>
          
          <div class="budget-container">
            <div class="budget-overview">
              <div class="budget-item total">
                <div class="budget-label">总预算</div>
                <div class="budget-amount">¥{{ calculateTotalBudget() }}</div>
              </div>
              <div class="budget-item">
                <div class="budget-label">已分配</div>
                <div class="budget-amount">¥{{ calculateSpentBudget() }}</div>
              </div>
              <div class="budget-item">
                <div class="budget-label">剩余</div>
                <div class="budget-amount">{{ calculateRemainingBudget() }}</div>
              </div>
            </div>
            
            <div class="budget-breakdown">
              <h3 class="budget-breakdown-title">费用明细</h3>
              
              <!-- 费用类别 -->
              <div 
                v-for="category in budgetCategories" 
                :key="category.type"
                class="budget-category"
              >
                <div class="category-header">
                  <div class="category-info">
                    <i :class="category.iconClass"></i>
                    <span class="category-name">{{ category.name }}</span>
                  </div>
                  <div class="category-amount">¥{{ calculateCategoryAmount(category.type) }}</div>
                </div>
                
                <!-- 费用进度条 -->
                <div class="budget-progress">
                  <div 
                    class="budget-progress-bar"
                    :style="{ width: calculateCategoryPercentage(category.type) + '%' }"
                    :class="getBudgetStatusClass(category.type)"
                  ></div>
                </div>
                
                <!-- 预算使用比例 -->
                <div class="budget-percentage">
                  {{ calculateCategoryPercentage(category.type) }}% (¥{{ calculateCategoryAmount(category.type) }}/{{ category.budget }})
                </div>
                
                <!-- 具体费用项 -->
                <div class="budget-items">
                  <div 
                    v-for="item in getCategoryItems(category.type)" 
                    :key="item.id"
                    class="budget-item-detail"
                  >
                    <div class="budget-item-name">{{ item.name }}</div>
                    <div class="budget-item-amount">¥{{ item.amount }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <!-- 旅行装备 -->
        <Card v-if="trip && trip.packItems && trip.packItems.length > 0" class="trip-section">
          <template #header>
            <div class="section-header">
              <h2 class="section-title">旅行装备</h2>
              <Button 
                @click="managePackingList" 
                variant="outline" 
                size="small"
              >
                管理装备清单
              </Button>
            </div>
          </template>
          
          <div class="packing-list">
            <div 
              v-for="(item, index) in trip.packItems" 
              :key="index"
              class="pack-item"
            >
              <div class="pack-item-checkbox">
                <input 
                  type="checkbox" 
                  :id="`pack-item-${index}`" 
                  v-model="item.packed"
                  @change="updatePackStatus(index)"
                >
                <label :for="`pack-item-${index}`" class="pack-item-label"></label>
              </div>
              <div class="pack-item-name">{{ item.name }}</div>
              <div class="pack-item-amount" v-if="item.amount">x{{ item.amount }}</div>
              <div class="pack-item-note" v-if="item.note">{{ item.note }}</div>
            </div>
          </div>
        </Card>
        
        <!-- 旅行笔记 -->
        <Card v-if="trip" class="trip-section">
          <template #header>
            <div class="section-header">
              <h2 class="section-title">旅行笔记</h2>
              <Button 
                @click="addNote" 
                variant="outline" 
                size="small"
              >
                + 添加笔记
              </Button>
            </div>
          </template>
          
          <div class="notes-list" v-if="trip.notes && trip.notes.length > 0">
            <div 
              v-for="note in trip.notes" 
              :key="note.id"
              class="note-item"
            >
              <div class="note-header">
                <div class="note-title">{{ note.title || '未命名笔记' }}</div>
                <div class="note-date">{{ formatDateTime(note.createdAt) }}</div>
              </div>
              <div class="note-content">{{ note.content }}</div>
              <div class="note-actions">
                <Button 
                  @click="editNote(note.id)" 
                  variant="text" 
                  size="small"
                >
                  编辑
                </Button>
                <Button 
                  @click="deleteNote(note.id)" 
                  variant="text" 
                  size="small"
                  class="delete-note-button"
                >
                  删除
                </Button>
              </div>
            </div>
          </div>
          
          <div class="empty-notes" v-else>
            <div class="empty-icon"></div>
            <p class="empty-text">暂无旅行笔记</p>
            <p class="empty-description">记录旅途中的美好回忆和重要信息</p>
          </div>
        </Card>
      </div>
      
      <!-- 右侧边栏 -->
      <div class="trip-sidebar">
        <!-- 行程概览 -->
        <Card class="sidebar-card">
          <template #header>
            <h3 class="sidebar-title">行程概览</h3>
          </template>
          
          <div class="trip-summary">
            <div class="summary-item">
              <div class="summary-label">状态</div>
              <div :class="['summary-value status-badge', `status-${trip.status}`]">
                {{ getStatusLabel(trip.status) }}
              </div>
            </div>
            
            <div class="summary-item">
              <div class="summary-label">日期</div>
              <div class="summary-value">
                {{ formatDateRange(trip.startDate, trip.endDate) }}
              </div>
            </div>
            
            <div class="summary-item">
              <div class="summary-label">天数</div>
              <div class="summary-value">
                {{ calculateDuration(trip.startDate, trip.endDate) }}天
              </div>
            </div>
            
            <div class="summary-item">
              <div class="summary-label">目的地</div>
              <div class="summary-value">
                {{ trip.destination }}
              </div>
            </div>
            
            <div class="summary-item">
              <div class="summary-label">总活动数</div>
              <div class="summary-value">
                {{ trip.totalActivities }}
              </div>
            </div>
            
            <div class="summary-item">
              <div class="summary-label">创建时间</div>
              <div class="summary-value">
                {{ formatDateTime(trip.createdAt) }}
              </div>
            </div>
          </div>
        </Card>
        
        <!-- 紧急联系人和重要信息 -->
        <Card class="sidebar-card">
          <template #header>
            <h3 class="sidebar-title">重要信息</h3>
          </template>
          
          <div class="important-info">
            <div class="info-section">
              <h4 class="info-section-title">紧急联系人</h4>
              <div class="contact-item" v-if="trip.emergencyContact">
                <div class="contact-name">{{ trip.emergencyContact.name }}</div>
                <div class="contact-phone">{{ trip.emergencyContact.phone }}</div>
              </div>
              <div class="empty-info" v-else>
                未设置紧急联系人
              </div>
            </div>
            
            <div class="info-section">
              <h4 class="info-section-title">旅行保险</h4>
              <div class="insurance-item" v-if="trip.insurance">
                <div class="insurance-name">{{ trip.insurance.company }}</div>
                <div class="insurance-policy">保单号: {{ trip.insurance.policyNumber }}</div>
              </div>
              <div class="empty-info" v-else>
                未设置保险信息
              </div>
            </div>
            
            <Button @click="editImportantInfo" variant="outline" size="small" class="edit-info-button">
              编辑信息
            </Button>
          </div>
        </Card>
        
        <!-- 分享链接 -->
        <Card class="sidebar-card">
          <template #header>
            <h3 class="sidebar-title">分享行程</h3>
          </template>
          
          <div class="share-section">
            <div class="share-link-container">
              <input 
                type="text" 
                class="share-link-input"
                :value="shareLink" 
                readonly
              >
              <Button @click="copyShareLink" variant="primary" size="small">
                复制
              </Button>
            </div>
            
            <div class="share-platforms">
              <Button @click="shareToWeChat" variant="outline" size="small" class="share-platform-button">
                <i class="wechat-icon"></i>
                微信
              </Button>
              <Button @click="shareToWeibo" variant="outline" size="small" class="share-platform-button">
                <i class="weibo-icon"></i>
                微博
              </Button>
              <Button @click="shareToQQ" variant="outline" size="small" class="share-platform-button">
                <i class="qq-icon"></i>
                QQ
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
    
    <!-- 加载中状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">正在加载行程详情...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-if="error" class="error-container">
      <div class="error-icon"></div>
      <h3 class="error-title">加载失败</h3>
      <p class="error-message">{{ error }}</p>
      <Button @click="fetchTripDetail" variant="primary" class="retry-button">
        重试
      </Button>
    </div>
    
    <!-- 空状态 -->
    <div v-if="!loading && !error && !trip" class="empty-container">
      <div class="empty-icon"></div>
      <h3 class="empty-title">行程不存在</h3>
      <p class="empty-message">找不到该行程，可能已被删除或链接无效</p>
      <Button @click="goBack" variant="primary" class="back-button">
        返回行程列表
      </Button>
    </div>
  </div>
</template>

<script>
import { Card, Button } from '../components'
import dayjs from 'dayjs'

export default {
  name: 'TripDetail',
  
  components: {
    Card,
    Button
  },
  
  data() {
    return {
      // 页面状态
      loading: false,
      error: null,
      trip: null,
      showMap: false,
      activeDay: 0,
      
      // 预算类别
      budgetCategories: [
        { type: 'accommodation', name: '住宿', budget: 3000, iconClass: 'hotel-icon' },
        { type: 'transportation', name: '交通', budget: 2000, iconClass: 'transport-icon' },
        { type: 'food', name: '餐饮', budget: 1500, iconClass: 'food-icon' },
        { type: 'activities', name: '活动', budget: 1000, iconClass: 'activities-icon' },
        { type: 'shopping', name: '购物', budget: 2000, iconClass: 'shopping-icon' },
        { type: 'other', name: '其他', budget: 500, iconClass: 'other-icon' }
      ]
    }
  },
  
  computed: {
    // 当前选中的每日计划
    activeDayPlan() {
      if (!this.trip || !this.trip.dayPlans || this.trip.dayPlans.length === 0) {
        return null
      }
      return this.trip.dayPlans[this.activeDay]
    },
    
    // 分享链接
    shareLink() {
      return `${window.location.origin}/trip/${this.$route.params.id}`
    }
  },
  
  methods: {
    // 获取行程详情
    fetchTripDetail() {
      this.loading = true
      this.error = null
      
      // 模拟API请求
      setTimeout(() => {
        // 模拟数据 - 在实际项目中应从API获取
        this.trip = {
          id: parseInt(this.$route.params.id),
          title: '东京樱花之旅',
          destination: '日本东京',
          coverImage: '/assets/images/trips/tokyo-cherry.jpg',
          startDate: '2023-03-25',
          endDate: '2023-03-30',
          status: 'completed',
          description: '这是一次充满樱花和美食的东京之旅，我们将游览浅草寺、明治神宫、涩谷十字路口等著名景点，品尝正宗的日本料理，感受东京的独特魅力。',
          createdAt: '2023-02-15T10:30:00Z',
          
          // 每日计划
          dayPlans: [
            {
              id: 101,
              date: '2023-03-25',
              activities: 3,
              activityList: [
                {
                  id: 1001,
                  title: '抵达东京成田机场',
                  startTime: '10:00',
                  endTime: '12:00',
                  type: 'transport',
                  description: '搭乘CA927航班抵达东京成田国际机场，办理入境手续',
                  location: '成田国际机场',
                  duration: '约2小时'
                },
                {
                  id: 1002,
                  title: '前往酒店办理入住',
                  startTime: '12:30',
                  endTime: '14:00',
                  type: 'transport',
                  description: '乘坐机场巴士前往市区酒店，办理入住手续',
                  location: '东京都内酒店',
                  duration: '约1.5小时',
                  price: 1500
                },
                {
                  id: 1003,
                  title: '浅草寺参观',
                  startTime: '15:00',
                  endTime: '17:30',
                  type: 'sightseeing',
                  description: '游览东京最古老的寺庙，体验传统文化，品尝周边小吃',
                  location: '浅草寺，东京都台东区',
                  duration: '约2.5小时',
                  images: [
                    { url: '/assets/images/activities/asakusa1.jpg', alt: '浅草寺全景' },
                    { url: '/assets/images/activities/asakusa2.jpg', alt: '雷门' }
                  ],
                  tags: ['文化', '历史', '寺庙'],
                  price: 0
                }
              ]
            },
            {
              id: 102,
              date: '2023-03-26',
              activities: 4,
              activityList: [
                {
                  id: 2001,
                  title: '明治神宫参拜',
                  startTime: '09:00',
                  endTime: '11:00',
                  type: 'sightseeing',
                  description: '参观位于繁华涩谷区的城市绿洲，体验日本神道教文化',
                  location: '明治神宫，东京都涩谷区',
                  duration: '约2小时',
                  images: [
                    { url: '/assets/images/activities/meiji1.jpg', alt: '明治神宫入口' },
                    { url: '/assets/images/activities/meiji2.jpg', alt: '神宫森林' }
                  ],
                  tags: ['文化', '历史', '自然'],
                  price: 0
                },
                {
                  id: 2002,
                  title: '涩谷十字路口',
                  startTime: '11:30',
                  endTime: '13:00',
                  type: 'sightseeing',
                  description: '体验世界最繁忙的十字路口，感受东京的快节奏',
                  location: '涩谷十字路口，东京都涩谷区',
                  duration: '约1.5小时',
                  images: [
                    { url: '/assets/images/activities/shibuya1.jpg', alt: '涩谷十字路口' }
                  ],
                  tags: ['都市', '地标'],
                  price: 0
                },
                {
                  id: 2003,
                  title: '午餐 - 一兰拉面',
                  startTime: '13:30',
                  endTime: '14:30',
                  type: 'food',
                  description: '品尝正宗的一兰拉面，体验日本特色拉面文化',
                  location: '一兰拉面涩谷店',
                  duration: '约1小时',
                  tags: ['美食', '拉面'],
                  price: 1200
                },
                {
                  id: 2004,
                  title: '新宿御苑赏樱',
                  startTime: '15:30',
                  endTime: '17:30',
                  type: 'sightseeing',
                  description: '在新宿御苑欣赏美丽的樱花，拍照留念',
                  location: '新宿御苑，东京都新宿区',
                  duration: '约2小时',
                  images: [
                    { url: '/assets/images/activities/shinjuku1.jpg', alt: '新宿御苑樱花' },
                    { url: '/assets/images/activities/shinjuku2.jpg', alt: '樱花大道' }
                  ],
                  tags: ['赏樱', '公园', '自然'],
                  price: 500
                }
              ]
            },
            {
              id: 103,
              date: '2023-03-27',
              activities: 5,
              activityList: [
                {
                  id: 3001,
                  title: '东京塔',
                  startTime: '10:00',
                  endTime: '12:00',
                  type: 'sightseeing',
                  description: '登上东京塔，俯瞰东京全景',
                  location: '东京塔，东京都港区',
                  duration: '约2小时',
                  images: [
                    { url: '/assets/images/activities/tokyo-tower1.jpg', alt: '东京塔外观' },
                    { url: '/assets/images/activities/tokyo-tower2.jpg', alt: '东京全景' }
                  ],
                  tags: ['地标', '观景台'],
                  price: 1200
                },
                {
                  id: 3002,
                  title: '六本木Hills午餐',
                  startTime: '12:30',
                  endTime: '14:00',
                  type: 'food',
                  description: '在六本木Hills购物中心享用午餐，顺便购物',
                  location: '六本木Hills，东京都港区',
                  duration: '约1.5小时',
                  tags: ['美食', '购物'],
                  price: 2000
                },
                {
                  id: 3003,
                  title: '东京迪士尼乐园',
                  startTime: '15:00',
                  endTime: '21:00',
                  type: 'entertainment',
                  description: '在东京迪士尼乐园度过欢乐时光',
                  location: '东京迪士尼乐园，千叶县浦安市',
                  duration: '约6小时',
                  images: [
                    { url: '/assets/images/activities/disney1.jpg', alt: '迪士尼城堡' }
                  ],
                  tags: ['主题公园', '娱乐'],
                  price: 7900
                }
              ]
            }
          ],
          
          // 总活动数
          totalActivities: 10,
          
          // 预算项目
          budgetItems: [
            { id: 1, type: 'accommodation', name: '东京酒店5晚', amount: 15000 },
            { id: 2, type: 'transportation', name: '机场巴士', amount: 1500 },
            { id: 3, type: 'transportation', name: '地铁通票', amount: 1200 },
            { id: 4, type: 'food', name: '一兰拉面', amount: 1200 },
            { id: 5, type: 'food', name: '六本木午餐', amount: 2000 },
            { id: 6, type: 'activities', name: '东京塔门票', amount: 1200 },
            { id: 7, type: 'activities', name: '新宿御苑门票', amount: 500 },
            { id: 8, type: 'activities', name: '迪士尼门票', amount: 7900 },
            { id: 9, type: 'shopping', name: '伴手礼', amount: 5000 },
            { id: 10, type: 'other', name: '杂费', amount: 1000 }
          ],
          
          // 装备清单
          packItems: [
            { name: '护照', packed: true },
            { name: '签证', packed: true },
            { name: '日元现金', packed: true },
            { name: '信用卡', packed: true },
            { name: '手机及充电器', packed: true },
            { name: '相机', packed: true },
            { name: '转换插头', packed: true },
            { name: '舒适衣物', amount: 5, packed: true },
            { name: '舒适鞋子', amount: 2, packed: true },
            { name: '雨伞', note: '樱花季可能下雨', packed: false }
          ],
          
          // 旅行笔记
          notes: [
            {
              id: 1,
              title: '行程规划注意事项',
              content: '1. 东京地铁很发达，但需要注意末班车时间\n2. 樱花季游客较多，热门景点建议提前到达\n3. 餐厅通常需要提前预约',
              createdAt: '2023-02-15T11:30:00Z'
            },
            {
              id: 2,
              title: '日本美食推荐',
              content: '1. 寿司 - 筑地市场附近\n2. 拉面 - 一兰拉面、竹末拉面\n3. 烧肉 - 叙々苑\n4. 居酒屋 - 六本木或新宿',
              createdAt: '2023-02-16T10:15:00Z'
            }
          ],
          
          // 重要信息
          emergencyContact: {
            name: '李明',
            phone: '+81-90-1234-5678',
            relation: '朋友'
          },
          
          insurance: {
            company: '平安保险',
            policyNumber: 'PA20230325001',
            coverage: '旅行综合保险',
            contactNumber: '95511'
          }
        }
        
        this.loading = false
      }, 1000)
    },
    
    // 获取状态标签
    getStatusLabel(status) {
      const labels = {
        'upcoming': '即将到来',
        'ongoing': '进行中',
        'completed': '已完成',
        'draft': '草稿'
      }
      return labels[status] || status
    },
    
    // 格式化日期范围
    formatDateRange(startDate, endDate) {
      if (!startDate || !endDate) return '未设置'
      
      const start = dayjs(startDate)
      const end = dayjs(endDate)
      
      return `${start.format('YYYY年MM月DD日')} - ${end.format('YYYY年MM月DD日')}`
    },
    
    // 格式化单天日期
    formatDayDate(date) {
      if (!date) return '未设置'
      return dayjs(date).format('MM月DD日 dddd')
    },
    
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '未设置'
      return dayjs(dateTime).format('YYYY年MM月DD日 HH:mm')
    },
    
    // 格式化时间
    formatTime(time) {
      if (!time) return ''
      return time
    },
    
    // 计算行程天数
    calculateDuration(startDate, endDate) {
      if (!startDate || !endDate) return 0
      
      const start = dayjs(startDate)
      const end = dayjs(endDate)
      
      // 计算包含起始日期在内的天数
      return end.diff(start, 'day') + 1
    },
    
    // 获取活动类型标签
    getActivityTypeLabel(type) {
      const labels = {
        'sightseeing': '观光',
        'food': '美食',
        'transport': '交通',
        'entertainment': '娱乐',
        'shopping': '购物',
        'accommodation': '住宿'
      }
      return labels[type] || type
    },
    
    // 计算总预算
    calculateTotalBudget() {
      let total = 0
      if (this.budgetCategories) {
        this.budgetCategories.forEach(category => {
          total += category.budget
        })
      }
      return total
    },
    
    // 计算已分配预算
    calculateSpentBudget() {
      let total = 0
      if (this.trip && this.trip.budgetItems) {
        this.trip.budgetItems.forEach(item => {
          total += item.amount
        })
      }
      return total
    },
    
    // 计算剩余预算
    calculateRemainingBudget() {
      const remaining = this.calculateTotalBudget() - this.calculateSpentBudget()
      return remaining >= 0 ? `¥${remaining}` : `超支¥${Math.abs(remaining)}`
    },
    
    // 计算类别金额
    calculateCategoryAmount(type) {
      let total = 0
      if (this.trip && this.trip.budgetItems) {
        const items = this.trip.budgetItems.filter(item => item.type === type)
        items.forEach(item => {
          total += item.amount
        })
      }
      return total
    },
    
    // 获取类别项目
    getCategoryItems(type) {
      if (!this.trip || !this.trip.budgetItems) return []
      return this.trip.budgetItems.filter(item => item.type === type)
    },
    
    // 计算类别预算百分比
    calculateCategoryPercentage(type) {
      const category = this.budgetCategories.find(c => c.type === type)
      if (!category) return 0
      
      const amount = this.calculateCategoryAmount(type)
      const percentage = (amount / category.budget) * 100
      return Math.min(Math.round(percentage), 100)
    },
    
    // 获取预算状态样式类
    getBudgetStatusClass(type) {
      const percentage = this.calculateCategoryPercentage(type)
      if (percentage >= 90) return 'status-warning'
      if (percentage >= 100) return 'status-danger'
      return 'status-normal'
    },
    
    // 编辑行程
    editTrip() {
      this.$router.push(`/trip-planner/${this.trip.id}`)
    },
    
    // 分享行程
    shareTrip() {
      this.$notification.success({
        title: '分享行程',
        message: '分享链接已复制到剪贴板',
        duration: 2000
      })
    },
    
    // 导出行程
    exportTrip() {
      this.$notification.info({
        title: '导出行程',
        message: '行程导出功能开发中',
        duration: 2000
      })
    },
    
    // 删除行程确认
    deleteTripConfirm() {
      this.$confirm({
        title: '确认删除',
        message: `确定要删除行程"${this.trip.title}"吗？此操作不可恢复。`,
        type: 'warning',
        onOk: () => {
          this.deleteTrip()
        }
      })
    },
    
    // 删除行程
    deleteTrip() {
      this.$notification.success({
        title: '删除成功',
        message: '行程已成功删除',
        duration: 2000
      })
      
      // 2秒后返回行程列表
      setTimeout(() => {
        this.$router.push('/trips')
      }, 2000)
    },
    
    // 显示图片预览
    showImagePreview(image) {
      // 实际项目中应该打开图片预览弹窗
      console.log('Show image preview:', image)
    },
    
    // 显示活动位置
    showActivityLocation(activity) {
      // 实际项目中应该在地图上显示活动位置
      console.log('Show activity location:', activity)
    },
    
    // 添加日程
    addDayPlan() {
      // 实际项目中应该打开添加日程弹窗
      this.$notification.info({
        title: '添加日程',
        message: '添加日程功能开发中',
        duration: 2000
      })
    },
    
    // 添加活动
    addActivity(dayIndex) {
      // 实际项目中应该打开添加活动弹窗
      this.$notification.info({
        title: '添加活动',
        message: `为第${dayIndex + 1}天添加活动功能开发中`,
        duration: 2000
      })
    },
    
    // 编辑活动
    editActivity(dayIndex, activityId) {
      // 实际项目中应该打开编辑活动弹窗
      this.$notification.info({
        title: '编辑活动',
        message: '编辑活动功能开发中',
        duration: 2000
      })
    },
    
    // 删除活动
    deleteActivity(dayIndex, activityId) {
      // 实际项目中应该打开确认删除弹窗
      this.$notification.success({
        title: '删除成功',
        message: '活动已成功删除',
        duration: 2000
      })
    },
    
    // 更新装备打包状态
    updatePackStatus(index) {
      // 实际项目中应该保存到后端
      console.log('Update pack status:', index, this.trip.packItems[index].packed)
    },
    
    // 管理装备清单
    managePackingList() {
      // 实际项目中应该打开装备清单管理弹窗
      this.$notification.info({
        title: '管理装备清单',
        message: '管理装备清单功能开发中',
        duration: 2000
      })
    },
    
    // 添加笔记
    addNote() {
      // 实际项目中应该打开添加笔记弹窗
      this.$notification.info({
        title: '添加笔记',
        message: '添加笔记功能开发中',
        duration: 2000
      })
    },
    
    // 编辑笔记
    editNote(noteId) {
      // 实际项目中应该打开编辑笔记弹窗
      this.$notification.info({
        title: '编辑笔记',
        message: '编辑笔记功能开发中',
        duration: 2000
      })
    },
    
    // 删除笔记
    deleteNote(noteId) {
      // 实际项目中应该打开确认删除弹窗
      this.$notification.success({
        title: '删除成功',
        message: '笔记已成功删除',
        duration: 2000
      })
    },
    
    // 编辑重要信息
    editImportantInfo() {
      // 实际项目中应该打开重要信息编辑弹窗
      this.$notification.info({
        title: '编辑重要信息',
        message: '编辑重要信息功能开发中',
        duration: 2000
      })
    },
    
    // 复制分享链接
    copyShareLink() {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(this.shareLink)
        .then(() => {
          this.$notification.success({
            title: '复制成功',
            message: '分享链接已复制到剪贴板',
            duration: 2000
          })
        })
        .catch(err => {
          this.$notification.error({
            title: '复制失败',
            message: '请手动复制链接',
            duration: 2000
          })
        })
    },
    
    // 分享到微信
    shareToWeChat() {
      this.$notification.info({
        title: '分享到微信',
        message: '请使用微信扫描二维码分享',
        duration: 2000
      })
    },
    
    // 分享到微博
    shareToWeibo() {
      const shareUrl = encodeURIComponent(this.shareLink)
      const title = encodeURIComponent(`我在AI旅行规划师创建了${this.trip.title}行程，快来看看吧！`)
      window.open(`http://service.weibo.com/share/share.php?url=${shareUrl}&title=${title}`, '_blank')
    },
    
    // 分享到QQ
    shareToQQ() {
      const shareUrl = encodeURIComponent(this.shareLink)
      const title = encodeURIComponent(`${this.trip.title}`)
      window.open(`https://connect.qq.com/widget/shareqq/index.html?url=${shareUrl}&title=${title}`, '_blank')
    },
    
    // 返回上一页
    goBack() {
      this.$router.push('/trips')
    }
  },
  
  mounted() {
    this.fetchTripDetail()
  }
}
</script>

<style scoped>
/* 行程详情容器 */
.trip-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 顶部横幅 */
.trip-hero {
  height: 400px;
  position: relative;
}

.trip-hero-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.trip-hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.trip-hero-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px;
  color: white;
}

.trip-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.trip-main-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0;
  flex: 1;
}

.trip-status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-upcoming {
  background-color: #1890ff;
}

.status-ongoing {
  background-color: #52c41a;
}

.status-completed {
  background-color: #8c8c8c;
}

.status-draft {
  background-color: #faad14;
}

.trip-basic-info {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.trip-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.location-icon::before { content: '📍'; }
.calendar-icon::before { content: '📅'; }
.clock-icon::before { content: '⏰'; }
.activity-icon::before { content: '🎯'; }

/* 主内容区域 */
.trip-content {
  display: flex;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.trip-main {
  flex: 1;
}

.trip-sidebar {
  width: 300px;
  flex-shrink: 0;
}

/* 行程操作按钮 */
.trip-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.edit-icon::before { content: '✏️'; }
.share-icon::before { content: '📤'; }
.export-icon::before { content: '📥'; }
.delete-icon::before { content: '🗑️'; }

.delete-button:hover {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

/* 行程区块 */
.trip-section {
  margin-bottom: 24px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 行程描述 */
.trip-description {
  line-height: 1.6;
  color: #333;
  white-space: pre-line;
}

/* 行程地图 */
.trip-map-container {
  height: 300px;
  border-radius: 4px;
  overflow: hidden;
}

.map-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #666;
}

.map-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.map-icon::before {
  content: '🗺️';
}

.map-placeholder-text {
  margin-bottom: 16px;
}

.map-container {
  height: 100%;
}

.map-simulation {
  height: 100%;
  background-color: #e6f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: #666;
}

.map-marker {
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: #ff4d4f;
  border-radius: 50%;
  top: 40%;
  left: 55%;
}

.map-marker::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 12px solid #ff4d4f;
  bottom: -12px;
  left: 4px;
}

/* 每日计划 */
.day-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.day-tab {
  padding: 12px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;
}

.day-tab:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.day-tab.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.day-number {
  font-weight: 600;
  margin-bottom: 4px;
}

.day-date {
  font-size: 12px;
  margin-bottom: 4px;
}

.day-activity-count {
  font-size: 12px;
  opacity: 0.8;
}

/* 活动列表 */
.day-activities {
  margin-top: 16px;
}

.activity-item {
  display: flex;
  margin-bottom: 24px;
  position: relative;
}

.activity-timeline {
  width: 24px;
  flex-shrink: 0;
  position: relative;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #1890ff;
  margin-left: 6px;
  margin-top: 4px;
}

.timeline-line {
  position: absolute;
  top: 16px;
  bottom: -24px;
  left: 11px;
  width: 2px;
  background-color: #e8e8e8;
}

.activity-item:last-child .timeline-line {
  display: none;
}

.activity-content {
  flex: 1;
  padding-left: 16px;
  background-color: #fafafa;
  border-radius: 4px;
  padding: 16px;
  margin-left: 16px;
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.activity-time {
  font-weight: 600;
  color: #1890ff;
  min-width: 60px;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.activity-type {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  white-space: nowrap;
}

.type-sightseeing {
  background-color: #1890ff;
}

.type-food {
  background-color: #52c41a;
}

.type-transport {
  background-color: #faad14;
}

.type-entertainment {
  background-color: #eb2f96;
}

.type-shopping {
  background-color: #722ed1;
}

.type-accommodation {
  background-color: #fa8c16;
}

/* 活动图片 */
.activity-images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.activity-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s;
}

.activity-image:hover {
  transform: scale(1.05);
}

/* 活动描述 */
.activity-description {
  margin-bottom: 12px;
  line-height: 1.6;
  color: #333;
}

/* 活动详情 */
.activity-details {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
}

.price-icon::before { content: '💰'; }
.duration-icon::before { content: '⏱️'; }
.view-map-icon::before { content: '📍'; }

/* 活动标签 */
.activity-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.activity-tag {
  padding: 2px 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

/* 活动操作按钮 */
.activity-actions {
  display: flex;
  gap: 8px;
}

.delete-activity-button:hover {
  color: #ff4d4f;
}

/* 添加活动按钮 */
.add-activity-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.add-activity-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.add-icon::before { content: '+'; }

/* 预算相关 */
.budget-container {
  margin-top: 16px;
}

.budget-overview {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.budget-item {
  flex: 1;
  min-width: 150px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 4px;
  text-align: center;
}

.budget-item.total {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
}

.budget-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.budget-amount {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.budget-breakdown-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.budget-category {
  margin-bottom: 24px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hotel-icon::before { content: '🏨'; }
.transport-icon::before { content: '🚗'; }
.food-icon::before { content: '🍽️'; }
.activities-icon::before { content: '🎯'; }
.shopping-icon::before { content: '🛍️'; }
.other-icon::before { content: '📋'; }

.category-name {
  font-weight: 500;
  color: #333;
}

.category-amount {
  font-weight: 600;
  color: #333;
}

.budget-progress {
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.budget-progress-bar {
  height: 100%;
  background-color: #1890ff;
  transition: width 0.3s;
}

.status-warning {
  background-color: #faad14;
}

.status-danger {
  background-color: #ff4d4f;
}

.budget-percentage {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.budget-items {
  background-color: #fafafa;
  border-radius: 4px;
  padding: 8px;
}

.budget-item-detail {
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  font-size: 14px;
}

.budget-item-name {
  color: #666;
}

.budget-item-amount {
  color: #333;
  font-weight: 500;
}

/* 装备清单 */
.packing-list {
  margin-top: 16px;
}

.pack-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.pack-item-checkbox {
  position: relative;
}

.pack-item-checkbox input[type="checkbox"] {
  opacity: 0;
  position: absolute;
}

.pack-item-label {
  display: block;
  width: 20px;
  height: 20px;
  border: 2px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
}

.pack-item-checkbox input[type="checkbox"]:checked + .pack-item-label {
  background-color: #1890ff;
  border-color: #1890ff;
}

.pack-item-checkbox input[type="checkbox"]:checked + .pack-item-label::after {
  content: '✓';
  position: absolute;
  top: 0;
  left: 4px;
  color: white;
  font-size: 14px;
}

.pack-item-name {
  flex: 1;
  color: #333;
}

.pack-item-amount {
  font-size: 14px;
  color: #666;
}

.pack-item-note {
  font-size: 12px;
  color: #999;
}

/* 旅行笔记 */
.notes-list {
  margin-top: 16px;
}

.note-item {
  padding: 16px;
  background-color: #fafafa;
  border-radius: 4px;
  margin-bottom: 16px;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.note-title {
  font-weight: 600;
  color: #333;
}

.note-date {
  font-size: 12px;
  color: #999;
}

.note-content {
  line-height: 1.6;
  color: #333;
  white-space: pre-line;
  margin-bottom: 12px;
}

.note-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.delete-note-button:hover {
  color: #ff4d4f;
}

.empty-notes {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-icon::before {
  content: '📝';
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #666;
}

.empty-description {
  font-size: 14px;
  color: #999;
}

/* 侧边栏 */
.sidebar-card {
  margin-bottom: 24px;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 行程概览 */
.trip-summary {
  margin-top: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-label {
  color: #666;
  font-size: 14px;
}

.summary-value {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

/* 重要信息 */
.important-info {
  margin-top: 16px;
}

.info-section {
  margin-bottom: 16px;
}

.info-section-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px 0;
}

.contact-item,
.insurance-item {
  background-color: #fafafa;
  border-radius: 4px;
  padding: 8px;
}

.contact-name,
.insurance-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.contact-phone,
.insurance-policy {
  font-size: 14px;
  color: #666;
}

.empty-info {
  color: #999;
  font-size: 14px;
  font-style: italic;
}

.edit-info-button {
  width: 100%;
}

/* 分享链接 */
.share-section {
  margin-top: 16px;
}

.share-link-container {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.share-link-input {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  background-color: #fafafa;
}

.share-platforms {
  display: flex;
  gap: 8px;
}

.share-platform-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.wechat-icon::before { content: '💬'; }
.weibo-icon::before { content: '🔖'; }
.qq-icon::before { content: '🐧'; }

/* 加载状态 */
.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
  background-color: white;
  margin: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
.error-message,
.empty-message {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
  text-align: center;
}

.error-icon,
.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 32px;
}

.error-icon {
  background-color: #fff2f0;
}

.error-icon::before {
  content: '⚠️';
}

.empty-icon {
  background-color: #f6ffed;
}

.empty-icon::before {
  content: '📋';
}

.error-title,
.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.error-title {
  color: #ff4d4f;
}

.retry-button,
.back-button {
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trip-hero {
    height: 300px;
  }
  
  .trip-hero-content {
    padding: 20px;
  }
  
  .trip-main-title {
    font-size: 24px;
  }
  
  .trip-basic-info {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .trip-content {
    flex-direction: column;
    padding: 16px;
  }
  
  .trip-sidebar {
    width: 100%;
  }
  
  .trip-actions {
    flex-wrap: wrap;
  }
  
  .action-button {
    flex: 1;
    min-width: 120px;
  }
  
  .activity-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .activity-time {
    min-width: auto;
  }
  
  .activity-type {
    align-self: flex-start;
  }
  
  .activity-details {
    flex-direction: column;
    gap: 8px;
  }
  
  .budget-overview {
    flex-direction: column;
  }
  
  .day-tabs {
    overflow-x: auto;
  }
  
  .map-simulation-text {
    font-size: 14px;
    text-align: center;
  }
}