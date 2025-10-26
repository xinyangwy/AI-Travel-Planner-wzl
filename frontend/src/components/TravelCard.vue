<template>
  <div 
    class="travel-card"
    :class="{
      'disabled': disabled,
      'expanded': expanded,
      [statusClass]: !!data.status
    }"
    @click="handleClick"
  >
    <!-- 卡片头部 -->
    <div class="card-header">
      <!-- 标题区域 -->
      <div class="title-section">
        <h3 class="card-title" :title="data.name">{{ truncateText(data.name, 20) }}</h3>
        <div class="status-badge" :class="statusClass">{{ formatStatus(data.status) }}</div>
      </div>
      
      <!-- 操作按钮区域 -->
      <div v-if="showActions" class="actions-section">
        <button 
          v-if="allowEdit" 
          class="action-button edit-button" 
          @click.stop="editTravel"
          title="编辑"
        >
          <i class="edit-icon"></i>
        </button>
        <button 
          v-if="allowDelete" 
          class="action-button delete-button" 
          @click.stop="deleteTravel"
          title="删除"
        >
          <i class="delete-icon"></i>
        </button>
        <button 
          v-if="allowExpand && expanded"
          class="action-button collapse-button" 
          @click.stop="toggleExpand"
          title="收起"
        >
          <i class="collapse-icon"></i>
        </button>
        <button 
          v-if="allowExpand && !expanded"
          class="action-button expand-button" 
          @click.stop="toggleExpand"
          title="展开"
        >
          <i class="expand-icon"></i>
        </button>
      </div>
    </div>

    <!-- 卡片主体 -->
    <div class="card-body">
      <!-- 基本信息 -->
      <div class="basic-info">
        <div class="info-row">
          <i class="location-icon"></i>
          <span class="info-label">目的地:</span>
          <span class="info-value">{{ data.destination || '-' }}</span>
        </div>
        <div class="info-row">
          <i class="date-icon"></i>
          <span class="info-label">日期:</span>
          <span class="info-value">{{ formatDateRange(data.startDate, data.endDate) }}</span>
        </div>
        <div class="info-row">
          <i class="duration-icon"></i>
          <span class="info-label">天数:</span>
          <span class="info-value">{{ calculateDuration(data.startDate, data.endDate) }} 天</span>
        </div>
        <div class="info-row">
          <i class="people-icon"></i>
          <span class="info-label">人数:</span>
          <span class="info-value">{{ data.numberOfTravelers || 1 }} 人</span>
        </div>
        <div class="info-row">
          <i class="budget-icon"></i>
          <span class="info-label">预算:</span>
          <span class="info-value">{{ formatBudget(data.budget) }}</span>
        </div>
      </div>

      <!-- 扩展内容 -->
      <div v-if="expanded" class="expanded-content">
        <!-- 旅行类型 -->
        <div class="info-section">
          <h4 class="section-title">旅行信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-sub-label">旅行类型</span>
              <span class="info-sub-value">{{ formatTravelType(data.type) }}</span>
            </div>
            <div class="info-item">
              <span class="info-sub-label">出发地</span>
              <span class="info-sub-value">{{ data.origin || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-sub-label">交通方式</span>
              <span class="info-sub-value">{{ formatTransportation(data.transportation) }}</span>
            </div>
            <div class="info-item">
              <span class="info-sub-label">住宿类型</span>
              <span class="info-sub-value">{{ formatAccommodation(data.accommodation) }}</span>
            </div>
          </div>
        </div>

        <!-- 行程摘要 -->
        <div v-if="data.itinerary && data.itinerary.length > 0" class="info-section">
          <h4 class="section-title">行程概览</h4>
          <div class="itinerary-summary">
            <div 
              v-for="(day, index) in firstThreeItineraries" 
              :key="index"
              class="itinerary-day"
            >
              <div class="day-header">第 {{ index + 1 }} 天</div>
              <div class="day-activities">
                <div 
                  v-for="(activity, actIndex) in day.activities.slice(0, 2)" 
                  :key="actIndex"
                  class="activity-item"
                >
                  <i class="activity-icon"></i>
                  <span>{{ activity.name || '活动' }}</span>
                </div>
                <div v-if="day.activities.length > 2" class="more-activities">
                  还有 {{ day.activities.length - 2 }} 个活动...
                </div>
              </div>
            </div>
            <div v-if="data.itinerary.length > 3" class="more-days">
              还有 {{ data.itinerary.length - 3 }} 天行程...
            </div>
          </div>
        </div>

        <!-- 费用统计 -->
        <div v-if="expenseStats" class="info-section">
          <h4 class="section-title">费用统计</h4>
          <div class="expense-stats">
            <div class="stat-item">
              <div class="stat-label">总支出</div>
              <div class="stat-value">{{ formatCurrency(expenseStats.total || 0) }}</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-label">日均支出</div>
              <div class="stat-value">{{ formatCurrency(expenseStats.avgDaily || 0) }}</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-label">费用笔数</div>
              <div class="stat-value">{{ expenseStats.count || 0 }}</div>
            </div>
          </div>
        </div>

        <!-- 备注 -->
        <div v-if="data.notes" class="info-section">
          <h4 class="section-title">备注</h4>
          <div class="notes-content" :title="data.notes">
            {{ truncateText(data.notes, 100) }}
          </div>
        </div>
      </div>

      <!-- 底部操作 -->
      <div v-if="expanded" class="card-footer">
        <button 
          class="primary-button" 
          @click.stop="viewDetail"
        >
          查看详情
        </button>
        <button 
          v-if="showExpenseButton" 
          class="secondary-button" 
          @click.stop="viewExpenses"
        >
          查看费用
        </button>
        <button 
          v-if="showItineraryButton" 
          class="secondary-button" 
          @click.stop="viewItinerary"
        >
          查看行程
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { formatCurrency } from '../utils/formatters'
import { TRAVEL_PLAN } from '../constants'

export default {
  name: 'TravelCard',
  
  props: {
    // 旅行计划数据
    data: {
      type: Object,
      default: () => ({})
    },
    // 费用统计数据
    expenseStats: {
      type: Object,
      default: null
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否展开
    expanded: {
      type: Boolean,
      default: false
    },
    // 是否显示操作按钮
    showActions: {
      type: Boolean,
      default: true
    },
    // 是否允许编辑
    allowEdit: {
      type: Boolean,
      default: true
    },
    // 是否允许删除
    allowDelete: {
      type: Boolean,
      default: true
    },
    // 是否允许展开/收起
    allowExpand: {
      type: Boolean,
      default: true
    },
    // 是否显示费用按钮
    showExpenseButton: {
      type: Boolean,
      default: true
    },
    // 是否显示行程按钮
    showItineraryButton: {
      type: Boolean,
      default: true
    }
  },
  
  computed: {
    // 状态样式类
    statusClass() {
      const statusMap = {
        [TRAVEL_PLAN.STATUS.PLANNING]: 'status-planning',
        [TRAVEL_PLAN.STATUS.CONFIRMED]: 'status-confirmed',
        [TRAVEL_PLAN.STATUS.IN_PROGRESS]: 'status-in-progress',
        [TRAVEL_PLAN.STATUS.COMPLETED]: 'status-completed',
        [TRAVEL_PLAN.STATUS.CANCELLED]: 'status-cancelled'
      }
      return statusMap[this.data.status] || 'status-default'
    },
    
    // 获取前三天的行程
    firstThreeItineraries() {
      return this.data.itinerary ? this.data.itinerary.slice(0, 3) : []
    }
  },
  
  methods: {
    // 处理卡片点击
    handleClick() {
      if (this.disabled) return
      if (this.allowExpand) {
        this.toggleExpand()
      } else {
        this.viewDetail()
      }
    },
    
    // 切换展开状态
    toggleExpand() {
      this.$emit('expand', !this.expanded)
    },
    
    // 查看详情
    viewDetail() {
      this.$emit('view', this.data)
    },
    
    // 编辑旅行计划
    editTravel() {
      this.$emit('edit', this.data)
    },
    
    // 删除旅行计划
    deleteTravel() {
      if (confirm('确定要删除这个旅行计划吗？')) {
        this.$emit('delete', this.data.id)
      }
    },
    
    // 查看费用
    viewExpenses() {
      this.$emit('view-expenses', this.data.id)
    },
    
    // 查看行程
    viewItinerary() {
      this.$emit('view-itinerary', this.data.id)
    },
    
    // 格式化状态
    formatStatus(status) {
      const statusMap = {
        [TRAVEL_PLAN.STATUS.PLANNING]: '规划中',
        [TRAVEL_PLAN.STATUS.CONFIRMED]: '已确认',
        [TRAVEL_PLAN.STATUS.IN_PROGRESS]: '进行中',
        [TRAVEL_PLAN.STATUS.COMPLETED]: '已完成',
        [TRAVEL_PLAN.STATUS.CANCELLED]: '已取消'
      }
      return statusMap[status] || '未知'
    },
    
    // 格式化旅行类型
    formatTravelType(type) {
      const typeMap = {
        [TRAVEL_PLAN.TYPE.LEISURE]: '休闲度假',
        [TRAVEL_PLAN.TYPE.BUSINESS]: '商务出差',
        [TRAVEL_PLAN.TYPE.ADVENTURE]: '探险旅行',
        [TRAVEL_PLAN.TYPE.CULTURAL]: '文化体验',
        [TRAVEL_PLAN.TYPE.FAMILY]: '家庭旅行',
        [TRAVEL_PLAN.TYPE.HONEYMOON]: '蜜月旅行',
        [TRAVEL_PLAN.TYPE.BACKPACKING]: '背包客',
        [TRAVEL_PLAN.TYPE.CRUISE]: '邮轮旅行'
      }
      return typeMap[type] || '其他'
    },
    
    // 格式化交通方式
    formatTransportation(transport) {
      const transportMap = {
        'plane': '飞机',
        'train': '火车',
        'car': '汽车',
        'bus': '巴士',
        'ship': '船',
        'bike': '自行车',
        'walk': '步行',
        'other': '其他'
      }
      return transportMap[transport] || transport || '-'  
    },
    
    // 格式化住宿类型
    formatAccommodation(accommodation) {
      const accommodationMap = {
        'hotel': '酒店',
        'hostel': '青旅',
        'apartment': '公寓',
        'homestay': '民宿',
        'camping': '露营',
        'other': '其他'
      }
      return accommodationMap[accommodation] || accommodation || '-'  
    },
    
    // 格式化日期范围
    formatDateRange(startDate, endDate) {
      if (!startDate) return '-'
      
      const start = dayjs(startDate)
      const end = endDate ? dayjs(endDate) : null
      
      if (!end) {
        return start.format('YYYY-MM-DD')
      }
      
      // 如果是同一天
      if (start.isSame(end, 'day')) {
        return start.format('YYYY-MM-DD')
      }
      
      // 如果是同年同月
      if (start.isSame(end, 'month') && start.isSame(end, 'year')) {
        return `${start.format('YYYY-MM-DD')} - ${end.format('DD')}`
      }
      
      // 如果是同年
      if (start.isSame(end, 'year')) {
        return `${start.format('YYYY-MM-DD')} - ${end.format('MM-DD')}`
      }
      
      // 不同年
      return `${start.format('YYYY-MM-DD')} - ${end.format('YYYY-MM-DD')}`
    },
    
    // 计算旅行天数
    calculateDuration(startDate, endDate) {
      if (!startDate) return 0
      
      const start = dayjs(startDate)
      const end = endDate ? dayjs(endDate) : start
      
      return end.diff(start, 'day') + 1
    },
    
    // 格式化预算
    formatBudget(budget) {
      if (!budget || budget === 0) return '未设置'
      return formatCurrency(budget)
    },
    
    // 截断文本
    truncateText(text, maxLength) {
      if (!text || typeof text !== 'string') return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    },
    
    // 获取状态图标
    getStatusIcon(status) {
      const iconMap = {
        [TRAVEL_PLAN.STATUS.PLANNING]: '📝',
        [TRAVEL_PLAN.STATUS.CONFIRMED]: '✅',
        [TRAVEL_PLAN.STATUS.IN_PROGRESS]: '🚗',
        [TRAVEL_PLAN.STATUS.COMPLETED]: '🏁',
        [TRAVEL_PLAN.STATUS.CANCELLED]: '❌'
      }
      return iconMap[status] || '📌'
    },
    
    // 获取状态描述
    getStatusDescription() {
      const now = dayjs()
      const start = this.data.startDate ? dayjs(this.data.startDate) : null
      const end = this.data.endDate ? dayjs(this.data.endDate) : null
      
      if (!start) return ''
      
      // 根据日期和状态提供描述
      if (this.data.status === TRAVEL_PLAN.STATUS.PLANNING) {
        if (start.isAfter(now, 'day')) {
          const days = start.diff(now, 'day')
          return `还有 ${days} 天开始`
        }
      } else if (this.data.status === TRAVEL_PLAN.STATUS.IN_PROGRESS) {
        if (end && end.isAfter(now, 'day')) {
          const days = end.diff(now, 'day')
          return `还有 ${days} 天结束`
        }
      } else if (this.data.status === TRAVEL_PLAN.STATUS.COMPLETED) {
        const days = now.diff(end, 'day')
        return `已结束 ${days} 天`
      }
      
      return ''
    }
  }
}
</script>

<style scoped>
.travel-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background-color: #fff;
  transition: all 0.3s;
  overflow: hidden;
  cursor: pointer;
}

.travel-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.travel-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.travel-card.disabled:hover {
  box-shadow: none;
  transform: none;
}

/* 状态样式 */
.travel-card.status-planning {
  border-left: 4px solid #1890ff;
}

.travel-card.status-confirmed {
  border-left: 4px solid #52c41a;
}

.travel-card.status-in-progress {
  border-left: 4px solid #faad14;
}

.travel-card.status-completed {
  border-left: 4px solid #8c8c8c;
}

.travel-card.status-cancelled {
  border-left: 4px solid #f5222d;
}

/* 卡片头部 */
.card-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-section {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-planning .status-badge {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-confirmed .status-badge {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-in-progress .status-badge {
  background-color: #fff7e6;
  color: #fa8c16;
}

.status-completed .status-badge {
  background-color: #f5f5f5;
  color: #8c8c8c;
}

.status-cancelled .status-badge {
  background-color: #fff1f0;
  color: #f5222d;
}

.actions-section {
  display: flex;
  gap: 4px;
}

.action-button {
  background: transparent;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(0, 0, 0, 0.45);
}

.action-button:hover {
  background-color: #f5f5f5;
  color: rgba(0, 0, 0, 0.65);
}

.edit-button:hover {
  color: #1890ff;
  background-color: #e6f7ff;
}

.delete-button:hover {
  color: #f5222d;
  background-color: #fff1f0;
}

/* 卡片主体 */
.card-body {
  padding: 16px;
}

.basic-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.info-row i {
  color: #999;
  flex-shrink: 0;
}

.info-label {
  color: rgba(0, 0, 0, 0.45);
  min-width: 60px;
}

.info-value {
  color: rgba(0, 0, 0, 0.65);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 扩展内容 */
.expanded-content {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.info-section {
  margin-bottom: 16px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-sub-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.info-sub-value {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
}

/* 行程摘要 */
.itinerary-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.itinerary-day {
  background-color: #fafafa;
  border-radius: 6px;
  padding: 8px 12px;
}

.day-header {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  font-size: 13px;
  margin-bottom: 6px;
}

.day-activities {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
}

.more-activities,
.more-days {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  font-style: italic;
}

/* 费用统计 */
.expense-stats {
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.stat-divider {
  width: 1px;
  background-color: #e8e8e8;
}

/* 备注 */
.notes-content {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.5;
  background-color: #fafafa;
  padding: 8px 12px;
  border-radius: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 底部操作 */
.card-footer {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.primary-button,
.secondary-button {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.primary-button {
  background-color: #1890ff;
  color: white;
}

.primary-button:hover {
  background-color: #40a9ff;
}

.secondary-button {
  background-color: #fff;
  color: rgba(0, 0, 0, 0.65);
  border: 1px solid #d9d9d9;
}

.secondary-button:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

/* 图标样式 */
.location-icon::before { content: '📍'; }
.date-icon::before { content: '📅'; }
.duration-icon::before { content: '⏱️'; }
.people-icon::before { content: '👥'; }
.budget-icon::before { content: '💰'; }
.edit-icon::before { content: '✏️'; }
.delete-icon::before { content: '🗑️'; }
.expand-icon::before { content: '▼'; }
.collapse-icon::before { content: '▲'; }
.activity-icon::before { content: '📍'; }
</style>