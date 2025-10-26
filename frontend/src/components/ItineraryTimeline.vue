<template>
  <div class="itinerary-timeline-container">
    <!-- 按日期分组的行程列表 -->
    <div v-if="groupedItinerary && groupedItinerary.length > 0" class="timeline-dates">
      <div 
        v-for="dateGroup in groupedItinerary" 
        :key="dateGroup.date"
        class="timeline-date-group"
      >
        <!-- 日期标题 -->
        <div class="date-header">
          <el-divider :content-position="'left'">
            <div class="date-title">
              <el-icon class="date-icon"><Calendar /></el-icon>
              <span>{{ dateGroup.formattedDate }}</span>
              <span v-if="dateGroup.dayOfWeek" class="day-of-week">{{ dateGroup.dayOfWeek }}</span>
              <span v-if="isToday(dateGroup.date)" class="today-badge">今天</span>
            </div>
          </el-divider>
        </div>
        
        <!-- 行程时间轴 -->
        <div class="timeline">
          <div 
            v-for="(item, index) in dateGroup.items" 
            :key="item.id || index"
            class="timeline-item"
            :class="{ 'is-active': isActiveItem(item) }"
          >
            <!-- 时间线圆点 -->
            <div class="timeline-node">
              <el-icon class="node-icon" :class="getNodeIconClass(item.type)">
                <component :is="getNodeIcon(item.type)" />
              </el-icon>
            </div>
            
            <!-- 时间线内容 -->
            <div class="timeline-content">
              <!-- 时间信息 -->
              <div class="time-info">
                <span class="time-range">{{ formatTimeRange(item.startTime, item.endTime) }}</span>
                <el-tag 
                  v-if="item.type" 
                  size="small" 
                  :effect="'plain'"
                  :type="getTypeTagType(item.type)"
                  class="type-tag"
                >
                  {{ formatItineraryType(item.type) }}
                </el-tag>
              </div>
              
              <!-- 行程卡片 -->
              <el-card shadow="hover" class="itinerary-card" @click="handleItemClick(item)">
                <!-- 行程标题和地点 -->
                <div class="itinerary-header">
                  <h3 class="itinerary-title">{{ item.title }}</h3>
                  <div v-if="item.location" class="location-info">
                    <el-icon class="location-icon"><Position /></el-icon>
                    <span class="location-name">{{ item.location }}</span>
                  </div>
                </div>
                
                <!-- 详细地址 -->
                <div v-if="item.address" class="address-info">
                  <el-icon class="address-icon"><HomeFilled /></el-icon>
                  <span class="address-text">{{ item.address }}</span>
                </div>
                
                <!-- 预计费用 -->
                <div v-if="item.cost !== null && item.cost !== undefined" class="cost-info">
                  <el-icon class="cost-icon"><Wallet /></el-icon>
                  <span class="cost-text">预计费用：¥{{ item.cost }}</span>
                </div>
                
                <!-- 详细描述 -->
                <div v-if="item.description" class="description-info">
                  <p class="description-text">{{ truncateText(item.description, 100) }}</p>
                </div>
                
                <!-- 备注 -->
                <div v-if="item.note" class="note-info">
                  <el-icon class="note-icon"><ChatDotRound /></el-icon>
                  <span class="note-text">{{ truncateText(item.note, 50) }}</span>
                </div>
                
                <!-- 操作按钮 -->
                <div v-if="showActions" class="itinerary-actions">
                  <el-button 
                    v-if="editable" 
                    size="small" 
                    type="primary" 
                    text 
                    @click.stop="handleEditClick(item)"
                  >
                    编辑
                  </el-button>
                  <el-button 
                    v-if="editable" 
                    size="small" 
                    type="danger" 
                    text 
                    @click.stop="handleDeleteClick(item)"
                  >
                    删除
                  </el-button>
                  <el-button 
                    v-if="!editable" 
                    size="small" 
                    type="primary" 
                    text 
                    @click.stop="handleViewDetails(item)"
                  >
                    详情
                  </el-button>
                </div>
              </el-card>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty description="暂无行程安排">
        <el-button type="primary" @click="$emit('add-first-item')">添加第一个行程项</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script>
import { Calendar, Position, HomeFilled, Wallet, ChatDotRound, Car, Hotel, Coffee, Navigation, ShoppingBag, VideoPlay, Ticket, Timer } from '@element-plus/icons-vue'
import { dateFormatter, enumFormatter, textFormatter, arrayUtils } from '../utils/formatters'

export default {
  name: 'ItineraryTimeline',
  components: {
    Calendar,
    Position,
    HomeFilled,
    Wallet,
    ChatDotRound,
    Car,
    Hotel,
    Coffee,
    Navigation,
    ShoppingBag,
    VideoPlay,
    Ticket,
    Timer
  },
  props: {
    // 行程项列表
    itineraryItems: {
      type: Array,
      default: () => []
    },
    // 是否可编辑
    editable: {
      type: Boolean,
      default: false
    },
    // 是否显示操作按钮
    showActions: {
      type: Boolean,
      default: true
    },
    // 当前选中的行程项ID
    activeItemId: {
      type: [Number, String],
      default: null
    }
  },
  computed: {
    // 按日期分组的行程数据
    groupedItinerary() {
      const grouped = arrayUtils.groupItineraryByDate(this.itineraryItems)
      
      // 为每个日期组添加星期信息
      return grouped.map(group => ({
        ...group,
        dayOfWeek: this.getDayOfWeek(group.date)
      }))
    }
  },
  methods: {
    // 检查行程项是否为当前活动项
    isActiveItem(item) {
      return this.activeItemId && item.id === this.activeItemId
    },
    
    // 格式化时间范围
    formatTimeRange(startTime, endTime) {
      if (!startTime) return '时间待定'
      return endTime ? `${startTime} - ${endTime}` : `${startTime} 开始`
    },
    
    // 格式化行程类型
    formatItineraryType(type) {
      return enumFormatter.formatItineraryType(type)
    },
    
    // 获取类型标签类型
    getTypeTagType(type) {
      const typeMap = {
        'TRANSPORTATION': 'info',
        'ACCOMMODATION': 'primary',
        'FOOD': 'success',
        'ATTRACTION': 'warning',
        'SHOPPING': 'danger',
        'ENTERTAINMENT': 'info',
        'REST': 'primary',
        'OTHER': 'info'
      }
      
      return typeMap[type] || 'info'
    },
    
    // 获取节点图标
    getNodeIcon(type) {
      const iconMap = {
        'TRANSPORTATION': Car,
        'ACCOMMODATION': Hotel,
        'FOOD': Coffee,
        'ATTRACTION': Navigation,
        'SHOPPING': ShoppingBag,
        'ENTERTAINMENT': VideoPlay,
        'REST': Timer,
        'OTHER': Ticket
      }
      
      return iconMap[type] || Ticket
    },
    
    // 获取节点图标样式类
    getNodeIconClass(type) {
      const classMap = {
        'TRANSPORTATION': 'icon-info',
        'ACCOMMODATION': 'icon-primary',
        'FOOD': 'icon-success',
        'ATTRACTION': 'icon-warning',
        'SHOPPING': 'icon-danger',
        'ENTERTAINMENT': 'icon-info',
        'REST': 'icon-primary',
        'OTHER': 'icon-info'
      }
      
      return classMap[type] || 'icon-info'
    },
    
    // 判断是否为今天
    isToday(date) {
      return dateFormatter.isToday(date)
    },
    
    // 获取星期几
    getDayOfWeek(date) {
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const dayIndex = new Date(date).getDay()
      return days[dayIndex]
    },
    
    // 截断文本
    truncateText(text, maxLength = 50) {
      return textFormatter.truncateText(text, maxLength)
    },
    
    // 处理行程项点击
    handleItemClick(item) {
      this.$emit('item-click', item)
    },
    
    // 处理编辑点击
    handleEditClick(item) {
      this.$emit('edit-click', item)
    },
    
    // 处理删除点击
    handleDeleteClick(item) {
      this.$emit('delete-click', item)
    },
    
    // 处理查看详情
    handleViewDetails(item) {
      this.$emit('view-details', item)
    }
  }
}
</script>

<style scoped>
.itinerary-timeline-container {
  width: 100%;
}

/* 按日期分组样式 */
.timeline-dates {
  width: 100%;
}

.timeline-date-group {
  margin-bottom: 30px;
}

/* 日期标题样式 */
.date-header {
  margin-bottom: 20px;
}

.date-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.date-icon {
  margin-right: 8px;
  color: #409eff;
}

.day-of-week {
  margin-left: 10px;
  font-size: 14px;
  color: #606266;
  font-weight: normal;
}

.today-badge {
  margin-left: 10px;
  padding: 2px 8px;
  background-color: #f0f9eb;
  color: #67c23a;
  border-radius: 10px;
  font-size: 12px;
  font-weight: normal;
}

/* 时间轴样式 */
.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline-item {
  position: relative;
  padding-bottom: 25px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -18px;
  top: 24px;
  bottom: 0;
  width: 2px;
  background-color: #e0e0e0;
}

.timeline-item:last-child::before {
  display: none;
}

.timeline-item.is-active .timeline-node {
  background-color: #409eff;
  box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2);
}

/* 时间线节点样式 */
.timeline-node {
  position: absolute;
  left: -30px;
  top: 4px;
  width: 24px;
  height: 24px;
  background-color: #fff;
  border: 2px solid #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: all 0.3s;
}

.node-icon {
  font-size: 14px;
}

.icon-info { color: #409eff; }
.icon-primary { color: #409eff; }
.icon-success { color: #67c23a; }
.icon-warning { color: #e6a23c; }
.icon-danger { color: #f56c6c; }

/* 时间线内容样式 */
.timeline-content {
  margin-left: 10px;
}

.time-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.time-range {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-right: 10px;
}

.type-tag {
  margin-right: 0;
}

/* 行程卡片样式 */
.itinerary-card {
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 8px;
}

.itinerary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 行程头部样式 */
.itinerary-header {
  margin-bottom: 12px;
}

.itinerary-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.location-info,
.address-info,
.cost-info,
.note-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.location-icon,
.address-icon,
.cost-icon,
.note-icon {
  margin-right: 5px;
  color: #909399;
}

.address-info,
.note-info {
  color: #909399;
}

.description-info {
  margin-bottom: 12px;
}

.description-text {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

/* 操作按钮样式 */
.itinerary-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

/* 空状态样式 */
.empty-state {
  padding: 40px 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .timeline {
    padding-left: 25px;
  }
  
  .timeline-node {
    left: -25px;
    width: 20px;
    height: 20px;
  }
  
  .timeline-item::before {
    left: -15px;
  }
  
  .node-icon {
    font-size: 12px;
  }
  
  .timeline-content {
    margin-left: 8px;
  }
  
  .date-title {
    font-size: 14px;
  }
  
  .itinerary-title {
    font-size: 15px;
  }
}
</style>