<template>
  <div class="date-picker-container">
    <!-- 输入框 -->
    <div 
      class="date-input"
      :class="{
        'focused': isFocused,
        'disabled': disabled,
        'error': hasError
      }"
      @click="togglePicker"
      @focus="isFocused = true"
      @blur="handleBlur"
    >
      <!-- 输入框内容 -->
      <div class="input-content">
        <i class="date-icon"></i>
        <span v-if="displayValue" class="date-text">{{ displayValue }}</span>
        <span v-else class="placeholder">{{ placeholder }}</span>
      </div>
      <i class="arrow-icon" :class="{ 'rotated': isOpen }"></i>
    </div>

    <!-- 错误信息 -->
    <div v-if="hasError && errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- 日期选择器面板 -->
    <div 
      v-if="isOpen" 
      class="picker-panel"
      :class="{
        'show-time': showTime,
        'range': isRangePicker,
        'inline': inline
      }"
      ref="pickerPanel"
    >
      <!-- 标题栏 -->
      <div v-if="!inline" class="panel-header">
        <div class="header-left">
          <button 
            v-if="!isRangePicker"
            class="btn-text" 
            @click="today"
          >
            今天
          </button>
        </div>
        <div class="header-center">
          <!-- 单选日期标题 -->
          <div v-if="!isRangePicker" class="header-title">
            {{ formatYearMonth(currentDate) }}
          </div>
          <!-- 范围日期标题 -->
          <div v-else class="header-title">
            {{ formatYearMonth(rangeStartDate) }} - {{ formatYearMonth(rangeEndDate) }}
          </div>
        </div>
        <div class="header-right">
          <button 
            v-if="!isRangePicker"
            class="btn-text" 
            @click="clear"
          >
            清除
          </button>
        </div>
      </div>

      <!-- 日期面板 -->
      <div class="calendar-container">
        <!-- 单选日期 -->
        <div v-if="!isRangePicker" class="calendar">
          <!-- 星期标题 -->
          <div class="week-header">
            <div v-for="day in weekDays" :key="day" class="week-day">
              {{ day }}
            </div>
          </div>

          <!-- 日期网格 -->
          <div class="days-grid">
            <div 
              v-for="day in calendarDays" 
              :key="day.key"
              class="day-cell"
              :class="{
                'disabled': day.disabled,
                'today': day.isToday,
                'selected': day.isSelected,
                'other-month': day.isOtherMonth,
                'start-date': day.isStartDate,
                'end-date': day.isEndDate,
                'in-range': day.isInRange
              }"
              @click="selectDate(day.date)"
            >
              {{ day.text }}
            </div>
          </div>
        </div>

        <!-- 范围日期 -->
        <div v-else class="range-calendar">
          <!-- 开始日期面板 -->
          <div class="calendar">
            <div class="month-header">{{ formatYearMonth(rangeStartDate) }}</div>
            <div class="week-header">
              <div v-for="day in weekDays" :key="'start-' + day" class="week-day">
                {{ day }}
              </div>
            </div>
            <div class="days-grid">
              <div 
                v-for="day in rangeStartCalendarDays" 
                :key="'start-' + day.key"
                class="day-cell"
                :class="{
                  'disabled': day.disabled,
                  'today': day.isToday,
                  'selected': day.isSelected,
                  'other-month': day.isOtherMonth,
                  'start-date': day.isStartDate,
                  'end-date': day.isEndDate,
                  'in-range': day.isInRange
                }"
                @click="selectRangeStartDate(day.date)"
              >
                {{ day.text }}
              </div>
            </div>
          </div>

          <!-- 结束日期面板 -->
          <div class="calendar">
            <div class="month-header">{{ formatYearMonth(rangeEndDate) }}</div>
            <div class="week-header">
              <div v-for="day in weekDays" :key="'end-' + day" class="week-day">
                {{ day }}
              </div>
            </div>
            <div class="days-grid">
              <div 
                v-for="day in rangeEndCalendarDays" 
                :key="'end-' + day.key"
                class="day-cell"
                :class="{
                  'disabled': day.disabled,
                  'today': day.isToday,
                  'selected': day.isSelected,
                  'other-month': day.isOtherMonth,
                  'start-date': day.isStartDate,
                  'end-date': day.isEndDate,
                  'in-range': day.isInRange
                }"
                @click="selectRangeEndDate(day.date)"
              >
                {{ day.text }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 月份切换 -->
      <div v-if="!inline" class="panel-footer">
        <!-- 单选日期 -->
        <div v-if="!isRangePicker" class="month-nav">
          <button 
            class="btn-icon" 
            @click="prevMonth"
            title="上个月"
          >
            <i class="prev-icon"></i>
          </button>
          <div class="month-display">{{ formatYearMonth(currentDate) }}</div>
          <button 
            class="btn-icon" 
            @click="nextMonth"
            title="下个月"
          >
            <i class="next-icon"></i>
          </button>
        </div>

        <!-- 范围日期 -->
        <div v-else class="month-nav">
          <button 
            class="btn-icon" 
            @click="prevStartMonth"
            title="上个月"
          >
            <i class="prev-icon"></i>
          </button>
          <div class="month-display">
            {{ formatYearMonth(rangeStartDate) }}
          </div>
          <button 
            class="btn-icon" 
            @click="nextStartMonth"
            title="下个月"
          >
            <i class="next-icon"></i>
          </button>
        </div>
      </div>

      <!-- 时间选择器 -->
      <div v-if="showTime && !isRangePicker" class="time-picker">
        <div class="time-section">
          <label>时</label>
          <select v-model="selectedHour" @change="updateTime">
            <option 
              v-for="hour in 24" 
              :key="hour - 1" 
              :value="String(hour - 1).padStart(2, '0')"
            >
              {{ String(hour - 1).padStart(2, '0') }}
            </option>
          </select>
        </div>
        <div class="time-separator">:</div>
        <div class="time-section">
          <label>分</label>
          <select v-model="selectedMinute" @change="updateTime">
            <option 
              v-for="minute in 60" 
              :key="minute - 1" 
              :value="String(minute - 1).padStart(2, '0')"
            >
              {{ String(minute - 1).padStart(2, '0') }}
            </option>
          </select>
        </div>
        <div v-if="showSecond" class="time-separator">:</div>
        <div v-if="showSecond" class="time-section">
          <label>秒</label>
          <select v-model="selectedSecond" @change="updateTime">
            <option 
              v-for="second in 60" 
              :key="second - 1" 
              :value="String(second - 1).padStart(2, '0')"
            >
              {{ String(second - 1).padStart(2, '0') }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { DATE_FORMAT } from '../constants'

export default {
  name: 'DatePicker',
  
  props: {
    // 绑定值
    value: {
      type: [String, Date, Array],
      default: null
    },
    // 占位符
    placeholder: {
      type: String,
      default: '请选择日期'
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 最小日期
    minDate: {
      type: [String, Date],
      default: null
    },
    // 最大日期
    maxDate: {
      type: [String, Date],
      default: null
    },
    // 是否显示时间
    showTime: {
      type: Boolean,
      default: false
    },
    // 是否显示秒
    showSecond: {
      type: Boolean,
      default: false
    },
    // 是否为范围选择器
    range: {
      type: Boolean,
      default: false
    },
    // 日期格式
    format: {
      type: String,
      default: DATE_FORMAT.DATE
    },
    // 范围选择器的分隔符
    rangeSeparator: {
      type: String,
      default: ' 至 '
    },
    // 是否内联显示
    inline: {
      type: Boolean,
      default: false
    },
    // 错误状态
    error: {
      type: Boolean,
      default: false
    },
    // 错误信息
    errorMessage: {
      type: String,
      default: ''
    }
  },
  
  data() {
    return {
      // 是否打开选择器
      isOpen: this.inline,
      // 是否聚焦
      isFocused: false,
      // 当前显示的日期（单选）
      currentDate: dayjs(),
      // 开始日期（范围）
      rangeStartDate: dayjs(),
      // 结束日期（范围）
      rangeEndDate: dayjs().add(1, 'month'),
      // 选中的小时
      selectedHour: '00',
      // 选中的分钟
      selectedMinute: '00',
      // 选中的秒
      selectedSecond: '00',
      // 星期标题
      weekDays: ['日', '一', '二', '三', '四', '五', '六']
    }
  },
  
  computed: {
    // 是否为范围选择器
    isRangePicker() {
      return this.range
    },
    
    // 显示值
    displayValue() {
      if (!this.value) return ''
      
      if (this.isRangePicker && Array.isArray(this.value)) {
        const [start, end] = this.value
        if (!start) return ''
        const startFormatted = dayjs(start).format(this.format)
        if (!end) return startFormatted
        return startFormatted + this.rangeSeparator + dayjs(end).format(this.format)
      } else {
        return dayjs(this.value).format(this.format)
      }
    },
    
    // 是否有错误
    hasError() {
      return this.error
    },
    
    // 单选日期的日历天数据
    calendarDays() {
      const year = this.currentDate.year()
      const month = this.currentDate.month()
      
      // 当月第一天
      const firstDay = dayjs().year(year).month(month).date(1)
      // 当月最后一天
      const lastDay = firstDay.endOf('month')
      // 日历开始日期（上个月的某一天）
      const startDate = firstDay.startOf('week')
      // 日历结束日期（下个月的某一天）
      const endDate = lastDay.endOf('week')
      
      const days = []
      let current = startDate
      
      // 生成日历天数
      while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
        const isToday = current.isSame(dayjs(), 'day')
        const isOtherMonth = current.month() !== month
        const isSelected = this.value && current.isSame(dayjs(this.value), 'day')
        const isDisabled = this.isDisabledDate(current)
        
        days.push({
          key: current.format('YYYY-MM-DD'),
          date: current,
          text: current.date(),
          isToday,
          isOtherMonth,
          isSelected,
          isDisabled,
          isStartDate: false,
          isEndDate: false,
          isInRange: false
        })
        
        current = current.add(1, 'day')
      }
      
      return days
    },
    
    // 范围选择开始日期的日历数据
    rangeStartCalendarDays() {
      return this.generateRangeCalendarDays(this.rangeStartDate, true)
    },
    
    // 范围选择结束日期的日历数据
    rangeEndCalendarDays() {
      return this.generateRangeCalendarDays(this.rangeEndDate, false)
    }
  },
  
  watch: {
    // 监听值变化
    value: {
      handler(newVal) {
        if (newVal && this.showTime && !this.isRangePicker) {
          this.updateTimeFromValue(newVal)
        }
      },
      immediate: true
    },
    
    // 监听内联状态变化
    inline(newVal) {
      this.isOpen = newVal
    }
  },
  
  mounted() {
    // 点击外部关闭选择器
    document.addEventListener('click', this.handleDocumentClick)
    // 处理键盘事件
    document.addEventListener('keydown', this.handleKeyDown)
  },
  
  beforeUnmount() {
    // 移除事件监听
    document.removeEventListener('click', this.handleDocumentClick)
    document.removeEventListener('keydown', this.handleKeyDown)
  },
  
  methods: {
    // 切换选择器显示状态
    togglePicker() {
      if (this.disabled) return
      this.isOpen = !this.isOpen
    },
    
    // 处理失焦
    handleBlur() {
      // 延迟设置失焦，以便点击选择器内部元素时不会关闭
      setTimeout(() => {
        this.isFocused = false
      }, 200)
    },
    
    // 处理文档点击
    handleDocumentClick(event) {
      if (!this.isOpen || this.inline) return
      
      const pickerContainer = this.$el
      if (!pickerContainer.contains(event.target)) {
        this.isOpen = false
        this.isFocused = false
      }
    },
    
    // 处理键盘事件
    handleKeyDown(event) {
      if (!this.isOpen) return
      
      // ESC 关闭选择器
      if (event.key === 'Escape') {
        this.isOpen = false
        this.isFocused = false
      }
    },
    
    // 生成范围选择的日历数据
    generateRangeCalendarDays(date, isStartCalendar) {
      const year = date.year()
      const month = date.month()
      
      // 当月第一天
      const firstDay = dayjs().year(year).month(month).date(1)
      // 当月最后一天
      const lastDay = firstDay.endOf('month')
      // 日历开始日期
      const startDate = firstDay.startOf('week')
      // 日历结束日期
      const endDate = lastDay.endOf('week')
      
      const days = []
      let current = startDate
      
      // 获取选中的开始和结束日期
      let selectedStart = null
      let selectedEnd = null
      if (this.value && Array.isArray(this.value)) {
        selectedStart = this.value[0] ? dayjs(this.value[0]) : null
        selectedEnd = this.value[1] ? dayjs(this.value[1]) : null
      }
      
      // 生成日历天数
      while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
        const isToday = current.isSame(dayjs(), 'day')
        const isOtherMonth = current.month() !== month
        const isDisabled = this.isDisabledDate(current)
        
        // 判断是否为选中状态
        let isSelected = false
        let isStartDate = false
        let isEndDate = false
        let isInRange = false
        
        if (selectedStart) {
          if (current.isSame(selectedStart, 'day')) {
            isSelected = true
            isStartDate = true
          }
          
          if (selectedEnd && current.isSame(selectedEnd, 'day')) {
            isSelected = true
            isEndDate = true
          }
          
          if (selectedStart && selectedEnd) {
            if ((current.isAfter(selectedStart, 'day') && current.isBefore(selectedEnd, 'day'))) {
              isInRange = true
            }
          } else if (isStartCalendar && current.isAfter(selectedStart, 'day')) {
            // 如果是开始日历且没有结束日期，选中日期之后的日期都禁用
            isDisabled = true
          } else if (!isStartCalendar && selectedStart && current.isBefore(selectedStart, 'day')) {
            // 如果是结束日历且有开始日期，选中日期之前的日期都禁用
            isDisabled = true
          }
        }
        
        days.push({
          key: current.format('YYYY-MM-DD'),
          date: current,
          text: current.date(),
          isToday,
          isOtherMonth,
          isSelected,
          isDisabled,
          isStartDate,
          isEndDate,
          isInRange
        })
        
        current = current.add(1, 'day')
      }
      
      return days
    },
    
    // 判断日期是否禁用
    isDisabledDate(date) {
      // 检查最小日期
      if (this.minDate && date.isBefore(dayjs(this.minDate), 'day')) {
        return true
      }
      
      // 检查最大日期
      if (this.maxDate && date.isAfter(dayjs(this.maxDate), 'day')) {
        return true
      }
      
      return false
    },
    
    // 选择日期（单选）
    selectDate(date) {
      if (date.disabled) return
      
      let selectedDate = date.date
      
      // 如果显示时间，设置选中的时间
      if (this.showTime) {
        selectedDate = selectedDate
          .hour(parseInt(this.selectedHour))
          .minute(parseInt(this.selectedMinute))
          .second(parseInt(this.selectedSecond))
      }
      
      // 发射值变化事件
      this.$emit('input', selectedDate.format(this.format))
      this.$emit('change', selectedDate.format(this.format))
      
      // 非内联模式下关闭选择器
      if (!this.inline) {
        this.isOpen = false
      }
    },
    
    // 选择范围开始日期
    selectRangeStartDate(date) {
      if (date.disabled) return
      
      const startDate = date.date
      let newRange = [startDate.format(this.format), null]
      
      // 如果已经有结束日期且在开始日期之前，则清空结束日期
      if (this.value && Array.isArray(this.value) && this.value[1]) {
        const endDate = dayjs(this.value[1])
        if (startDate.isAfter(endDate) || startDate.isSame(endDate, 'day')) {
          newRange = [startDate.format(this.format), null]
        } else {
          newRange = [startDate.format(this.format), this.value[1]]
        }
      }
      
      // 更新选中值
      this.$emit('input', newRange)
      this.$emit('change', newRange)
    },
    
    // 选择范围结束日期
    selectRangeEndDate(date) {
      if (date.disabled) return
      
      const endDate = date.date
      let newRange = [null, endDate.format(this.format)]
      
      // 如果已经有开始日期，组合成范围
      if (this.value && Array.isArray(this.value) && this.value[0]) {
        const startDate = dayjs(this.value[0])
        if (endDate.isBefore(startDate)) {
          // 如果结束日期在开始日期之前，交换它们
          newRange = [endDate.format(this.format), startDate.format(this.format)]
        } else {
          newRange = [this.value[0], endDate.format(this.format)]
        }
      }
      
      // 更新选中值
      this.$emit('input', newRange)
      this.$emit('change', newRange)
      
      // 非内联模式下关闭选择器
      if (!this.inline) {
        this.isOpen = false
      }
    },
    
    // 上个月
    prevMonth() {
      this.currentDate = this.currentDate.subtract(1, 'month')
    },
    
    // 下个月
    nextMonth() {
      this.currentDate = this.currentDate.add(1, 'month')
    },
    
    // 开始日期上个月
    prevStartMonth() {
      this.rangeStartDate = this.rangeStartDate.subtract(1, 'month')
    },
    
    // 开始日期下个月
    nextStartMonth() {
      this.rangeStartDate = this.rangeStartDate.add(1, 'month')
    },
    
    // 今天
    today() {
      this.currentDate = dayjs()
      this.selectDate({
        date: dayjs(),
        disabled: false
      })
    },
    
    // 清除
    clear() {
      if (this.isRangePicker) {
        this.$emit('input', [null, null])
        this.$emit('change', [null, null])
      } else {
        this.$emit('input', null)
        this.$emit('change', null)
      }
      
      // 重置时间
      if (this.showTime) {
        this.selectedHour = '00'
        this.selectedMinute = '00'
        this.selectedSecond = '00'
      }
      
      // 非内联模式下关闭选择器
      if (!this.inline) {
        this.isOpen = false
      }
    },
    
    // 更新时间
    updateTime() {
      if (!this.value) return
      
      const date = dayjs(this.value)
        .hour(parseInt(this.selectedHour))
        .minute(parseInt(this.selectedMinute))
        .second(parseInt(this.selectedSecond))
      
      this.$emit('input', date.format(this.format))
      this.$emit('change', date.format(this.format))
    },
    
    // 从值更新时间
    updateTimeFromValue(value) {
      const date = dayjs(value)
      this.selectedHour = String(date.hour()).padStart(2, '0')
      this.selectedMinute = String(date.minute()).padStart(2, '0')
      this.selectedSecond = String(date.second()).padStart(2, '0')
    },
    
    // 格式化年月
    formatYearMonth(date) {
      return date.format('YYYY年MM月')
    },
    
    // 获取选中的日期对象
    getSelectedDate() {
      if (!this.value) return null
      
      if (this.isRangePicker && Array.isArray(this.value)) {
        return {
          start: this.value[0] ? dayjs(this.value[0]) : null,
          end: this.value[1] ? dayjs(this.value[1]) : null
        }
      } else {
        return dayjs(this.value)
      }
    },
    
    // 设置日期
    setDate(date) {
      this.$emit('input', date)
    },
    
    // 设置范围日期
    setRange(start, end) {
      this.$emit('input', [start, end])
    }
  }
}
</script>

<style scoped>
.date-picker-container {
  position: relative;
  display: inline-block;
  width: 100%;
}

.date-input {
  position: relative;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fff;
}

.date-input:hover {
  border-color: #40a9ff;
}

.date-input.focused {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.date-input.disabled {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  cursor: not-allowed;
  color: rgba(0, 0, 0, 0.25);
}

.date-input.error {
  border-color: #ff4d4f;
}

.date-input.error.focused {
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
}

.input-content {
  display: flex;
  align-items: center;
  overflow: hidden;
}

.date-icon {
  margin-right: 8px;
  color: #999;
  font-size: 16px;
}

.date-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(0, 0, 0, 0.85);
}

.placeholder {
  color: rgba(0, 0, 0, 0.25);
}

.arrow-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  transition: transform 0.3s;
  color: #999;
}

.arrow-icon.rotated {
  transform: translateY(-50%) rotate(180deg);
}

.error-message {
  margin-top: 4px;
  font-size: 12px;
  color: #ff4d4f;
}

.picker-panel {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  width: 280px;
}

.picker-panel.show-time {
  width: 320px;
}

.picker-panel.range {
  width: 560px;
}

.picker-panel.inline {
  position: static;
  box-shadow: none;
  margin-top: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.header-title {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.btn-text {
  background: transparent;
  border: none;
  padding: 4px 8px;
  color: #1890ff;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-text:hover {
  background-color: #e6f7ff;
}

.calendar-container {
  padding: 8px;
}

.calendar {
  width: 100%;
}

.month-header {
  text-align: center;
  font-weight: 500;
  padding: 4px 0;
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.85);
}

.week-header {
  display: flex;
  margin-bottom: 4px;
}

.week-day {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  padding: 4px 0;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day-cell {
  text-align: center;
  padding: 4px 0;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-cell:hover:not(.disabled) {
  background-color: #e6f7ff;
}

.day-cell.disabled {
  color: rgba(0, 0, 0, 0.25);
  cursor: not-allowed;
}

.day-cell.today {
  color: #1890ff;
  font-weight: 500;
}

.day-cell.selected {
  background-color: #1890ff;
  color: white;
}

.day-cell.other-month {
  color: rgba(0, 0, 0, 0.25);
}

.day-cell.start-date {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.day-cell.end-date {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

.day-cell.in-range {
  background-color: #e6f7ff;
  border-radius: 0;
}

.range-calendar {
  display: flex;
  gap: 16px;
}

.range-calendar .calendar {
  flex: 1;
}

.panel-footer {
  padding: 8px 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.month-nav {
  display: flex;
  align-items: center;
}

.btn-icon {
  background: transparent;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: #f5f5f5;
}

.month-display {
  padding: 0 16px;
  min-width: 120px;
  text-align: center;
  color: rgba(0, 0, 0, 0.85);
}

.time-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-top: 1px solid #f0f0f0;
  gap: 8px;
}

.time-section {
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-section label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.time-section select {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 2px 4px;
  min-width: 50px;
}

.time-separator {
  color: rgba(0, 0, 0, 0.85);
}

/* 图标样式（这里使用文字替代，实际项目中可使用图标库） */
.date-icon::before {
  content: '📅';
}

.arrow-icon::before {
  content: '▼';
  font-size: 12px;
}

.prev-icon::before {
  content: '←';
}

.next-icon::before {
  content: '→';
}
</style>