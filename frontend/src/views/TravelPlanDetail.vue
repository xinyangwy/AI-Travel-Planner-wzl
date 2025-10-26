<template>
  <div class="travel-plan-detail">
    <!-- 加载动画 -->
    <LoadingAnimation v-if="loading" :message="'加载中...'" />
    
    <!-- 错误提示 -->
    <div v-else-if="error" class="error-container">
      <el-empty description="获取旅行计划详情失败" />
      <el-button type="primary" @click="fetchTravelPlanDetail">重试</el-button>
    </div>
    
    <!-- 旅行计划详情 -->
    <div v-else-if="travelPlan" class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">{{ travelPlan.title }}</h1>
            <el-tag 
              :class="`status-${travelPlan.status}`" 
              size="large"
              :type="getStatusType(travelPlan.status)"
              effect="light"
            >
              {{ getStatusText(travelPlan.status) }}
            </el-tag>
          </div>
          <div class="action-buttons">
            <el-button-group>
              <el-button type="primary" @click="editTravelPlan">
                <el-icon><EditPen /></el-icon> 编辑计划
              </el-button>
              <el-dropdown @command="handleDropdownCommand">
                <el-button>
                  更多操作 <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="share">分享计划</el-dropdown-item>
                    <el-dropdown-item command="export">导出计划</el-dropdown-item>
                    <el-dropdown-item command="duplicate">复制计划</el-dropdown-item>
                    <el-dropdown-item command="archive" :disabled="travelPlan.status === 'archived'">
                      归档计划
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided>
                      <span style="color: var(--danger-color);">删除计划</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-button-group>
          </div>
        </div>
      </div>
      
      <!-- 旅行概览卡片 -->
      <div class="custom-card overview-card">
        <div class="overview-grid">
          <div class="overview-item">
            <div class="item-label">目的地</div>
            <div class="item-value">{{ travelPlan.location }}</div>
          </div>
          <div class="overview-item">
            <div class="item-label">日期</div>
            <div class="item-value">{{ formatDateRange(travelPlan.startDate, travelPlan.endDate) }}</div>
          </div>
          <div class="overview-item">
            <div class="item-label">天数</div>
            <div class="item-value">{{ calculateDays(travelPlan.startDate, travelPlan.endDate) }} 天</div>
          </div>
          <div class="overview-item">
            <div class="item-label">人数</div>
            <div class="item-value">{{ travelPlan.numberOfPeople }} 人</div>
          </div>
          <div class="overview-item">
            <div class="item-label">类型</div>
            <div class="item-value">{{ getTravelTypeText(travelPlan.travelType) }}</div>
          </div>
          <div class="overview-item">
            <div class="item-label">创建时间</div>
            <div class="item-value">{{ formatDateTime(travelPlan.createdAt) }}</div>
          </div>
        </div>
      </div>
      
      <!-- 预算信息 -->
      <div class="custom-card budget-card">
        <div class="section-header">
          <h2>预算信息</h2>
          <el-button type="text" @click="showBudgetDialog = true">
            <el-icon><EditPen /></el-icon> 编辑预算
          </el-button>
        </div>
        
        <div class="budget-overview">
          <div class="budget-progress">
            <div class="progress-header">
              <span>预算使用率</span>
              <span class="progress-value">{{ budgetUsageRate }}%</span>
            </div>
            <el-progress 
              :percentage="budgetUsageRate" 
              :color="getBudgetProgressColor(budgetUsageRate)"
              :format="() => ''"
            />
          </div>
          
          <div class="budget-amounts">
            <div class="amount-item">
              <span class="amount-label">总预算</span>
              <span class="amount-value">{{ formatAmount(travelPlan.totalBudget) }}</span>
            </div>
            <div class="amount-item">
              <span class="amount-label">已花费</span>
              <span class="amount-value">{{ formatAmount(totalExpense) }}</span>
            </div>
            <div class="amount-item">
              <span class="amount-label">剩余预算</span>
              <span :class="['amount-value', { 'text-danger': remainingBudget < 0 }]">
                {{ formatAmount(remainingBudget) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 旅行描述 -->
      <div v-if="travelPlan.description" class="custom-card description-card">
        <div class="section-header">
          <h2>旅行描述</h2>
        </div>
        <p class="description-content">{{ travelPlan.description }}</p>
      </div>
      
      <!-- 标签区域 -->
      <div v-if="travelPlan.tags && travelPlan.tags.length > 0" class="custom-card tags-card">
        <div class="section-header">
          <h2>标签</h2>
        </div>
        <div class="tags-container">
          <el-tag 
            v-for="tag in travelPlan.tags" 
            :key="tag"
            size="large"
            class="tag-item"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
      
      <!-- 行程和费用选项卡 -->
      <div class="custom-card content-card">
        <el-tabs v-model="activeTab" class="main-tabs">
          <!-- 行程安排 -->
          <el-tab-pane label="行程安排" name="itinerary">
            <div class="tab-header">
              <h3>每日行程</h3>
              <el-button type="primary" @click="showItineraryDialog = true">
                <el-icon><Plus /></el-icon> 添加行程
              </el-button>
            </div>
            
            <div v-if="groupedItineraries.length > 0" class="itinerary-days">
              <div 
                v-for="(dayItineraries, dayIndex) in groupedItineraries" 
                :key="dayIndex"
                class="itinerary-day"
              >
                <div class="day-header">
                  <h4>第 {{ dayIndex + 1 }} 天</h4>
                  <span class="day-date">{{ getDayDate(dayIndex) }}</span>
                </div>
                
                <div class="itinerary-items">
                  <div 
                    v-for="itinerary in dayItineraries" 
                    :key="itinerary.id"
                    class="itinerary-item"
                  >
                    <div class="item-time">{{ formatTime(itinerary.time) }}</div>
                    <div class="item-content">
                      <div class="item-title">
                        {{ itinerary.activity }}
                        <el-tag 
                          v-if="itinerary.priority"
                          size="small"
                          :effect="getPriorityEffect(itinerary.priority)"
                          :type="getPriorityType(itinerary.priority)"
                        >
                          {{ getPriorityText(itinerary.priority) }}
                        </el-tag>
                      </div>
                      <div class="item-details">
                        <div class="detail-item">
                          <el-icon><Location /></el-icon>
                          {{ itinerary.location }}
                        </div>
                        <div v-if="itinerary.transportation" class="detail-item">
                          <el-icon><Van /></el-icon>
                          {{ getTransportationText(itinerary.transportation) }}
                        </div>
                        <div v-if="itinerary.estimatedCost" class="detail-item">
                          <el-icon><Wallet /></el-icon>
                          {{ formatAmount(itinerary.estimatedCost) }}
                        </div>
                      </div>
                      <div v-if="itinerary.notes" class="item-notes">
                        <el-icon><Document /></el-icon>
                        {{ itinerary.notes }}
                      </div>
                      <div class="item-actions">
                        <el-button type="text" @click="editItinerary(itinerary)">
                          <el-icon><EditPen /></el-icon>
                        </el-button>
                        <el-button type="text" @click="deleteItinerary(itinerary.id)">
                          <el-icon><Delete /></el-icon>
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="empty-container">
              <el-empty description="暂无行程安排" />
            </div>
          </el-tab-pane>
          
          <!-- 费用记录 -->
          <el-tab-pane label="费用记录" name="expenses">
            <div class="tab-header">
              <h3>费用记录</h3>
              <el-button type="primary" @click="showExpenseDialog = true">
                <el-icon><Plus /></el-icon> 添加费用
              </el-button>
            </div>
            
            <div v-if="expenses.length > 0">
              <!-- 费用统计图表 -->
              <div class="expense-stats">
                <div class="stats-card">
                  <div class="stats-title">费用分类统计</div>
                  <div class="stats-chart" ref="expenseChartContainer"></div>
                </div>
              </div>
              
              <!-- 费用表格 -->
              <el-table :data="expenses" style="width: 100%" stripe>
                <el-table-column prop="date" label="日期" width="120">
                  <template #default="scope">{{ formatDate(scope.row.date) }}</template>
                </el-table-column>
                <el-table-column prop="category" label="分类" width="120">
                  <template #default="scope">
                    <el-tag size="small">{{ getExpenseCategoryText(scope.row.category) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="amount" label="金额" width="120" align="right">
                  <template #default="scope">{{ formatAmount(scope.row.amount) }}</template>
                </el-table-column>
                <el-table-column prop="description" label="描述"></el-table-column>
                <el-table-column prop="paymentMethod" label="支付方式" width="120">
                  <template #default="scope">{{ getPaymentMethodText(scope.row.paymentMethod) }}</template>
                </el-table-column>
                <el-table-column prop="location" label="地点" width="120"></el-table-column>
                <el-table-column label="操作" width="100" fixed="right">
                  <template #default="scope">
                    <el-button type="text" @click="editExpense(scope.row)">
                      <el-icon><EditPen /></el-icon>
                    </el-button>
                    <el-button type="text" @click="deleteExpense(scope.row.id)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              
              <!-- 费用分页 -->
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="expenseCurrentPage"
                  v-model:page-size="expensePageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="expenses.length"
                  @size-change="handleExpensePageSizeChange"
                  @current-change="handleExpenseCurrentPageChange"
                />
              </div>
            </div>
            
            <div v-else class="empty-container">
              <el-empty description="暂无费用记录" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <!-- 行程表单对话框 -->
      <el-dialog
        v-model="showItineraryDialog"
        :title="editingItinerary ? '编辑行程' : '添加行程'"
        width="600px"
      >
        <ItineraryForm
          ref="itineraryFormRef"
          :initial-data="editingItinerary"
          :travel-plan-id="travelPlan.id"
          @submit="handleItinerarySubmit"
          @cancel="handleItineraryCancel"
        />
      </el-dialog>
      
      <!-- 费用表单对话框 -->
      <el-dialog
        v-model="showExpenseDialog"
        :title="editingExpense ? '编辑费用' : '添加费用'"
        width="600px"
      >
        <ExpenseForm
          ref="expenseFormRef"
          :initial-data="editingExpense"
          :travel-plan-id="travelPlan.id"
          @submit="handleExpenseSubmit"
          @cancel="handleExpenseCancel"
        />
      </el-dialog>
      
      <!-- 预算编辑对话框 -->
      <el-dialog
        v-model="showBudgetDialog"
        title="编辑预算"
        width="400px"
      >
        <el-form
          ref="budgetFormRef"
          :model="budgetForm"
          :rules="budgetRules"
          label-width="100px"
        >
          <el-form-item label="总预算" prop="totalBudget">
            <el-input-number
              v-model="budgetForm.totalBudget"
              :min="0"
              :step="100"
              :precision="2"
              style="width: 100%"
              placeholder="请输入总预算金额"
            />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showBudgetDialog = false">取消</el-button>
            <el-button type="primary" @click="saveBudget">保存</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
    
    <!-- 无数据状态 -->
    <div v-else class="empty-container">
      <el-empty description="未找到旅行计划" />
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { EditPen, Plus, Delete, Location, Van, Wallet, Document, ArrowDown } from '@element-plus/icons-vue';
import LoadingAnimation from '../components/LoadingAnimation.vue';
import ItineraryForm from '../components/ItineraryForm.vue';
import ExpenseForm from '../components/ExpenseForm.vue';
import * as api from '../services/api';
import { formatDate, formatDateTime, formatDateRange, formatTime, calculateDays, formatAmount, 
         getStatusText, getStatusType, getTravelTypeText, getTransportationText, 
         getPaymentMethodText, getExpenseCategoryText, getPriorityText, getPriorityType, 
         getPriorityEffect } from '../utils/helper';
import { useStore } from 'vuex';

export default {
  name: 'TravelPlanDetail',
  components: {
    LoadingAnimation,
    ItineraryForm,
    ExpenseForm
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const travelPlanId = computed(() => route.params.id);
    
    // 响应式数据
    const travelPlan = ref(null);
    const expenses = ref([]);
    const itineraries = ref([]);
    const loading = ref(true);
    const error = ref(false);
    const activeTab = ref('itinerary');
    const showItineraryDialog = ref(false);
    const showExpenseDialog = ref(false);
    const showBudgetDialog = ref(false);
    const editingItinerary = ref(null);
    const editingExpense = ref(null);
    const itineraryFormRef = ref(null);
    const expenseFormRef = ref(null);
    const budgetFormRef = ref(null);
    const expenseChartContainer = ref(null);
    
    // 分页数据
    const expenseCurrentPage = ref(1);
    const expensePageSize = ref(10);
    
    // 预算表单
    const budgetForm = ref({
      totalBudget: 0
    });
    
    const budgetRules = {
      totalBudget: [
        { required: true, message: '请输入总预算', trigger: 'blur' },
        { type: 'number', min: 0, message: '预算必须大于等于0', trigger: 'blur' }
      ]
    };
    
    // 计算属性
    const totalExpense = computed(() => {
      return expenses.value.reduce((sum, expense) => sum + expense.amount, 0);
    });
    
    const remainingBudget = computed(() => {
      return (travelPlan.value?.totalBudget || 0) - totalExpense.value;
    });
    
    const budgetUsageRate = computed(() => {
      if (!travelPlan.value?.totalBudget || travelPlan.value.totalBudget === 0) return 0;
      const rate = (totalExpense.value / travelPlan.value.totalBudget) * 100;
      return Math.min(Math.round(rate), 100);
    });
    
    const groupedItineraries = computed(() => {
      const groups = {};
      
      // 按日期分组行程
      itineraries.value.forEach(item => {
        const dateStr = item.date;
        if (!groups[dateStr]) {
          groups[dateStr] = [];
        }
        groups[dateStr].push(item);
      });
      
      // 对每个日期的行程按时间排序
      Object.keys(groups).forEach(date => {
        groups[date].sort((a, b) => {
          return new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`);
        });
      });
      
      // 转换为数组格式返回
      return Object.values(groups);
    });
    
    // 方法
    const fetchTravelPlanDetail = async () => {
      loading.value = true;
      error.value = false;
      
      try {
        // 从API获取旅行计划详情
        const planDetail = await api.getTravelPlanById(travelPlanId.value);
        travelPlan.value = planDetail;
        
        // 从API获取相关行程
        const itinerariesData = await api.getItinerariesByTravelPlanId(travelPlanId.value);
        itineraries.value = itinerariesData;
        
        // 从API获取相关费用
        const expensesData = await api.getExpensesByTravelPlanId(travelPlanId.value);
        expenses.value = expensesData;
        
        // 设置预算表单
        budgetForm.value.totalBudget = planDetail.totalBudget || 0;
        
      } catch (err) {
        console.error('获取旅行计划详情失败:', err);
        error.value = true;
        ElMessage.error('获取旅行计划详情失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    };
    
    const editTravelPlan = () => {
      router.push(`/travel-plans/edit/${travelPlanId.value}`);
    };
    
    const handleDropdownCommand = async (command) => {
      switch (command) {
        case 'share':
          ElMessage.success('分享功能开发中');
          break;
        case 'export':
          ElMessage.success('导出功能开发中');
          break;
        case 'duplicate':
          try {
            await api.duplicateTravelPlan(travelPlanId.value);
            ElMessage.success('计划已复制');
            router.push('/');
          } catch (err) {
            ElMessage.error('复制计划失败');
          }
          break;
        case 'archive':
          try {
            await api.updateTravelPlanStatus(travelPlanId.value, 'archived');
            ElMessage.success('计划已归档');
            fetchTravelPlanDetail();
          } catch (err) {
            ElMessage.error('归档计划失败');
          }
          break;
        case 'delete':
          ElMessageBox.confirm(
            '确定要删除此旅行计划吗？此操作不可撤销，将同时删除相关的所有行程和费用记录。',
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            }
          ).then(async () => {
            try {
              await api.deleteTravelPlan(travelPlanId.value);
              ElMessage.success('旅行计划已删除');
              router.push('/');
            } catch (err) {
              ElMessage.error('删除旅行计划失败');
            }
          }).catch(() => {});
          break;
      }
    };
    
    const editItinerary = (itinerary) => {
      editingItinerary.value = { ...itinerary };
      showItineraryDialog.value = true;
    };
    
    const editExpense = (expense) => {
      editingExpense.value = { ...expense };
      showExpenseDialog.value = true;
    };
    
    const handleItinerarySubmit = async (formData) => {
      try {
        if (editingItinerary.value) {
          await api.updateItinerary(editingItinerary.value.id, formData);
          ElMessage.success('行程更新成功');
        } else {
          await api.createItinerary({ ...formData, travelPlanId: travelPlanId.value });
          ElMessage.success('行程添加成功');
        }
        
        // 重置表单并刷新数据
        showItineraryDialog.value = false;
        editingItinerary.value = null;
        fetchTravelPlanDetail();
      } catch (err) {
        ElMessage.error(editingItinerary.value ? '更新行程失败' : '添加行程失败');
      }
    };
    
    const handleItineraryCancel = () => {
      showItineraryDialog.value = false;
      editingItinerary.value = null;
      nextTick(() => {
        if (itineraryFormRef.value) {
          itineraryFormRef.value.resetForm();
        }
      });
    };
    
    const handleExpenseSubmit = async (formData) => {
      try {
        if (editingExpense.value) {
          await api.updateExpense(editingExpense.value.id, formData);
          ElMessage.success('费用更新成功');
        } else {
          await api.createExpense({ ...formData, travelPlanId: travelPlanId.value });
          ElMessage.success('费用添加成功');
        }
        
        // 重置表单并刷新数据
        showExpenseDialog.value = false;
        editingExpense.value = null;
        fetchTravelPlanDetail();
      } catch (err) {
        ElMessage.error(editingExpense.value ? '更新费用失败' : '添加费用失败');
      }
    };
    
    const handleExpenseCancel = () => {
      showExpenseDialog.value = false;
      editingExpense.value = null;
      nextTick(() => {
        if (expenseFormRef.value) {
          expenseFormRef.value.resetForm();
        }
      });
    };
    
    const deleteItinerary = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除此行程吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        await api.deleteItinerary(id);
        ElMessage.success('行程已删除');
        fetchTravelPlanDetail();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除行程失败');
        }
      }
    };
    
    const deleteExpense = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除此费用记录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        await api.deleteExpense(id);
        ElMessage.success('费用记录已删除');
        fetchTravelPlanDetail();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除费用记录失败');
        }
      }
    };
    
    const saveBudget = async () => {
      try {
        await api.updateTravelPlanBudget(travelPlanId.value, budgetForm.value.totalBudget);
        ElMessage.success('预算更新成功');
        showBudgetDialog.value = false;
        fetchTravelPlanDetail();
      } catch (error) {
        ElMessage.error('更新预算失败');
      }
    };
    
    const getDayDate = (dayIndex) => {
      if (!travelPlan.value) return '';
      
      const startDate = new Date(travelPlan.value.startDate);
      startDate.setDate(startDate.getDate() + dayIndex);
      
      return formatDate(startDate.toISOString().split('T')[0]);
    };
    
    const getBudgetProgressColor = (percentage) => {
      if (percentage < 60) return '#67C23A';
      if (percentage < 80) return '#E6A23C';
      return '#F56C6C';
    };
    
    const handleExpensePageSizeChange = (size) => {
      expensePageSize.value = size;
    };
    
    const handleExpenseCurrentPageChange = (current) => {
      expenseCurrentPage.value = current;
    };
    
    // 监听标签页变化，在费用标签页显示时初始化图表
    watch(activeTab, async (newTab) => {
      if (newTab === 'expenses' && expenses.value.length > 0) {
        await nextTick();
        // 这里可以初始化费用统计图表
        // 例如使用 ECharts 或其他图表库
      }
    });
    
    // 生命周期钩子
    onMounted(() => {
      fetchTravelPlanDetail();
    });
    
    return {
      // 数据
      travelPlan,
      expenses,
      itineraries,
      loading,
      error,
      activeTab,
      showItineraryDialog,
      showExpenseDialog,
      showBudgetDialog,
      editingItinerary,
      editingExpense,
      itineraryFormRef,
      expenseFormRef,
      budgetFormRef,
      budgetForm,
      budgetRules,
      expenseCurrentPage,
      expensePageSize,
      expenseChartContainer,
      
      // 计算属性
      totalExpense,
      remainingBudget,
      budgetUsageRate,
      groupedItineraries,
      
      // 方法
      fetchTravelPlanDetail,
      editTravelPlan,
      handleDropdownCommand,
      editItinerary,
      editExpense,
      handleItinerarySubmit,
      handleItineraryCancel,
      handleExpenseSubmit,
      handleExpenseCancel,
      deleteItinerary,
      deleteExpense,
      saveBudget,
      getDayDate,
      getBudgetProgressColor,
      handleExpensePageSizeChange,
      handleExpenseCurrentPageChange,
      
      // 工具方法
      formatDate,
      formatDateTime,
      formatDateRange,
      formatTime,
      calculateDays,
      formatAmount,
      getStatusText,
      getStatusType,
      getTravelTypeText,
      getTransportationText,
      getPaymentMethodText,
      getExpenseCategoryText,
      getPriorityText,
      getPriorityType,
      getPriorityEffect
    };
  }
};
</script>

<style scoped>
.travel-plan-detail {
  min-height: 100vh;
  padding: var(--space-lg);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  background-color: var(--bg-white);
  border-radius: var(--border-radius-base);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-light);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.page-title {
  margin: 0;
  font-size: var(--font-size-title);
  color: var(--text-primary);
}

.overview-card {
  margin-bottom: var(--space-lg);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--space-md);
}

.overview-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.item-label {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.item-value {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: 500;
}

.budget-card {
  margin-bottom: var(--space-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.section-header h2 {
  margin: 0;
  font-size: var(--font-size-large);
  color: var(--text-primary);
}

.budget-overview {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.budget-progress {
  width: 100%;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-xs);
}

.progress-value {
  font-weight: 500;
}

.budget-amounts {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-md);
}

.amount-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.amount-label {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.amount-value {
  font-size: var(--font-size-large);
  font-weight: 500;
  color: var(--text-primary);
}

.description-card {
  margin-bottom: var(--space-lg);
}

.description-content {
  white-space: pre-wrap;
  line-height: var(--line-height-comfortable);
  color: var(--text-regular);
}

.tags-card {
  margin-bottom: var(--space-lg);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.tag-item {
  margin-right: var(--space-xs);
}

.content-card {
  margin-bottom: var(--space-lg);
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.tab-header h3 {
  margin: 0;
  font-size: var(--font-size-medium);
  color: var(--text-primary);
}

.itinerary-day {
  margin-bottom: var(--space-xl);
  border-left: 2px solid var(--border-light);
  padding-left: var(--space-lg);
  position: relative;
}

.itinerary-day::before {
  content: '';
  position: absolute;
  left: -5px;
  top: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--primary-color);
}

.day-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.day-header h4 {
  margin: 0;
  font-size: var(--font-size-medium);
  color: var(--text-primary);
}

.day-date {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.itinerary-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.itinerary-item {
  display: flex;
  gap: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--border-lighter);
}

.item-time {
  width: 80px;
  font-weight: 500;
  color: var(--primary-color);
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.item-title {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-weight: 500;
  color: var(--text-primary);
}

.item-details {
  display: flex;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.item-notes {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.item-actions {
  display: flex;
  gap: var(--space-xs);
}

.expense-stats {
  margin-bottom: var(--space-lg);
}

.stats-card {
  height: 300px;
  display: flex;
  flex-direction: column;
}

.stats-title {
  font-weight: 500;
  margin-bottom: var(--space-md);
  color: var(--text-primary);
}

.stats-chart {
  flex: 1;
}

.pagination-container {
  margin-top: var(--space-md);
  display: flex;
  justify-content: flex-end;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-xxl) 0;
}

.empty-container {
  padding: var(--space-xxl) 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

/* 响应式样式 */
@media (max-width: 768px) {
  .travel-plan-detail {
    padding: var(--space-md);
  }
  
  .header-content {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .overview-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .budget-amounts {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .itinerary-item {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .item-time {
    width: 100%;
  }
  
  .item-details {
    flex-direction: column;
    gap: var(--space-xs);
  }
}
</style>