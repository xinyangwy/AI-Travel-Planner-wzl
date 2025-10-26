<template>
  <div 
    class="form-input-container"
    :class="{
      'form-input-container-disabled': disabled,
      'form-input-container-invalid': isInvalid,
      'form-input-container-focused': isFocused,
      [`form-input-container-${size}`]: size !== 'medium'
    }"
    :style="containerStyle"
  >
    <!-- 标签 -->
    <label 
      v-if="label || $slots.label" 
      class="form-input-label"
      :for="inputId"
      :class="{ 'form-input-label-required': required }"
    >
      <slot name="label">{{ label }}</slot>
      <span v-if="required && showRequiredMark" class="form-input-required-mark">*</span>
    </label>
    
    <!-- 输入框包装器 -->
    <div 
      class="form-input-wrapper"
      :class="{
        'form-input-wrapper-has-prefix': hasPrefix,
        'form-input-wrapper-has-suffix': hasSuffix,
        'form-input-wrapper-error': isInvalid
      }"
    >
      <!-- 前缀 -->
      <div v-if="hasPrefix" class="form-input-prefix">
        <slot name="prefix">{{ prefix }}</slot>
      </div>
      
      <!-- 输入框 -->
      <template v-if="inputType !== 'textarea'">
        <input
          :id="inputId"
          :type="inputType"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="disabled || readonly"
          :readonly="readonly"
          :required="required"
          :min="min"
          :max="max"
          :minlength="minlength"
          :maxlength="maxlength"
          :pattern="pattern"
          :step="step"
          :autocomplete="autocomplete"
          :autofocus="autofocus"
          :formnovalidate="!validation"
          :list="list"
          :name="name"
          :multiple="multiple"
          :accept="accept"
          :capture="capture"
          class="form-input"
          :class="{
            'form-input-invalid': isInvalid,
            'form-input-disabled': disabled || readonly,
            'form-input-with-prefix': hasPrefix,
            'form-input-with-suffix': hasSuffix,
            [`form-input-${size}`]: size !== 'medium'
          }"
          :style="inputStyle"
          @input="handleInput"
          @change="handleChange"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
          @keypress="handleKeypress"
          @keyup="handleKeyup"
          @click="handleClick"
          @dblclick="handleDblclick"
          @contextmenu="handleContextmenu"
        />
      </template>
      
      <!-- 文本域 -->
      <textarea
        v-else
        :id="inputId"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled || readonly"
        :readonly="readonly"
        :required="required"
        :minlength="minlength"
        :maxlength="maxlength"
        :rows="rows"
        :cols="cols"
        :wrap="wrap"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        :formnovalidate="!validation"
        :name="name"
        class="form-input-textarea"
        :class="{
          'form-input-textarea-invalid': isInvalid,
          'form-input-textarea-disabled': disabled || readonly,
          'form-input-textarea-with-prefix': hasPrefix,
          'form-input-textarea-with-suffix': hasSuffix,
          [`form-input-textarea-${size}`]: size !== 'medium'
        }"
        :style="inputStyle"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @keypress="handleKeypress"
        @keyup="handleKeyup"
        @click="handleClick"
        @dblclick="handleDblclick"
        @contextmenu="handleContextmenu"
      ></textarea>
      
      <!-- 后缀 -->
      <div v-if="hasSuffix" class="form-input-suffix">
        <slot name="suffix">{{ suffix }}</slot>
      </div>
    </div>
    
    <!-- 提示信息 -->
    <div v-if="hint || errorMessage || $slots.hint" class="form-input-hint">
      <template v-if="isInvalid && errorMessage">
        <span class="form-input-error-icon">!</span>
        <span class="form-input-error-message">{{ errorMessage }}</span>
      </template>
      <template v-else-if="hint || $slots.hint">
        <slot name="hint">{{ hint }}</slot>
      </template>
    </div>
    
    <!-- 字符计数器 -->
    <div 
      v-if="showCounter && (inputType === 'text' || inputType === 'textarea') && maxlength"
      class="form-input-counter"
      :class="{ 'form-input-counter-warning': isOverLimit }"
    >
      <span class="form-input-counter-current">{{ currentLength }}</span>
      <span class="form-input-counter-separator">/</span>
      <span class="form-input-counter-max">{{ maxlength }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FormInput',
  
  props: {
    // 绑定值
    modelValue: {
      type: [String, Number, Boolean],
      default: ''
    },
    
    // 输入框类型
    type: {
      type: String,
      default: 'text',
      validator: (value) => [
        'text', 'password', 'email', 'tel', 'url',
        'number', 'date', 'time', 'datetime-local', 'month',
        'week', 'color', 'range', 'search', 'file',
        'checkbox', 'radio', 'hidden', 'textarea'
      ].includes(value)
    },
    
    // 标签文本
    label: {
      type: String,
      default: ''
    },
    
    // 占位符
    placeholder: {
      type: String,
      default: ''
    },
    
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    
    // 是否只读
    readonly: {
      type: Boolean,
      default: false
    },
    
    // 是否必填
    required: {
      type: Boolean,
      default: false
    },
    
    // 显示必填标记
    showRequiredMark: {
      type: Boolean,
      default: true
    },
    
    // 错误信息
    errorMessage: {
      type: String,
      default: ''
    },
    
    // 提示信息
    hint: {
      type: String,
      default: ''
    },
    
    // 大小
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    
    // 前缀内容
    prefix: {
      type: String,
      default: ''
    },
    
    // 后缀内容
    suffix: {
      type: String,
      default: ''
    },
    
    // 最小长度
    minlength: {
      type: Number,
      default: null
    },
    
    // 最大长度
    maxlength: {
      type: Number,
      default: null
    },
    
    // 最小值 (用于数字、日期等)
    min: {
      type: [String, Number, Date],
      default: null
    },
    
    // 最大值 (用于数字、日期等)
    max: {
      type: [String, Number, Date],
      default: null
    },
    
    // 步长 (用于数字、日期等)
    step: {
      type: [String, Number],
      default: null
    },
    
    // 正则表达式模式
    pattern: {
      type: String,
      default: null
    },
    
    // 自动完成
    autocomplete: {
      type: String,
      default: 'off'
    },
    
    // 是否自动聚焦
    autofocus: {
      type: Boolean,
      default: false
    },
    
    // 是否启用原生验证
    validation: {
      type: Boolean,
      default: false
    },
    
    // 表单元素名称
    name: {
      type: String,
      default: ''
    },
    
    // 关联的datalist ID
    list: {
      type: String,
      default: null
    },
    
    // 文件上传相关属性
    multiple: {
      type: Boolean,
      default: false
    },
    
    // 接受的文件类型
    accept: {
      type: String,
      default: ''
    },
    
    // 媒体捕获模式
    capture: {
      type: String,
      default: null
    },
    
    // 文本域属性
    rows: {
      type: Number,
      default: 3
    },
    
    cols: {
      type: Number,
      default: 20
    },
    
    wrap: {
      type: String,
      default: 'soft',
      validator: (value) => ['hard', 'soft', 'off'].includes(value)
    },
    
    // 显示字符计数器
    showCounter: {
      type: Boolean,
      default: false
    },
    
    // 自定义容器样式
    containerStyle: {
      type: Object,
      default: () => ({})
    },
    
    // 自定义输入框样式
    inputStyle: {
      type: Object,
      default: () => ({})
    },
    
    // 唯一标识
    id: {
      type: String,
      default: null
    }
  },
  
  data() {
    return {
      // 聚焦状态
      isFocused: false,
      // 内部验证状态
      internalError: ''
    }
  },
  
  computed: {
    // 输入框ID
    inputId() {
      return this.id || `form-input-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    },
    
    // 输入类型
    inputType() {
      return this.type === 'textarea' ? 'textarea' : this.type
    },
    
    // 是否有前缀
    hasPrefix() {
      return this.$slots.prefix !== undefined || !!this.prefix
    },
    
    // 是否有后缀
    hasSuffix() {
      return this.$slots.suffix !== undefined || !!this.suffix
    },
    
    // 是否无效
    isInvalid() {
      return !!this.errorMessage || !!this.internalError
    },
    
    // 当前字符长度
    currentLength() {
      return String(this.modelValue || '').length
    },
    
    // 是否超出字符限制
    isOverLimit() {
      return this.maxlength !== null && this.currentLength > this.maxlength
    }
  },
  
  watch: {
    // 监听值变化，进行验证
    modelValue: {
      handler(newValue) {
        this.validateInput(newValue)
      },
      immediate: true
    }
  },
  
  methods: {
    // 处理输入事件
    handleInput(event) {
      const value = this.getInputValue(event.target)
      this.$emit('input', value)
      this.$emit('update:modelValue', value)
      this.$emit('input-change', value, event)
    },
    
    // 处理变化事件
    handleChange(event) {
      const value = this.getInputValue(event.target)
      this.$emit('change', value, event)
    },
    
    // 处理聚焦事件
    handleFocus(event) {
      this.isFocused = true
      this.$emit('focus', event)
    },
    
    // 处理失焦事件
    handleBlur(event) {
      this.isFocused = false
      this.validateInput(this.modelValue)
      this.$emit('blur', event)
    },
    
    // 处理键盘按下事件
    handleKeydown(event) {
      this.$emit('keydown', event)
      
      // 特殊按键处理
      if (event.key === 'Enter') {
        this.$emit('enter', event)
      } else if (event.key === 'Escape') {
        this.$emit('escape', event)
      } else if (event.key === 'Tab') {
        this.$emit('tab', event)
      }
    },
    
    // 处理键盘按压事件
    handleKeypress(event) {
      this.$emit('keypress', event)
    },
    
    // 处理键盘释放事件
    handleKeyup(event) {
      this.$emit('keyup', event)
    },
    
    // 处理点击事件
    handleClick(event) {
      this.$emit('click', event)
    },
    
    // 处理双击事件
    handleDblclick(event) {
      this.$emit('dblclick', event)
    },
    
    // 处理右键菜单事件
    handleContextmenu(event) {
      this.$emit('contextmenu', event)
    },
    
    // 获取输入值
    getInputValue(target) {
      const type = this.type
      
      if (type === 'checkbox') {
        return target.checked
      } else if (type === 'radio') {
        return target.value
      } else if (type === 'number') {
        return target.value === '' ? null : Number(target.value)
      } else if (type === 'file') {
        return target.files
      } else {
        return target.value
      }
    },
    
    // 验证输入
    validateInput(value) {
      if (this.disabled || this.readonly) return
      
      // 重置内部错误
      this.internalError = ''
      
      // 必填验证
      if (this.required) {
        if (value === '' || value === null || value === undefined) {
          this.internalError = this.errorMessage || '此字段为必填项'
          return false
        }
      }
      
      // 最小长度验证
      if (this.minlength !== null && value && String(value).length < this.minlength) {
        this.internalError = `最少需要${this.minlength}个字符`
        return false
      }
      
      // 最大长度验证
      if (this.maxlength !== null && value && String(value).length > this.maxlength) {
        this.internalError = `最多允许${this.maxlength}个字符`
        return false
      }
      
      // 正则表达式验证
      if (this.pattern && value) {
        const regex = new RegExp(this.pattern)
        if (!regex.test(String(value))) {
          this.internalError = '输入格式不正确'
          return false
        }
      }
      
      return true
    },
    
    // 手动验证
    validate() {
      return this.validateInput(this.modelValue)
    },
    
    // 获取焦点
    focus() {
      const input = this.$el.querySelector('input, textarea')
      if (input) {
        input.focus()
      }
    },
    
    // 失去焦点
    blur() {
      const input = this.$el.querySelector('input, textarea')
      if (input) {
        input.blur()
      }
    },
    
    // 清除值
    clear() {
      this.$emit('update:modelValue', '')
      this.$emit('input', '')
      this.$emit('clear')
    }
  }
}
</script>

<style scoped>
/* 容器样式 */
.form-input-container {
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.form-input-container-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.form-input-container-focused {
  color: #1890ff;
}

/* 尺寸变体 */
.form-input-container-small {
  margin-bottom: 12px;
}

.form-input-container-large {
  margin-bottom: 20px;
}

/* 标签样式 */
.form-input-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  user-select: none;
}

.form-input-label-required {
  position: relative;
}

.form-input-required-mark {
  color: #f5222d;
  margin-left: 4px;
}

/* 输入框包装器 */
.form-input-wrapper {
  position: relative;
  display: flex;
  align-items: stretch;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #d9d9d9;
  transition: all 0.3s ease;
}

.form-input-wrapper:focus-within {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-input-wrapper-error {
  border-color: #f5222d;
}

.form-input-wrapper-error:focus-within {
  box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
}

/* 前缀和后缀 */
.form-input-prefix,
.form-input-suffix {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  background-color: #fafafa;
  color: #999;
  font-size: 14px;
  border-right: 1px solid #f0f0f0;
  white-space: nowrap;
}

.form-input-suffix {
  border-right: none;
  border-left: 1px solid #f0f0f0;
  cursor: pointer;
  transition: color 0.3s;
}

.form-input-suffix:hover {
  color: #1890ff;
}

/* 输入框基础样式 */
.form-input {
  flex: 1;
  padding: 8px 12px;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  background-color: transparent;
  transition: all 0.3s;
  min-width: 0;
}

.form-input::placeholder {
  color: #bfbfbf;
}

.form-input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px white inset;
}

/* 文本域样式 */
.form-input-textarea {
  flex: 1;
  padding: 8px 12px;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  background-color: transparent;
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
  transition: all 0.3s;
}

.form-input-textarea::placeholder {
  color: #bfbfbf;
}

/* 错误状态 */
.form-input-invalid,
.form-input-textarea-invalid {
  color: #f5222d;
}

/* 禁用状态 */
.form-input-disabled,
.form-input-textarea-disabled {
  color: rgba(0, 0, 0, 0.25);
  background-color: #f5f5f5;
  cursor: not-allowed;
}

/* 带前缀/后缀的输入框 */
.form-input-with-prefix {
  padding-left: 0;
}

.form-input-with-suffix {
  padding-right: 0;
}

.form-input-textarea-with-prefix {
  padding-left: 0;
}

.form-input-textarea-with-suffix {
  padding-right: 0;
}

/* 大小变体 */
.form-input-small,
.form-input-textarea-small {
  font-size: 12px;
  padding: 6px 8px;
}

.form-input-large,
.form-input-textarea-large {
  font-size: 16px;
  padding: 10px 16px;
}

.form-input-container-small .form-input-prefix,
.form-input-container-small .form-input-suffix {
  padding: 0 8px;
  font-size: 12px;
}

.form-input-container-large .form-input-prefix,
.form-input-container-large .form-input-suffix {
  padding: 0 16px;
  font-size: 16px;
}

/* 提示信息 */
.form-input-hint {
  margin-top: 4px;
  font-size: 12px;
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.form-input-error-icon {
  color: #f5222d;
  font-weight: bold;
  font-size: 14px;
  line-height: 1.2;
}

.form-input-error-message {
  color: #f5222d;
}

/* 字符计数器 */
.form-input-counter {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
  text-align: right;
}

.form-input-counter-warning {
  color: #fa8c16;
}

.form-input-counter-current,
.form-input-counter-separator,
.form-input-counter-max {
  display: inline-block;
}

/* 范围输入类型样式 */
input[type="range"].form-input {
  -webkit-appearance: none;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  padding: 0;
  outline: none;
}

input[type="range"].form-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1890ff;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

input[type="range"].form-input::-webkit-slider-thumb:hover {
  background: #40a9ff;
  transform: scale(1.2);
}

input[type="range"].form-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1890ff;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

input[type="range"].form-input::-moz-range-thumb:hover {
  background: #40a9ff;
  transform: scale(1.2);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .form-input-container {
    margin-bottom: 12px;
  }
  
  .form-input {
    font-size: 16px; /* 防止iOS缩放 */
  }
}
</style>