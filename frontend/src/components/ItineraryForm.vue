<template>
  <el-form 
    ref="itineraryForm" 
    :model="formData" 
    :rules="rules" 
    label-width="100px"
  >
    <el-form-item label="日期" prop="date">
      <el-date-picker
        v-model="formData.date"
        type="date"
        placeholder="选择日期"
        style="width: 100%"
        value-format="YYYY-MM-DD"
        :disabled-date="disabledDate"
      />
    </el-form-item>
    
    <el-form-item label="时间" prop="time">
      <el-time-picker
        v-model="formData.time"
        placeholder="选择时间"
        style="width: 100%"
        format="HH:mm"
        value-format="HH:mm"
      />
    </el-form-item>
    
    <el-form-item label="活动" prop="activity">
      <el-input 
        v-model="formData.activity" 
        placeholder="请输入活动名称"
        maxlength="100"
        show-word-limit
      />
    </el-form-item>
    
    <el-form-item label="地点" prop="location">
      <el-input 
        v-model="formData.location" 
        placeholder="请输入地点"
        maxlength="100"
        show-word-limit
      />
      <div class="location-tips" v-if="enableLocationSearch">
        <el-button 
          type="text" 
          size="small"
          @click="searchLocation"
          :disabled="!formData.location"
        >
          <i class="el-icon-search"></i> 搜索地点
        </el-button>
      </div>
    </el-form-item>
    
    <el-form-item label="交通方式" prop="transportation">
      <el-select v-model="formData.transportation" placeholder="选择交通方式" style="width: 100%">
        <el-option 
          v-for="method in transportationMethods" 
          :key="method.value" 
          :label="method.label" 
          :value="method.value"
        />
      </el-select>
    </el-form-item>
    
    <el-form-item label="预计费用" prop="cost">
      <el-input 
        v-model.number="formData.cost" 
        type="number" 
        placeholder="请输入预计费用（可选）" 
        prefix-icon="el-icon-money"
        :min="0"
        :step="0.01"
      />
    </el-form-item>
    
    <el-form-item label="备注" prop="notes">
      <el-input
        v-model="formData.notes"
        type="textarea"
        placeholder="添加备注信息（可选）"
        :rows="4"
        maxlength="200"
        show-word-limit
      />
    </el-form-item>
    
    <el-form-item label="优先级" prop="priority" v-if="showPriority">
      <el-rate
        v-model="formData.priority"
        :max="3"
        :texts="['低', '中', '高']"
        show-text
      />
    </el-form-item>
    
    <el-form-item label="提醒" prop="reminder" v-if="showReminder">
      <el-select v-model="formData.reminder" placeholder="选择提醒时间" style="width: 100%">
        <el-option 
          v-for="reminder in reminderOptions" 
          :key="reminder.value" 
          :label="reminder.label" 
          :value="reminder.value"
        />
      </el-select>
    </el-form-item>
    
    <el-form-item>
      <div class="form-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEditing ? '保存修改' : '添加行程' }}
        </el-button>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
import { createValidationRules } from '@/utils/validation'
import dayjs from 'dayjs'

export default {
  name: 'ItineraryForm',
  props: {
    // 初始表单数据
    initialData: {
      type: Object,
      default: () => ({})
    },
    // 旅行计划ID
    travelPlanId: {
      type: String,
      required: true
    },
    // 旅行计划日期范围
    travelDateRange: {
      type: Object,
      default: () => ({})
    },
    // 是否为编辑模式
    isEditing: {
      type: Boolean,
      default: false
    },
    // 是否显示优先级选择
    showPriority: {
      type: Boolean,
      default: false
    },
    // 是否显示提醒设置
    showReminder: {
      type: Boolean,
      default: false
    },
    // 是否启用地点搜索
    enableLocationSearch: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validation = createValidationRules()
    
    return {
      submitting: false,
      formData: {
        date: '',
        time: '09:00',
        activity: '',
        location: '',
        transportation: '',
        cost: 0,
        notes: '',
        priority: 2,
        reminder: '',
        travelPlanId: ''
      },
      rules: {
        date: [
          validation.required,
          validation.dateFormat
        ],
        time: [
          validation.required,
          validation.timeFormat
        ],
        activity: [
          validation.required,
          validation.minLength(2),
          validation.maxLength(100)
        ],
        location: [
          validation.required,
          validation.minLength(1),
          validation.maxLength(100)
        ],
        cost: [
          validation.nonNegativeNumber
        ],
        notes: [
          validation.maxLength(200)
        ]
      },
      transportationMethods: [
        { value: '', label: '请选择' },
        { value: 'WALK', label: '步行' },
        { value: 'PUBLIC_TRANSIT', label: '公共交通' },
        { value: 'TAXI', label: '出租车' },
        { value: 'CAR', label: '自驾' },
        { value: 'BIKE', label: '自行车' },
        { value: 'BUS', label: '公交车' },
        { value: 'SUBWAY', label: '地铁' },
        { value: 'TRAIN', label: '火车' },
        { value: 'PLANE', label: '飞机' },
        { value: 'SHIP', label: '船' },
        { value: 'OTHER', label: '其他' }
      ],
      reminderOptions: [
        { value: '', label: '无提醒' },
        { value: 'AT_TIME', label: '准时提醒' },
        { value: '5_MINUTES_BEFORE', label: '提前5分钟' },
        { value: '15_MINUTES_BEFORE', label: '提前15分钟' },
        { value: '30_MINUTES_BEFORE', label: '提前30分钟' },
        { value: '1_HOUR_BEFORE', label: '提前1小时' },
        { value: '1_DAY_BEFORE', label: '提前1天' }
      ]
    }
  },
  watch: {
    // 监听初始数据变化
    initialData: {
      handler(newData) {
        this.initForm(newData)
      },
      deep: true,
      immediate: true
    },
    
    // 监听旅行计划ID变化
    travelPlanId: {
      handler(newId) {
        if (newId) {
          this.formData.travelPlanId = newId
        }
      },
      immediate: true
    }
  },
  methods: {
    // 初始化表单
    initForm(data = {}) {
      // 设置默认日期
      let defaultDate = ''
      if (this.travelDateRange && this.travelDateRange.startDate) {
        defaultDate = this.travelDateRange.startDate
      } else {
        defaultDate = new Date().toISOString().split('T')[0]
      }
      
      this.formData = {
        date: defaultDate,
        time: '09:00',
        activity: '',
        location: '',
        transportation: '',
        cost: 0,
        notes: '',
        priority: 2,
        reminder: '',
        travelPlanId: this.travelPlanId,
        ...data
      }
    },
    
    // 禁用特定日期
    disabledDate(time) {
      // 如果提供了旅行日期范围，限制只能选择范围内的日期
      if (this.travelDateRange) {
        const { startDate, endDate } = this.travelDateRange
        
        if (startDate) {
          const start = dayjs(startDate).startOf('day')
          if (time < start) return true
        }
        
        if (endDate) {
          const end = dayjs(endDate).endOf('day')
          if (time > end) return true
        }
      }
      
      return false
    },
    
    // 搜索地点
    searchLocation() {
      if (!this.formData.location) {
        this.$message.warning('请先输入地点名称')
        return
      }
      
      // 触发地点搜索事件
      this.$emit('search-location', this.formData.location)
    },
    
    // 提交表单
    async handleSubmit() {
      this.$refs.itineraryForm.validate(async (valid) => {
        if (!valid) {
          this.$message.warning('请完善表单信息')
          return
        }
        
        try {
          this.submitting = true
          
          // 准备提交数据
          const submitData = {
            ...this.formData,
            cost: Number(this.formData.cost) // 确保费用是数字类型
          }
          
          // 触发提交事件
          this.$emit('submit', submitData)
          
        } catch (error) {
          console.error('Submit error:', error)
          this.$message.error('提交失败，请重试')
        } finally {
          this.submitting = false
        }
      })
    },
    
    // 取消操作
    handleCancel() {
      // 重置表单验证状态
      if (this.$refs.itineraryForm) {
        this.$refs.itineraryForm.resetFields()
      }
      
      // 触发取消事件
      this.$emit('cancel')
    },
    
    // 重置表单
    resetForm() {
      this.initForm()
      if (this.$refs.itineraryForm) {
        this.$refs.itineraryForm.resetFields()
      }
    },
    
    // 获取表单数据
    getFormData() {
      return { ...this.formData }
    }
  }
}
</script>

<style scoped>
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.location-tips {
  margin-top: 5px;
  display: flex;
  justify-content: flex-end;
}
</style>