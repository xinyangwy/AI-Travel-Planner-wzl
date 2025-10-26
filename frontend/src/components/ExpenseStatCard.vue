<template>
  <div class="expense-stat-card-container">
    <el-card :shadow="shadow" class="stat-card" :class="{ 'highlight': highlight }">
      <!-- 卡片头部 -->
      <div v-if="showHeader" class="card-header">
        <div class="header-left">
          <h3 class="card-title">{{ title }}</h3>
          <div v-if="subtitle" class="card-subtitle">{{ subtitle }}</div>
        </div>
        <div v-if="showIcon" class="header-icon">
          <el-icon :class="['icon', iconClass]">
            <component :is="icon" />
          </el-icon>
        </div>
      </div>
      
      <!-- 卡片内容 -->
      <div class="card-content">
        <!-- 主要数值 -->
        <div class="main-value">
          <span v-if="prefix" class="value-prefix">{{ prefix }}</span>
          <span class="value-number" :class="{ 'formatted': formatNumber }">
            {{ formatMainValue(value) }}
          </span>
          <span v-if="suffix" class="value-suffix">{{ suffix }}</span>
        </div>
        
        <!-- 趋势指标 -->
        <div v-if="showTrend && trendValue !== null" class="trend-info">
          <el-icon 
            v-if="trendValue > 0" 
            class="trend-icon up"
            :title="'上升 ' + Math.abs(trendValue) + '%'"
          >
            <ArrowUp />
          </el-icon>
          <el-icon 
            v-else-if="trendValue < 0" 
            class="trend-icon down"
            :title="'下降 ' + Math.abs(trendValue) + '%'"
          >
            <ArrowDown />
          </el-icon>
          <span 
            class="trend-text" 
            :class="{
              'up': trendValue > 0,
              'down': trendValue < 0,
              'neutral': trendValue === 0
            }"
          >
            {{ formatTrendValue(trendValue) }}
          </span>
          <span v-if="trendLabel" class="trend-label">{{ trendLabel }}</span>
        </div>
        
        <!-- 辅助信息 -->
        <div v-if="helpText" class="help-info">
          <el-tooltip :content="helpText" placement="top">
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </div>
      
      <!-- 卡片底部 -->
      <div v-if="showFooter && (footerText || showFooterActions)" class="card-footer">
        <span v-if="footerText" class="footer-text">{{ footerText }}</span>
        <div v-if="showFooterActions" class="footer-actions">
          <el-button 
            v-for="action in footerActions" 
            :key="action.key"
            :size="'small'"
            :type="action.type || 'text'"
            @click="handleAction(action)"
          >
            {{ action.label }}
          </el-button>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-overlay">
        <el-icon class="is-loading"><Loading /></el-icon>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ArrowUp, ArrowDown, QuestionFilled, Loading, 
         Wallet, BankCard, ShoppingBag, Coffee, Car, 
         HomeFilled, Ticket, PieChart, TrendingUp } from '@element-plus/icons-vue'
import { currencyFormatter } from '../utils/formatters'

export default {
  name: 'ExpenseStatCard',
  components: {
    ArrowUp,
    ArrowDown,
    QuestionFilled,
    Loading,
    Wallet,
    BankCard,
    ShoppingBag,
    Coffee,
    Car,
    HomeFilled,
    Ticket,
    PieChart,
    TrendingUp
  },
  props: {
    // 标题
    title: {
      type: String,
      default: ''
    },
    // 副标题
    subtitle: {
      type: String,
      default: ''
    },
    // 主要数值
    value: {
      type: [Number, String],
      default: 0
    },
    // 前缀
    prefix: {
      type: String,
      default: ''
    },
    // 后缀
    suffix: {
      type: String,
      default: ''
    },
    // 趋势值（百分比）
    trendValue: {
      type: [Number, null],
      default: null
    },
    // 趋势标签
    trendLabel: {
      type: String,
      default: ''
    },
    // 帮助文本
    helpText: {
      type: String,
      default: ''
    },
    // 底部文本
    footerText: {
      type: String,
      default: ''
    },
    // 图标类型
    icon: {
      type: [String, Object],
      default: 'Wallet'
    },
    // 图标样式类
    iconClass: {
      type: String,
      default: ''
    },
    // 卡片阴影
    shadow: {
      type: String,
      default: 'hover',
      validator: (value) => ['hover', 'never', 'always'].includes(value)
    },
    // 是否高亮显示
    highlight: {
      type: Boolean,
      default: false
    },
    // 是否显示头部
    showHeader: {
      type: Boolean,
      default: true
    },
    // 是否显示图标
    showIcon: {
      type: Boolean,
      default: true
    },
    // 是否显示趋势
    showTrend: {
      type: Boolean,
      default: true
    },
    // 是否显示底部
    showFooter: {
      type: Boolean,
      default: false
    },
    // 是否显示底部操作按钮
    showFooterActions: {
      type: Boolean,
      default: false
    },
    // 底部操作按钮列表
    footerActions: {
      type: Array,
      default: () => []
    },
    // 是否格式化数字（添加千分位）
    formatNumber: {
      type: Boolean,
      default: true
    },
    // 数字小数位数
    decimalPlaces: {
      type: Number,
      default: 2
    },
    // 是否为货币类型
    isCurrency: {
      type: Boolean,
      default: false
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 图标组件映射
      iconComponents: {
        Wallet,
        BankCard,
        ShoppingBag,
        Coffee,
        Car,
        HomeFilled,
        Ticket,
        PieChart,
        TrendingUp
      }
    }
  },
  computed: {
    // 处理后的图标组件
    iconComponent() {
      // 如果icon是字符串，则从映射中获取对应的组件
      if (typeof this.icon === 'string') {
        return this.iconComponents[this.icon] || Wallet
      }
      // 如果icon已经是组件，则直接返回
      return this.icon
    }
  },
  methods: {
    // 格式化主要数值
    formatMainValue(val) {
      if (val === null || val === undefined || val === '') return 0
      
      const num = Number(val)
      if (isNaN(num)) return 0
      
      // 如果是货币类型，使用货币格式化
      if (this.isCurrency) {
        return currencyFormatter.formatCurrency(num, '', this.decimalPlaces)
      }
      
      // 否则根据是否需要格式化数字来处理
      if (this.formatNumber) {
        return num.toLocaleString('zh-CN', {
          minimumFractionDigits: this.decimalPlaces,
          maximumFractionDigits: this.decimalPlaces
        })
      }
      
      return num.toFixed(this.decimalPlaces)
    },
    
    // 格式化趋势值
    formatTrendValue(val) {
      if (val === null || val === undefined) return ''
      
      const num = Number(val)
      if (isNaN(num)) return ''
      
      // 添加正负符号和百分号
      return (num > 0 ? '+' : '') + num.toFixed(1) + '%'
    },
    
    // 处理操作按钮点击
    handleAction(action) {
      // 触发自定义事件
      this.$emit('action', action)
      // 如果有回调函数，则调用
      if (action.callback && typeof action.callback === 'function') {
        action.callback()
      }
    },
    
    // 获取卡片数据
    getCardData() {
      return {
        title: this.title,
        value: this.value,
        trendValue: this.trendValue
      }
    }
  }
}
</script>

<style scoped>
.expense-stat-card-container {
  width: 100%;
}

.stat-card {
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card.highlight {
  border-left: 4px solid #409eff;
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-left {
  flex: 1;
}

.card-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-subtitle {
  font-size: 12px;
  color: #909399;
}

.header-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ecf5ff;
  border-radius: 8px;
}

.icon {
  font-size: 20px;
  color: #409eff;
}

.iconClass {
  /* 允许自定义图标样式 */
}

/* 卡片内容样式 */
.card-content {
  position: relative;
}

.main-value {
  display: flex;
  align-items: baseline;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.value-prefix,
.value-suffix {
  font-size: 16px;
  font-weight: normal;
  color: #606266;
}

.value-number {
  transition: all 0.3s;
}

/* 趋势指标样式 */
.trend-info {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.trend-icon {
  font-size: 12px;
  margin-right: 4px;
}

.trend-icon.up {
  color: #f56c6c;
}

.trend-icon.down {
  color: #67c23a;
}

.trend-text {
  font-weight: 500;
}

.trend-text.up {
  color: #f56c6c;
}

.trend-text.down {
  color: #67c23a;
}

.trend-text.neutral {
  color: #909399;
}

.trend-label {
  margin-left: 4px;
  color: #909399;
  font-size: 12px;
}

/* 帮助信息样式 */
.help-info {
  position: absolute;
  top: 0;
  right: 0;
}

.help-icon {
  font-size: 14px;
  color: #909399;
  cursor: help;
}

/* 卡片底部样式 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.footer-text {
  font-size: 12px;
  color: #909399;
}

.footer-actions {
  display: flex;
  gap: 8px;
}

/* 加载状态样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-value {
    font-size: 22px;
  }
  
  .value-prefix,
  .value-suffix {
    font-size: 14px;
  }
  
  .header-icon {
    width: 32px;
    height: 32px;
  }
  
  .icon {
    font-size: 16px;
  }
  
  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>