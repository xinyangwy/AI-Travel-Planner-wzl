<template>
  <div class="tag-selector" :class="{ 'disabled': disabled }">
    <!-- 已选标签显示区域 -->
    <div class="selected-tags" v-if="selectedTags.length > 0">
      <div 
        v-for="(tag, index) in selectedTags" 
        :key="`selected-${getTagKey(tag)}`"
        class="tag-item"
        :class="[getTagTypeClass(tag.type), { 'removable': !disabled && removable && !tag.disabled }]"
      >
        <!-- 标签图标 -->
        <span v-if="showIcon && getTagIcon(tag)" class="tag-icon">{{ getTagIcon(tag) }}</span>
        
        <!-- 标签文本 -->
        <span class="tag-text">{{ getTagLabel(tag) }}</span>
        
        <!-- 移除按钮 -->
        <button 
          v-if="!disabled && removable && !tag.disabled"
          class="tag-remove-button"
          @click.stop="removeTag(tag, index)"
          :title="`移除 ${getTagLabel(tag)}`"
        >
          <span class="remove-icon"></span>
        </button>
      </div>
    </div>
    
    <!-- 无标签提示 -->
    <div v-else-if="placeholder" class="placeholder-text">{{ placeholder }}</div>
    
    <!-- 标签输入/选择区域 -->
    <div 
      v-if="!disabled && editable" 
      class="tag-input-container"
      :class="{ 'focused': isFocused, 'error': error }"
    >
      <!-- 可输入模式 -->
      <div v-if="allowInput" class="tag-input-wrapper">
        <input
          ref="tagInput"
          type="text"
          class="tag-input"
          :value="inputValue"
          :placeholder="inputPlaceholder"
          :maxlength="maxLength"
          :disabled="disabled || !editable"
          :autocomplete="'off'"
          @input="handleInput"
          @keydown="handleKeydown"
          @focus="handleFocus"
          @blur="handleBlur"
          @paste="handlePaste"
        />
        
        <!-- 建议标签列表 -->
        <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-container">
          <div 
            v-for="(suggestion, index) in suggestions" 
            :key="`suggestion-${getTagKey(suggestion)}`"
            class="suggestion-item"
            :class="{ 'selected': index === selectedSuggestionIndex }"
            @click="selectSuggestion(suggestion)"
            @mouseenter="selectedSuggestionIndex = index"
          >
            <span v-if="showIcon && getTagIcon(suggestion)" class="suggestion-icon">{{ getTagIcon(suggestion) }}</span>
            <span class="suggestion-text">{{ getTagLabel(suggestion) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 下拉选择模式 -->
      <div v-else-if="showDropdown" class="tag-dropdown-wrapper">
        <button 
          class="tag-dropdown-button"
          @click="toggleDropdown"
          :class="{ 'open': isDropdownOpen }"
        >
          <span class="dropdown-icon">{{ isDropdownOpen ? '▲' : '▼' }}</span>
          <span class="dropdown-text">{{ dropdownButtonText }}</span>
        </button>
        
        <!-- 下拉菜单 -->
        <div v-if="isDropdownOpen" class="dropdown-menu">
          <!-- 搜索框 -->
          <div v-if="showSearch" class="dropdown-search">
            <input
              type="text"
              class="dropdown-search-input"
              placeholder="搜索标签..."
              v-model="dropdownSearchText"
              @input="filterDropdownTags"
            />
          </div>
          
          <!-- 标签分组 -->
          <div v-if="groupedTags.length > 0" class="tag-groups">
            <div 
              v-for="group in groupedTags" 
              :key="`group-${group.name || 'default'}`"
              class="tag-group"
            >
              <div v-if="group.name" class="tag-group-title">{{ group.name }}</div>
              <div class="tag-group-items">
                <button
                  v-for="tag in group.tags"
                  :key="`dropdown-${getTagKey(tag)}`"
                  class="dropdown-tag-item"
                  :class="[
                    getTagTypeClass(tag.type),
                    { 'selected': isTagSelected(tag) },
                    { 'disabled': tag.disabled }
                  ]"
                  :disabled="tag.disabled"
                  @click="toggleTagSelection(tag)"
                >
                  <span v-if="showIcon && getTagIcon(tag)" class="tag-icon">{{ getTagIcon(tag) }}</span>
                  <span class="tag-text">{{ getTagLabel(tag) }}</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- 无子项提示 -->
          <div v-else class="dropdown-empty">
            暂无标签
          </div>
        </div>
      </div>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error && errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script>
export default {
  name: 'TagSelector',
  
  props: {
    // 绑定值（选中的标签列表）
    modelValue: {
      type: Array,
      default: () => []
    },
    // 预设标签列表
    options: {
      type: Array,
      default: () => []
    },
    // 分组标签列表
    groups: {
      type: Array,
      default: () => []
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否可编辑
    editable: {
      type: Boolean,
      default: true
    },
    // 是否可移除已选标签
    removable: {
      type: Boolean,
      default: true
    },
    // 是否允许输入自定义标签
    allowInput: {
      type: Boolean,
      default: true
    },
    // 是否显示下拉选择
    showDropdown: {
      type: Boolean,
      default: true
    },
    // 是否显示图标
    showIcon: {
      type: Boolean,
      default: false
    },
    // 是否显示搜索框
    showSearch: {
      type: Boolean,
      default: false
    },
    // 是否显示建议
    showSuggestions: {
      type: Boolean,
      default: true
    },
    // 最大标签数量
    maxTags: {
      type: Number,
      default: 0 // 0表示无限制
    },
    // 输入框最大长度
    maxLength: {
      type: Number,
      default: 20
    },
    // 分隔符 (用于粘贴时分割多个标签)
    separator: {
      type: String,
      default: ','
    },
    // 占位文本
    placeholder: {
      type: String,
      default: '请选择或输入标签'
    },
    // 输入框占位文本
    inputPlaceholder: {
      type: String,
      default: '输入标签后按回车确认'
    },
    // 下拉按钮文本
    dropdownButtonText: {
      type: String,
      default: '选择标签'
    },
    // 是否允许多选
    multiple: {
      type: Boolean,
      default: true
    },
    // 标签类型映射
    tagTypes: {
      type: Object,
      default: () => ({
        default: 'default',
        primary: 'primary',
        success: 'success',
        warning: 'warning',
        error: 'error',
        info: 'info'
      })
    },
    // 是否错误状态
    error: {
      type: Boolean,
      default: false
    },
    // 错误提示信息
    errorMessage: {
      type: String,
      default: ''
    }
  },
  
  data() {
    return {
      inputValue: '',
      suggestions: [],
      selectedSuggestionIndex: -1,
      isFocused: false,
      isDropdownOpen: false,
      dropdownSearchText: '',
      filteredDropdownTags: []
    }
  },
  
  computed: {
    // 选中的标签列表
    selectedTags: {
      get() {
        return [...this.modelValue]
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    
    // 分组标签（包含搜索过滤）
    groupedTags() {
      // 如果有搜索文本，则过滤标签
      if (this.dropdownSearchText) {
        const filteredGroups = []
        
        // 过滤分组标签
        this.groups.forEach(group => {
          const filteredTags = group.tags.filter(tag => {
            const label = getTagLabel(tag)
            return label.toLowerCase().includes(this.dropdownSearchText.toLowerCase())
          })
          
          if (filteredTags.length > 0) {
            filteredGroups.push({
              name: group.name,
              tags: filteredTags
            })
          }
        })
        
        // 过滤非分组标签
        const filteredOptions = this.options.filter(tag => {
          const label = getTagLabel(tag)
          return label.toLowerCase().includes(this.dropdownSearchText.toLowerCase())
        })
        
        if (filteredOptions.length > 0) {
          filteredGroups.push({
            name: '',
            tags: filteredOptions
          })
        }
        
        return filteredGroups
      }
      
      // 没有搜索文本时，返回原始分组
      const result = [...this.groups]
      
      // 添加非分组标签
      if (this.options.length > 0) {
        result.push({
          name: '',
          tags: this.options
        })
      }
      
      return result
    }
  },
  
  watch: {
    // 监听输入值变化，更新建议
    inputValue(val) {
      if (this.showSuggestions && val && this.allowInput) {
        this.updateSuggestions(val)
      } else {
        this.suggestions = []
        this.selectedSuggestionIndex = -1
      }
    },
    
    // 监听选中标签变化
    selectedTags: {
      handler(newVal) {
        this.$emit('change', newVal)
        this.$emit('update:modelValue', newVal)
      },
      deep: true
    }
  },
  
  mounted() {
    // 添加点击外部关闭下拉菜单的监听
    document.addEventListener('click', this.handleDocumentClick)
  },
  
  beforeDestroy() {
    document.removeEventListener('click', this.handleDocumentClick)
  },
  
  methods: {
    // 获取标签的唯一标识
    getTagKey(tag) {
      if (typeof tag === 'object') {
        return tag.id || tag.value || tag.name || JSON.stringify(tag)
      }
      return String(tag)
    },
    
    // 获取标签的显示文本
    getTagLabel(tag) {
      if (typeof tag === 'object') {
        return tag.label || tag.name || tag.value || JSON.stringify(tag)
      }
      return String(tag)
    },
    
    // 获取标签类型样式类
    getTagTypeClass(type) {
      return type || 'default'
    },
    
    // 获取标签图标
    getTagIcon(tag) {
      if (typeof tag === 'object' && tag.icon) {
        return tag.icon
      }
      return null
    },
    
    // 判断标签是否已选中
    isTagSelected(tag) {
      const tagKey = this.getTagKey(tag)
      return this.selectedTags.some(t => this.getTagKey(t) === tagKey)
    },
    
    // 添加标签
    addTag(tag) {
      // 检查是否达到最大标签数量
      if (this.maxTags > 0 && this.selectedTags.length >= this.maxTags) {
        this.$emit('max-tags', this.maxTags)
        return false
      }
      
      // 检查标签是否已存在
      const tagKey = this.getTagKey(tag)
      if (this.selectedTags.some(t => this.getTagKey(t) === tagKey)) {
        return false
      }
      
      // 添加标签
      const newTag = typeof tag === 'object' ? { ...tag } : { value: tag, label: tag }
      this.selectedTags.push(newTag)
      
      // 触发添加事件
      this.$emit('add', newTag)
      
      return true
    },
    
    // 移除标签
    removeTag(tag, index) {
      if (this.disabled || !this.editable || !this.removable) return
      
      // 触发移除前事件
      if (this.$emit('before-remove', tag, index) === false) {
        return
      }
      
      // 移除标签
      const removedTag = this.selectedTags.splice(index, 1)[0]
      
      // 触发移除事件
      this.$emit('remove', removedTag, index)
      this.$emit('change', this.selectedTags)
    },
    
    // 切换标签选择状态
    toggleTagSelection(tag) {
      if (tag.disabled) return
      
      const tagKey = this.getTagKey(tag)
      const existingIndex = this.selectedTags.findIndex(t => this.getTagKey(t) === tagKey)
      
      if (existingIndex > -1) {
        // 标签已选中，移除它
        this.removeTag(tag, existingIndex)
      } else {
        // 标签未选中，添加它
        // 如果是单选模式，先清空已选中的标签
        if (!this.multiple) {
          this.selectedTags.length = 0
        }
        this.addTag(tag)
      }
    },
    
    // 更新建议列表
    updateSuggestions(value) {
      const lowercaseValue = value.toLowerCase()
      
      // 从选项中过滤匹配的标签
      const optionSuggestions = this.options
        .filter(tag => {
          const label = this.getTagLabel(tag).toLowerCase()
          const tagKey = this.getTagKey(tag)
          
          // 标签名称包含输入值，并且未被选中
          return label.includes(lowercaseValue) &&
            !this.selectedTags.some(t => this.getTagKey(t) === tagKey)
        })
        .slice(0, 10) // 最多显示10个建议
      
      // 从分组选项中过滤匹配的标签
      const groupSuggestions = []
      this.groups.forEach(group => {
        group.tags
          .filter(tag => {
            const label = this.getTagLabel(tag).toLowerCase()
            const tagKey = this.getTagKey(tag)
            
            // 标签名称包含输入值，并且未被选中
            return label.includes(lowercaseValue) &&
              !this.selectedTags.some(t => this.getTagKey(t) === tagKey)
          })
          .forEach(tag => {
            // 复制标签对象并添加分组信息
            groupSuggestions.push({ ...tag, groupName: group.name })
          })
      })
      
      // 合并并去重建议
      const allSuggestions = [...optionSuggestions]
      groupSuggestions.forEach(tag => {
        if (!allSuggestions.some(t => this.getTagKey(t) === this.getTagKey(tag))) {
          allSuggestions.push(tag)
        }
      })
      
      this.suggestions = allSuggestions.slice(0, 10)
      this.selectedSuggestionIndex = -1
    },
    
    // 选择建议
    selectSuggestion(suggestion) {
      this.addTag(suggestion)
      this.inputValue = ''
      this.suggestions = []
      this.selectedSuggestionIndex = -1
    },
    
    // 处理输入
    handleInput(e) {
      this.inputValue = e.target.value
      this.$emit('input', this.inputValue)
    },
    
    // 处理键盘事件
    handleKeydown(e) {
      // 回车键 - 添加标签
      if (e.key === 'Enter') {
        e.preventDefault()
        
        // 如果有选中的建议，使用建议
        if (this.suggestions.length > 0 && this.selectedSuggestionIndex >= 0) {
          this.selectSuggestion(this.suggestions[this.selectedSuggestionIndex])
        } 
        // 否则使用输入值作为标签
        else if (this.inputValue.trim()) {
          const tagText = this.inputValue.trim()
          this.addTag(tagText)
          this.inputValue = ''
          this.suggestions = []
        }
      }
      
      // 退格键 - 输入框为空时删除最后一个标签
      else if (e.key === 'Backspace' && !this.inputValue && this.selectedTags.length > 0) {
        this.removeTag(this.selectedTags[this.selectedTags.length - 1], this.selectedTags.length - 1)
      }
      
      // 上下箭头 - 导航建议列表
      else if (e.key === 'ArrowDown' && this.suggestions.length > 0) {
        e.preventDefault()
        this.selectedSuggestionIndex = Math.min(this.selectedSuggestionIndex + 1, this.suggestions.length - 1)
      }
      else if (e.key === 'ArrowUp' && this.suggestions.length > 0) {
        e.preventDefault()
        this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, 0)
      }
      
      // ESC键 - 取消输入
      else if (e.key === 'Escape') {
        this.inputValue = ''
        this.suggestions = []
        this.selectedSuggestionIndex = -1
        this.$refs.tagInput?.blur()
      }
    },
    
    // 处理粘贴事件
    handlePaste(e) {
      e.preventDefault()
      const pastedText = e.clipboardData.getData('text')
      
      // 使用分隔符分割文本为多个标签
      if (pastedText) {
        const tags = pastedText.split(this.separator)
          .map(tag => tag.trim())
          .filter(tag => tag) // 过滤空标签
          
        // 批量添加标签
        tags.forEach(tag => {
          this.addTag(tag)
        })
      }
    },
    
    // 处理焦点事件
    handleFocus() {
      this.isFocused = true
      this.$emit('focus')
    },
    
    // 处理失焦事件
    handleBlur() {
      this.isFocused = false
      this.suggestions = []
      this.selectedSuggestionIndex = -1
      
      // 如果配置了失焦时添加标签，可以在这里添加逻辑
      this.$emit('blur')
    },
    
    // 切换下拉菜单
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen
      
      if (this.isDropdownOpen) {
        this.dropdownSearchText = ''
        this.$emit('dropdown-open')
      } else {
        this.$emit('dropdown-close')
      }
    },
    
    // 过滤下拉标签
    filterDropdownTags() {
      // 过滤逻辑已在computed中处理
    },
    
    // 处理文档点击事件
    handleDocumentClick(e) {
      // 点击组件外部，关闭下拉菜单
      const container = this.$el
      if (!container.contains(e.target)) {
        this.isDropdownOpen = false
      }
    },
    
    // 清空所有标签
    clear() {
      this.selectedTags.length = 0
      this.$emit('clear')
    },
    
    // 手动聚焦输入框
    focus() {
      if (this.$refs.tagInput) {
        this.$refs.tagInput.focus()
      }
    },
    
    // 手动失焦输入框
    blur() {
      if (this.$refs.tagInput) {
        this.$refs.tagInput.blur()
      }
    }
  }
}
</script>

<style scoped>
.tag-selector {
  position: relative;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 8px 12px;
  background-color: #fff;
  transition: all 0.3s;
  min-height: 40px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.tag-selector:hover {
  border-color: #40a9ff;
}

.tag-selector.disabled {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  cursor: not-allowed;
  opacity: 0.6;
}

.tag-selector.focused {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.tag-selector.error {
  border-color: #f5222d;
}

/* 已选标签区域 */
.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

/* 标签样式 */
.tag-item {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  background-color: #f0f0f0;
  color: rgba(0, 0, 0, 0.65);
  transition: all 0.3s;
}

/* 标签类型样式 */
.tag-item.default {
  background-color: #f0f0f0;
  color: rgba(0, 0, 0, 0.65);
}

.tag-item.primary {
  background-color: #e6f7ff;
  color: #1890ff;
}

.tag-item.success {
  background-color: #f6ffed;
  color: #52c41a;
}

.tag-item.warning {
  background-color: #fff7e6;
  color: #fa8c16;
}

.tag-item.error {
  background-color: #fff1f0;
  color: #f5222d;
}

.tag-item.info {
  background-color: #f0f5ff;
  color: #3291ff;
}

/* 标签图标 */
.tag-icon {
  margin-right: 4px;
  font-size: 12px;
}

/* 标签文本 */
.tag-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

/* 标签移除按钮 */
.tag-remove-button {
  background: transparent;
  border: none;
  padding: 0;
  margin-left: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  color: rgba(0, 0, 0, 0.45);
  transition: all 0.2s;
}

.tag-remove-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.65);
}

/* 占位文本 */
.placeholder-text {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

/* 标签输入容器 */
.tag-input-container {
  flex: 1;
  min-width: 100px;
  position: relative;
}

/* 标签输入框 */
.tag-input-wrapper {
  position: relative;
}

.tag-input {
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  font-size: 14px;
  width: 100%;
  background: transparent;
  color: rgba(0, 0, 0, 0.85);
}

/* 建议列表 */
.suggestions-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  font-size: 14px;
}

.suggestion-item:hover,
.suggestion-item.selected {
  background-color: #f5f5f5;
}

.suggestion-icon {
  margin-right: 8px;
  font-size: 12px;
}

/* 下拉选择器 */
.tag-dropdown-wrapper {
  position: relative;
}

.tag-dropdown-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fff;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  outline: none;
}

.tag-dropdown-button:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

.tag-dropdown-button.open {
  border-color: #40a9ff;
  color: #40a9ff;
}

.dropdown-icon {
  font-size: 10px;
  transition: transform 0.3s;
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 20;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 4px;
}

/* 下拉搜索框 */
.dropdown-search {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-search-input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.dropdown-search-input:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 标签分组 */
.tag-groups {
  padding: 8px 0;
}

.tag-group {
  margin-bottom: 8px;
}

.tag-group-title {
  padding: 4px 12px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  font-weight: 500;
}

.tag-group-items {
  padding: 0 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 下拉标签项 */
.dropdown-tag-item {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  background-color: #f5f5f5;
  color: rgba(0, 0, 0, 0.65);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-tag-item:hover {
  transform: translateY(-1px);
}

.dropdown-tag-item.selected {
  background-color: #1890ff;
  color: #fff;
}

.dropdown-tag-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 空状态提示 */
.dropdown-empty {
  padding: 16px;
  text-align: center;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

/* 错误提示 */
.error-message {
  position: absolute;
  bottom: -20px;
  left: 0;
  color: #f5222d;
  font-size: 12px;
}

/* 关闭图标 */
.remove-icon::before {
  content: '✕';
}

/* 响应式样式 */
@media (max-width: 768px) {
  .tag-selector {
    padding: 6px 8px;
  }
  
  .tag-item {
    font-size: 11px;
    padding: 2px 6px;
  }
  
  .dropdown-menu {
    min-width: 150px;
  }
}
</style>