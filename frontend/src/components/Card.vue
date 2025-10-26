<template>
  <div 
    class="card"
    :class="{
      'card-borderless': bordered === false,
      'card-hoverable': hoverable,
      'card-shadow': shadow !== 'none',
      [`card-shadow-${shadow}`]: shadow !== 'none',
      'card-disabled': disabled,
      'card-centered': centered,
      [`card-${size}`]: size !== 'medium'
    }"
    :style="customStyle"
  >
    <!-- 卡片头部 -->
    <div v-if="$slots.header || title" class="card-header">
      <div class="card-header-content">
        <div v-if="title" class="card-title">{{ title }}</div>
        <slot name="header"></slot>
      </div>
      <div class="card-header-extra">
        <slot name="header-extra"></slot>
      </div>
    </div>
    
    <!-- 卡片内容 -->
    <div v-if="$slots.default" class="card-body">
      <slot></slot>
    </div>
    
    <!-- 卡片加载状态 -->
    <div v-else-if="loading" class="card-loading">
      <div class="card-loading-spinner"></div>
      <div class="card-loading-text">{{ loadingText }}</div>
    </div>
    
    <!-- 卡片底部 -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
    
    <!-- 卡片封面 -->
    <div v-if="cover" class="card-cover">
      <img :src="cover" :alt="coverAlt || title" class="card-cover-img" />
    </div>
    
    <!-- 卡片标签 -->
    <div v-if="tags && tags.length > 0" class="card-tags">
      <span 
        v-for="(tag, index) in tags" 
        :key="index" 
        class="card-tag"
        :class="getTagClass(tag)"
      >
        {{ tag.text }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Card',
  
  props: {
    // 卡片标题
    title: {
      type: String,
      default: ''
    },
    
    // 是否显示边框
    bordered: {
      type: Boolean,
      default: true
    },
    
    // 是否可悬停
    hoverable: {
      type: Boolean,
      default: false
    },
    
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    
    // 是否居中内容
    centered: {
      type: Boolean,
      default: false
    },
    
    // 阴影样式
    shadow: {
      type: String,
      default: 'none',
      validator: (value) => ['none', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    
    // 卡片大小
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    
    // 加载状态文字
    loadingText: {
      type: String,
      default: '加载中...'
    },
    
    // 封面图片
    cover: {
      type: String,
      default: ''
    },
    
    // 封面图片替代文本
    coverAlt: {
      type: String,
      default: ''
    },
    
    // 标签列表
    tags: {
      type: Array,
      default: () => []
    },
    
    // 自定义样式
    customStyle: {
      type: Object,
      default: () => ({})
    },
    
    // 唯一标识
    id: {
      type: String,
      default: () => `card-${Date.now()}`
    }
  },
  
  methods: {
    // 获取标签样式类名
    getTagClass(tag) {
      if (typeof tag === 'string') {
        return ''
      }
      
      const classes = []
      
      // 标签类型
      if (tag.type) {
        classes.push(`card-tag-${tag.type}`)
      }
      
      // 标签大小
      if (tag.size) {
        classes.push(`card-tag-${tag.size}`)
      }
      
      // 自定义类名
      if (tag.className) {
        classes.push(tag.className)
      }
      
      return classes.join(' ')
    }
  }
}
</script>

<style scoped>
/* 卡片基础样式 */
.card {
  background-color: #fff;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* 无边框样式 */
.card-borderless {
  border: none;
  box-shadow: none;
}

/* 默认边框 */
.card {
  border: 1px solid #e8e8e8;
}

/* 可悬停样式 */
.card-hoverable {
  cursor: pointer;
}

.card-hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12), 0 3px 6px rgba(0, 0, 0, 0.1);
}

/* 阴影样式 */
.card-shadow-sm {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-shadow-md {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-shadow-lg {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-shadow-xl {
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.16);
}

/* 禁用状态 */
.card-disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* 居中内容 */
.card-centered {
  text-align: center;
}

/* 卡片大小 */
.card-small {
  padding: 12px;
}

.card-medium {
  padding: 16px;
}

.card-large {
  padding: 24px;
}

/* 卡片头部 */
.card-header {
  padding: 0 0 16px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
}

.card-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-header-extra {
  flex-shrink: 0;
}

/* 卡片内容 */
.card-body {
  overflow: hidden;
}

/* 卡片底部 */
.card-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

/* 卡片封面 */
.card-cover {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
  margin: -16px -16px 16px;
}

.card-small .card-cover {
  margin: -12px -12px 12px;
}

.card-large .card-cover {
  margin: -24px -24px 24px;
}

.card-cover-img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.card-hoverable .card-cover-img:hover {
  transform: scale(1.02);
}

/* 标签样式 */
.card-tags {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 1;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.card-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 标签类型样式 */
.card-tag-primary {
  background-color: rgba(24, 144, 255, 0.9);
  color: #fff;
}

.card-tag-success {
  background-color: rgba(82, 196, 26, 0.9);
  color: #fff;
}

.card-tag-warning {
  background-color: rgba(250, 140, 22, 0.9);
  color: #fff;
}

.card-tag-error {
  background-color: rgba(245, 34, 45, 0.9);
  color: #fff;
}

.card-tag-info {
  background-color: rgba(114, 114, 114, 0.9);
  color: #fff;
}

/* 标签大小样式 */
.card-tag-xs {
  padding: 2px 6px;
  font-size: 11px;
}

.card-tag-sm {
  padding: 3px 7px;
  font-size: 11px;
}

.card-tag-lg {
  padding: 5px 10px;
  font-size: 13px;
}

/* 加载状态 */
.card-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
}

.card-loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #1890ff;
  animation: spin 0.8s linear infinite;
}

.card-loading-text {
  color: #999;
  font-size: 14px;
}

/* 动画效果 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .card-header-extra {
    align-self: stretch;
  }
  
  .card-footer {
    justify-content: center;
  }
}
</style>