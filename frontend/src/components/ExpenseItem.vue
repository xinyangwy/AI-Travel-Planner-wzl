<template>
  <div 
    class="expense-item"
    :class="{
      'disabled': disabled,
      'selected': selected,
      [categoryClass]: !!expense.category
    }"
    @click="handleClick"
  >
    <!-- 左侧：图标和分类 -->
    <div class="left-section">
      <div class="category-icon" :class="categoryClass">
        {{ getCategoryIcon(expense.category) }}
      </div>
      <div class="category-info">
        <h4 class="expense-name" :title="expense.name">{{ truncateText(expense.name, 25) }}</h4>
        <div class="expense-meta">
          <span class="category-label">{{ formatCategory(expense.category) }}</span>
          <span class="payment-method-label" v-if="expense.paymentMethod">
            {{ formatPaymentMethod(expense.paymentMethod) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 中间：日期和备注 -->
    <div class="middle-section">
      <div class="date-info">
        <div class="date-value">{{ formatDate(expense.date) }}</div>
        <div class="time-value" v-if="showTime">{{ formatTime(expense.date) }}</div>
      </div>
      <div v-if="expense.notes" class="notes-preview" :title="expense.notes">
        {{ truncateText(expense.notes, 30) }}
      </div>
    </div>

    <!-- 右侧：金额和操作 -->
    <div class="right-section">
      <!-- 金额区域 -->
      <div class="amount-section">
        <div class="amount-value" :class="{ 'refunded': expense.isRefunded }">
          {{ formatAmount(expense.amount) }}
        </div>
        <div class="currency-label">{{ expense.currency || '¥' }}</div>
      </div>

      <!-- 操作按钮区域 -->
      <div v-if="showActions" class="actions-section">
        <button 
          v-if="allowEdit" 
          class="action-button edit-button" 
          @click.stop="editExpense"
          title="编辑"
        >
          <i class="edit-icon"></i>
        </button>
        <button 
          v-if="allowDelete" 
          class="action-button delete-button" 
          @click.stop="deleteExpense"
          title="删除"
        >
          <i class="delete-icon"></i>
        </button>
        <button 
          v-if="allowDuplicate" 
          class="action-button duplicate-button" 
          @click.stop="duplicateExpense"
          title="复制"
        >
          <i class="duplicate-icon"></i>
        </button>
        <button 
          v-if="allowAttachment && expense.receiptUrl" 
          class="action-button receipt-button" 
          @click.stop="viewReceipt"
          title="查看收据"
        >
          <i class="receipt-icon"></i>
        </button>
        <button 
          v-if="allowSelect" 
          class="action-button select-button" 
          @click.stop="toggleSelect"
          title="选择"
        >
          <i class="select-icon" :class="{ 'selected': selected }"></i>
        </button>
      </div>
    </div>

    <!-- 退款标记 -->
    <div v-if="expense.isRefunded" class="refunded-badge">
      已退款
    </div>

    <!-- 标签 -->
    <div v-if="showTags && expense.tags && expense.tags.length > 0" class="tags-section">
      <span 
        v-for="(tag, index) in displayTags" 
        :key="index"
        class="tag-item"
        :title="tag"
      >
        {{ tag }}
      </span>
      <span v-if="hasMoreTags" class="more-tags">+{{ expense.tags.length - maxTags }}</span>
    </div>

    <!-- 位置信息 -->
    <div v-if="showLocation && expense.location" class="location-section">
      <i class="location-icon"></i>
      <span class="location-text" :title="expense.location">{{ truncateText(expense.location, 20) }}</span>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { formatCurrency } from '../utils/formatters'
import { EXPENSE } from '../constants'

export default {
  name: 'ExpenseItem',
  
  props: {
    // 费用数据
    expense: {
      type: Object,
      required: true,
      default: () => ({})
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否选中
    selected: {
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
    // 是否允许复制
    allowDuplicate: {
      type: Boolean,
      default: false
    },
    // 是否允许查看收据
    allowAttachment: {
      type: Boolean,
      default: true
    },
    // 是否允许选择
    allowSelect: {
      type: Boolean,
      default: false
    },
    // 是否显示时间
    showTime: {
      type: Boolean,
      default: false
    },
    // 是否显示标签
    showTags: {
      type: Boolean,
      default: true
    },
    // 是否显示位置
    showLocation: {
      type: Boolean,
      default: true
    },
    // 最大显示标签数量
    maxTags: {
      type: Number,
      default: 3
    }
  },
  
  computed: {
    // 分类样式类
    categoryClass() {
      const categoryMap = {
        [EXPENSE.CATEGORY.TRANSPORTATION]: 'category-transport',
        [EXPENSE.CATEGORY.ACCOMMODATION]: 'category-accommodation',
        [EXPENSE.CATEGORY.FOOD]: 'category-food',
        [EXPENSE.CATEGORY.ACTIVITY]: 'category-activity',
        [EXPENSE.CATEGORY.SHOPPING]: 'category-shopping',
        [EXPENSE.CATEGORY.MEDICAL]: 'category-medical',
        [EXPENSE.CATEGORY.COMMUNICATION]: 'category-communication',
        [EXPENSE.CATEGORY.OTHER]: 'category-other'
      }
      return categoryMap[this.expense.category] || 'category-default'
    },
    
    // 显示的标签
    displayTags() {
      return this.expense.tags ? this.expense.tags.slice(0, this.maxTags) : []
    },
    
    // 是否有更多标签
    hasMoreTags() {
      return this.expense.tags && this.expense.tags.length > this.maxTags
    }
  },
  
  methods: {
    // 处理点击事件
    handleClick() {
      if (this.disabled) return
      
      if (this.allowSelect) {
        this.toggleSelect()
      } else {
        this.$emit('click', this.expense)
      }
    },
    
    // 切换选择状态
    toggleSelect() {
      this.$emit('select', !this.selected, this.expense.id)
    },
    
    // 编辑费用
    editExpense() {
      this.$emit('edit', this.expense)
    },
    
    // 删除费用
    deleteExpense() {
      if (confirm('确定要删除这条费用记录吗？')) {
        this.$emit('delete', this.expense.id)
      }
    },
    
    // 复制费用
    duplicateExpense() {
      this.$emit('duplicate', this.expense)
    },
    
    // 查看收据
    viewReceipt() {
      if (this.expense.receiptUrl) {
        this.$emit('view-receipt', this.expense.receiptUrl)
      }
    },
    
    // 格式化分类
    formatCategory(category) {
      const categoryMap = {
        [EXPENSE.CATEGORY.TRANSPORTATION]: '交通',
        [EXPENSE.CATEGORY.ACCOMMODATION]: '住宿',
        [EXPENSE.CATEGORY.FOOD]: '餐饮',
        [EXPENSE.CATEGORY.ACTIVITY]: '活动',
        [EXPENSE.CATEGORY.SHOPPING]: '购物',
        [EXPENSE.CATEGORY.MEDICAL]: '医疗',
        [EXPENSE.CATEGORY.COMMUNICATION]: '通讯',
        [EXPENSE.CATEGORY.OTHER]: '其他'
      }
      return categoryMap[category] || '未分类'
    },
    
    // 格式化支付方式
    formatPaymentMethod(method) {
      const methodMap = {
        'cash': '现金',
        'credit_card': '信用卡',
        'debit_card': '借记卡',
        'alipay': '支付宝',
        'wechat': '微信支付',
        'paypal': 'PayPal',
        'bank_transfer': '银行转账',
        'other': '其他'
      }
      return methodMap[method] || method || ''
    },
    
    // 格式化日期
    formatDate(date) {
      if (!date) return '-'  
      return dayjs(date).format('YYYY-MM-DD')
    },
    
    // 格式化时间
    formatTime(date) {
      if (!date) return ''  
      return dayjs(date).format('HH:mm')
    },
    
    // 格式化金额
    formatAmount(amount) {
      if (amount === undefined || amount === null) return '0.00'
      return formatCurrency(amount, false)
    },
    
    // 截断文本
    truncateText(text, maxLength) {
      if (!text || typeof text !== 'string') return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    },
    
    // 获取分类图标
    getCategoryIcon(category) {
      const iconMap = {
        [EXPENSE.CATEGORY.TRANSPORTATION]: '🚗',
        [EXPENSE.CATEGORY.ACCOMMODATION]: '🏨',
        [EXPENSE.CATEGORY.FOOD]: '🍽️',
        [EXPENSE.CATEGORY.ACTIVITY]: '🎯',
        [EXPENSE.CATEGORY.SHOPPING]: '🛍️',
        [EXPENSE.CATEGORY.MEDICAL]: '🏥',
        [EXPENSE.CATEGORY.COMMUNICATION]: '📱',
        [EXPENSE.CATEGORY.OTHER]: '📝'
      }
      return iconMap[category] || '💰'
    },
    
    // 获取费用状态描述
    getExpenseStatus() {
      if (this.expense.isRefunded) {
        return '已退款'
      }
      
      // 计算费用记录天数
      const days = dayjs().diff(dayjs(this.expense.date), 'day')
      if (days === 0) {
        return '今天'
      } else if (days === 1) {
        return '昨天'
      } else if (days <= 7) {
        return `${days} 天前`
      } else if (days <= 30) {
        return `${Math.floor(days / 7)} 周前`
      } else {
        return `${Math.floor(days / 30)} 个月前`
      }
    }
  }
}
</script>

<style scoped>
.expense-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background-color: #fff;
  transition: all 0.3s;
  position: relative;
  cursor: pointer;
  gap: 16px;
}

.expense-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  transform: translateY(-1px);
}

.expense-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.expense-item.disabled:hover {
  box-shadow: none;
  transform: none;
}

.expense-item.selected {
  border-color: #1890ff;
  background-color: #e6f7ff;
}

/* 分类样式 */
.expense-item.category-transport .category-icon {
  background-color: #e6f7ff;
  color: #1890ff;
}

.expense-item.category-accommodation .category-icon {
  background-color: #f6ffed;
  color: #52c41a;
}

.expense-item.category-food .category-icon {
  background-color: #fff7e6;
  color: #fa8c16;
}

.expense-item.category-activity .category-icon {
  background-color: #f9f0ff;
  color: #722ed1;
}

.expense-item.category-shopping .category-icon {
  background-color: #fff0f6;
  color: #eb2f96;
}

.expense-item.category-medical .category-icon {
  background-color: #fff1f0;
  color: #f5222d;
}

.expense-item.category-communication .category-icon {
  background-color: #e6fffb;
  color: #13c2c2;
}

.expense-item.category-other .category-icon {
  background-color: #f5f5f5;
  color: #8c8c8c;
}

/* 左侧区域 */
.left-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.expense-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expense-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-label,
.payment-method-label {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 2px;
  background-color: #f5f5f5;
  color: rgba(0, 0, 0, 0.45);
}

/* 中间区域 */
.middle-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
}

.date-info {
  text-align: center;
}

.date-value {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.65);
}

.time-value {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.notes-preview {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 右侧区域 */
.right-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex: 0 0 auto;
}

.amount-section {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.amount-value {
  font-size: 18px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  transition: color 0.3s;
}

.amount-value.refunded {
  color: #f5222d;
  text-decoration: line-through;
}

.currency-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
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
  font-size: 12px;
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

.duplicate-button:hover {
  color: #52c41a;
  background-color: #f6ffed;
}

.receipt-button:hover {
  color: #fa8c16;
  background-color: #fff7e6;
}

/* 退款标记 */
.refunded-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 6px;
  background-color: #fff1f0;
  color: #f5222d;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

/* 标签区域 */
.tags-section {
  position: absolute;
  bottom: 8px;
  left: 68px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  max-width: calc(100% - 140px);
}

.tag-item {
  padding: 1px 4px;
  background-color: #e6f7ff;
  color: #1890ff;
  border-radius: 2px;
  font-size: 10px;
  white-space: nowrap;
}

.more-tags {
  padding: 1px 4px;
  background-color: #f5f5f5;
  color: rgba(0, 0, 0, 0.45);
  border-radius: 2px;
  font-size: 10px;
}

/* 位置信息 */
.location-section {
  position: absolute;
  bottom: 8px;
  right: 100px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.location-section i {
  color: rgba(0, 0, 0, 0.45);
  font-size: 10px;
}

.location-text {
  font-size: 10px;
  color: rgba(0, 0, 0, 0.45);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 图标样式 */
.edit-icon::before { content: '✏️'; }
.delete-icon::before { content: '🗑️'; }
.duplicate-icon::before { content: '📋'; }
.receipt-icon::before { content: '🧾'; }
.select-icon::before { 
  content: '⭕'; 
  font-size: 14px;
}
.select-icon.selected::before { 
  content: '✅'; 
  color: #1890ff;
}
.location-icon::before { content: '📍'; }
</style>