<template>
  <div class="travel-plan-form">
    <!-- 加载动画 -->
    <LoadingAnimation v-if="loading" :message="'加载中...'" />
    
    <div v-else class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1 class="page-title">{{ isEditMode ? '编辑旅行计划' : '创建新旅行计划' }}</h1>
        <p class="page-subtitle">{{ isEditMode ? '修改您的旅行计划信息' : '创建一个新的旅行计划，开始您的旅程' }}</p>
      </div>
      
      <!-- 表单卡片 -->
      <div class="custom-card">
        <el-form
          ref="travelPlanFormRef"
          :model="formData"
          :rules="rules"
          label-width="100px"
          @submit.prevent
        >
          <!-- 基本信息区域 -->
          <div class="form-section">
            <h2 class="section-title">基本信息</h2>
            
            <!-- 标题 -->
            <el-form-item label="标题" prop="title">
              <el-input
                v-model="formData.title"
                placeholder="请输入旅行计划标题"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
            
            <!-- 目的地 -->
            <el-form-item label="目的地" prop="location">
              <el-input
                v-model="formData.location"
                placeholder="请输入旅行目的地"
                maxlength="100"
                show-word-limit
              />
              
              <!-- 地点搜索提示 -->
              <div v-if="showLocationSuggestions && locationSuggestions.length > 0" class="location-suggestions">
                <div
                  v-for="suggestion in locationSuggestions"
                  :key="suggestion"
                  class="location-suggestion-item"
                  @click="selectLocation(suggestion)"
                >
                  {{ suggestion }}
                </div>
              </div>
            </el-form-item>
            
            <!-- 旅行类型 -->
            <el-form-item label="旅行类型" prop="travelType">
              <el-select v-model="formData.travelType" placeholder="请选择旅行类型">
                <el-option 
                  v-for="type in travelTypes" 
                  :key="type.value" 
                  :label="type.label" 
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
          </div>
          
          <!-- 时间与人数区域 -->
          <div class="form-section">
            <h2 class="section-title">时间与人数</h2>
            
            <!-- 日期范围 -->
            <el-form-item label="日期范围" prop="dateRange">
              <el-date-picker
                v-model="formData.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            
            <!-- 人数 -->
            <el-form-item label="旅行人数" prop="numberOfPeople">
              <el-input-number
                v-model="formData.numberOfPeople"
                :min="1"
                :max="100"
                style="width: 100%"
                placeholder="请输入旅行人数"
              />
            </el-form-item>
          </div>
          
          <!-- 预算区域 -->
          <div class="form-section">
            <h2 class="section-title">预算信息</h2>
            
            <!-- 总预算 -->
            <el-form-item label="总预算" prop="totalBudget">
              <el-input-number
                v-model="formData.totalBudget"
                :min="0"
                :step="100"
                :precision="2"
                style="width: 100%"
                placeholder="请输入总预算金额"
              >
                <template #prefix>¥</template>
              </el-input-number>
            </el-form-item>
            
            <!-- 预算说明 -->
            <div class="budget-note">
              <el-icon><InfoFilled /></el-icon>
              <span>您可以在创建计划后添加详细的费用记录和分类预算</span>
            </div>
          </div>
          
          <!-- 其他信息区域 -->
          <div class="form-section">
            <h2 class="section-title">其他信息</h2>
            
            <!-- 状态 -->
            <el-form-item v-if="isEditMode" label="状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择旅行计划状态">
                <el-option 
                  v-for="status in statusOptions" 
                  :key="status.value" 
                  :label="status.label" 
                  :value="status.value"
                />
              </el-select>
            </el-form-item>
            
            <!-- 标签 -->
            <el-form-item label="标签">
              <el-tag
                v-for="tag in formData.tags"
                :key="tag"
                closable
                @close="removeTag(tag)"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-model="inputTag"
                placeholder="输入标签后按回车添加"
                @keyup.enter="addTag"
                clearable
                style="width: 200px; margin-left: 10px;"
              />
            </el-form-item>
            
            <!-- 描述 -->
            <el-form-item label="描述" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="4"
                placeholder="请输入旅行计划描述"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </div>
          
          <!-- AI生成行程选项 -->
          <div v-if="!isEditMode" class="form-section">
            <h2 class="section-title">AI行程规划</h2>
            
            <el-checkbox v-model="useAIItinerary">使用AI自动生成行程安排</el-checkbox>
            
            <div v-if="useAIItinerary" class="ai-options">
              <el-form-item label="兴趣偏好">
                <el-select
                  v-model="aiPreferences"
                  placeholder="选择您的兴趣偏好"
                  multiple
                  collapse-tags
                  style="width: 100%"
                >
                  <el-option label="历史文化" value="history" />
                  <el-option label="自然风光" value="nature" />
                  <el-option label="美食探索" value="food" />
                  <el-option label="购物血拼" value="shopping" />
                  <el-option label="艺术展览" value="art" />
                  <el-option label="户外活动" value="outdoor" />
                  <el-option label="休闲度假" value="relaxation" />
                  <el-option label="冒险体验" value="adventure" />
                  <el-option label="夜生活" value="nightlife" />
                  <el-option label="家庭友好" value="family" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="每日活动时长">
                <el-slider
                  v-model="dailyActivityHours"
                  :min="4"
                  :max="16"
                  :marks="{
                    4: '4小时',
                    8: '8小时',
                    12: '12小时',
                    16: '16小时'
                  }"
                />
              </el-form-item>
              
              <el-form-item label="行程密度">
                <el-rate
                  v-model="itineraryDensity"
                  :max="5"
                  :texts="['轻松', '适中', '紧凑', '非常紧凑', '极限']"
                  show-text
                />
              </el-form-item>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="form-actions">
            <el-button-group>
              <el-button @click="goBack">返回</el-button>
              <el-button type="primary" @click="saveDraft" :loading="submitting">保存为草稿</el-button>
              <el-button type="success" @click="submitForm" :loading="submitting">{{ isEditMode ? '更新' : '创建' }}</el-button>
            </el-button-group>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { InfoFilled } from '@element-plus/icons-vue';
import LoadingAnimation from '../components/LoadingAnimation.vue';
import * as api from '../services/api';
import { calculateDays } from '../utils/helper';

export default {
  name: 'TravelPlanForm',
  components: {
    LoadingAnimation,
    InfoFilled
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const travelPlanFormRef = ref(null);
    
    // 响应式数据
    const loading = ref(false);
    const submitting = ref(false);
    const showLocationSuggestions = ref(false);
    const locationSuggestions = ref([]);
    const inputTag = ref('');
    const useAIItinerary = ref(false);
    const aiPreferences = ref([]);
    const dailyActivityHours = ref(10);
    const itineraryDensity = ref(3);
    
    // 判断是否为编辑模式
    const isEditMode = computed(() => {
      return !!route.params.id;
    });
    
    // 表单数据
    const formData = reactive({
      title: '',
      location: '',
      travelType: '',
      dateRange: null,
      numberOfPeople: 1,
      totalBudget: 0,
      status: 'planned',
      tags: [],
      description: ''
    });
    
    // 旅行类型选项
    const travelTypes = [
      { label: '休闲度假', value: 'vacation' },
      { label: '商务出差', value: 'business' },
      { label: '探险旅行', value: 'adventure' },
      { label: '文化之旅', value: 'cultural' },
      { label: '美食之旅', value: 'food' },
      { label: '购物之旅', value: 'shopping' },
      { label: '蜜月旅行', value: 'honeymoon' },
      { label: '亲子旅行', value: 'family' },
      { label: '背包客', value: 'backpacking' },
      { label: '自驾游', value: 'road_trip' },
      { label: '其他', value: 'other' }
    ];
    
    // 状态选项
    const statusOptions = [
      { label: '计划中', value: 'planned' },
      { label: '进行中', value: 'ongoing' },
      { label: '已完成', value: 'completed' },
      { label: '已取消', value: 'cancelled' },
      { label: '已归档', value: 'archived' }
    ];
    
    // 表单验证规则
    const rules = {
      title: [
        { required: true, message: '请输入旅行计划标题', trigger: 'blur' },
        { min: 1, max: 50, message: '标题长度应在 1 到 50 个字符之间', trigger: 'blur' }
      ],
      location: [
        { required: true, message: '请输入旅行目的地', trigger: 'blur' },
        { min: 1, max: 100, message: '目的地长度应在 1 到 100 个字符之间', trigger: 'blur' }
      ],
      travelType: [
        { required: true, message: '请选择旅行类型', trigger: 'change' }
      ],
      dateRange: [
        { required: true, message: '请选择日期范围', trigger: 'change' }
      ],
      numberOfPeople: [
        { required: true, message: '请输入旅行人数', trigger: 'blur' },
        { type: 'number', min: 1, message: '人数必须大于等于1', trigger: 'blur' }
      ],
      totalBudget: [
        { required: true, message: '请输入总预算', trigger: 'blur' },
        { type: 'number', min: 0, message: '预算必须大于等于0', trigger: 'blur' }
      ],
      description: [
        { max: 500, message: '描述长度不能超过 500 个字符', trigger: 'blur' }
      ]
    };
    
    // 监听地点输入
    watch(() => formData.location, (newLocation) => {
      if (newLocation && newLocation.length > 1) {
        // 模拟地点搜索API
        fetchLocationSuggestions(newLocation);
      } else {
        showLocationSuggestions.value = false;
        locationSuggestions.value = [];
      }
    });
    
    // 获取地点建议（模拟）
    const fetchLocationSuggestions = (query) => {
      setTimeout(() => {
        // 模拟地点建议数据
        const mockSuggestions = [
          `${query}市`,
          `${query}省`,
          `${query}岛`,
          `${query}景区`,
          `${query}国家公园`,
          `${query}海滩`,
          `${query}山脉`
        ];
        
        locationSuggestions.value = mockSuggestions;
        showLocationSuggestions.value = true;
      }, 300);
    };
    
    // 选择地点
    const selectLocation = (location) => {
      formData.location = location;
      showLocationSuggestions.value = false;
    };
    
    // 添加标签
    const addTag = () => {
      if (inputTag.value && !formData.tags.includes(inputTag.value) && formData.tags.length < 10) {
        formData.tags.push(inputTag.value);
        inputTag.value = '';
      }
    };
    
    // 删除标签
    const removeTag = (tag) => {
      formData.tags = formData.tags.filter(t => t !== tag);
    };
    
    // 加载现有旅行计划数据
    const loadTravelPlanData = async () => {
      if (!isEditMode.value) return;
      
      loading.value = true;
      try {
        const planData = await api.getTravelPlanById(route.params.id);
        
        // 填充表单数据
        formData.title = planData.title || '';
        formData.location = planData.location || '';
        formData.travelType = planData.travelType || '';
        formData.dateRange = planData.startDate && planData.endDate 
          ? [planData.startDate, planData.endDate] 
          : null;
        formData.numberOfPeople = planData.numberOfPeople || 1;
        formData.totalBudget = planData.totalBudget || 0;
        formData.status = planData.status || 'planned';
        formData.tags = planData.tags || [];
        formData.description = planData.description || '';
      } catch (error) {
        console.error('加载旅行计划数据失败:', error);
        ElMessage.error('加载旅行计划数据失败，请稍后重试');
        router.push('/');
      } finally {
        loading.value = false;
      }
    };
    
    // 提交表单
    const submitForm = () => {
      travelPlanFormRef.value.validate(async (valid) => {
        if (valid) {
          submitting.value = true;
          try {
            // 准备提交数据
            const submitData = {
              title: formData.title,
              location: formData.location,
              travelType: formData.travelType,
              startDate: formData.dateRange[0],
              endDate: formData.dateRange[1],
              numberOfPeople: formData.numberOfPeople,
              totalBudget: formData.totalBudget,
              status: formData.status,
              tags: formData.tags,
              description: formData.description
            };
            
            let response;
            if (isEditMode.value) {
              // 更新现有旅行计划
              response = await api.updateTravelPlan(route.params.id, submitData);
              ElMessage.success('旅行计划已更新');
            } else {
              // 创建新旅行计划
              response = await api.createTravelPlan(submitData);
              ElMessage.success('旅行计划已创建');
              
              // 如果选择了AI生成行程，调用AI生成接口
              if (useAIItinerary.value) {
                await generateAIItinerary(response.id);
              }
            }
            
            // 跳转到详情页
            router.push(`/travel-plans/${isEditMode.value ? route.params.id : response.id}`);
          } catch (error) {
            console.error('提交表单失败:', error);
            ElMessage.error(isEditMode.value ? '更新旅行计划失败' : '创建旅行计划失败');
          } finally {
            submitting.value = false;
          }
        } else {
          console.log('表单验证失败');
          return false;
        }
      });
    };
    
    // 保存为草稿
    const saveDraft = () => {
      // 验证必填字段，但允许部分字段为空
      const draftRules = {
        title: [{ required: true, message: '请输入旅行计划标题', trigger: 'blur' }],
        location: [{ required: true, message: '请输入旅行目的地', trigger: 'blur' }]
      };
      
      travelPlanFormRef.value.validateField(Object.keys(draftRules), async (errors) => {
        if (!errors || errors.length === 0) {
          submitting.value = true;
          try {
            // 准备草稿数据
            const draftData = {
              title: formData.title,
              location: formData.location,
              travelType: formData.travelType || 'other',
              startDate: formData.dateRange ? formData.dateRange[0] : null,
              endDate: formData.dateRange ? formData.dateRange[1] : null,
              numberOfPeople: formData.numberOfPeople || 1,
              totalBudget: formData.totalBudget || 0,
              status: 'draft',
              tags: formData.tags,
              description: formData.description
            };
            
            let response;
            if (isEditMode.value) {
              // 更新为草稿
              response = await api.updateTravelPlan(route.params.id, draftData);
            } else {
              // 创建草稿
              response = await api.createTravelPlan(draftData);
            }
            
            ElMessage.success('草稿已保存');
            router.push(`/travel-plans/${isEditMode.value ? route.params.id : response.id}`);
          } catch (error) {
            console.error('保存草稿失败:', error);
            ElMessage.error('保存草稿失败，请稍后重试');
          } finally {
            submitting.value = false;
          }
        }
      });
    };
    
    // AI生成行程
    const generateAIItinerary = async (travelPlanId) => {
      try {
        await api.generateAIItinerary(travelPlanId, {
          preferences: aiPreferences.value,
          dailyActivityHours: dailyActivityHours.value,
          density: itineraryDensity.value
        });
        ElMessage.success('AI已为您生成行程建议');
      } catch (error) {
        console.error('AI生成行程失败:', error);
        ElMessage.warning('AI行程生成失败，您可以手动添加行程');
      }
    };
    
    // 返回上一页
    const goBack = () => {
      router.back();
    };
    
    // 组件挂载后加载数据
    onMounted(() => {
      loadTravelPlanData();
    });
    
    return {
      // 数据
      loading,
      submitting,
      formData,
      rules,
      travelTypes,
      statusOptions,
      showLocationSuggestions,
      locationSuggestions,
      inputTag,
      useAIItinerary,
      aiPreferences,
      dailyActivityHours,
      itineraryDensity,
      
      // 计算属性
      isEditMode,
      
      // 方法
      addTag,
      removeTag,
      selectLocation,
      submitForm,
      saveDraft,
      goBack
    };
  }
};
</script>

<style scoped>
.travel-plan-form {
  min-height: 100vh;
  padding: var(--space-lg);
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--border-lighter);
}

.section-title {
  margin-top: 0;
  margin-bottom: var(--space-md);
  font-size: var(--font-size-large);
  color: var(--text-primary);
  border-left: 4px solid var(--primary-color);
  padding-left: var(--space-sm);
}

.budget-note {
  margin-top: -8px;
  margin-bottom: var(--space-md);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.tag-item {
  margin-right: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.ai-options {
  margin-top: var(--space-md);
  padding: var(--space-md);
  background-color: var(--primary-light);
  border-radius: var(--border-radius-base);
}

.form-actions {
  margin-top: var(--space-xxl);
  display: flex;
  justify-content: flex-end;
}

.location-suggestions {
  position: absolute;
  top: 100%;
  left: 100px;
  right: 0;
  background: white;
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-small);
  box-shadow: var(--shadow-base);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.location-suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color var(--transition-duration-fast);
}

.location-suggestion-item:hover {
  background-color: var(--primary-light);
}

/* 响应式样式 */
@media (max-width: 768px) {
  .travel-plan-form {
    padding: var(--space-md);
  }
  
  .form-actions {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .location-suggestions {
    left: 0;
  }
}
</style>