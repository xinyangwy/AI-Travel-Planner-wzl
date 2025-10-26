<template>
  <div class="expense-detail-container">
    <h2 class="page-title">费用详情</h2>
    
    <el-card shadow="hover" class="detail-card">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      
      <template v-else-if="expense">
        <div class="detail-header">
          <div class="detail-title">{{ expense.description }}</div>
          <div class="detail-amount">{{ formatCurrency(expense.amount) }}</div>
        </div>
        
        <div class="detail-content">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-descriptions border :column="1">
                <el-descriptions-item label="费用类型">
                  {{ formatExpenseType(expense.type) }}
                </el-descriptions-item>
                <el-descriptions-item label="日期">
                  {{ formatDate(expense.date) }}
                </el-descriptions-item>
                <el-descriptions-item label="支付方式">
                  {{ formatPaymentMethod(expense.paymentMethod) }}
                </el-descriptions-item>
                <el-descriptions-item label="旅行计划">
                  {{ expense.travelPlan?.title || '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </el-col>
            
            <el-col :span="12">
              <el-descriptions border :column="1">
                <el-descriptions-item label="创建时间">
                  {{ formatDateTime(expense.createdAt) }}
                </el-descriptions-item>
                <el-descriptions-item label="更新时间">
                  {{ formatDateTime(expense.updatedAt) }}
                </el-descriptions-item>
                <el-descriptions-item label="创建人">
                  {{ expense.createdBy || '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </el-col>
          </el-row>
          
          <div class="note-section">
            <h4>备注</h4>
            <div class="note-content">
              {{ expense.note || '无备注信息' }}
            </div>
          </div>
          
          <!-- 上传的收据图片展示 -->
          <div v-if="receiptImages && receiptImages.length > 0" class="receipt-section">
            <h4>收据图片</h4>
            <div class="receipt-images">
              <el-image
                v-for="(image, index) in receiptImages"
                :key="index"
                :src="image.url"
                fit="cover"
                :preview-src-list="receiptImageUrls"
                style="width: 100px; height: 100px; margin-right: 10px; margin-bottom: 10px;"
              ></el-image>
            </div>
          </div>
        </div>
        
        <div class="detail-actions">
          <el-button type="primary" @click="editExpense">编辑</el-button>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>
      
      <div v-else class="not-found">
        <el-empty description="未找到费用记录"></el-empty>
        <el-button type="primary" @click="goBack">返回列表</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export default {
  name: 'ExpenseDetail',
  data() {
    return {
      receiptImages: [] // 收据图片列表
    }
  },
  computed: {
    ...mapState(['loading']),
    ...mapGetters(['getExpenseById']),
    
    expense() {
      const id = this.$route.params.id
      if (!id) return null
      
      // 先从getters中获取
      const expense = this.getExpenseById(id)
      if (expense) {
        return expense
      }
      
      // 如果getters中没有，则返回null，等待fetchExpenseById加载
      return null
    },
    
    receiptImageUrls() {
      return this.receiptImages.map(image => image.url)
    }
  },
  watch: {
    $route: {
      handler(to) {
        const id = to.params.id
        if (id) {
          this.loadExpenseData(id)
        }
      },
      immediate: true
    }
  },
  methods: {
    formatCurrency(value) {
      if (typeof value !== 'number') return '¥0.00'
      return `¥${value.toFixed(2)}`
    },
    
    formatDate(date) {
      if (!date) return ''
      return dayjs(date).format('YYYY-MM-DD')
    },
    
    formatDateTime(date) {
      if (!date) return ''
      return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    
    formatExpenseType(type) {
      const typeMap = {
        'TRANSPORTATION': '交通',
        'ACCOMMODATION': '住宿',
        'FOOD': '餐饮',
        'ATTRACTION': '景点门票',
        'SHOPPING': '购物',
        'ENTERTAINMENT': '娱乐',
        'OTHER': '其他'
      }
      return typeMap[type] || type
    },
    
    formatPaymentMethod(method) {
      const methodMap = {
        'CASH': '现金',
        'CREDIT_CARD': '信用卡',
        'DEBIT_CARD': '借记卡',
        'ALIPAY': '支付宝',
        'WECHAT_PAY': '微信支付',
        'BANK_TRANSFER': '银行转账',
        'OTHER': '其他'
      }
      return methodMap[method] || method
    },
    
    async loadExpenseData(id) {
      try {
        // 尝试从store中获取费用数据，如果没有则从API获取
        const expense = this.getExpenseById(id)
        if (!expense) {
          await this.$store.dispatch('fetchExpenseById', id)
        }
        
        // 加载收据图片（实际项目中需要从后端API获取）
        // 这里使用模拟数据
        this.loadReceiptImages(id)
      } catch (error) {
        console.error('加载费用数据失败:', error)
        this.$message.error('加载失败，请稍后再试')
      }
    },
    
    loadReceiptImages(expenseId) {
      // 实际项目中，这里应该调用API获取与费用相关的图片
      // 现在使用模拟数据
      if (expenseId === '1' || expenseId === '2') {
        this.receiptImages = [
          {
            id: '1',
            url: 'https://via.placeholder.com/300x200?text=Receipt+1',
            name: '收据1.jpg'
          },
          {
            id: '2',
            url: 'https://via.placeholder.com/300x200?text=Receipt+2',
            name: '收据2.jpg'
          }
        ]
      } else {
        this.receiptImages = []
      }
    },
    
    editExpense() {
      const id = this.$route.params.id
      this.$router.push(`/expense/edit/${id}`)
    },
    
    goBack() {
      this.$router.push('/expense/list')
    }
  }
}
</script>

<style scoped>
.expense-detail-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  margin-bottom: 20px;
  color: #303133;
  font-size: 24px;
}

.detail-card {
  margin-bottom: 20px;
}

.loading-container {
  padding: 20px 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.detail-title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.detail-amount {
  font-size: 28px;
  font-weight: bold;
  color: #f56c6c;
}

.detail-content {
  margin-bottom: 30px;
}

.note-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.note-section h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #303133;
}

.note-content {
  color: #606266;
  white-space: pre-wrap;
}

.receipt-section {
  margin-top: 30px;
}

.receipt-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
}

.receipt-images {
  display: flex;
  flex-wrap: wrap;
}

.detail-actions {
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.not-found {
  text-align: center;
  padding: 40px 0;
}

.not-found .el-button {
  margin-top: 20px;
}
</style>