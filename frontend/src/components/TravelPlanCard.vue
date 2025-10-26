<template>
  <el-card class="travel-plan-card" :shadow="shadow" @click="handleCardClick">
    <!-- 卡片头部 -->
    <div class="card-header">
      <h3 class="plan-title">{{ plan.title }}</h3>
      <el-tag 
        :class="getStatusClass(plan.status)"
        size="small"
        v-if="showStatus"
      >
        {{ getStatusText(plan.status) }}
      </el-tag>
    </div>
    
    <!-- 旅行元信息 -->
    <div class="plan-meta" v-if="showMeta">
      <div class="meta-row">
        <div class="meta-item">
          <i class="el-icon-map-marker"></i>
          <span>{{ plan.location }}</span>
        </div>
        <div class="meta-item">
          <i class="el-icon-time"></i>
          <span>{{ durationText }}</span>
        </div>
      </div>
      <div class="meta-row">
        <div class="meta-item">
          <i class="el-icon-calendar"></i>
          <span>{{ dateRangeText }}</span>
        </div>
        <div class="meta-item">
          <i class="el-icon-user"></i>
          <span>{{ plan.travelerCount }}人</span>
        </div>
      </div>
    </div>
    
    <!-- 旅行类型 -->
    <div class="plan-type" v-if="showType">
      <el-tag size="small" effect="plain">
        {{ getTravelTypeText(plan.type) }}
      </el-tag>
    </div>
    
    <!-- 旅行描述 -->
    <div class="plan-description" v-if="showDescription && plan.description">
      <p>{{ truncateDescription }}</p>
    </div>
    
    <!-- 预算信息 -->
    <div class="budget-info" v-if="showBudget">
      <div class="budget-header">
        <span>预算</span>
        <span>{{ formatCurrency(plan.budget) }}</span>
      </div>
      <div class="budget-bar">
        <el-progress 
          :percentage="budgetUsagePercentage" 
          :color="getBudgetColor()"
          :show-text="false"
        />
      </div>
      <div class="budget-footer">
        <span>已花费</span>
        <span>{{ formatCurrency(spentAmount) }}</span>
      </div>
    </div>
    
    <!-- 标签 -->
    <div class="plan-tags" v-if="showTags && plan.tags && plan.tags.length > 0">
      <el-tag 
        v-for="tag in plan.tags" 
        :key="tag" 
        size="small" 
        effect="plain"
        class="tag"
      >
        {{ tag }}
      </el-tag>
    </div>
    
    <!-- 操作按钮 -->
    <div class="card-actions" v-if="showActions">
      <slot name="actions">
        <el-button-group>
          <el-button size="small" type="primary" @click.stop="handleEdit">
            编辑
          </el-button>
          <el-button size="small" type="danger" @click.stop="handleDelete">
            删除
          </el-button>
        </el-button-group>
      </slot>
    </div>
    
    <!-- 自定义内容插槽 -->
    <div class="custom-content" v-if="$slots.default">
      <slot></slot>
    </div>
  </el-card>
</template>

<script>
import { 
  formatDate, 
  calculateDays, 
  formatCurrency, 
  getStatusText, 
  getStatusClass, 
  getTravelTypeText,
  calculateBudgetUsage,
  truncateText 
} from '@/utils/helper'

export default {
  name: 'TravelPlanCard',
  props: {
    // 旅行计划数据
    plan: {
      type: Object,
      required: true
    },
    // 已花费金额
    spentAmount: {
      type: Number,
      default: 0
    },
    // 卡片阴影
    shadow: {
      type: String,
      default: 'hover',
      validator: (value) => ['hover', 'always', 'never'].includes(value)
    },
    // 是否显示状态标签
    showStatus: {
      type: Boolean,
      default: true
    },
    // 是否显示元信息（地点、日期等）
    showMeta: {
      type: Boolean,
      default: true
    },
    // 是否显示旅行类型
    showType: {
      type: Boolean,
      default: false
    },
    // 是否显示描述
    showDescription: {
      type: Boolean,
      default: true
    },
    // 是否显示预算信息
    showBudget: {
      type: Boolean,
      default: true
    },
    // 是否显示标签
    showTags: {
      type: Boolean,
      default: true
    },
    // 是否显示操作按钮
    showActions: {
      type: Boolean,
      default: false
    },
    // 描述文本最大长度
    descriptionMaxLength: {
      type: Number,
      default: 100
    },
    // 是否可点击
    clickable: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    // 日期范围文本
    dateRangeText() {
      if (!this.plan.startDate) return ''
      if (!this.plan.endDate || this.plan.startDate === this.plan.endDate) {
        return formatDate(this.plan.startDate)
      }
      return `${formatDate(this.plan.startDate)} - ${formatDate(this.plan.endDate)}`
    },
    
    // 持续时间文本
    durationText() {
      if (!this.plan.startDate || !this.plan.endDate) return ''
      const days = calculateDays(this.plan.startDate, this.plan.endDate)
      return `${days}天`
    },
    
    // 截断后的描述
    truncateDescription() {
      if (!this.plan.description) return ''
      return truncateText(this.plan.description, this.descriptionMaxLength)
    },
    
    // 预算使用率百分比
    budgetUsagePercentage() {
      if (!this.plan.budget || this.plan.budget === 0) return 0
      return calculateBudgetUsage(this.spentAmount, this.plan.budget)
    }
  },
  methods: {
    formatDate,
    calculateDays,
    formatCurrency,
    getStatusText,
    getStatusClass,
    getTravelTypeText,
    calculateBudgetUsage,
    truncateText,
    
    // 获取预算条颜色
    getBudgetColor() {
      const usage = this.budgetUsagePercentage
      if (usage >= 90) return '#F56C6C'
      if (usage >= 70) return '#E6A23C'
      return '#67C23A'
    },
    
    // 处理卡片点击
    handleCardClick() {
      if (!this.clickable) return
      this.$emit('click', this.plan)
    },
    
    // 处理编辑
    handleEdit() {
      this.$emit('edit', this.plan)
    },
    
    // 处理删除
    handleDelete() {
      this.$emit('delete', this.plan)
    }
  }
}
</script>

<style scoped>
.travel-plan-card {
  transition: transform 0.3s ease;
  cursor: pointer;
}

.travel-plan-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.plan-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: 10px;
  color: #303133;
}

.plan-meta {
  margin-bottom: 15px;
  font-size: 14px;
  color: #606266;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 5px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.plan-type {
  margin-bottom: 10px;
}

.plan-description {
  margin-bottom: 15px;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.budget-info {
  margin-bottom: 15px;
}

.budget-header,
.budget-footer {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 5px;
}

.budget-bar {
  margin-bottom: 5px;
}

.plan-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.card-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.custom-content {
  margin-top: 15px;
}

/* 状态标签样式 */
.status-planned {
  background-color: #e6f7ff;
  color: #1890ff;
  border-color: #91d5ff;
}

.status-ongoing {
  background-color: #fff7e6;
  color: #fa8c16;
  border-color: #ffc069;
}

.status-completed {
  background-color: #f6ffed;
  color: #52c41a;
  border-color: #b7eb8f;
}

.status-cancelled {
  background-color: #fff1f0;
  color: #ff4d4f;
  border-color: #ffa39e;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .meta-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .plan-title {
    white-space: normal;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    display: -webkit-box;
  }
  
  .card-actions {
    flex-direction: column;
    gap: 8px;
  }
}
</style>