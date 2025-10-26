<template>
  <div class="travel-create-container">
    <div class="page-header">
      <h1 class="page-title">{{ isEditMode ? '编辑旅行计划' : '创建旅行计划' }}</h1>
      <el-button @click="backToList" icon="el-icon-arrow-left">返回列表</el-button>
    </div>
    
    <el-card class="travel-form-card">
      <el-form 
        :model="travelPlan" 
        :rules="rules" 
        ref="travelPlanRef" 
        label-width="120px"
        label-position="top"
        :validate-on-rule-change="false"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-header">基本信息</h3>
          <div class="form-row">
            <el-form-item label="计划标题" prop="title" class="form-item-full-width">
              <el-input 
                v-model="travelPlan.title" 
                placeholder="请输入旅行计划标题" 
                maxlength="100"
                show-word-limit
                size="large"
                prefix-icon="el-icon-edit"
              ></el-input>
            </el-form-item>
          </div>
          
          <div class="form-row">
            <el-form-item label="目的地" prop="destination" class="form-item-full-width">
              <el-input 
                v-model="travelPlan.destination" 
                placeholder="请输入目的地" 
                maxlength="100"
                show-word-limit
                size="large"
                prefix-icon="el-icon-location"
              ></el-input>
            </el-form-item>
          </div>
          
          <div class="form-row">
            <el-form-item label="开始日期" prop="startDate" class="form-item-half-width">
              <el-date-picker
                v-model="travelPlan.startDate"
                type="date"
                placeholder="选择开始日期"
                style="width: 100%;"
                value-format="YYYY-MM-DD"
                size="large"
                prefix-icon="el-icon-date"
              ></el-date-picker>
            </el-form-item>
            
            <el-form-item label="结束日期" prop="endDate" class="form-item-half-width">
              <el-date-picker
                v-model="travelPlan.endDate"
                type="date"
                placeholder="选择结束日期"
                style="width: 100%;"
                value-format="YYYY-MM-DD"
                size="large"
                :disabled-date="disabledStartDate"
                prefix-icon="el-icon-date"
              ></el-date-picker>
            </el-form-item>
          </div>
          
          <div class="form-row">
            <el-form-item label="旅行人数" prop="travelers" class="form-item-half-width">
              <el-input-number 
                v-model="travelPlan.travelers" 
                :min="1" 
                :max="20" 
                size="large"
                placeholder="请输入旅行人数"
              ></el-input-number>
            </el-form-item>
            
            <el-form-item label="旅行预算" prop="budget" class="form-item-half-width">
              <el-input-number 
                v-model="travelPlan.budget" 
                :min="0" 
                :step="100" 
                size="large"
                placeholder="请输入旅行预算"
              ></el-input-number>
            </el-form-item>
          </div>
          
          <div class="form-row">
            <el-form-item label="旅行类型" prop="type" class="form-item-half-width">
              <el-select 
                v-model="travelPlan.type" 
                placeholder="选择旅行类型" 
                clearable
                size="large"
                filterable
              >
                <el-option label="休闲度假" value="VACATION" />
                <el-option label="商务出差" value="BUSINESS" />
                <el-option label="探险旅行" value="ADVENTURE" />
                <el-option label="文化体验" value="CULTURE" />
                <el-option label="自驾游" value="ROAD_TRIP" />
                <el-option label="背包客" value="BACKPACKING" />
                <el-option label="亲子游" value="FAMILY" />
                <el-option label="蜜月旅行" value="HONEYMOON" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="旅行状态" prop="status" class="form-item-half-width" v-if="isEditMode">
              <el-select 
                v-model="travelPlan.status" 
                placeholder="选择旅行状态"
                size="large"
                disabled
              >
                <el-option label="未开始" value="PENDING" />
                <el-option label="进行中" value="ACTIVE" />
                <el-option label="已完成" value="COMPLETED" />
                <el-option label="已取消" value="CANCELLED" />
              </el-select>
            </el-form-item>
          </div>
          
          <div class="form-row">
            <el-form-item label="旅行标签" class="form-item-full-width">
              <el-tag
                v-for="tag in travelPlan.tags"
                :key="tag"
                closable
                :disable-transitions="false"
                class="travel-tag"
                @close="removeTag(tag)"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-model="inputTag"
                class="input-new-tag"
                size="large"
                placeholder="输入标签后按回车添加"
                @keyup.enter.native="addTag"
                @blur="addTag"
                :style="{ width: travelPlan.tags.length > 0 ? 'auto' : '100%' }"
              ></el-input>
              <div class="tag-suggestions" v-if="popularTags.length > 0">
                <span class="suggestion-label">推荐标签：</span>
                <el-tag
                  v-for="tag in popularTags"
                  :key="tag"
                  size="small"
                  class="suggestion-tag"
                  @click="addTag(tag)"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </el-form-item>
          </div>
        </div>
        
        <!-- 详细信息 -->
        <div class="form-section">
          <h3 class="section-header">详细信息</h3>
          <div class="form-row">
            <el-form-item label="行程安排" prop="itinerary" class="form-item-full-width">
              <el-input 
                v-model="travelPlan.itinerary" 
                type="textarea" 
                :rows="8" 
                placeholder="请输入行程安排"
                maxlength="2000"
                show-word-limit
                resize="vertical"
              ></el-input>
            </el-form-item>
          </div>
          
          <div class="form-row">
            <el-form-item label="备注" prop="description" class="form-item-full-width">
              <el-input 
                v-model="travelPlan.description" 
                type="textarea" 
                :rows="5" 
                placeholder="请输入备注信息"
                maxlength="1000"
                show-word-limit
                resize="vertical"
              ></el-input>
            </el-form-item>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button type="primary" @click="submitForm" :loading="loading" size="large">
            {{ isEditMode ? '更新旅行计划' : '创建旅行计划' }}
          </el-button>
          <el-button @click="resetForm" size="large">重置表单</el-button>
          <el-button type="danger" @click="confirmDelete" v-if="isEditMode" size="large">删除计划</el-button>
        </div>
      </el-form>
    </el-card>
    
    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="30%"
    >
      <span>确定要删除这个旅行计划吗？此操作不可恢复。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="deleteTravelPlan">确定删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import dayjs from 'dayjs'

export default {
  name: 'TravelCreate',
  data() {
    return {
      travelPlan: {
        title: '',
        destination: '',
        startDate: '',
        endDate: '',
        travelers: 1,
        budget: 0,
        type: '',
        status: 'PENDING',
        itinerary: '',
        description: '',
        tags: []
      },
      rules: {
        title: [
          { required: true, message: '请输入计划标题', trigger: 'blur' },
          { min: 2, max: 100, message: '标题长度应在2-100个字符之间', trigger: 'blur' }
        ],
        destination: [
          { required: true, message: '请输入目的地', trigger: 'blur' }
        ],
        startDate: [
          { required: true, message: '请选择开始日期', trigger: 'change' }
        ],
        endDate: [
          { required: true, message: '请选择结束日期', trigger: 'change' },
          { validator: this.validateEndDate, trigger: 'change' }
        ],
        travelers: [
          { required: true, message: '请输入旅行人数', trigger: 'blur' },
          { type: 'number', min: 1, message: '旅行人数至少为1人', trigger: 'blur' }
        ],
        budget: [
          { type: 'number', min: 0, message: '预算不能为负数', trigger: 'blur' }
        ]
      },
      isEditMode: false,
      planId: null,
      inputTag: '',
      deleteDialogVisible: false,
      popularTags: ['国内游', '国外游', '海边', '山区', '城市', '自驾', '背包客', '美食', '摄影', '购物']
    }
  },
  computed: {
    ...mapState(['loading']),
    // 计算旅行天数
    tripDuration() {
      if (!this.travelPlan.startDate || !this.travelPlan.endDate) return 0
      const start = dayjs(this.travelPlan.startDate)
      const end = dayjs(this.travelPlan.endDate)
      return end.diff(start, 'day') + 1
    },
    // 每日平均预算
    dailyBudget() {
      if (this.tripDuration <= 0 || !this.travelPlan.budget) return 0
      return this.travelPlan.budget / this.tripDuration
    }
  },
  methods: {
    // 禁用日期选择
    disabledStartDate(time) {
      if (this.travelPlan.startDate) {
        return time.getTime() < new Date(this.travelPlan.startDate).getTime() - 8.64e7
      }
      return false
    },
    
    // 验证结束日期
    validateEndDate(rule, value, callback) {
      if (!value) {
        callback()
        return
      }
      
      if (this.travelPlan.startDate && value < this.travelPlan.startDate) {
        callback(new Error('结束日期不能早于开始日期'))
      } else {
        callback()
      }
    },
    
    // 重置表单
    resetForm() {
      this.$refs.travelPlanRef.resetFields()
      // 重置标签
      this.travelPlan.tags = []
      this.inputTag = ''
      
      // 恢复默认值
      this.travelPlan.travelers = 1
      this.travelPlan.budget = 0
      this.travelPlan.status = 'PENDING'
    },
    
    // 返回列表
    backToList() {
      this.$router.push('/travel')
    },
    
    // 提交表单
    async submitForm() {
      try {
        await this.$refs.travelPlanRef.validate()
        
        const planData = { ...this.travelPlan }
        
        let response
        if (this.isEditMode) {
          response = await this.$store.dispatch('updateTravelPlan', {
            planId: this.planId,
            planData
          })
        } else {
          response = await this.$store.dispatch('createTravelPlan', planData)
        }
        
        this.$message.success(this.isEditMode ? '更新成功' : '创建成功')
        this.$router.push('/travel')
      } catch (error) {
        console.error('提交失败:', error)
        this.$message.error(this.isEditMode ? '更新失败' : '创建失败')
      }
    },
    
    // 加载计划数据
    async loadPlanData() {
      try {
        const response = await this.$store.dispatch('fetchTravelPlanById', this.planId)
        this.travelPlan = {
          title: response.title,
          destination: response.destination,
          startDate: response.startDate,
          endDate: response.endDate,
          travelers: response.travelers || 1,
          budget: response.budget || 0,
          type: response.type || '',
          status: response.status,
          itinerary: response.itinerary || '',
          description: response.description || '',
          tags: response.tags || []
        }
      } catch (error) {
        console.error('加载计划数据失败:', error)
        this.$message.error('加载计划数据失败')
        this.$router.push('/travel')
      }
    },
    
    // 添加标签
    addTag(tag) {
      let inputTag = tag || this.inputTag.trim()
      if (inputTag && this.travelPlan.tags.indexOf(inputTag) === -1) {
        this.travelPlan.tags.push(inputTag)
      }
      this.inputTag = ''
    },
    
    // 移除标签
    removeTag(tag) {
      const index = this.travelPlan.tags.indexOf(tag)
      if (index !== -1) {
        this.travelPlan.tags.splice(index, 1)
      }
    },
    
    // 确认删除
    confirmDelete() {
      this.deleteDialogVisible = true
    },
    
    // 删除旅行计划
    async deleteTravelPlan() {
      try {
        await this.$store.dispatch('deleteTravelPlan', this.planId)
        this.$message.success('删除成功')
        this.deleteDialogVisible = false
        this.$router.push('/travel')
      } catch (error) {
        console.error('删除失败:', error)
        this.$message.error('删除失败')
        this.deleteDialogVisible = false
      }
    }
  },
  mounted() {
    // 检查URL参数是否有id，如果有则为编辑模式
    const id = this.$route.query.id
    if (id) {
      this.isEditMode = true
      this.planId = Number(id)
      this.loadPlanData()
    }
  }
}
</script>

<style scoped>
.travel-create-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.travel-form-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.form-section {
  margin-bottom: 30px;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.form-section:last-child {
  border-bottom: none;
}

.section-header {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
  gap: 20px;
}

.form-item-full-width {
  flex: 1 1 100%;
}

.form-item-half-width {
  flex: 1 1 calc(50% - 10px);
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  padding: 20px 0;
  border-top: 1px solid #ebeef5;
}

/* 标签样式 */
.travel-tag {
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
}

.input-new-tag {
  width: 120px;
  margin-top: 10px;
  margin-left: 10px;
  vertical-align: bottom;
}

.tag-suggestions {
  margin-top: 10px;
}

.suggestion-label {
  font-size: 12px;
  color: #909399;
  margin-right: 8px;
}

.suggestion-tag {
  margin-right: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  background-color: #f0f9ff;
  border-color: #91d5ff;
  color: #1890ff;
}

.suggestion-tag:hover {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .form-item-half-width {
    flex: 1 1 100%;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
}
</style>