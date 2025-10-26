<template>
  <div class="itinerary-editor">
    <!-- 加载动画 -->
    <LoadingAnimation v-if="loading" :message="'加载行程中...'" />
    
    <!-- 错误提示 -->
    <div v-else-if="error" class="error-container">
      <el-empty description="获取行程数据失败" />
      <el-button type="primary" @click="fetchItineraryData">重试</el-button>
    </div>
    
    <!-- 行程编辑内容 -->
    <div v-else class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">行程编辑</h1>
          <p class="page-subtitle">{{ travelPlanTitle }}</p>
        </div>
        <div class="header-actions">
          <el-button type="success" @click="saveItinerary">
            <el-icon><Check /></el-icon> 保存行程
          </el-button>
          <el-button type="primary" @click="generateAIItinerary" :loading="generatingAIItinerary">
            <el-icon><MagicStick /></el-icon> AI生成行程
          </el-button>
        </div>
      </div>
      
      <!-- 旅行基本信息 -->
      <div class="custom-card info-card">
        <div class="travel-info">
          <div class="info-item">
            <el-icon class="info-icon"><Calendar /></el-icon>
            <span>{{ formatDateRange(startDate, endDate) }}</span>
          </div>
          <div class="info-item">
            <el-icon class="info-icon"><Timer /></el-icon>
            <span>{{ calculateDays }}天行程</span>
          </div>
          <div class="info-item">
            <el-icon class="info-icon"><User /></el-icon>
            <span>{{ travelersCount }}人</span>
          </div>
          <div class="info-item">
            <el-icon class="info-icon"><Map /></el-icon>
            <span>{{ destination }}</span>
          </div>
        </div>
      </div>
      
      <!-- 行程日历和列表 -->
      <div class="itinerary-content">
        <!-- 行程日历 -->
        <div class="custom-card calendar-card">
          <div class="card-header">
            <h2 class="card-title">行程日历</h2>
          </div>
          <div class="calendar-container">
            <el-calendar
              v-model="selectedDate"
              class="itinerary-calendar"
              :range-separator="' 至 '"
              :disabled-date="disabledDate"
              @change="onDateSelected"
            >
              <template #default="{ date, data }">
                <div class="calendar-day">
                  <div class="day-number">{{ data.day }}</div>
                  <div v-if="hasItineraryOnDate(date)" class="day-indicator">
                    <div 
                      class="indicator-dot" 
                      :class="getIndicatorClassByCount(getItineraryCountOnDate(date))"
                    ></div>
                    <div class="indicator-count">{{ getItineraryCountOnDate(date) }}</div>
                  </div>
                </div>
              </template>
            </el-calendar>
          </div>
        </div>
        
        <!-- 行程列表 -->
        <div class="custom-card itinerary-list-card">
          <div class="card-header">
            <h2 class="card-title">{{ formatDate(selectedDate) }} 的行程</h2>
            <el-button type="primary" @click="showItineraryForm = true">
              <el-icon><Plus /></el-icon> 添加行程项
            </el-button>
          </div>
          
          <div v-if="selectedDateItineraries.length > 0" class="itinerary-list">
            <div 
              v-for="(item, index) in selectedDateItineraries" 
              :key="item.id" 
              class="itinerary-item"
              :class="{ 'is-dragging': draggedItemId === item.id }"
              draggable="true"
              @dragstart="onDragStart($event, item)"
              @dragover.prevent
              @dragenter.prevent
              @drop="onDrop($event, item)"
            >
              <div class="itinerary-time">{{ formatTime(item.time) }}</div>
              <div class="itinerary-content">
                <div class="itinerary-header">
                  <div class="itinerary-title">{{ item.activity }}</div>
                  <div class="itinerary-priority">
                    <el-tooltip :content="getPriorityText(item.priority)" placement="top">
                      <div class="priority-indicator" :class="`priority-${item.priority}`"></div>
                    </el-tooltip>
                  </div>
                </div>
                <div class="itinerary-location">
                  <el-icon><Position /></el-icon>
                  {{ item.location }}
                </div>
                <div class="itinerary-transportation">
                  <el-icon><Van /></el-icon>
                  {{ getTransportationText(item.transportation) }}
                </div>
                <div class="itinerary-cost" v-if="item.estimatedCost > 0">
                  <el-icon><Wallet /></el-icon>
                  预计费用: {{ formatAmount(item.estimatedCost) }}
                </div>
                <div class="itinerary-notes" v-if="item.notes">
                  <el-icon><ChatLineSquare /></el-icon>
                  {{ item.notes }}
                </div>
                <div class="itinerary-actions">
                  <el-button type="primary" size="small" @click="editItinerary(item)">
                    <el-icon><EditPen /></el-icon> 编辑
                  </el-button>
                  <el-button type="danger" size="small" @click="deleteItinerary(item.id)">
                    <el-icon><Delete /></el-icon> 删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-state">
            <el-empty description="当天暂无行程安排" :image-size="100" />
            <el-button type="primary" style="margin-top: var(--space-md);" @click="showItineraryForm = true">
              添加第一个行程项
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 行程统计 -->
      <div class="custom-card stats-card">
        <div class="card-header">
          <h2 class="card-title">行程统计</h2>
        </div>
        <div class="stats-container">
          <div class="stat-item">
            <div class="stat-value">{{ totalItineraryItems }}</div>
            <div class="stat-label">总行程项</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ averageItemsPerDay }}</div>
            <div class="stat-label">日均行程项</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ formatAmount(totalEstimatedCost) }}</div>
            <div class="stat-label">预计总费用</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ coverageRate }}%</div>
            <div class="stat-label">行程覆盖率</div>
          </div>
        </div>
      </div>
      
      <!-- AI行程生成对话框 -->
      <el-dialog
        v-model="showAIGenerateDialog"
        title="AI 行程生成"
        width="600px"
        center
      >
        <el-form :model="aiGenerateForm" :rules="aiGenerateRules" ref="aiGenerateFormRef" label-width="120px">
          <el-form-item label="旅行主题">
            <el-select
              v-model="aiGenerateForm.theme"
              placeholder="选择旅行主题"
              style="width: 100%"
            >
              <el-option label="文化探索" value="culture" />
              <el-option label="美食之旅" value="food" />
              <el-option label="自然风光" value="nature" />
              <el-option label="城市观光" value="city" />
              <el-option label="休闲度假" value="relaxation" />
              <el-option label="购物血拼" value="shopping" />
              <el-option label="历史古迹" value="history" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="兴趣偏好">
            <el-select
              v-model="aiGenerateForm.interests"
              placeholder="选择兴趣偏好"
              multiple
              collapse-tags
              style="width: 100%"
            >
              <el-option label="博物馆" value="museum" />
              <el-option label="艺术" value="art" />
              <el-option label="音乐" value="music" />
              <el-option label="电影" value="movies" />
              <el-option label="美食" value="food" />
              <el-option label="购物" value="shopping" />
              <el-option label="户外活动" value="outdoors" />
              <el-option label="徒步" value="hiking" />
              <el-option label="水上运动" value="water_sports" />
              <el-option label="主题公园" value="theme_parks" />
              <el-option label="夜生活" value="nightlife" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="每日活动数量">
            <el-slider
              v-model="aiGenerateForm.itemsPerDay"
              :min="1"
              :max="10"
              :marks="{ 1: '1', 5: '5', 10: '10' }"
            />
          </el-form-item>
          
          <el-form-item label="旅行节奏">
            <el-rate
              v-model="aiGenerateForm.pace"
              :low-threshold="2"
              :high-threshold="4"
              :texts="['轻松', '适中', '紧凑']"
              show-text
            />
          </el-form-item>
          
          <el-form-item label="预算偏好">
            <el-select
              v-model="aiGenerateForm.budgetPreference"
              placeholder="选择预算偏好"
              style="width: 100%"
            >
              <el-option label="经济实惠" value="budget" />
              <el-option label="性价比高" value="value" />
              <el-option label="舒适体验" value="comfortable" />
              <el-option label="豪华享受" value="luxury" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="特别要求">
            <el-input
              v-model="aiGenerateForm.specialRequests"
              type="textarea"
              :rows="3"
              placeholder="请输入您的特别要求或偏好..."
            />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="showAIGenerateDialog = false">取消</el-button>
            <el-button type="primary" @click="confirmAIGenerate" :loading="generatingAIItinerary">
              <el-icon><MagicStick /></el-icon> 生成行程
            </el-button>
          </div>
        </template>
      </el-dialog>
      
      <!-- 行程项表单对话框 -->
      <el-dialog
        v-model="showItineraryForm"
        :title="editingItinerary ? '编辑行程项' : '添加行程项'"
        width="500px"
        center
      >
        <ItineraryForm
          ref="itineraryFormRef"
          :initial-data="editingItinerary"
          :date="selectedDate"
          @submit="handleItinerarySubmit"
          @cancel="cancelItineraryEdit"
        />
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Check, MagicStick, Calendar, Timer, User, Map, Plus, 
  EditPen, Delete, Position, Van, Wallet, ChatLineSquare
} from '@element-plus/icons-vue';
import LoadingAnimation from '../components/LoadingAnimation.vue';
import ItineraryForm from '../components/ItineraryForm.vue';
import * as api from '../services/api';
import { 
  formatDate, formatTime, formatDateRange, formatAmount, 
  calculateDaysBetween, getTransportationText 
} from '../utils/helper';

export default {
  name: 'ItineraryEditor',
  components: {
    LoadingAnimation,
    ItineraryForm,
    Check,
    MagicStick,
    Calendar,
    Timer,
    User,
    Map,
    Plus,
    EditPen,
    Delete,
    Position,
    Van,
    Wallet,
    ChatLineSquare
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    
    // 响应式数据
    const loading = ref(false);
    const error = ref(false);
    const generatingAIItinerary = ref(false);
    const travelPlanTitle = ref('');
    const startDate = ref('');
    const endDate = ref('');
    const travelersCount = ref(1);
    const destination = ref('');
    const selectedDate = ref(new Date());
    const allItineraries = ref([]);
    const showItineraryForm = ref(false);
    const showAIGenerateDialog = ref(false);
    const editingItinerary = ref(null);
    const draggedItemId = ref(null);
    const itineraryFormRef = ref(null);
    const aiGenerateFormRef = ref(null);
    
    // AI生成表单数据
    const aiGenerateForm = reactive({
      theme: 'culture',
      interests: [],
      itemsPerDay: 5,
      pace: 3,
      budgetPreference: 'value',
      specialRequests: ''
    });
    
    // AI生成表单验证规则
    const aiGenerateRules = {
      theme: [
        { required: true, message: '请选择旅行主题', trigger: 'change' }
      ],
      budgetPreference: [
        { required: true, message: '请选择预算偏好', trigger: 'change' }
      ]
    };
    
    // 计算属性
    const selectedDateItineraries = computed(() => {
      const dateStr = formatDate(selectedDate.value);
      return allItineraries.value
        .filter(item => item.date === dateStr)
        .sort((a, b) => {
          // 首先按时间排序
          if (a.time !== b.time) {
            return a.time.localeCompare(b.time);
          }
          // 如果时间相同，按优先级排序
          return b.priority - a.priority;
        });
    });
    
    const totalItineraryItems = computed(() => {
      return allItineraries.value.length;
    });
    
    const averageItemsPerDay = computed(() => {
      const days = calculateDays;
      return days > 0 ? (totalItineraryItems.value / days).toFixed(1) : 0;
    });
    
    const totalEstimatedCost = computed(() => {
      return allItineraries.value.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
    });
    
    const calculateDays = computed(() => {
      return calculateDaysBetween(startDate.value, endDate.value) + 1;
    });
    
    const coverageRate = computed(() => {
      // 计算有行程安排的天数占总天数的百分比
      const days = calculateDays.value;
      if (days === 0) return 0;
      
      const daysWithItinerary = new Set(allItineraries.value.map(item => item.date)).size;
      return Math.round((daysWithItinerary / days) * 100);
    });
    
    // 方法
    const fetchItineraryData = async () => {
      loading.value = true;
      error.value = false;
      
      try {
        const travelPlanId = route.params.id;
        
        // 获取旅行计划信息
        // const plan = await api.getTravelPlanById(travelPlanId);
        // travelPlanTitle.value = plan.title;
        // startDate.value = plan.startDate;
        // endDate.value = plan.endDate;
        // travelersCount.value = plan.travelersCount;
        // destination.value = plan.destination;
        
        // 模拟旅行计划数据
        travelPlanTitle.value = '东京七日游';
        startDate.value = '2023-10-15';
        endDate.value = '2023-10-22';
        travelersCount.value = 2;
        destination.value = '东京, 日本';
        
        // 设置默认选中的日期为旅行开始日期
        selectedDate.value = new Date(startDate.value);
        
        // 获取行程数据
        // const itineraries = await api.getItinerariesByTravelPlanId(travelPlanId);
        // allItineraries.value = itineraries;
        
        // 模拟行程数据
        allItineraries.value = [
          {
            id: 1,
            travelPlanId,
            date: '2023-10-15',
            time: '10:00',
            activity: '浅草寺参观',
            location: '浅草寺，东京都台东区浅草2-3-1',
            transportation: 'subway',
            estimatedCost: 0,
            notes: '记得参观雷门和购买纪念品',
            priority: 2,
            reminder: false
          },
          {
            id: 2,
            travelPlanId,
            date: '2023-10-15',
            time: '13:00',
            activity: '午餐',
            location: '浅草附近餐厅',
            transportation: 'walking',
            estimatedCost: 2000,
            notes: '尝试当地特色美食天妇罗',
            priority: 1,
            reminder: false
          },
          {
            id: 3,
            travelPlanId,
            date: '2023-10-16',
            time: '09:00',
            activity: '东京塔',
            location: '东京塔，东京都港区芝公园4丁目2-8',
            transportation: 'subway',
            estimatedCost: 1200,
            notes: '建议早上前往，避开人流高峰',
            priority: 2,
            reminder: true
          }
        ];
      } catch (err) {
        console.error('获取行程数据失败:', err);
        error.value = true;
        ElMessage.error('获取行程数据失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    };
    
    // 禁用不在旅行日期范围内的日期
    const disabledDate = (date) => {
      const start = new Date(startDate.value);
      const end = new Date(endDate.value);
      return date < start || date > end;
    };
    
    // 日期选择处理
    const onDateSelected = (date) => {
      selectedDate.value = date;
    };
    
    // 检查指定日期是否有行程
    const hasItineraryOnDate = (date) => {
      const dateStr = formatDate(date);
      return allItineraries.value.some(item => item.date === dateStr);
    };
    
    // 获取指定日期的行程数量
    const getItineraryCountOnDate = (date) => {
      const dateStr = formatDate(date);
      return allItineraries.value.filter(item => item.date === dateStr).length;
    };
    
    // 根据行程数量获取指示器样式类
    const getIndicatorClassByCount = (count) => {
      if (count === 0) return '';
      if (count < 3) return 'indicator-low';
      if (count < 6) return 'indicator-medium';
      return 'indicator-high';
    };
    
    // 编辑行程项
    const editItinerary = (item) => {
      editingItinerary.value = { ...item };
      showItineraryForm.value = true;
    };
    
    // 取消编辑行程项
    const cancelItineraryEdit = () => {
      editingItinerary.value = null;
      showItineraryForm.value = false;
      
      // 重置表单
      if (itineraryFormRef.value) {
        itineraryFormRef.value.resetForm();
      }
    };
    
    // 处理行程项提交
    const handleItinerarySubmit = (data) => {
      const travelPlanId = route.params.id;
      
      if (editingItinerary.value) {
        // 更新现有行程项
        const index = allItineraries.value.findIndex(item => item.id === editingItinerary.value.id);
        if (index !== -1) {
          allItineraries.value[index] = { ...editingItinerary.value, ...data };
        }
      } else {
        // 添加新行程项
        const newItem = {
          id: Date.now(), // 临时ID，实际应该由后端生成
          travelPlanId,
          date: formatDate(selectedDate.value),
          ...data
        };
        allItineraries.value.push(newItem);
      }
      
      cancelItineraryEdit();
      ElMessage.success(editingItinerary.value ? '行程项已更新' : '行程项已添加');
    };
    
    // 删除行程项
    const deleteItinerary = async (id) => {
      try {
        await ElMessageBox.confirm(
          '确定要删除这个行程项吗？',
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
        
        allItineraries.value = allItineraries.value.filter(item => item.id !== id);
        ElMessage.success('行程项已删除');
      } catch (error) {
        // 用户取消删除
      }
    };
    
    // 保存行程
    const saveItinerary = async () => {
      try {
        const travelPlanId = route.params.id;
        
        // 调用API保存行程
        // await api.updateItineraries(travelPlanId, allItineraries.value);
        
        ElMessage.success('行程已保存');
      } catch (err) {
        console.error('保存行程失败:', err);
        ElMessage.error('保存行程失败，请稍后重试');
      }
    };
    
    // 生成AI行程
    const generateAIItinerary = () => {
      showAIGenerateDialog.value = true;
    };
    
    // 确认AI生成行程
    const confirmAIGenerate = async () => {
      if (!aiGenerateFormRef.value) return;
      
      try {
        await aiGenerateFormRef.value.validate();
        
        generatingAIItinerary.value = true;
        showAIGenerateDialog.value = false;
        
        // 调用API生成AI行程
        // const generatedItineraries = await api.generateAIItinerary(route.params.id, aiGenerateForm);
        
        // 模拟AI生成的行程
        // 实际应该根据表单数据生成更智能的行程
        const mockGeneratedItineraries = [
          {
            id: Date.now() + 1,
            travelPlanId: route.params.id,
            date: '2023-10-17',
            time: '09:30',
            activity: '明治神宫参观',
            location: '明治神宫，东京都涩谷区代代木神园町1-1',
            transportation: 'subway',
            estimatedCost: 0,
            notes: '参观神宫和周边的神宫外苑',
            priority: 2,
            reminder: true
          },
          {
            id: Date.now() + 2,
            travelPlanId: route.params.id,
            date: '2023-10-17',
            time: '14:00',
            activity: '涩谷十字路口',
            location: '涩谷十字路口，东京都涩谷区涩谷2丁目',
            transportation: 'walking',
            estimatedCost: 0,
            notes: '体验世界最繁忙的十字路口',
            priority: 1,
            reminder: false
          },
          {
            id: Date.now() + 3,
            travelPlanId: route.params.id,
            date: '2023-10-18',
            time: '10:00',
            activity: '上野公园和博物馆',
            location: '上野公园，东京都台东区上野公园',
            transportation: 'subway',
            estimatedCost: 1500,
            notes: '参观上野公园和东京国立博物馆',
            priority: 2,
            reminder: true
          }
        ];
        
        // 添加AI生成的行程
        allItineraries.value.push(...mockGeneratedItineraries);
        
        ElMessage.success('AI行程生成成功');
      } catch (err) {
        if (err !== false) { // 不是验证失败
          console.error('生成AI行程失败:', err);
          ElMessage.error('生成AI行程失败，请稍后重试');
        }
      } finally {
        generatingAIItinerary.value = false;
      }
    };
    
    // 获取优先级文本
    const getPriorityText = (priority) => {
      const priorities = {
        0: '低',
        1: '中',
        2: '高',
        3: '紧急'
      };
      
      return priorities[priority] || '中';
    };
    
    // 拖拽开始
    const onDragStart = (event, item) => {
      draggedItemId.value = item.id;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', item.id);
    };
    
    // 拖拽放置
    const onDrop = (event, targetItem) => {
      event.preventDefault();
      
      const draggedId = parseInt(event.dataTransfer.getData('text/plain'));
      if (draggedId === targetItem.id) return;
      
      // 找到拖拽的项目和目标项目在数组中的索引
      const draggedIndex = allItineraries.value.findIndex(item => item.id === draggedId);
      const targetIndex = allItineraries.value.findIndex(item => item.id === targetItem.id);
      
      if (draggedIndex === -1 || targetIndex === -1) return;
      
      // 创建新数组进行重排序
      const newItineraries = [...allItineraries.value];
      const [draggedItem] = newItineraries.splice(draggedIndex, 1);
      
      // 计算新位置
      let newPosition = targetIndex;
      if (draggedIndex < targetIndex) {
        newPosition = targetIndex;
      } else {
        newPosition = targetIndex;
      }
      
      // 插入到新位置
      newItineraries.splice(newPosition, 0, draggedItem);
      
      // 更新数组
      allItineraries.value = newItineraries;
      draggedItemId.value = null;
    };
    
    onMounted(() => {
      fetchItineraryData();
    });
    
    return {
      // 数据
      loading,
      error,
      generatingAIItinerary,
      travelPlanTitle,
      startDate,
      endDate,
      travelersCount,
      destination,
      selectedDate,
      allItineraries,
      showItineraryForm,
      showAIGenerateDialog,
      editingItinerary,
      draggedItemId,
      itineraryFormRef,
      aiGenerateFormRef,
      aiGenerateForm,
      aiGenerateRules,
      
      // 计算属性
      selectedDateItineraries,
      totalItineraryItems,
      averageItemsPerDay,
      totalEstimatedCost,
      calculateDays,
      coverageRate,
      
      // 方法
      fetchItineraryData,
      disabledDate,
      onDateSelected,
      hasItineraryOnDate,
      getItineraryCountOnDate,
      getIndicatorClassByCount,
      editItinerary,
      cancelItineraryEdit,
      handleItinerarySubmit,
      deleteItinerary,
      saveItinerary,
      generateAIItinerary,
      confirmAIGenerate,
      getPriorityText,
      onDragStart,
      onDrop,
      
      // 工具方法
      formatDate,
      formatTime,
      formatDateRange,
      formatAmount,
      getTransportationText
    };
  }
};
</script>

<style scoped>
.itinerary-editor {
  min-height: 100vh;
  padding: var(--space-lg);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.page-title {
  margin: 0;
  font-size: var(--font-size-extra-large);
  color: var(--text-primary);
}

.page-subtitle {
  margin: 0;
  font-size: var(--font-size-medium);
  color: var(--text-secondary);
}

.header-actions {
  display: flex;
  gap: var(--space-md);
}

.info-card {
  margin-bottom: var(--space-xl);
}

.travel-info {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-lg);
  padding: var(--space-lg);
}

.info-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.info-icon {
  color: var(--primary-color);
}

.itinerary-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.calendar-card, .itinerary-list-card {
  padding: var(--space-lg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.card-title {
  margin: 0;
  font-size: var(--font-size-medium);
  color: var(--text-primary);
}

.itinerary-calendar {
  width: 100%;
}

.calendar-day {
  position: relative;
  text-align: center;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.day-number {
  font-size: var(--font-size-medium);
  font-weight: 500;
}

.day-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.indicator-low {
  background-color: var(--success-color);
}

.indicator-medium {
  background-color: var(--warning-color);
}

.indicator-high {
  background-color: var(--danger-color);
}

.indicator-count {
  font-size: 10px;
  color: var(--text-secondary);
}

.itinerary-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.itinerary-item {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  background-color: var(--background-color-light);
  border-radius: var(--border-radius);
  border-left: 4px solid var(--primary-color);
  transition: all var(--transition-time);
  cursor: move;
}

.itinerary-item:hover {
  background-color: var(--hover-color);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow);
}

.itinerary-item.is-dragging {
  opacity: 0.5;
  transform: rotate(2deg);
}

.itinerary-time {
  width: 80px;
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: flex-start;
  padding-top: 4px;
}

.itinerary-content {
  flex: 1;
}

.itinerary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
}

.itinerary-title {
  font-weight: 500;
  font-size: var(--font-size-medium);
  color: var(--text-primary);
}

.priority-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.priority-0 {
  background-color: var(--text-secondary);
}

.priority-1 {
  background-color: var(--success-color);
}

.priority-2 {
  background-color: var(--warning-color);
}

.priority-3 {
  background-color: var(--danger-color);
}

.itinerary-location, .itinerary-transportation, .itinerary-cost, .itinerary-notes {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.itinerary-actions {
  margin-top: var(--space-sm);
  display: flex;
  gap: var(--space-xs);
}

.stats-card {
  padding: var(--space-lg);
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-lg);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: var(--font-size-extra-large);
  font-weight: 500;
  color: var(--primary-color);
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) 0;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-xxl) 0;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .itinerary-editor {
    padding: var(--space-md);
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }
  
  .travel-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  
  .itinerary-content {
    grid-template-columns: 1fr;
  }
  
  .calendar-card {
    order: 2;
  }
  
  .itinerary-list-card {
    order: 1;
  }
  
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }
}
</style>