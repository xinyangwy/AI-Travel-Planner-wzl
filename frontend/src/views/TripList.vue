<template>
  <div class="trip-list-container">
    <div class="page-header">
      <h1 class="page-title">我的行程</h1>
      <p class="page-description">管理您的旅行计划和行程安排</p>
    </div>
    
    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="view-options">
        <Button 
          @click="switchView('grid')"
          :class="['view-button', { 'active': viewMode === 'grid' }]"
          variant="outline"
          size="small"
        >
          <i class="grid-icon"></i>
          网格视图
        </Button>
        <Button 
          @click="switchView('list')"
          :class="['view-button', { 'active': viewMode === 'list' }]"
          variant="outline"
          size="small"
        >
          <i class="list-icon"></i>
          列表视图
        </Button>
      </div>
      
      <div class="action-buttons">
        <Button 
          @click="createNewTrip"
          variant="primary"
          class="create-button"
        >
          <i class="create-icon"></i>
          创建新行程
        </Button>
      </div>
    </div>
    
    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="search-filter">
        <FormInput 
          v-model="searchQuery"
          :placeholder="'搜索行程名称、目的地...'"
          class="search-input"
          @keyup.enter="searchTrips"
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
      </div>
      
      <div class="filter-options">
        <div class="filter-group">
          <label class="filter-label">状态</label>
          <select v-model="filters.status" @change="applyFilters" class="filter-select">
            <option value="">全部</option>
            <option value="upcoming">即将到来</option>
            <option value="ongoing">进行中</option>
            <option value="completed">已完成</option>
            <option value="draft">草稿</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">排序</label>
          <select v-model="sortBy" @change="sortTrips" class="filter-select">
            <option value="date-desc">开始日期 (新到旧)</option>
            <option value="date-asc">开始日期 (旧到新)</option>
            <option value="name">名称</option>
            <option value="duration">行程天数</option>
          </select>
        </div>
        
        <div class="filter-actions">
          <Button @click="resetFilters" variant="outline" size="small" class="reset-button">
            重置筛选
          </Button>
        </div>
      </div>
    </div>
    
    <!-- 行程列表内容 -->
    <div class="trip-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">正在加载行程...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon"></div>
        <h3 class="error-title">加载失败</h3>
        <p class="error-message">{{ error }}</p>
        <Button @click="fetchTrips" variant="primary" class="retry-button">
          重试
        </Button>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="filteredTrips.length === 0" class="empty-state">
        <div class="empty-icon"></div>
        <h3 class="empty-title">暂无行程</h3>
        <p class="empty-message">{{ hasActiveFilters ? '没有找到匹配的行程，请尝试调整筛选条件' : '您还没有创建任何行程，点击下方按钮开始规划您的旅行' }}</p>
        <Button @click="hasActiveFilters ? resetAll : createNewTrip" variant="primary" class="action-button">
          {{ hasActiveFilters ? '清除所有筛选' : '创建第一个行程' }}
        </Button>
      </div>
      
      <!-- 网格视图 -->
      <div 
        v-else-if="viewMode === 'grid'"
        class="trip-grid"
      >
        <div 
          v-for="trip in filteredTrips" 
          :key="trip.id"
          class="trip-card"
          @click="openTripDetail(trip.id)"
        >
          <!-- 行程封面图 -->
          <div class="trip-image-container">
            <img 
              :src="trip.coverImage" 
              :alt="trip.title"
              class="trip-image"
            />
            <!-- 行程状态标签 -->
            <div :class="['trip-status', `status-${trip.status}`]">
              {{ getStatusLabel(trip.status) }}
            </div>
          </div>
          
          <!-- 行程信息 -->
          <div class="trip-info">
            <h3 class="trip-title">{{ trip.title }}</h3>
            
            <!-- 目的地 -->
            <div class="trip-destination">
              <i class="location-icon"></i>
              <span>{{ trip.destination }}</span>
            </div>
            
            <!-- 日期 -->
            <div class="trip-date">
              <i class="calendar-icon"></i>
              <span>{{ formatDateRange(trip.startDate, trip.endDate) }}</span>
              <span class="trip-duration">({{ calculateDuration(trip.startDate, trip.endDate) }}天)</span>
            </div>
            
            <!-- 行程统计 -->
            <div class="trip-stats">
              <div class="stat-item">
                <i class="stat-icon"></i>
                <span>{{ trip.dayPlans.length }}天行程</span>
              </div>
              <div class="stat-item">
                <i class="activity-icon"></i>
                <span>{{ trip.totalActivities }}个活动</span>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="trip-actions">
              <Button 
                @click.stop="editTrip(trip.id)"
                variant="outline"
                size="small"
                class="action-btn"
              >
                编辑
              </Button>
              <Button 
                @click.stop="shareTrip(trip.id)"
                variant="outline"
                size="small"
                class="action-btn"
              >
                分享
              </Button>
              <Button 
                @click.stop="deleteTripConfirm(trip)"
                variant="outline"
                size="small"
                class="action-btn delete-btn"
              >
                删除
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 列表视图 -->
      <div 
        v-else-if="viewMode === 'list'"
        class="trip-table"
      >
        <table class="table">
          <thead class="table-header">
            <tr>
              <th class="col-title">行程名称</th>
              <th class="col-destination">目的地</th>
              <th class="col-date">日期</th>
              <th class="col-duration">天数</th>
              <th class="col-activities">活动数</th>
              <th class="col-status">状态</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody class="table-body">
            <tr 
              v-for="trip in filteredTrips" 
              :key="trip.id"
              class="table-row"
              @click="openTripDetail(trip.id)"
            >
              <td class="col-title">
                <div class="table-title-cell">
                  <div class="trip-cover-small" :style="{ backgroundImage: `url(${trip.coverImage})` }"></div>
                  <div class="trip-title-text">{{ trip.title }}</div>
                </div>
              </td>
              <td class="col-destination">
                <div class="location-cell">
                  <i class="location-icon"></i>
                  <span>{{ trip.destination }}</span>
                </div>
              </td>
              <td class="col-date">{{ formatDateRange(trip.startDate, trip.endDate) }}</td>
              <td class="col-duration">{{ calculateDuration(trip.startDate, trip.endDate) }}天</td>
              <td class="col-activities">{{ trip.totalActivities }}</td>
              <td class="col-status">
                <div :class="['status-badge', `status-${trip.status}`]">
                  {{ getStatusLabel(trip.status) }}
                </div>
              </td>
              <td class="col-actions">
                <div class="table-actions" @click.stop>
                  <Button 
                    @click="openTripDetail(trip.id)"
                    variant="text"
                    size="small"
                    title="查看详情"
                  >
                    <i class="view-icon"></i>
                  </Button>
                  <Button 
                    @click="editTrip(trip.id)"
                    variant="text"
                    size="small"
                    title="编辑"
                  >
                    <i class="edit-icon"></i>
                  </Button>
                  <Button 
                    @click="shareTrip(trip.id)"
                    variant="text"
                    size="small"
                    title="分享"
                  >
                    <i class="share-icon"></i>
                  </Button>
                  <Button 
                    @click="deleteTripConfirm(trip)"
                    variant="text"
                    size="small"
                    title="删除"
                  >
                    <i class="delete-icon"></i>
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 分页控件 -->
    <div class="pagination-container" v-if="filteredTrips.length > 0">
      <div class="pagination-info">
        显示 {{ currentPage * pageSize + 1 }} - {{ Math.min((currentPage + 1) * pageSize, filteredTrips.length) }} 共 {{ filteredTrips.length }} 个行程
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
    
    <!-- 最近浏览和推荐 -->
    <div class="recommendations-section" v-if="filteredTrips.length === 0 && !hasActiveFilters">
      <div class="section-header">
        <h2 class="section-title">推荐行程模板</h2>
        <p class="section-subtitle">选择一个模板开始您的旅行规划</p>
      </div>
      
      <div class="template-grid">
        <div 
          v-for="template in tripTemplates" 
          :key="template.id"
          class="template-card"
          @click="useTemplate(template.id)"
        >
          <div class="template-image-container">
            <img 
              :src="template.imageUrl" 
              :alt="template.name"
              class="template-image"
            />
          </div>
          <div class="template-info">
            <h3 class="template-name">{{ template.name }}</h3>
            <div class="template-destination">
              <i class="location-icon"></i>
              <span>{{ template.destination }}</span>
            </div>
            <div class="template-details">
              <span class="template-duration">{{ template.duration }}天</span>
              <span class="template-activities">{{ template.activities }}个活动</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Card, Button, FormInput } from '../components'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

export default {
  name: 'TripList',
  
  components: {
    Card,
    Button,
    FormInput
  },
  
  data() {
    return {
      // 页面状态
      loading: false,
      error: null,
      
      // 视图模式
      viewMode: 'grid', // 'grid' or 'list'
      
      // 搜索和筛选
      searchQuery: '',
      filters: {
        status: ''
      },
      sortBy: 'date-desc',
      
      // 分页
      currentPage: 0,
      pageSize: 9,
      
      // 行程数据 (模拟数据)
      trips: [
        {
          id: 1,
          title: '东京樱花之旅',
          destination: '日本东京',
          coverImage: '/assets/images/trips/tokyo-cherry.jpg',
          startDate: '2023-03-25',
          endDate: '2023-03-30',
          status: 'completed',
          dayPlans: [
            { id: 101, date: '2023-03-25', activities: 5 },
            { id: 102, date: '2023-03-26', activities: 4 },
            { id: 103, date: '2023-03-27', activities: 6 },
            { id: 104, date: '2023-03-28', activities: 5 },
            { id: 105, date: '2023-03-29', activities: 4 }
          ],
          totalActivities: 24
        },
        {
          id: 2,
          title: '巴厘岛度假',
          destination: '印度尼西亚巴厘岛',
          coverImage: '/assets/images/trips/bali-beach.jpg',
          startDate: '2023-07-10',
          endDate: '2023-07-17',
          status: 'completed',
          dayPlans: [
            { id: 201, date: '2023-07-10', activities: 3 },
            { id: 202, date: '2023-07-11', activities: 4 },
            { id: 203, date: '2023-07-12', activities: 3 },
            { id: 204, date: '2023-07-13', activities: 5 },
            { id: 205, date: '2023-07-14', activities: 3 },
            { id: 206, date: '2023-07-15', activities: 4 },
            { id: 207, date: '2023-07-16', activities: 3 }
          ],
          totalActivities: 25
        },
        {
          id: 3,
          title: '欧洲文化之旅',
          destination: '法国巴黎、意大利罗马',
          coverImage: '/assets/images/trips/europe-culture.jpg',
          startDate: '2023-10-05',
          endDate: '2023-10-19',
          status: 'completed',
          dayPlans: [
            { id: 301, date: '2023-10-05', activities: 4 },
            { id: 302, date: '2023-10-06', activities: 5 },
            { id: 303, date: '2023-10-07', activities: 4 },
            { id: 304, date: '2023-10-08', activities: 4 },
            { id: 305, date: '2023-10-09', activities: 3 },
            { id: 306, date: '2023-10-10', activities: 2 },
            { id: 307, date: '2023-10-11', activities: 5 },
            { id: 308, date: '2023-10-12', activities: 5 },
            { id: 309, date: '2023-10-13', activities: 4 },
            { id: 310, date: '2023-10-14', activities: 4 },
            { id: 311, date: '2023-10-15', activities: 3 },
            { id: 312, date: '2023-10-16', activities: 3 },
            { id: 313, date: '2023-10-17', activities: 2 },
            { id: 314, date: '2023-10-18', activities: 3 }
          ],
          totalActivities: 49
        },
        {
          id: 4,
          title: '北海道滑雪之旅',
          destination: '日本北海道',
          coverImage: '/assets/images/trips/hokkaido-ski.jpg',
          startDate: '2024-01-15',
          endDate: '2024-01-22',
          status: 'upcoming',
          dayPlans: [
            { id: 401, date: '2024-01-15', activities: 3 },
            { id: 402, date: '2024-01-16', activities: 4 },
            { id: 403, date: '2024-01-17', activities: 5 },
            { id: 404, date: '2024-01-18', activities: 5 },
            { id: 405, date: '2024-01-19', activities: 4 },
            { id: 406, date: '2024-01-20', activities: 3 },
            { id: 407, date: '2024-01-21', activities: 3 }
          ],
          totalActivities: 27
        },
        {
          id: 5,
          title: '泰国清迈自由行',
          destination: '泰国清迈',
          coverImage: '/assets/images/trips/chiangmai.jpg',
          startDate: '2024-02-20',
          endDate: '2024-02-26',
          status: 'upcoming',
          dayPlans: [
            { id: 501, date: '2024-02-20', activities: 3 },
            { id: 502, date: '2024-02-21', activities: 4 },
            { id: 503, date: '2024-02-22', activities: 4 },
            { id: 504, date: '2024-02-23', activities: 5 },
            { id: 505, date: '2024-02-24', activities: 3 },
            { id: 506, date: '2024-02-25', activities: 4 }
          ],
          totalActivities: 23
        },
        {
          id: 6,
          title: '美国西海岸自驾游',
          destination: '美国洛杉矶、旧金山',
          coverImage: '/assets/images/trips/usa-road.jpg',
          startDate: '2024-06-10',
          endDate: '2024-06-24',
          status: 'upcoming',
          dayPlans: [
            { id: 601, date: '2024-06-10', activities: 3 },
            { id: 602, date: '2024-06-11', activities: 4 },
            { id: 603, date: '2024-06-12', activities: 4 },
            { id: 604, date: '2024-06-13', activities: 4 },
            { id: 605, date: '2024-06-14', activities: 5 },
            { id: 606, date: '2024-06-15', activities: 3 },
            { id: 607, date: '2024-06-16', activities: 3 },
            { id: 608, date: '2024-06-17', activities: 4 },
            { id: 609, date: '2024-06-18', activities: 4 },
            { id: 610, date: '2024-06-19', activities: 5 },
            { id: 611, date: '2024-06-20', activities: 4 },
            { id: 612, date: '2024-06-21', activities: 3 },
            { id: 613, date: '2024-06-22', activities: 4 },
            { id: 614, date: '2024-06-23', activities: 3 }
          ],
          totalActivities: 52
        },
        {
          id: 7,
          title: '三亚度假计划',
          destination: '中国三亚',
          coverImage: '/assets/images/trips/sanya.jpg',
          startDate: '',
          endDate: '',
          status: 'draft',
          dayPlans: [
            { id: 701, date: '', activities: 2 }
          ],
          totalActivities: 2
        },
        {
          id: 8,
          title: '新加坡亲子游',
          destination: '新加坡',
          coverImage: '/assets/images/trips/singapore-family.jpg',
          startDate: '2023-12-15',
          endDate: '2023-12-22',
          status: 'completed',
          dayPlans: [
            { id: 801, date: '2023-12-15', activities: 3 },
            { id: 802, date: '2023-12-16', activities: 4 },
            { id: 803, date: '2023-12-17', activities: 4 },
            { id: 804, date: '2023-12-18', activities: 5 },
            { id: 805, date: '2023-12-19', activities: 4 },
            { id: 806, date: '2023-12-20', activities: 3 },
            { id: 807, date: '2023-12-21', activities: 3 }
          ],
          totalActivities: 26
        },
        {
          id: 9,
          title: '澳大利亚墨尔本之旅',
          destination: '澳大利亚墨尔本',
          coverImage: '/assets/images/trips/melbourne.jpg',
          startDate: '2024-04-01',
          endDate: '2024-04-08',
          status: 'upcoming',
          dayPlans: [
            { id: 901, date: '2024-04-01', activities: 4 },
            { id: 902, date: '2024-04-02', activities: 5 },
            { id: 903, date: '2024-04-03', activities: 4 },
            { id: 904, date: '2024-04-04', activities: 3 },
            { id: 905, date: '2024-04-05', activities: 4 },
            { id: 906, date: '2024-04-06', activities: 4 },
            { id: 907, date: '2024-04-07', activities: 3 }
          ],
          totalActivities: 27
        }
      ],
      
      // 行程模板
      tripTemplates: [
        {
          id: 'template1',
          name: '东京经典5日游',
          destination: '日本东京',
          imageUrl: '/assets/images/templates/tokyo.jpg',
          duration: 5,
          activities: 20
        },
        {
          id: 'template2',
          name: '泰国普吉岛度假',
          destination: '泰国普吉岛',
          imageUrl: '/assets/images/templates/phuket.jpg',
          duration: 7,
          activities: 15
        },
        {
          id: 'template3',
          name: '巴黎艺术之旅',
          destination: '法国巴黎',
          imageUrl: '/assets/images/templates/paris.jpg',
          duration: 6,
          activities: 24
        },
        {
          id: 'template4',
          name: '三亚阳光海滩',
          destination: '中国三亚',
          imageUrl: '/assets/images/templates/sanya.jpg',
          duration: 4,
          activities: 12
        }
      ]
    }
  },
  
  computed: {
    // 过滤后的行程列表
    filteredTrips() {
      let result = [...this.trips]
      
      // 搜索过滤
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        result = result.filter(trip => 
          trip.title.toLowerCase().includes(query) ||
          trip.destination.toLowerCase().includes(query)
        )
      }
      
      // 状态过滤
      if (this.filters.status) {
        result = result.filter(trip => trip.status === this.filters.status)
      }
      
      // 排序
      result = this.sortTripsList(result)
      
      return result
    },
    
    // 分页后的行程列表
    paginatedTrips() {
      const start = this.currentPage * this.pageSize
      const end = start + this.pageSize
      return this.filteredTrips.slice(start, end)
    },
    
    // 总页数
    totalPages() {
      return Math.ceil(this.filteredTrips.length / this.pageSize)
    },
    
    // 是否有活动的筛选条件
    hasActiveFilters() {
      return this.searchQuery.trim() !== '' || 
             this.filters.status !== ''
    }
  },
  
  methods: {
    // 获取行程列表
    fetchTrips() {
      this.loading = true
      this.error = null
      
      // 模拟API请求
      setTimeout(() => {
        // 在实际应用中，这里应该是从API获取数据
        this.loading = false
      }, 800)
    },
    
    // 切换视图模式
    switchView(mode) {
      this.viewMode = mode
    },
    
    // 创建新行程
    createNewTrip() {
      this.$router.push('/trip-planner')
    },
    
    // 搜索行程
    searchTrips() {
      this.currentPage = 0
    },
    
    // 清除搜索
    clearSearch() {
      this.searchQuery = ''
      this.currentPage = 0
    },
    
    // 应用筛选
    applyFilters() {
      this.currentPage = 0
    },
    
    // 重置筛选
    resetFilters() {
      this.filters = {
        status: ''
      }
      this.currentPage = 0
    },
    
    // 重置所有
    resetAll() {
      this.searchQuery = ''
      this.resetFilters()
      this.sortBy = 'date-desc'
    },
    
    // 排序行程列表
    sortTripsList(trips) {
      const sorted = [...trips]
      
      switch (this.sortBy) {
        case 'date-asc':
          return sorted.sort((a, b) => {
            // 草稿排在最后
            if (a.status === 'draft' && b.status !== 'draft') return 1
            if (a.status !== 'draft' && b.status === 'draft') return -1
            // 比较开始日期
            if (a.startDate && b.startDate) {
              return new Date(a.startDate) - new Date(b.startDate)
            }
            return 0
          })
        case 'date-desc':
          return sorted.sort((a, b) => {
            // 草稿排在最后
            if (a.status === 'draft' && b.status !== 'draft') return 1
            if (a.status !== 'draft' && b.status === 'draft') return -1
            // 比较开始日期
            if (a.startDate && b.startDate) {
              return new Date(b.startDate) - new Date(a.startDate)
            }
            return 0
          })
        case 'name':
          return sorted.sort((a, b) => a.title.localeCompare(b.title))
        case 'duration':
          return sorted.sort((a, b) => {
            const durationA = a.startDate && a.endDate ? 
              calculateDuration(a.startDate, a.endDate) : 0
            const durationB = b.startDate && b.endDate ? 
              calculateDuration(b.startDate, b.endDate) : 0
            return durationA - durationB
          })
        default:
          return sorted
      }
    },
    
    // 排序行程
    sortTrips() {
      this.currentPage = 0
    },
    
    // 分页方法
    prevPage() {
      if (this.currentPage > 0) {
        this.currentPage--
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage++
      }
    },
    
    goToPage(page) {
      if (page >= 0 && page < this.totalPages) {
        this.currentPage = page
      }
    },
    
    // 打开行程详情
    openTripDetail(tripId) {
      this.$router.push(`/trip/${tripId}`)
    },
    
    // 编辑行程
    editTrip(tripId) {
      this.$router.push(`/trip-planner/${tripId}`)
    },
    
    // 分享行程
    shareTrip(tripId) {
      const trip = this.trips.find(t => t.id === tripId)
      if (trip) {
        this.$notification.success({
          title: '分享行程',
          message: `分享链接已复制到剪贴板`,
          duration: 2000
        })
      }
    },
    
    // 删除行程确认
    deleteTripConfirm(trip) {
      this.$confirm({
        title: '确认删除',
        message: `确定要删除行程"${trip.title}"吗？此操作不可恢复。`,
        type: 'warning',
        onOk: () => {
          this.deleteTrip(trip.id)
        }
      })
    },
    
    // 删除行程
    deleteTrip(tripId) {
      const index = this.trips.findIndex(t => t.id === tripId)
      if (index !== -1) {
        this.trips.splice(index, 1)
        
        this.$notification.success({
          title: '删除成功',
          message: '行程已成功删除',
          duration: 2000
        })
        
        // 如果删除后当前页没有数据，回到上一页
        if (this.paginatedTrips.length === 0 && this.currentPage > 0) {
          this.currentPage--
        }
      }
    },
    
    // 使用模板
    useTemplate(templateId) {
      this.$router.push({
        path: '/trip-planner',
        query: { template: templateId }
      })
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
      
      // 如果是同年同月，只显示一次年和月
      if (start.year() === end.year() && start.month() === end.month()) {
        return `${start.format('YYYY年MM月DD日')} - ${end.format('DD日')}`
      }
      
      // 如果是同年，只显示一次年
      if (start.year() === end.year()) {
        return `${start.format('YYYY年MM月DD日')} - ${end.format('MM月DD日')}`
      }
      
      // 不同年
      return `${start.format('YYYY年MM月DD日')} - ${end.format('YYYY年MM月DD日')}`
    },
    
    // 计算行程天数
    calculateDuration(startDate, endDate) {
      if (!startDate || !endDate) return 0
      
      const start = dayjs(startDate)
      const end = dayjs(endDate)
      
      // 计算包含起始日期在内的天数
      return end.diff(start, 'day') + 1
    }
  },
  
  mounted() {
    this.fetchTrips()
  }
}
</script>

<style scoped>
/* 行程列表容器 */
.trip-list-container {
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

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.view-options {
  display: flex;
  gap: 8px;
}

.view-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.view-button.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.grid-icon::before {
  content: '⊞';
  font-size: 16px;
}

.list-icon::before {
  content: '≡';
  font-size: 16px;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.create-icon::before {
  content: '+';
  font-size: 16px;
}

/* 筛选部分 */
.filter-section {
  margin-bottom: 24px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-filter {
  margin-bottom: 16px;
}

.search-input {
  max-width: 400px;
}

.search-icon::before {
  content: '🔍';
}

.clear-icon::before {
  content: '✕';
}

.filter-options {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.filter-select {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
}

.filter-actions {
  margin-left: auto;
}

/* 行程内容区域 */
.trip-content {
  margin-bottom: 32px;
}

/* 加载状态 */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
  background-color: white;
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
.action-button {
  margin-top: 16px;
}

/* 网格视图 */
.trip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.trip-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.trip-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

/* 行程图片 */
.trip-image-container {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.trip-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.trip-card:hover .trip-image {
  transform: scale(1.05);
}

/* 行程状态标签 */
.trip-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  color: white;
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

/* 行程信息 */
.trip-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.trip-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.trip-destination,
.trip-date {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.location-icon::before {
  content: '📍';
  font-size: 14px;
}

.calendar-icon::before {
  content: '📅';
  font-size: 14px;
}

.trip-duration {
  font-size: 12px;
  color: #999;
}

/* 行程统计 */
.trip-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.stat-icon::before {
  content: '📅';
  font-size: 12px;
}

.activity-icon::before {
  content: '🎯';
  font-size: 12px;
}

/* 操作按钮 */
.trip-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.action-btn {
  flex: 1;
  font-size: 12px;
}

.delete-btn:hover {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

/* 列表视图 */
.trip-table {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  background-color: #fafafa;
}

.table-header th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #333;
  font-size: 14px;
  border-bottom: 1px solid #e8e8e8;
}

.table-body .table-row {
  cursor: pointer;
  transition: background-color 0.3s;
  border-bottom: 1px solid #f0f0f0;
}

.table-body .table-row:hover {
  background-color: #f5f5f5;
}

.table-body td {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
}

/* 表格单元格内容 */
.table-title-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trip-cover-small {
  width: 60px;
  height: 40px;
  border-radius: 4px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.trip-title-text {
  font-weight: 500;
}

.location-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  display: inline-block;
}

/* 表格操作按钮 */
.table-actions {
  display: flex;
  gap: 8px;
}

.view-icon::before { content: '👁️'; }
.edit-icon::before { content: '✏️'; }
.share-icon::before { content: '📤'; }
.delete-icon::before { content: '🗑️'; }

/* 分页控件 */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 16px 0;
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

/* 推荐行程模板 */
.recommendations-section {
  margin-top: 40px;
}

.section-header {
  text-align: center;
  margin-bottom: 32px;
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

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.template-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.template-image-container {
  height: 160px;
  overflow: hidden;
}

.template-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.template-card:hover .template-image {
  transform: scale(1.05);
}

.template-info {
  padding: 16px;
}

.template-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.template-destination {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.template-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trip-list-container {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .action-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .view-options {
    justify-content: center;
  }
  
  .filter-options {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-actions {
    margin-left: 0;
    display: flex;
    justify-content: center;
  }
  
  .trip-grid {
    grid-template-columns: 1fr;
  }
  
  .template-grid {
    grid-template-columns: 1fr;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 16px;
  }
  
  /* 表格响应式 */
  .table {
    display: block;
    overflow-x: auto;
  }
  
  .table-header th,
  .table-body td {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .trip-title-text {
    font-size: 12px;
  }
  
  .trip-cover-small {
    width: 40px;
    height: 30px;
  }
}
</style>