<template>
  <div class="expense-create-container">
    <h2 class="page-title">{{ isEdit ? '编辑费用' : '添加费用' }}</h2>
    
    <el-card shadow="hover" class="form-card">
      <el-form 
        :model="expenseForm" 
        :rules="rules" 
        ref="expenseFormRef" 
        label-width="120px"
      >
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="expenseForm.description" 
            placeholder="请输入费用描述" 
            maxlength="200"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="金额" prop="amount">
          <el-input 
            v-model.number="expenseForm.amount" 
            type="number" 
            placeholder="请输入金额" 
            min="0" 
            step="0.01"
          >
            <template slot="prepend">¥</template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="费用类型" prop="type">
          <el-select v-model="expenseForm.type" placeholder="请选择费用类型">
            <el-option label="交通" value="TRANSPORTATION"></el-option>
            <el-option label="住宿" value="ACCOMMODATION"></el-option>
            <el-option label="餐饮" value="FOOD"></el-option>
            <el-option label="景点门票" value="ATTRACTION"></el-option>
            <el-option label="购物" value="SHOPPING"></el-option>
            <el-option label="娱乐" value="ENTERTAINMENT"></el-option>
            <el-option label="其他" value="OTHER"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="expenseForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%;"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-select v-model="expenseForm.paymentMethod" placeholder="请选择支付方式">
            <el-option label="现金" value="CASH"></el-option>
            <el-option label="信用卡" value="CREDIT_CARD"></el-option>
            <el-option label="借记卡" value="DEBIT_CARD"></el-option>
            <el-option label="支付宝" value="ALIPAY"></el-option>
            <el-option label="微信支付" value="WECHAT_PAY"></el-option>
            <el-option label="银行转账" value="BANK_TRANSFER"></el-option>
            <el-option label="其他" value="OTHER"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="旅行计划" prop="travelPlanId">
          <el-select 
            v-model="expenseForm.travelPlanId" 
            placeholder="选择关联的旅行计划" 
            filterable
            clearable
          >
            <el-option 
              v-for="plan in travelPlans" 
              :key="plan.id" 
              :label="plan.title" 
              :value="plan.id" 
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="备注" prop="note">
          <el-input 
            v-model="expenseForm.note" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入备注信息"
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading">
            {{ isEdit ? '更新' : '保存' }}
          </el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button @click="goBack">返回列表</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 上传收据图片对话框 -->
    <el-dialog
      title="上传收据图片"
      :visible.sync="uploadDialogVisible"
      width="500px"
    >
      <el-upload
        class="upload-demo"
        :action="uploadUrl"
        :on-success="handleUploadSuccess"
        :before-upload="beforeUpload"
        list-type="picture-card"
        multiple
      >
        <i class="el-icon-plus"></i>
        <div class="el-upload__text">点击或拖拽文件到此处上传</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="uploadDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import dayjs from 'dayjs'

export default {
  name: 'ExpenseCreate',
  data() {
    return {
      expenseForm: {
        description: '',
        amount: '',
        type: '',
        date: dayjs().format('YYYY-MM-DD'),
        paymentMethod: '',
        travelPlanId: '',
        note: ''
      },
      rules: {
        description: [
          { required: true, message: '请输入费用描述', trigger: 'blur' },
          { min: 1, max: 200, message: '描述长度在 1 到 200 个字符', trigger: 'blur' }
        ],
        amount: [
          { required: true, message: '请输入金额', trigger: 'blur' },
          { type: 'number', min: 0, message: '金额必须大于0', trigger: 'blur' }
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
      },
      uploadDialogVisible: false,
      uploadUrl: '/api/upload', // 实际项目中需要替换为真实的上传接口
      isEditMode: false,
      editingExpenseId: null
    }
  },
  computed: {
    ...mapState(['travelPlans', 'loading']),
    
    isEdit() {
      return this.$route.path.includes('/edit/')
    }
  },
  watch: {
    $route: {
      handler(to) {
        // 监听路由变化，判断是编辑模式还是创建模式
        this.initForm()
      },
      immediate: true
    }
  },
  methods: {
    resetForm() {
      if (this.$refs.expenseFormRef) {
        this.$refs.expenseFormRef.resetFields()
      }
    },
    
    async submitForm() {
      try {
        await this.$refs.expenseFormRef.validate()
        
        if (this.isEdit) {
          // 编辑模式
          await this.$store.dispatch('updateExpense', {
            id: this.editingExpenseId,
            ...this.expenseForm
          })
          this.$message.success('费用记录已成功更新')
        } else {
          // 创建模式
          await this.$store.dispatch('createExpense', this.expenseForm)
          this.$message.success('费用记录已成功添加')
        }
        
        // 返回列表页
        this.goBack()
      } catch (error) {
        console.error('保存失败:', error)
        this.$message.error('保存失败，请稍后再试')
      }
    },
    
    goBack() {
      this.$router.push('/expense/list')
    },
    
    initForm() {
      // 重置表单数据
      this.expenseForm = {
        description: '',
        amount: '',
        type: '',
        date: dayjs().format('YYYY-MM-DD'),
        paymentMethod: '',
        travelPlanId: '',
        note: ''
      }
      
      if (this.isEdit) {
        // 编辑模式，获取费用ID并加载数据
        this.editingExpenseId = this.$route.params.id
        if (this.editingExpenseId) {
          this.loadExpenseData(this.editingExpenseId)
        }
      }
    },
    
    async loadExpenseData(id) {
      try {
        // 从store中查找费用数据
        const expense = this.$store.getters.getExpenseById(id)
        
        if (expense) {
          // 填充表单数据
          this.expenseForm = {
            description: expense.description || '',
            amount: expense.amount || '',
            type: expense.type || '',
            date: expense.date || dayjs().format('YYYY-MM-DD'),
            paymentMethod: expense.paymentMethod || '',
            travelPlanId: expense.travelPlanId || '',
            note: expense.note || ''
          }
        } else {
          // 如果store中没有数据，则尝试从API获取
          const response = await this.$store.dispatch('fetchExpenseById', id)
          if (response) {
            this.expenseForm = {
              description: response.description || '',
              amount: response.amount || '',
              type: response.type || '',
              date: response.date || dayjs().format('YYYY-MM-DD'),
              paymentMethod: response.paymentMethod || '',
              travelPlanId: response.travelPlanId || '',
              note: response.note || ''
            }
          } else {
            this.$message.error('未找到费用记录')
            this.$router.push('/expense/list')
          }
        }
      } catch (error) {
        console.error('加载费用数据失败:', error)
        this.$message.error('加载失败，请稍后再试')
      }
    },
    
    beforeUpload(file) {
      // 文件类型校验
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      
      // 文件大小校验
      const isLessThan2MB = file.size / 1024 / 1024 < 2
      if (!isLessThan2MB) {
        this.$message.error('文件大小不能超过 2MB!')
        return false
      }
      
      return true
    },
    
    handleUploadSuccess(response, file, fileList) {
      // 处理上传成功
      this.$message.success('图片上传成功')
      // 可以将上传的图片URL保存到表单中
      // 这里简化处理，实际项目中需要根据后端返回的数据格式处理
    }
  },
  mounted() {
    // 加载旅行计划数据
    this.$store.dispatch('fetchTravelPlans')
  }
}
</script>

<style scoped>
.expense-create-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  margin-bottom: 20px;
  color: #303133;
  font-size: 24px;
}

.form-card {
  margin-bottom: 20px;
}
</style>