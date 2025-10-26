<template>
  <div class="travel-tags-container">
    <!-- 只读模式 -->
    <div v-if="!editable" class="tags-display">
      <div v-if="tags && tags.length > 0" class="tag-list">
        <el-tag 
          v-for="tag in tags" 
          :key="tag" 
          size="small"
          :effect="tagEffect"
          :type="getTagType(tag)"
          class="tag-item"
        >
          {{ tag }}
        </el-tag>
      </div>
      <div v-else class="empty-tags">
        <span v-if="showEmptyPlaceholder" class="placeholder-text">暂无标签</span>
      </div>
    </div>
    
    <!-- 编辑模式 -->
    <div v-else class="tags-edit">
      <el-select
        v-model="selectedTags"
        multiple
        filterable
        allow-create
        default-first-option
        placeholder="添加标签"
        :clearable="allowClear"
        collapse-tags
        :max-collapse-tags="maxCollapseTags"
        class="tags-select"
        @change="handleTagsChange"
      >
        <el-option
          v-for="tag in availableTags"
          :key="tag"
          :label="tag"
          :value="tag"
        ></el-option>
      </el-select>
      
      <div v-if="selectedTags.length > 0" class="selected-tags-preview">
        <el-tag 
          v-for="tag in selectedTags" 
          :key="tag" 
          size="small"
          :effect="tagEffect"
          :type="getTagType(tag)"
          closable
          @close="removeTag(tag)"
          class="tag-item"
        >
          {{ tag }}
        </el-tag>
      </div>
      
      <!-- 推荐标签 -->
      <div v-if="showRecommendTags && availableTags.length > 0" class="recommend-tags">
        <span class="recommend-title">推荐标签：</span>
        <el-tag
          v-for="tag in availableTags"
          :key="tag"
          size="small"
          effect="plain"
          :class="{ 'active': selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
          class="recommend-tag-item"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script>
import { COMMON_TAGS } from '../constants/appConstants'

export default {
  name: 'TravelTags',
  props: {
    // 标签列表
    tags: {
      type: Array,
      default: () => []
    },
    // 是否可编辑
    editable: {
      type: Boolean,
      default: false
    },
    // 标签效果（dark/light/plain）
    tagEffect: {
      type: String,
      default: 'light'
    },
    // 标签类型映射（可选，用于自定义标签颜色）
    tagTypeMap: {
      type: Object,
      default: () => ({})
    },
    // 是否显示空占位符
    showEmptyPlaceholder: {
      type: Boolean,
      default: true
    },
    // 是否允许清空全部标签
    allowClear: {
      type: Boolean,
      default: true
    },
    // 最多显示的折叠标签数量
    maxCollapseTags: {
      type: Number,
      default: 3
    },
    // 是否显示推荐标签
    showRecommendTags: {
      type: Boolean,
      default: true
    },
    // 标签类型（travelPlan/expense/itinerary）
    tagCategory: {
      type: String,
      default: 'travelPlan',
      validator: (value) => ['travelPlan', 'expense', 'itinerary'].includes(value)
    }
  },
  data() {
    return {
      // 选中的标签（编辑模式）
      selectedTags: [...this.tags]
    }
  },
  computed: {
    // 可用的推荐标签
    availableTags() {
      // 根据标签类别获取不同的推荐标签
      switch (this.tagCategory) {
        case 'expense':
          return COMMON_TAGS.EXPENSE || []
        case 'itinerary':
          return COMMON_TAGS.ITINERARY || []
        case 'travelPlan':
        default:
          return COMMON_TAGS.TRAVEL_PLAN || []
      }
    },
    
    // 去重后的标签列表
    uniqueTags() {
      return [...new Set(this.tags)]
    }
  },
  watch: {
    // 监听外部标签变化
    tags: {
      handler(newTags) {
        this.selectedTags = [...newTags]
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // 获取标签类型（颜色）
    getTagType(tag) {
      // 如果有自定义标签类型映射，则优先使用
      if (this.tagTypeMap && this.tagTypeMap[tag]) {
        return this.tagTypeMap[tag]
      }
      
      // 默认根据标签文本生成一个固定类型
      const tagIndex = this.availableTags.indexOf(tag)
      const types = ['primary', 'success', 'warning', 'danger', 'info']
      return tagIndex !== -1 ? types[tagIndex % types.length] : ''
    },
    
    // 移除标签
    removeTag(tag) {
      const index = this.selectedTags.indexOf(tag)
      if (index !== -1) {
        this.selectedTags.splice(index, 1)
        this.emitTagsChange()
      }
    },
    
    // 切换标签（添加/移除）
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag)
      if (index !== -1) {
        this.selectedTags.splice(index, 1)
      } else {
        this.selectedTags.push(tag)
      }
      this.emitTagsChange()
    },
    
    // 处理标签变化
    handleTagsChange() {
      this.emitTagsChange()
    },
    
    // 发送标签变化事件
    emitTagsChange() {
      // 去重并发送事件
      const uniqueSelectedTags = [...new Set(this.selectedTags)]
      this.$emit('update:tags', uniqueSelectedTags)
      this.$emit('change', uniqueSelectedTags)
    },
    
    // 添加自定义标签
    addCustomTag(tag) {
      if (tag && !this.selectedTags.includes(tag)) {
        this.selectedTags.push(tag)
        this.emitTagsChange()
      }
    },
    
    // 清空所有标签
    clearAllTags() {
      this.selectedTags = []
      this.emitTagsChange()
    },
    
    // 获取当前标签列表
    getCurrentTags() {
      return [...new Set(this.selectedTags)]
    }
  },
  mounted() {
    // 组件挂载时，确保标签去重
    this.selectedTags = [...new Set(this.selectedTags)]
  }
}
</script>

<style scoped>
.travel-tags-container {
  width: 100%;
}

/* 只读模式样式 */
.tags-display {
  width: 100%;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin-right: 0;
  cursor: default;
}

/* 编辑模式样式 */
.tags-edit {
  width: 100%;
}

.tags-select {
  width: 100%;
  margin-bottom: 12px;
}

.selected-tags-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.selected-tags-preview .tag-item {
  cursor: pointer;
}

/* 推荐标签样式 */
.recommend-tags {
  margin-top: 12px;
}

.recommend-title {
  font-size: 14px;
  color: #606266;
  margin-right: 8px;
}

.recommend-tag-item {
  margin-right: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.recommend-tag-item:hover {
  transform: translateY(-2px);
}

.recommend-tag-item.active {
  background-color: #ecf5ff;
  border-color: #c6e2ff;
  color: #409eff;
}

/* 空状态样式 */
.empty-tags {
  padding: 4px 0;
}

.placeholder-text {
  color: #909399;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tag-list,
  .selected-tags-preview {
    gap: 6px;
  }
  
  .recommend-tag-item {
    margin-right: 6px;
    margin-bottom: 6px;
  }
}
</style>