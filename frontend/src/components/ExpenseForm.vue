<template>
  <div class="expense-form-container">
    <el-form 
      ref="expenseForm"
      :model="formData" 
      :rules="rules" 
      label-width="120px"
      class="expense-form"
      @submit.native.prevent="handleSubmit"
    >
      <el-card shadow="hover" class="form-card">
        <!-- 基本信息 -->
        <div slot="header" class="form-header">
          <span>{{ isEditMode ? '编辑费用' : '添加费用' }}</span>
        </div>
        
        <el-row :gutter="20">
          <!-- 左侧列 -->
          <el-col :span="12">
            <!-- 描述 -->
            <el-form-item label="费用描述" prop="description">
              <el-input 
                v-model="formData.description" 
                placeholder="请输入费用描述" 
                size="large"
                maxlength="100"
                show-word-limit
              ></el-input>
            </el-form-item>
            
            <!-- 金额 -->
            <el-form-item label="金额（元）" prop="amount">
              <el-input-number 
                v-model="formData.amount" 
                :min="0.01" 
                :step="0.01" 
                :precision="2"
                size="large"
                style="width: 100%"
                placeholder="请输入费用金额"
              ></el-input-number>
            </el-form-item>
            
            <!-- 费用类型 -->
            <el-form-item label="费用类型" prop="type">
              <el-select 
                v-model="formData.type" 
                placeholder="请选择费用类型" 
                size="large"
                style="width: 100%"
              >
                <el-option label="交通" value="TRANSPORTATION"></el-option>
                <el-option label="住宿" value="ACCOMMODATION"></el-option>
                <el-option label="餐饮" value="FOOD"></el-option>
                <el-option label="景点门票" value="ATTRACTION"></el-option>
                <el-option label="购物" value="SHOPPING"></el-option>
                <el-option label="娱乐" value="ENTERTAINMENT"></el-option>
                <el-option label="其他" value="OTHER"></el-option>
              </el-select>
            </el-form-item>
            
            <!-- 支付方式 -->
            <el-form-item label="支付方式" prop="paymentMethod">
              <el-select 
                v-model="formData.paymentMethod" 
                placeholder="请选择支付方式" 
                size="large"
                style="width: 100%"
              >
                <el-option label="现金" value="CASH"></el-option>
                <el-option label="信用卡" value="CREDIT_CARD"></el-option>
                <el-option label="借记卡" value="DEBIT_CARD"></el-option>
                <el-option label="支付宝" value="ALIPAY"></el-option>
                <el-option label="微信支付" value="WECHAT_PAY"></el-option>
                <el-option label="银行转账" value="BANK_TRANSFER"></el-option>
                <el-option label="其他" value="OTHER"></el-option>
              </el-select>
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
          </el-col>
          
          <!-- 右侧列 -->
          <el-col :span="12">
            <!-- 旅行计划 -->
            <el-form-item label="关联旅行计划" prop="travelPlanId">
              <el-select 
                v-model="formData.travelPlanId" 
                placeholder="选择关联的旅行计划（可选）" 
                clearable
                size="large"
                filterable
                style="width: 100%"
              >
                <el-option 
                  v-for="plan in travelPlans" 
                  :key="plan.id" 
                  :label="plan.title + ' (' + plan.destination + ')" 
                  :value="plan.id" 
                ></el-option>
              </el-select>
            </el-form-item>
            
            <!-- 标签 -->
            <el-form-item label="标签（可选）">
              <el-select
                v-model="selectedTags"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="选择或输入标签"
                style="width: 100%"
                size="large"
              >
                <el-option
                  v-for="tag in commonTags"
                  :key="tag"
                  :label="tag"
                  :value="tag"
                ></el-option>
              </el-select>
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
  name: 'ExpenseForm',
  props: {
    // 是否为编辑模式
    isEditMode: {
      type: Boolean,
      default: false
    },
    // 费用数据（编辑模式下使用）
    expenseData: {
      type: Object,
      default: () => ({})
    },
    // 旅行计划列表
    travelPlans: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // 表单数据
      formData: {
        description: '',
        amount: null,
        type: '',
        date: dayjs().format('YYYY-MM-DD'),
        paymentMethod: '',
        travelPlanId: '',
        note: '',
        tags: []
      },
      // 选中的标签
      selectedTags: [],
      // 常用标签
      commonTags: ['紧急', '商务', '个人', '国外', '国内', '报销', '未报销'],
      // 提交状态
      submitting: false,
      // 表单验证规则
      rules: {
        description: [
          { required: true, message: '请输入费用描述', trigger: 'blur' },
          { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
        ],
        amount: [
          { required: true, message: '请输入费用金额', trigger: 'blur' },
          { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择费用类型', trigger: 'change' }
        ],
        date: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ],
        paymentMethod: [
          { required: true, message: '请选择支付方式', trigger: 'change' }
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
    // 监听费用数据变化（编辑模式）
    expenseData: {
      handler(newData) {
        if (newData && this.isEditMode) {
          this.loadExpenseData(newData)
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 加载费用数据（编辑模式）
    loadExpenseData(expense) {
      this.formData = {
        id: expense.id || '',
        description: expense.description || '',
        amount: expense.amount || null,
        type: expense.type || '',
        date: expense.date || dayjs().format('YYYY-MM-DD'),
        paymentMethod: expense.paymentMethod || '',
        travelPlanId: expense.travelPlanId || '',
        note: expense.note || '',
        tags: expense.tags || []
      }
      
      // 加载标签
      this.selectedTags = [...this.formData.tags]
    },
    
    // 重置表单
    resetForm() {
      if (this.$refs.expenseForm) {
        this.$refs.expenseForm.resetFields()
      }
      
      this.formData = {
        description: '',
        amount: null,
        type: '',
        date: dayjs().format('YYYY-MM-DD'),
        paymentMethod: '',
        travelPlanId: '',
        note: '',
        tags: []
      }
      
      this.selectedTags = []
    },
    
    // 表单验证
    validateForm() {
      return new Promise((resolve, reject) => {
        if (this.$refs.expenseForm) {
          this.$refs.expenseForm.validate(valid => {
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
        
        // 更新标签数据
        this.formData.tags = [...this.selectedTags]
        
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
      return { ...this.formData, tags: this.selectedTags }
    }
  },
  // 组件挂载时，如果是新增模式且没有数据，则初始化表单
  mounted() {
    if (this.isCreateMode) {
      this.resetForm()
    }
  }
}
</script>

<style scoped>
.expense-form-container {
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

.expense-form {
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
  .expense-form {
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