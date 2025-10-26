<template>
  <div class="itinerary-item-form-container">
    <el-form 
      ref="itineraryForm"
      :model="formData" 
      :rules="rules" 
      label-width="120px"
      class="itinerary-form"
      @submit.native.prevent="handleSubmit"
    >
      <el-card shadow="hover" class="form-card">
        <!-- 行程基本信息 -->
        <div slot="header" class="form-header">
          <span>{{ isEditMode ? '编辑行程项' : '添加行程项' }}</span>
        </div>
        
        <el-row :gutter="20">
          <!-- 左侧列 -->
          <el-col :span="12">
            <!-- 行程标题 -->
            <el-form-item label="行程标题" prop="title">
              <el-input 
                v-model="formData.title" 
                placeholder="请输入行程标题" 
                size="large"
                maxlength="100"
                show-word-limit
              ></el-input>
            </el-form-item>
            
            <!-- 日期 -->
            <el-form-item label="日期" prop="date">
              <el-date-picker 
                v-model="formData.date" 
                type="date" 
                placeholder="选择日期" 
                value-format="YYYY-MM-DD"
                size="large"
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>
            
            <!-- 开始时间 -->
            <el-form-item label="开始时间" prop="startTime">
              <el-time-picker 
                v-model="formData.startTime" 
                placeholder="选择开始时间" 
                format="HH:mm" 
                value-format="HH:mm"
                size="large"
                style="width: 100%"
              ></el-time-picker>
            </el-form-item>
            
            <!-- 结束时间 -->
            <el-form-item label="结束时间" prop="endTime">
              <el-time-picker 
                v-model="formData.endTime" 
                placeholder="选择结束时间" 
                format="HH:mm" 
                value-format="HH:mm"
                size="large"
                style="width: 100%"
              ></el-time-picker>
            </el-form-item>
            
            <!-- 行程类型 -->
            <el-form-item label="行程类型" prop="type">
              <el-select 
                v-model="formData.type" 
                placeholder="请选择行程类型" 
                size="large"
                style="width: 100%"
              >
                <el-option label="交通" value="TRANSPORTATION"></el-option>
                <el-option label="住宿" value="ACCOMMODATION"></el-option>
                <el-option label="餐饮" value="FOOD"></el-option>
                <el-option label="景点游览" value="ATTRACTION"></el-option>
                <el-option label="购物" value="SHOPPING"></el-option>
                <el-option label="娱乐活动" value="ENTERTAINMENT"></el-option>
                <el-option label="休息" value="REST"></el-option>
                <el-option label="其他" value="OTHER"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          
          <!-- 右侧列 -->
          <el-col :span="12">
            <!-- 地点 -->
            <el-form-item label="地点" prop="location">
              <el-input 
                v-model="formData.location" 
                placeholder="请输入地点" 
                size="large"
                maxlength="100"
                show-word-limit
              ></el-input>
            </el-form-item>
            
            <!-- 地址 -->
            <el-form-item label="详细地址（可选）">
              <el-input 
                v-model="formData.address" 
                placeholder="请输入详细地址" 
                size="large"
                maxlength="200"
                show-word-limit
              ></el-input>
            </el-form-item>
            
            <!-- 费用 -->
            <el-form-item label="预计费用（元）（可选）">
              <el-input-number 
                v-model="formData.cost" 
                :min="0" 
                :step="1" 
                :precision="2"
                size="large"
                style="width: 100%"
                placeholder="请输入预计费用"
              ></el-input-number>
            </el-form-item>
            
            <!-- 备注 -->
            <el-form-item label="备注（可选）">
              <el-input
                v-model="formData.note"
                type="textarea"
                :rows="4"
                placeholder="添加备注信息（可选）"
                maxlength="500"
                show-word-limit
                size="large"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 详细描述 -->
        <el-form-item label="详细描述（可选）">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="添加详细描述信息（可选）"
            maxlength="1000"
            show-word-limit
            size="large"
          ></el-input>
        </el-form-item>
      </el-card>
      
      <!-- 表单操作按钮 -->
      <div class="form-actions">
        <el-button size="large" @click="handleCancel">取消</el-button>
        <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit">
          {{ isEditMode ? '更新' : '保存' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'ItineraryItemForm',
  props: {
    // 是否为编辑模式
    isEditMode: {
      type: Boolean,
      default: false
    },
    // 行程项数据（编辑模式下使用）
    itemData: {
      type: Object,
      default: () => ({})
    },
    // 默认日期（可选，新增行程项时使用）
    defaultDate: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 表单数据
      formData: {
        title: '',
        date: dayjs().format('YYYY-MM-DD'),
        startTime: '09:00',
        endTime: '10:00',
        type: 'ATTRACTION',
        location: '',
        address: '',
        cost: null,
        description: '',
        note: ''
      },
      // 提交状态
      submitting: false,
      // 表单验证规则
      rules: {
        title: [
          { required: true, message: '请输入行程标题', trigger: 'blur' },
          { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
        ],
        date: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ],
        startTime: [
          { required: true, message: '请选择开始时间', trigger: 'change' }
        ],
        endTime: [
          { required: true, message: '请选择结束时间', trigger: 'change' },
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback()
              } else if (this.formData.startTime && value <= this.formData.startTime) {
                callback(new Error('结束时间必须晚于开始时间'))
              } else {
                callback()
              }
            },
            trigger: 'change'
          }
        ],
        type: [
          { required: true, message: '请选择行程类型', trigger: 'change' }
        ],
        location: [
          { required: true, message: '请输入地点', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 是否为新增模式
    isCreateMode() {
      return !this.isEditMode
    }
  },
  watch: {
    // 监听行程项数据变化（编辑模式）
    itemData: {
      handler(newData) {
        if (newData && this.isEditMode) {
          this.loadItemData(newData)
        }
      },
      immediate: true,
      deep: true
    },
    // 监听默认日期变化（新增模式）
    defaultDate(newDate) {
      if (newDate && this.isCreateMode) {
        this.formData.date = newDate
      }
    }
  },
  methods: {
    // 加载行程项数据（编辑模式）
    loadItemData(item) {
      this.formData = {
        id: item.id || '',
        title: item.title || '',
        date: item.date || (this.defaultDate || dayjs().format('YYYY-MM-DD')),
        startTime: item.startTime || '09:00',
        endTime: item.endTime || '10:00',
        type: item.type || 'ATTRACTION',
        location: item.location || '',
        address: item.address || '',
        cost: item.cost || null,
        description: item.description || '',
        note: item.note || ''
      }
    },
    
    // 重置表单
    resetForm() {
      if (this.$refs.itineraryForm) {
        this.$refs.itineraryForm.resetFields()
      }
      
      this.formData = {
        title: '',
        date: this.defaultDate || dayjs().format('YYYY-MM-DD'),
        startTime: '09:00',
        endTime: '10:00',
        type: 'ATTRACTION',
        location: '',
        address: '',
        cost: null,
        description: '',
        note: ''
      }
    },
    
    // 表单验证
    validateForm() {
      return new Promise((resolve, reject) => {
        if (this.$refs.itineraryForm) {
          this.$refs.itineraryForm.validate(valid => {
            if (valid) {
              resolve(true)
            } else {
              reject(new Error('表单验证失败'))
            }
          })
        } else {
          resolve(true)
        }
      })
    },
    
    // 提交表单
    async handleSubmit() {
      try {
        // 表单验证
        await this.validateForm()
        
        // 设置提交状态
        this.submitting = true
        
        // 提交数据
        this.$emit('submit', { ...this.formData })
      } catch (error) {
        this.$message.error('请检查表单信息')
        console.error('表单验证失败:', error)
      } finally {
        this.submitting = false
      }
    },
    
    // 取消
    handleCancel() {
      this.$emit('cancel')
    },
    
    // 获取表单数据
    getFormData() {
      return { ...this.formData }
    }
  },
  // 组件挂载时，如果是新增模式且没有数据，则初始化表单
  mounted() {
    if (this.isCreateMode) {
      // 如果有默认日期，则使用默认日期
      if (this.defaultDate) {
        this.formData.date = this.defaultDate
      }
    }
  }
}
</script>

<style scoped>
.itinerary-item-form-container {
  width: 100%;
}

.form-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.form-header {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.itinerary-form {
  padding: 0 10px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
  padding: 15px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .itinerary-form {
    padding: 0;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions button {
    width: 100%;
  }
}
</style>