<template>
  <div class="trip-planner-container">
    <div class="page-header">
      <h1 class="page-title">智能旅行规划</h1>
      <p class="page-description">填写您的旅行偏好，让AI为您定制完美的行程</p>
    </div>
    
    <!-- 规划步骤指示器 -->
    <div class="step-indicator">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        :class="['step', { 
          'step-active': currentStep === index, 
          'step-completed': currentStep > index 
        }]"
      >
        <div class="step-number">{{ index + 1 }}</div>
        <div class="step-title">{{ step }}</div>
      </div>
    </div>
    
    <!-- 表单容器 -->
    <div class="planner-form-container">
      <!-- 步骤1：基本信息 -->
      <div v-if="currentStep === 0" class="form-step">
        <Card class="form-card">
          <h2 class="step-title">旅行基本信息</h2>
          
          <div class="form-group">
            <FormInput 
              v-model="tripInfo.destination"
              :label="'目的地'"
              :placeholder="'例如：日本东京、泰国清迈'"
              :required="true"
              class="form-input"
            />
          </div>
          
          <div class="form-row">
            <div class="form-group half">
              <FormInput 
                v-model="tripInfo.startDate"
                type="date"
                :label="'出发日期'"
                :required="true"
                class="form-input"
                :min="minDate"
              />
            </div>
            
            <div class="form-group half">
              <FormInput 
                v-model="tripInfo.endDate"
                type="date"
                :label="'结束日期'"
                :required="true"
                class="form-input"
                :min="tripInfo.startDate || minDate"
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group half">
              <FormInput 
                v-model.number="tripInfo.travelers"
                type="number"
                :label="'旅行人数'"
                :required="true"
                class="form-input"
                :min="1"
                :max="20"
              />
            </div>
            
            <div class="form-group half">
              <FormInput 
                v-model.number="tripInfo.budget"
                type="number"
                :label="'预算（¥）'"
                :placeholder="'可选，帮助我们推荐更合适的选项'"
                class="form-input"
                :min="0"
                :step="100"
              />
            </div>
          </div>
        </Card>
      </div>
      
      <!-- 步骤2：旅行偏好 -->
      <div v-if="currentStep === 1" class="form-step">
        <Card class="form-card">
          <h2 class="step-title">旅行偏好</h2>
          
          <div class="form-group">
            <label class="form-label">旅行目的</label>
            <div class="checkbox-group">
              <label 
                v-for="purpose in travelPurposes" 
                :key="purpose.value"
                class="checkbox-item"
              >
                <input 
                  type="checkbox"
                  :value="purpose.value"
                  v-model="tripInfo.purposes"
                />
                <span class="checkbox-label">{{ purpose.label }}</span>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">兴趣点类型</label>
            <div class="checkbox-group">
              <label 
                v-for="interest in interests" 
                :key="interest.value"
                class="checkbox-item"
              >
                <input 
                  type="checkbox"
                  :value="interest.value"
                  v-model="tripInfo.interests"
                />
                <span class="checkbox-label">{{ interest.label }}</span>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">住宿偏好</label>
            <div class="radio-group">
              <label 
                v-for="accommodation in accommodations" 
                :key="accommodation.value"
                class="radio-item"
              >
                <input 
                  type="radio"
                  name="accommodation"
                  :value="accommodation.value"
                  v-model="tripInfo.accommodationType"
                />
                <span class="radio-label">{{ accommodation.label }}</span>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">饮食偏好</label>
            <div class="checkbox-group">
              <label 
                v-for="food in foodPreferences" 
                :key="food.value"
                class="checkbox-item"
              >
                <input 
                  type="checkbox"
                  :value="food.value"
                  v-model="tripInfo.foodPreferences"
                />
                <span class="checkbox-label">{{ food.label }}</span>
              </label>
            </div>
          </div>
        </Card>
      </div>
      
      <!-- 步骤3：特殊需求 -->
      <div v-if="currentStep === 2" class="form-step">
        <Card class="form-card">
          <h2 class="step-title">特殊需求</h2>
          
          <div class="form-group">
            <FormInput 
              v-model="tripInfo.specialRequests"
              type="textarea"
              :label="'特殊要求或限制'"
              :placeholder="'例如：需要轮椅通道、素食要求、避开特定日期的活动等'"
              rows="4"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">交通偏好</label>
            <div class="radio-group">
              <label 
                v-for="transport in transportations" 
                :key="transport.value"
                class="radio-item"
              >
                <input 
                  type="radio"
                  name="transportation"
                  :value="transport.value"
                  v-model="tripInfo.transportationPreference"
                />
                <span class="radio-label">{{ transport.label }}</span>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">每天活动强度</label>
            <div class="slider-group">
              <input 
                type="range"
                min="1"
                max="5"
                v-model.number="tripInfo.activityLevel"
                class="activity-slider"
              />
              <div class="activity-level-labels">
                <span>轻松</span>
                <span>适中</span>
                <span>紧凑</span>
              </div>
              <div class="activity-level-value">{{ getActivityLevelLabel(tripInfo.activityLevel) }}</div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">附加选项</label>
            <div class="checkbox-group">
              <label 
                v-for="option in additionalOptions" 
                :key="option.value"
                class="checkbox-item"
              >
                <input 
                  type="checkbox"
                  :value="option.value"
                  v-model="tripInfo.additionalOptions"
                />
                <span class="checkbox-label">{{ option.label }}</span>
              </label>
            </div>
          </div>
        </Card>
      </div>
      
      <!-- 步骤4：生成行程 -->
      <div v-if="currentStep === 3" class="form-step">
        <Card class="form-card">
          <h2 class="step-title">生成您的行程</h2>
          
          <div class="loading-container" v-if="generatingTrip">
            <div class="loading-spinner"></div>
            <p class="loading-text">AI正在为您定制完美的旅行计划...</p>
            <p class="loading-subtext">这可能需要几秒钟，请耐心等待</p>
          </div>
          
          <div v-else-if="tripPlan" class="trip-plan-container">
            <div class="trip-plan-header">
              <h3 class="trip-plan-title">{{ tripInfo.destination }} - {{ formatTripDateRange() }}</h3>
              <div class="trip-plan-meta">
                <span class="trip-plan-meta-item"><i class="meta-icon-users"></i> {{ tripInfo.travelers }}人</span>
                <span class="trip-plan-meta-item"><i class="meta-icon-calendar"></i> {{ calculateDays() }}天</span>
                <span v-if="tripInfo.budget" class="trip-plan-meta-item">
                  <i class="meta-icon-budget"></i> 预算¥{{ tripInfo.budget }}
                </span>
              </div>
            </div>
            
            <div class="trip-plan-summary">
              <h4 class="trip-summary-title">行程概览</h4>
              <div class="trip-highlights">
                <div 
                  v-for="highlight in tripPlan.highlights" 
                  :key="highlight"
                  class="trip-highlight-item"
                >
                  <i class="highlight-icon"></i>
                  <span>{{ highlight }}</span>
                </div>
              </div>
              <div class="trip-stats">
                <div class="trip-stat-item">
                  <div class="trip-stat-number">{{ tripPlan.totalAttractions }}</div>
                  <div class="trip-stat-label">景点</div>
                </div>
                <div class="trip-stat-item">
                  <div class="trip-stat-number">{{ tripPlan.totalRestaurants }}</div>
                  <div class="trip-stat-label">餐厅</div>
                </div>
                <div class="trip-stat-item">
                  <div class="trip-stat-number">{{ tripPlan.totalActivities }}</div>
                  <div class="trip-stat-label">活动</div>
                </div>
              </div>
            </div>
            
            <div class="trip-days-container">
              <h4 class="trip-days-title">每日行程</h4>
              
              <div 
                v-for="(day, index) in tripPlan.itinerary" 
                :key="index"
                class="trip-day"
              >
                <div class="trip-day-header">
                  <h5 class="trip-day-title">第 {{ index + 1 }} 天</h5>
                  <div class="trip-day-date">{{ formatDayDate(index) }}</div>
                </div>
                
                <div class="trip-day-activities">
                  <div 
                    v-for="(activity, activityIndex) in day.activities" 
                    :key="activityIndex"
                    class="trip-activity"
                  >
                    <div class="activity-time">{{ activity.time }}</div>
                    <div class="activity-content">
                      <div class="activity-title">{{ activity.title }}</div>
                      <div class="activity-description">{{ activity.description }}</div>
                      <div class="activity-tags">
                        <span 
                          v-for="tag in activity.tags" 
                          :key="tag"
                          class="activity-tag"
                        >
                          {{ tag }}
                        </span>
                      </div>
                    </div>
                    <div class="activity-image-wrapper" v-if="activity.image">
                      <img 
                        :src="activity.image" 
                        :alt="activity.title"
                        class="activity-image"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="error-container">
            <div class="error-icon"></div>
            <h3 class="error-title">生成行程失败</h3>
            <p class="error-message">抱歉，我们无法为您生成行程。请尝试修改部分参数后重试。</p>
            <Button 
              variant="primary" 
              @click="regenerateTrip"
              class="regenerate-button"
            >
              重新生成
            </Button>
          </div>
        </Card>
      </div>
    </div>
    
    <!-- 导航按钮 -->
    <div class="form-navigation" v-if="currentStep < 2 || (currentStep === 3 && !generatingTrip)">
      <Button 
        v-if="currentStep > 0" 
        @click="previousStep"
        class="nav-button"
      >
        上一步
      </Button>
      
      <div class="nav-spacer" v-if="currentStep > 0"></div>
      
      <Button 
        v-if="currentStep < 2" 
        @click="nextStep"
        :disabled="!isCurrentStepValid"
        variant="primary"
        class="nav-button"
      >
        下一步
      </Button>
      
      <Button 
        v-if="currentStep === 2" 
        @click="generateTrip"
        :disabled="!isCurrentStepValid"
        variant="primary"
        class="nav-button generate-button"
      >
        生成行程
      </Button>
      
      <div v-if="currentStep === 3" class="plan-actions">
        <Button 
          @click="saveTrip"
          :disabled="!tripPlan"
          variant="default"
          class="plan-action-button"
        >
          保存行程
        </Button>
        
        <Button 
          @click="shareTrip"
          :disabled="!tripPlan"
          variant="default"
          class="plan-action-button"
        >
          分享行程
        </Button>
        
        <Button 
          @click="resetForm"
          variant="default"
          class="plan-action-button"
        >
          重新规划
        </Button>
      </div>
    </div>
  </div>
</template>

<script>
import { Card, Button, FormInput } from '../components'
import dayjs from 'dayjs'

export default {
  name: 'TripPlanner',
  
  components: {
    Card,
    Button,
    FormInput
  },
  
  data() {
    return {
      // 步骤信息
      steps: ['基本信息', '旅行偏好', '特殊需求', '生成行程'],
      currentStep: 0,
      minDate: dayjs().format('YYYY-MM-DD'),
      
      // 旅行基本信息
      tripInfo: {
        destination: '',
        startDate: '',
        endDate: '',
        travelers: 1,
        budget: null,
        purposes: [],
        interests: [],
        accommodationType: 'hotel',
        foodPreferences: [],
        specialRequests: '',
        transportationPreference: 'mix',
        activityLevel: 3,
        additionalOptions: []
      },
      
      // 生成状态
      generatingTrip: false,
      tripPlan: null,
      
      // 选项数据
      travelPurposes: [
        { value: 'leisure', label: '休闲度假' },
        { value: 'sightseeing', label: '观光游览' },
        { value: 'adventure', label: '探险体验' },
        { value: 'food', label: '美食探索' },
        { value: 'culture', label: '文化体验' },
        { value: 'shopping', label: '购物血拼' },
        { value: 'relaxation', label: '放松疗养' },
        { value: 'photography', label: '摄影创作' }
      ],
      
      interests: [
        { value: 'historical', label: '历史古迹' },
        { value: 'natural', label: '自然风光' },
        { value: 'museums', label: '博物馆' },
        { value: 'parks', label: '公园' },
        { value: 'temples', label: '寺庙教堂' },
        { value: 'markets', label: '市场市集' },
        { value: 'nightlife', label: '夜生活' },
        { value: 'entertainment', label: '娱乐场所' }
      ],
      
      accommodations: [
        { value: 'hotel', label: '酒店' },
        { value: 'hostel', label: '青旅' },
        { value: 'apartment', label: '民宿公寓' },
        { value: 'resort', label: '度假村' }
      ],
      
      foodPreferences: [
        { value: 'local', label: '当地特色' },
        { value: 'fine_dining', label: '高端餐厅' },
        { value: 'casual', label: '休闲简餐' },
        { value: 'street_food', label: '街头小吃' },
        { value: 'vegetarian', label: '素食' },
        { value: 'seafood', label: '海鲜' },
        { value: 'international', label: '国际美食' }
      ],
      
      transportations: [
        { value: 'public', label: '公共交通' },
        { value: 'taxi', label: '出租车/Uber' },
        { value: 'rental', label: '租车自驾' },
        { value: 'mix', label: '混合方式' }
      ],
      
      additionalOptions: [
        { value: 'guide', label: '当地导游' },
        { value: 'tickets', label: '景点门票' },
        { value: 'transport', label: '交通接送' },
        { value: 'photographer', label: '旅行摄影' },
        { value: 'insurance', label: '旅行保险' }
      ]
    }
  },
  
  computed: {
    // 当前步骤是否有效
    isCurrentStepValid() {
      switch (this.currentStep) {
        case 0:
          return this.tripInfo.destination.trim() && 
                 this.tripInfo.startDate && 
                 this.tripInfo.endDate &&
                 this.tripInfo.travelers > 0 &&
                 this.isValidDateRange()
        case 1:
          return this.tripInfo.purposes.length > 0 &&
                 this.tripInfo.interests.length > 0
        case 2:
          return true
        default:
          return true
      }
    }
  },
  
  methods: {
    // 下一步
    nextStep() {
      if (this.isCurrentStepValid) {
        this.currentStep++
      }
    },
    
    // 上一步
    previousStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    
    // 日期范围是否有效
    isValidDateRange() {
      if (!this.tripInfo.startDate || !this.tripInfo.endDate) return false
      
      const start = dayjs(this.tripInfo.startDate)
      const end = dayjs(this.tripInfo.endDate)
      
      return end.isAfter(start) || end.isSame(start)
    },
    
    // 获取活动强度标签
    getActivityLevelLabel(level) {
      const labels = ['', '非常轻松', '轻松', '适中', '紧凑', '非常紧凑']
      return labels[level] || '适中'
    },
    
    // 生成行程
    async generateTrip() {
      if (!this.isCurrentStepValid) return
      
      this.generatingTrip = true
      this.tripPlan = null
      
      try {
        // TODO: 调用API生成行程，这里使用模拟数据
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // 模拟行程数据
        this.tripPlan = this.generateMockTripPlan()
        
        this.$notification.success({
          title: '行程生成成功',
          message: '您的旅行计划已准备就绪！',
          duration: 3000
        })
      } catch (error) {
        console.error('生成行程失败:', error)
        this.$notification.error({
          title: '生成行程失败',
          message: '抱歉，我们无法为您生成行程。请尝试修改部分参数后重试。',
          duration: 3000
        })
      } finally {
        this.generatingTrip = false
        this.currentStep++
      }
    },
    
    // 重新生成行程
    regenerateTrip() {
      this.currentStep = 2
    },
    
    // 保存行程
    saveTrip() {
      // TODO: 实现保存行程功能
      this.$notification.success({
        title: '保存成功',
        message: '行程已保存到您的账户',
        duration: 3000
      })
    },
    
    // 分享行程
    shareTrip() {
      // TODO: 实现分享行程功能
      this.$notification.success({
        title: '分享链接已复制',
        message: '您可以将链接分享给朋友',
        duration: 3000
      })
    },
    
    // 重置表单
    resetForm() {
      this.currentStep = 0
      this.tripPlan = null
      
      // 重置表单数据
      this.tripInfo = {
        destination: '',
        startDate: '',
        endDate: '',
        travelers: 1,
        budget: null,
        purposes: [],
        interests: [],
        accommodationType: 'hotel',
        foodPreferences: [],
        specialRequests: '',
        transportationPreference: 'mix',
        activityLevel: 3,
        additionalOptions: []
      }
    },
    
    // 格式化旅行日期范围
    formatTripDateRange() {
      if (!this.tripInfo.startDate || !this.tripInfo.endDate) return ''
      
      const start = dayjs(this.tripInfo.startDate)
      const end = dayjs(this.tripInfo.endDate)
      
      return `${start.format('MM月DD日')} - ${end.format('MM月DD日')}`
    },
    
    // 计算旅行天数
    calculateDays() {
      if (!this.tripInfo.startDate || !this.tripInfo.endDate) return 0
      
      const start = dayjs(this.tripInfo.startDate)
      const end = dayjs(this.tripInfo.endDate)
      
      return end.diff(start, 'day') + 1
    },
    
    // 格式化单日日期
    formatDayDate(dayIndex) {
      if (!this.tripInfo.startDate) return ''
      
      const date = dayjs(this.tripInfo.startDate).add(dayIndex, 'day')
      return date.format('MM月DD日')
    },
    
    // 生成模拟行程数据
    generateMockTripPlan() {
      const days = this.calculateDays()
      
      // 生成每日行程
      const itinerary = []
      
      for (let day = 0; day < days; day++) {
        const dayActivities = []
        const activityCount = this.getRandomInt(4, 6)
        
        // 根据活动强度调整行程
        const baseTime = 8 + day * 10 // 基于天数错开活动时间
        
        for (let i = 0; i < activityCount; i++) {
          const hour = Math.floor(baseTime + i * (10 / activityCount))
          const minute = this.getRandomInt(0, 2) * 30 // 0, 30分钟
          
          dayActivities.push({
            time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            title: this.getActivityTitle(day, i),
            description: this.getActivityDescription(day, i),
            tags: this.getActivityTags(day, i),
            image: `/assets/images/activity-${(day + i) % 8 + 1}.jpg`
          })
        }
        
        itinerary.push({
          day: day + 1,
          activities: dayActivities
        })
      }
      
      // 生成行程亮点
      const highlights = this.getRandomHighlights()
      
      return {
        highlights,
        totalAttractions: highlights.length,
        totalRestaurants: Math.ceil(highlights.length * 0.5),
        totalActivities: itinerary.reduce((sum, day) => sum + day.activities.length, 0),
        itinerary
      }
    },
    
    // 获取随机整数
    getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min
    },
    
    // 获取活动标题
    getActivityTitle(day, index) {
      const titles = [
        '参观当地历史博物馆',
        '探索古老城堡',
        '享受海滨日落',
        '徒步自然公园',
        '品尝当地美食',
        '购物于传统市场',
        '参观艺术画廊',
        '体验当地文化活动',
        '乘船游览',
        '泡温泉放松',
        '参加烹饪课程',
        '参观宗教建筑',
        '骑行城市风光',
        '尝试当地特色活动',
        '观看传统表演',
        '登山俯瞰全景',
        '参观科技展览',
        '享受美食之旅',
        '探索历史街区',
        '购物于现代商场'
      ]
      
      return titles[(day * 10 + index) % titles.length]
    },
    
    // 获取活动描述
    getActivityDescription(day, index) {
      const descriptions = [
        '在这里您可以深入了解当地的历史文化，感受传统与现代的交融。',
        '探索这座有着数百年历史的建筑，欣赏精美的建筑风格和丰富的历史故事。',
        '在海滩上放松身心，欣赏美丽的日落景色，留下难忘的回忆。',
        '穿越茂密的森林，呼吸新鲜空气，欣赏大自然的壮丽景色。',
        '品尝正宗的当地美食，体验独特的烹饪风格和口味。',
        '在传统市场中寻找特色商品和纪念品，体验地道的市井生活。',
        '欣赏当地艺术家的作品，了解当地的艺术发展和文化底蕴。',
        '参与当地的文化活动，与当地人互动，深入了解当地生活方式。',
        '乘船游览周边景色，欣赏水上风光，感受宁静与美丽。',
        '在温泉中放松身心，消除旅途疲劳，享受宁静时光。',
        '学习制作当地特色美食，掌握烹饪技巧，带回家与亲友分享。',
        '参观当地著名的宗教建筑，了解宗教文化对当地的影响。',
        '骑行游览城市，欣赏沿途风景，体验当地的生活节奏。',
        '尝试刺激有趣的当地特色活动，挑战自我，创造难忘体验。',
        '观看精彩的传统表演，感受独特的艺术魅力和文化内涵。',
        '登上山顶，俯瞰整个城市的壮丽景色，拍照留念。',
        '参观科技展览，了解当地的科技发展和创新成果。',
        '跟随专业导游，品尝各种美食，了解美食背后的故事。',
        '漫步于历史街区，欣赏保存完好的古建筑，感受历史的厚重。',
        '在现代化商场中购物，寻找国际品牌和当地特色商品。'
      ]
      
      return descriptions[(day * 10 + index) % descriptions.length]
    },
    
    // 获取活动标签
    getActivityTags(day, index) {
      const allTags = [
        ['文化', '历史', '室内'],
        ['建筑', '历史', '摄影'],
        ['自然', '放松', '摄影'],
        ['户外', '运动', '自然'],
        ['美食', '体验', '休闲'],
        ['购物', '当地', '体验'],
        ['艺术', '文化', '室内'],
        ['文化', '互动', '体验'],
        ['自然', '休闲', '摄影'],
        ['放松', '健康', '体验'],
        ['美食', '学习', '互动'],
        ['宗教', '历史', '文化'],
        ['运动', '户外', '城市'],
        ['刺激', '体验', '户外'],
        ['艺术', '文化', '表演'],
        ['户外', '运动', '摄影'],
        ['科技', '现代', '室内'],
        ['美食', '探索', '互动'],
        ['历史', '建筑', '城市'],
        ['购物', '现代', '休闲']
      ]
      
      return allTags[(day * 10 + index) % allTags.length]
    },
    
    // 获取随机亮点
    getRandomHighlights() {
      const allHighlights = [
        `参观${this.tripInfo.destination}最著名的历史景点`,
        '体验当地特色美食文化',
        '探索自然风光和国家公园',
        `在${this.tripInfo.destination}的标志性建筑前拍照留念`,
        '享受当地特色SPA和放松体验',
        '参与当地传统节日和文化活动',
        `购物于${this.tripInfo.destination}著名的购物区`,
        '尝试当地特色的户外运动和活动',
        `参观${this.tripInfo.destination}的博物馆和艺术展览`,
        '品尝米其林星级餐厅的美食'
      ]
      
      // 随机选择3-5个亮点
      const highlightCount = this.getRandomInt(3, 5)
      const shuffled = [...allHighlights].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, highlightCount)
    }
  }
}
</script>

<style scoped>
/* 旅行规划器容器 */
.trip-planner-container {
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

/* 步骤指示器 */
.step-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 16px;
  left: 50%;
  width: calc(100% - 20px);
  height: 2px;
  background-color: #d9d9d9;
  z-index: 1;
}

.step-active:not(:last-child)::after,
.step-completed:not(:last-child)::after {
  background-color: #1890ff;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #d9d9d9;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 8px;
  position: relative;
  z-index: 2;
}

.step-title {
  font-size: 14px;
  color: #999;
  text-align: center;
}

.step-active .step-number,
.step-completed .step-number {
  background-color: #1890ff;
}

.step-active .step-title,
.step-completed .step-title {
  color: #333;
  font-weight: 500;
}

/* 表单容器 */
.planner-form-container {
  max-width: 800px;
  margin: 0 auto 40px;
}

.form-step {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 表单卡片 */
.form-card {
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.form-card .step-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
  text-align: left;
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.half {
  flex: 1;
}

.form-label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.form-input {
  width: 100%;
}

/* 复选框和单选按钮组 */
.checkbox-group,
.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.checkbox-item,
.radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-item input,
.radio-item input {
  margin-right: 8px;
}

.checkbox-label,
.radio-label {
  font-size: 14px;
  color: #333;
}

/* 滑块组 */
.slider-group {
  padding: 16px 0;
}

.activity-slider {
  width: 100%;
  margin-bottom: 8px;
}

.activity-level-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.activity-level-value {
  font-size: 14px;
  font-weight: 500;
  color: #1890ff;
  text-align: center;
}

/* 加载状态 */
.loading-container {
  text-align: center;
  padding: 40px 0;
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

.loading-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.loading-subtext {
  font-size: 14px;
  color: #666;
}

/* 行程计划容器 */
.trip-plan-container {
  padding: 16px 0;
}

.trip-plan-header {
  text-align: center;
  margin-bottom: 32px;
}

.trip-plan-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.trip-plan-meta {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.trip-plan-meta-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.meta-icon-users::before {
  content: '👥';
  margin-right: 4px;
}

.meta-icon-calendar::before {
  content: '📅';
  margin-right: 4px;
}

.meta-icon-budget::before {
  content: '💰';
  margin-right: 4px;
}

/* 行程概览 */
.trip-plan-summary {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 32px;
}

.trip-summary-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.trip-highlights {
  margin-bottom: 20px;
}

.trip-highlight-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
}

.highlight-icon::before {
  content: '✨';
  margin-right: 8px;
}

.trip-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

.trip-stat-item {
  text-align: center;
}

.trip-stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 4px;
}

.trip-stat-label {
  font-size: 14px;
  color: #666;
}

/* 每日行程 */
.trip-days-container {
  margin-bottom: 32px;
}

.trip-days-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.trip-day {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e8e8e8;
}

.trip-day:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.trip-day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.trip-day-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.trip-day-date {
  font-size: 14px;
  color: #666;
}

/* 行程活动 */
.trip-day-activities {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.trip-activity {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.trip-activity:hover {
  background-color: #f0f0f0;
}

.activity-time {
  min-width: 60px;
  font-weight: 500;
  color: #1890ff;
  padding-top: 2px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.activity-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.activity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.activity-tag {
  padding: 2px 8px;
  background-color: #e6f7ff;
  color: #1890ff;
  border-radius: 10px;
  font-size: 12px;
}

.activity-image-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.activity-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 错误容器 */
.error-container {
  text-align: center;
  padding: 40px 0;
}

.error-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #fff2f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 32px;
}

.error-icon::before {
  content: '❌';
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  color: #f5222d;
  margin-bottom: 8px;
}

.error-message {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

/* 表单导航 */
.form-navigation {
  display: flex;
  justify-content: space-between;
  max-width: 800px;
  margin: 0 auto;
}

.nav-button {
  min-width: 120px;
}

.generate-button {
  min-width: 160px;
}

.nav-spacer {
  flex: 1;
}

/* 行程操作按钮 */
.plan-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.plan-action-button {
  min-width: 120px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trip-planner-container {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .step-indicator {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
  
  .step {
    width: 100%;
    flex-direction: row;
    justify-content: center;
  }
  
  .step:not(:last-child)::after {
    display: none;
  }
  
  .step-number {
    margin-bottom: 0;
    margin-right: 12px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 20px;
  }
  
  .checkbox-group,
  .radio-group {
    flex-direction: column;
  }
  
  .trip-plan-meta {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
  
  .trip-activity {
    flex-direction: column;
  }
  
  .activity-image-wrapper {
    width: 100%;
    height: 150px;
  }
  
  .form-navigation {
    flex-direction: column;
    gap: 16px;
  }
  
  .plan-actions {
    flex-direction: column;
  }
  
  .regenerate-button {
    width: 100%;
  }
}
</style>