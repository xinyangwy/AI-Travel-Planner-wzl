<template>
  <div 
    class="plan-card"
    :class="{
      'plan-card-compact': compact,
      'plan-card-active': isActive,
      'plan-card-pinned': plan.pinned
    }"
  >
    <!-- TripAdvisor风格的卡片顶部渐变装饰 -->
    <div class="plan-card-accent" v-if="!compact"></div>
    <!-- 卡片头部 -->
    <div class="plan-card-header">
      <div class="plan-card-title-row">
        <h3 class="plan-card-title">
          <router-link 
            :to="`/plans/${plan.id}`" 
            :title="plan.name"
            class="plan-card-title-link"
          >
            {{ plan.name }}
          </router-link>
        </h3>
        <div class="plan-card-actions">
          <button 
            v-if="showPinButton"
            class="plan-card-action-btn"
            :class="{ 'active': plan.pinned }"
            @click="togglePin"
            :title="plan.pinned ? '取消固定' : '固定计划'"
          >
            <i :class="plan.pinned ? 'fas fa-thumbtack' : 'far fa-thumbtack'"></i>
          </button>
          <div class="plan-card-more-actions" v-if="showActions">
            <button 
              class="plan-card-action-btn"
              @click="showActionMenu = !showActionMenu"
              title="更多操作"
            >
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <div v-if="showActionMenu" class="plan-card-action-menu">
              <button 
                class="plan-card-action-item"
                @click="editPlan"
              >
                <i class="fas fa-edit"></i>
                <span>编辑计划</span>
              </button>
              <button 
                class="plan-card-action-item"
                @click="duplicatePlan"
              >
                <i class="fas fa-copy"></i>
                <span>复制计划</span>
              </button>
              <button 
                class="plan-card-action-item"
                @click="sharePlan"
              >
                <i class="fas fa-share-alt"></i>
                <span>分享计划</span>
              </button>
              <div class="plan-card-action-divider"></div>
              <button 
                class="plan-card-action-item danger"
                @click="deletePlan"
              >
                <i class="fas fa-trash"></i>
                <span>删除计划</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="plan-card-meta">
        <span class="plan-card-date">
          <i class="far fa-calendar-alt"></i>
          {{ formatDateRange(plan.startDate, plan.endDate) }}
        </span>
        <span class="plan-card-location" v-if="plan.destination">
          <i class="fas fa-map-marker-alt"></i>
          {{ plan.destination }}
        </span>
        <span class="plan-card-status" :class="`status-${plan.status}`">
          {{ getStatusText(plan.status) }}
        </span>
      </div>
    </div>

    <!-- 卡片内容 -->
    <div class="plan-card-body" v-if="!compact">
      <!-- 计划描述 -->
      <div class="plan-card-description" v-if="plan.description">
        <p>{{ truncateText(plan.description, 100) }}</p>
      </div>

      <!-- 计划统计 -->
      <div class="plan-card-stats">
        <div class="plan-card-stat-item">
          <i class="fas fa-route"></i>
          <span>{{ plan.itineraryCount || 0 }} 个行程</span>
        </div>
        <div class="plan-card-stat-item">
          <i class="fas fa-users"></i>
          <span>{{ plan.travelers || 1 }} 位旅行者</span>
        </div>
        <div class="plan-card-stat-item">
          <i class="fas fa-money-bill-wave"></i>
          <span>
            ¥{{ formatCurrency(plan.budget || 0) }}
            <span class="plan-card-stat-unit">预算</span>
          </span>
        </div>
      </div>

      <!-- 标签 -->
      <div class="plan-card-tags" v-if="plan.tags && plan.tags.length > 0">
        <span 
          v-for="tag in plan.tags" 
          :key="tag"
          class="plan-card-tag"
          @click="filterByTag(tag)"
        >
          #{{ tag }}
        </span>
      </div>
    </div>

    <!-- 卡片底部 -->
    <div class="plan-card-footer" v-if="!compact">
      <div class="plan-card-created-by" v-if="plan.createdBy">
        <img 
          v-if="plan.createdBy.avatar" 
          :src="plan.createdBy.avatar" 
          :alt="plan.createdBy.username"
          class="plan-card-user-avatar"
        />
        <div v-else class="plan-card-user-avatar-placeholder">
          {{ getInitials(plan.createdBy.username) }}
        </div>
        <span>{{ plan.createdBy.username }}</span>
      </div>
      <div class="plan-card-update-time">
        更新于 {{ formatRelativeTime(plan.updatedAt) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlanCard',
  
  props: {
    // 旅行计划数据
    plan: {
      type: Object,
      required: true
    },
    
    // 是否紧凑模式
    compact: {
      type: Boolean,
      default: false
    },
    
    // 是否显示操作按钮
    showActions: {
      type: Boolean,
      default: true
    },
    
    // 是否显示固定按钮
    showPinButton: {
      type: Boolean,
      default: true
    },
    
    // 是否为当前激活的计划
    isActive: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      // 是否显示操作菜单
      showActionMenu: false
    }
  },
  
  mounted() {
    // 监听点击外部关闭操作菜单
    document.addEventListener('click', this.handleClickOutside)
  },
  
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  
  methods: {
    /**
     * 处理点击外部事件
     */
    handleClickOutside(event) {
      if (this.showActionMenu && !this.$el.contains(event.target)) {
        this.showActionMenu = false
      }
    },
    
    /**
     * 切换计划固定状态
     */
    togglePin() {
      this.$emit('toggle-pin', this.plan.id)
    },
    
    /**
     * 编辑计划
     */
    editPlan() {
      this.showActionMenu = false
      this.$emit('edit', this.plan.id)
    },
    
    /**
     * 复制计划
     */
    duplicatePlan() {
      this.showActionMenu = false
      this.$emit('duplicate', this.plan.id)
    },
    
    /**
     * 分享计划
     */
    sharePlan() {
      this.showActionMenu = false
      this.$emit('share', this.plan.id)
    },
    
    /**
     * 删除计划
     */
    deletePlan() {
      this.showActionMenu = false
      this.$emit('delete', this.plan.id)
    },
    
    /**
     * 按标签筛选
     */
    filterByTag(tag) {
      this.$emit('filter-by-tag', tag)
    },
    
    /**
     * 格式化日期范围
     */
    formatDateRange(startDate, endDate) {
      if (!startDate) return ''
      
      const start = new Date(startDate)
      const end = endDate ? new Date(endDate) : start
      
      // 计算天数
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
      
      const formatOptions = {
        month: '2-digit',
        day: '2-digit'
      }
      
      const startStr = start.toLocaleDateString('zh-CN', formatOptions)
      const endStr = end.toLocaleDateString('zh-CN', formatOptions)
      
      if (startStr === endStr) {
        return `${startStr} (1天)`
      } else {
        return `${startStr} - ${endStr} (${days}天)`
      }
    },
    
    /**
     * 获取状态文本
     */
    getStatusText(status) {
      const statusMap = {
        'draft': '草稿',
        'scheduled': '已计划',
        'in_progress': '进行中',
        'completed': '已完成',
        'cancelled': '已取消'
      }
      
      return statusMap[status] || '未知'
    },
    
    /**
     * 截断文本
     */
    truncateText(text, maxLength) {
      if (!text || text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    },
    
    /**
     * 格式化货币
     */
    formatCurrency(amount) {
      if (typeof amount !== 'number') return '0'
      return amount.toLocaleString('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
    },
    
    /**
     * 获取用户姓名首字母
     */
    getInitials(name) {
      if (!name) return '?'
      return name.charAt(0).toUpperCase()
    },
    
    /**
     * 格式化相对时间
     */
    formatRelativeTime(timestamp) {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMins < 1) return '刚刚'
      if (diffMins < 60) return `${diffMins}分钟前`
      if (diffHours < 24) return `${diffHours}小时前`
      if (diffDays < 7) return `${diffDays}天前`
      
      // 超过7天显示具体日期
      return date.toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style scoped>
/* TripAdvisor风格的旅行计划卡片 */
.plan-card {
  background-color: #fff;
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-light);
  padding: var(--spacing-xl);
  transition: var(--transition-slow);
  border: 1px solid var(--border-light);
  position: relative;
  overflow: hidden;
  min-height: 280px;
  display: flex;
  flex-direction: column;
}

.plan-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-4px);
  border-color: var(--border-base);
}

.plan-card-compact {
  padding: var(--spacing-md);
  min-height: auto;
}

.plan-card-active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color), var(--shadow-base);
}

.plan-card-pinned {
  border-left: 4px solid var(--primary-color);
}

/* 卡片顶部渐变装饰条 */
.plan-card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), #00c8a0);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.plan-card:hover .plan-card-accent {
  opacity: 1;
}

.plan-card-header {
  margin-bottom: var(--spacing-lg);
  position: relative;
}

.plan-card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.plan-card-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  flex: 1;
}

.plan-card-title-link {
  color: var(--text-primary);
  text-decoration: none;
  transition: color 0.2s ease;
  display: block;
}

.plan-card-title-link:hover {
  color: var(--primary-color);
}

.plan-card-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-left: var(--spacing-md);
}

.plan-card-action-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 6px;
  border-radius: var(--border-radius-small);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plan-card-action-btn:hover {
  background-color: var(--bg-light);
  color: var(--primary-color);
}

.plan-card-action-btn.active {
  color: var(--primary-color);
}

.plan-card-more-actions {
  position: relative;
}

.plan-card-action-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: var(--border-radius-small);
  box-shadow: var(--shadow-base);
  padding: 8px 0;
  min-width: 180px;
  z-index: 100;
  border: 1px solid var(--border-base);
}

.plan-card-action-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
}

.plan-card-action-item:hover {
  background-color: var(--bg-light);
}

.plan-card-action-item.danger {
  color: var(--danger-color);
}

.plan-card-action-item.danger:hover {
  background-color: #fef0f0;
}

.plan-card-action-divider {
  height: 1px;
  background-color: var(--border-base);
  margin: 4px 0;
}

.plan-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  font-size: 14px;
  color: var(--text-secondary);
}

.plan-card-date, .plan-card-location, .plan-card-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.plan-card-status {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: var(--bg-light);
}

.status-draft {
  color: var(--info-color); 
  background-color: #ecf5ff;
}
.status-scheduled {
  color: var(--success-color); 
  background-color: #f0f9f7;
}
.status-in_progress {
  color: var(--primary-color); 
  background-color: #fff7e6;
}
.status-completed {
  color: var(--primary-color); 
  background-color: #f0f9f7;
}
.status-cancelled {
  color: var(--danger-color); 
  background-color: #fef0f0;
}

.plan-card-body {
  margin-top: var(--spacing-md);
  flex: 1;
}

.plan-card-description {
  margin-bottom: var(--spacing-lg);
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-regular);
}

.plan-card-stats {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--bg-light);
  border-radius: var(--border-radius-small);
}

.plan-card-stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.plan-card-stat-unit {
  font-size: 12px;
  opacity: 0.8;
}

.plan-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.plan-card-tag {
  background-color: var(--primary-light);
  color: var(--primary-color);
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: var(--transition-base);
  font-weight: 500;
}

.plan-card-tag:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-1px);
}

.plan-card-footer {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-lighter);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--text-secondary);
}

.plan-card-created-by {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.plan-card-user-avatar, .plan-card-user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  transition: transform 0.2s ease;
}

.plan-card-user-avatar {
  object-fit: cover;
}

.plan-card-user-avatar:hover, .plan-card-user-avatar-placeholder:hover {
  transform: scale(1.05);
}

.plan-card-user-avatar-placeholder {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.plan-card-update-time {
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .plan-card {
    padding: 12px;
    min-height: auto;
  }
  
  .plan-card-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .plan-card-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}
</style>