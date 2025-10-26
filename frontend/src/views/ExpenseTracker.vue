<template>
  <div class="expense-tracker">
    <!-- 加载动画 -->
    <LoadingAnimation v-if="loading" :message="'加载费用数据中...'" />
    
    <!-- 错误提示 -->
    <div v-else-if="error" class="error-container">
      <el-empty description="获取费用数据失败" />
      <el-button type="primary" @click="fetchExpenseData">重试</el-button>
    </div>
    
    <!-- 费用追踪内容 -->
    <div v-else class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">费用追踪</h1>
          <p class="page-subtitle">{{ travelPlanTitle }}</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showExpenseForm = true">
            <el-icon><Plus /></el-icon> 添加费用
          </el-button>
          <el-dropdown @command="handleExport">
            <el-button type="success">
              <el-icon><Download /></el-icon> 导出数据
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="csv">导出为CSV</el-dropdown-item>
                <el-dropdown-item command="pdf">导出为PDF</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 费用概览卡片 -->
      <div class="overview-cards">
        <div class="custom-card overview-card">
          <div class="card-icon expense-icon">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">总支出</div>
            <div class="card-value">{{ formatAmount(totalExpenses) }}</div>
          </div>
        </div>
        
        <div class="custom-card overview-card">
          <div class="card-icon budget-icon">
            <el-icon><Tickets /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">预算</div>
            <div class="card-value">{{ formatAmount(budget) }}</div>
          </div>
        </div>
        
        <div class="custom-card overview-card">
          <div class="card-icon remaining-icon">
            <el-icon><WalletFilled /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">剩余预算</div>
            <div class="card-value" :class="{ 'over-budget': remainingBudget < 0 }">
              {{ formatAmount(remainingBudget) }}
            </div>
          </div>
        </div>
        
        <div class="custom-card overview-card">
          <div class="card-icon usage-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">预算使用率</div>
            <div class="card-value">{{ budgetUsagePercentage }}%</div>
          </div>
        </div>
      </div>
      
      <!-- 预算进度条 -->
      <div class="custom-card budget-progress-card">
        <div class="progress-header">
          <div class="progress-title">预算使用进度</div>
          <div class="progress-status" :class="{ 'over-budget': remainingBudget < 0 }">
            {{ remainingBudget >= 0 ? '正常' : '超预算' }}
          </div>
        </div>
        <el-progress 
          :percentage="Math.min(budgetUsagePercentage, 100)" 
          :format="() => ''"
          :color="getProgressColor(budgetUsagePercentage)"
          class="budget-progress"
        />
        <div v-if="budgetUsagePercentage > 100" class="over-budget-indicator">
          超预算: {{ formatAmount(totalExpenses - budget) }}
        </div>
      </div>
      
      <!-- 图表区域 -->
      <div class="charts-section">
        <div class="custom-card chart-card">
          <div class="card-header">
            <h2 class="card-title">费用分类统计</h2>
          </div>
          <div class="chart-container">
            <div ref="categoryChartRef" class="chart"></div>
          </div>
        </div>
        
        <div class="custom-card chart-card">
          <div class="card-header">
            <h2 class="card-title">每日支出趋势</h2>
          </div>
          <div class="chart-container">
            <div ref="dailyTrendChartRef" class="chart"></div>
          </div>
        </div>
      </div>
      
      <!-- 筛选和费用列表 -->
      <div class="expense-list-section">
        <!-- 筛选器 -->
        <div class="custom-card filter-card">
          <div class="filter-content">
            <div class="filter-item">
              <label class="filter-label">分类</label>
              <el-select v-model="filter.category" placeholder="全部" clearable class="filter-select">
                <el-option label="全部" value="" />
                <el-option 
                  v-for="category in expenseCategories" 
                  :key="category.value" 
                  :label="category.label" 
                  :value="category.value" 
                />
              </el-select>
            </div>
            
            <div class="filter-item">
              <label class="filter-label">日期范围</label>
              <el-date-picker
                v-model="filter.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="filter-date"
              />
            </div>
            
            <div class="filter-item">
              <label class="filter-label">支付方式</label>
              <el-select v-model="filter.paymentMethod" placeholder="全部" clearable class="filter-select">
                <el-option label="全部" value="" />
                <el-option 
                  v-for="method in paymentMethods" 
                  :key="method.value" 
                  :label="method.label" 
                  :value="method.value" 
                />
              </el-select>
            </div>
            
            <div class="filter-item">
              <label class="filter-label">金额范围</label>
              <div class="amount-range">
                <el-input-number 
                  v-model="filter.minAmount" 
                  :min="0" 
                  placeholder="最小" 
                  size="small"
                  class="amount-input"
                />
                <span class="amount-separator">至</span>
                <el-input-number 
                  v-model="filter.maxAmount" 
                  :min="0" 
                  placeholder="最大" 
                  size="small"
                  class="amount-input"
                />
              </div>
            </div>
            
            <div class="filter-actions">
              <el-button type="primary" @click="applyFilters">应用筛选</el-button>
              <el-button @click="resetFilters">重置筛选</el-button>
            </div>
          </div>
        </div>
        
        <!-- 费用列表 -->
        <div class="custom-card list-card">
          <div class="card-header">
            <h2 class="card-title">费用明细</h2>
            <div class="card-actions">
              <el-input
                v-model="searchQuery"
                placeholder="搜索费用..."
                prefix-icon="Search"
                class="search-input"
              />
              <el-select v-model="sortField" placeholder="排序" class="sort-select">
                <el-option label="日期(新到旧)" value="date:desc" />
                <el-option label="日期(旧到新)" value="date:asc" />
                <el-option label="金额(高到低)" value="amount:desc" />
                <el-option label="金额(低到高)" value="amount:asc" />
              </el-select>
            </div>
          </div>
          
          <el-table 
            :data="filteredExpenses" 
            style="width: 100%"
            stripe
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            
            <el-table-column prop="date" label="日期" width="120" sortable>
              <template #default="scope">
                {{ formatDate(scope.row.date) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="category" label="分类" width="120">
              <template #default="scope">
                <el-tag :type="getCategoryTagType(scope.row.category)" size="small">
                  {{ getCategoryLabel(scope.row.category) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="description" label="描述" min-width="200">
              <template #default="scope">
                <div class="expense-description">
                  {{ scope.row.description }}
                  <span v-if="scope.row.notes" class="expense-notes">
                    ({{ scope.row.notes }})
                  </span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="location" label="地点" width="150" />
            
            <el-table-column prop="paymentMethod" label="支付方式" width="120">
              <template #default="scope">
                {{ getPaymentMethodLabel(scope.row.paymentMethod) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="amount" label="金额" width="120" align="right" sortable>
              <template #default="scope">
                <div class="expense-amount" :class="{ 'negative': scope.row.amount < 0 }">
                  {{ formatAmount(scope.row.amount) }}
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="收据" width="80" align="center">
              <template #default="scope">
                <el-popover
                  placement="top"
                  width="200"
                  trigger="click"
                >
                  <template #reference>
                    <el-button 
                      type="primary" 
                      size="small" 
                      :disabled="!scope.row.receiptUrl"
                    >
                      {{ scope.row.receiptUrl ? '查看' : '无' }}
                    </el-button>
                  </template>
                  <img 
                    v-if="scope.row.receiptUrl" 
                    :src="scope.row.receiptUrl" 
                    alt="收据"
                    class="receipt-image"
                  >
                </el-popover>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-button type="primary" size="small" @click="editExpense(scope.row)">
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click="deleteExpense(scope.row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredExpenses.length"
            />
          </div>
        </div>
      </div>
      
      <!-- 批量操作工具栏 -->
      <div class="batch-actions" v-if="selectedExpenses.length > 0">
        <el-button type="danger" @click="batchDeleteExpenses">
          <el-icon><Delete /></el-icon> 删除选中的 {{ selectedExpenses.length }} 项
        </el-button>
        <el-button @click="batchExportExpenses">
          <el-icon><Download /></el-icon> 导出选中的
        </el-button>
      </div>
      
      <!-- 费用表单对话框 -->
      <el-dialog
        v-model="showExpenseForm"
        :title="editingExpense ? '编辑费用' : '添加费用'"
        width="500px"
        center
      >
        <ExpenseForm
          ref="expenseFormRef"
          :initial-data="editingExpense"
          @submit="handleExpenseSubmit"
          @cancel="cancelExpenseEdit"
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
  Plus, Download, ArrowDown, Wallet, Tickets, 
  WalletFilled, TrendCharts, Delete, Search 
} from '@element-plus/icons-vue';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components';
import {
  PieChart,
  LineChart
} from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import LoadingAnimation from '../components/LoadingAnimation.vue';
import ExpenseForm from '../components/ExpenseForm.vue';
import * as api from '../services/api';
import { formatDate, formatAmount, getCategoryLabel, getCategoryTagType, getPaymentMethodLabel } from '../utils/helper';

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChart,
  LineChart,
  LabelLayout,
  CanvasRenderer
]);

export default {
  name: 'ExpenseTracker',
  components: {
    LoadingAnimation,
    ExpenseForm,
    Plus,
    Download,
    ArrowDown,
    Wallet,
    Tickets,
    WalletFilled,
    TrendCharts,
    Delete,
    Search
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    
    // 响应式数据
    const loading = ref(false);
    const error = ref(false);
    const travelPlanTitle = ref('');
    const budget = ref(0);
    const allExpenses = ref([]);
    const showExpenseForm = ref(false);
    const editingExpense = ref(null);
    const selectedExpenses = ref([]);
    const searchQuery = ref('');
    const currentPage = ref(1);
    const pageSize = ref(20);
    const sortField = ref('date:desc');
    const categoryChartRef = ref(null);
    const dailyTrendChartRef = ref(null);
    const categoryChart = ref(null);
    const dailyTrendChart = ref(null);
    
    // 费用分类
    const expenseCategories = [
      { label: '住宿', value: 'accommodation' },
      { label: '交通', value: 'transportation' },
      { label: '餐饮', value: 'food' },
      { label: '景点门票', value: 'attraction' },
      { label: '购物', value: 'shopping' },
      { label: '娱乐', value: 'entertainment' },
      { label: '通讯', value: 'communication' },
      { label: '其他', value: 'other' }
    ];
    
    // 支付方式
    const paymentMethods = [
      { label: '现金', value: 'cash' },
      { label: '信用卡', value: 'credit_card' },
      { label: '借记卡', value: 'debit_card' },
      { label: '移动支付', value: 'mobile_payment' },
      { label: '银行转账', value: 'bank_transfer' },
      { label: '其他', value: 'other' }
    ];
    
    // 筛选条件
    const filter = reactive({
      category: '',
      dateRange: null,
      paymentMethod: '',
      minAmount: null,
      maxAmount: null
    });
    
    // 计算属性
    const totalExpenses = computed(() => {
      return allExpenses.value.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    });
    
    const remainingBudget = computed(() => {
      return budget.value - totalExpenses.value;
    });
    
    const budgetUsagePercentage = computed(() => {
      if (budget.value === 0) return 0;
      return Math.round((totalExpenses.value / budget.value) * 100);
    });
    
    const filteredExpenses = computed(() => {
      let expenses = [...allExpenses.value];
      
      // 应用搜索
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        expenses = expenses.filter(expense => 
          expense.description.toLowerCase().includes(query) ||
          expense.notes?.toLowerCase().includes(query) ||
          expense.location?.toLowerCase().includes(query)
        );
      }
      
      // 应用筛选条件
      if (filter.category) {
        expenses = expenses.filter(expense => expense.category === filter.category);
      }
      
      if (filter.dateRange && filter.dateRange.length === 2) {
        const [start, end] = filter.dateRange;
        expenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= start && expenseDate <= end;
        });
      }
      
      if (filter.paymentMethod) {
        expenses = expenses.filter(expense => expense.paymentMethod === filter.paymentMethod);
      }
      
      if (filter.minAmount !== null) {
        expenses = expenses.filter(expense => expense.amount >= filter.minAmount);
      }
      
      if (filter.maxAmount !== null) {
        expenses = expenses.filter(expense => expense.amount <= filter.maxAmount);
      }
      
      // 应用排序
      const [field, order] = sortField.value.split(':');
      expenses.sort((a, b) => {
        let aValue = a[field];
        let bValue = b[field];
        
        if (field === 'date') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        
        if (order === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      // 应用分页 - 这里只是为了UI显示，实际数据未截断
      // 实际分页可以在这里计算，但通常在后端处理更好
      
      return expenses;
    });
    
    // 方法
    const fetchExpenseData = async () => {
      loading.value = true;
      error.value = false;
      
      try {
        const travelPlanId = route.params.id;
        
        // 获取旅行计划信息
        // const plan = await api.getTravelPlanById(travelPlanId);
        // travelPlanTitle.value = plan.title;
        // budget.value = plan.budget;
        
        // 模拟旅行计划数据
        travelPlanTitle.value = '东京七日游';
        budget.value = 50000;
        
        // 获取费用数据
        // const expenses = await api.getExpensesByTravelPlanId(travelPlanId);
        // allExpenses.value = expenses;
        
        // 模拟费用数据
        allExpenses.value = [
          {
            id: 1,
            travelPlanId,
            date: '2023-10-15',
            category: 'accommodation',
            description: '东京丽思卡尔顿酒店',
            amount: 25000,
            paymentMethod: 'credit_card',
            location: '东京都港区',
            notes: '豪华双床房',
            receiptUrl: null
          },
          {
            id: 2,
            travelPlanId,
            date: '2023-10-15',
            category: 'food',
            description: '晚餐',
            amount: 3500,
            paymentMethod: 'credit_card',
            location: '六本木',
            notes: '日式料理',
            receiptUrl: null
          },
          {
            id: 3,
            travelPlanId,
            date: '2023-10-16',
            category: 'transportation',
            description: '地铁一日券',
            amount: 1500,
            paymentMethod: 'cash',
            location: '东京站',
            notes: '',
            receiptUrl: null
          },
          {
            id: 4,
            travelPlanId,
            date: '2023-10-16',
            category: 'attraction',
            description: '东京塔门票',
            amount: 1200,
            paymentMethod: 'mobile_payment',
            location: '东京塔',
            notes: '主甲板和顶层甲板',
            receiptUrl: null
          },
          {
            id: 5,
            travelPlanId,
            date: '2023-10-17',
            category: 'shopping',
            description: '购物',
            amount: 10000,
            paymentMethod: 'credit_card',
            location: '银座',
            notes: '服装和纪念品',
            receiptUrl: null
          }
        ];
      } catch (err) {
        console.error('获取费用数据失败:', err);
        error.value = true;
        ElMessage.error('获取费用数据失败，请稍后重试');
      } finally {
        loading.value = false;
        
        // 渲染图表
        if (!error.value) {
          nextTick(() => {
            initCategoryChart();
            initDailyTrendChart();
          });
        }
      }
    };
    
    // 获取进度条颜色
    const getProgressColor = (percentage) => {
      if (percentage < 50) return '#67C23A';
      if (percentage < 80) return '#E6A23C';
      if (percentage < 100) return '#F56C6C';
      return '#F56C6C';
    };
    
    // 初始化分类图表
    const initCategoryChart = () => {
      if (!categoryChartRef.value) return;
      
      // 销毁之前的图表实例
      if (categoryChart.value) {
        categoryChart.value.dispose();
      }
      
      // 创建图表实例
      categoryChart.value = echarts.init(categoryChartRef.value);
      
      // 计算分类统计数据
      const categoryData = {};
      allExpenses.value.forEach(expense => {
        const category = expense.category || 'other';
        categoryData[category] = (categoryData[category] || 0) + expense.amount;
      });
      
      // 准备图表数据
      const data = Object.entries(categoryData).map(([category, amount]) => ({
        name: getCategoryLabel(category),
        value: amount
      }));
      
      // 设置图表选项
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: data.map(item => item.name)
        },
        series: [
          {
            name: '费用分类',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data
          }
        ]
      };
      
      // 设置图表选项
      categoryChart.value.setOption(option);
      
      // 处理窗口大小变化
      window.addEventListener('resize', () => {
        categoryChart.value?.resize();
      });
    };
    
    // 初始化每日趋势图表
    const initDailyTrendChart = () => {
      if (!dailyTrendChartRef.value) return;
      
      // 销毁之前的图表实例
      if (dailyTrendChart.value) {
        dailyTrendChart.value.dispose();
      }
      
      // 创建图表实例
      dailyTrendChart.value = echarts.init(dailyTrendChartRef.value);
      
      // 计算每日支出数据
      const dailyData = {};
      allExpenses.value.forEach(expense => {
        const date = expense.date;
        dailyData[date] = (dailyData[date] || 0) + expense.amount;
      });
      
      // 按日期排序
      const sortedDates = Object.keys(dailyData).sort();
      
      // 准备图表数据
      const xAxisData = sortedDates.map(date => formatDate(date, 'MM-DD'));
      const seriesData = sortedDates.map(date => dailyData[date]);
      
      // 设置图表选项
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c} 元'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxisData
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value} 元'
          }
        },
        series: [
          {
            name: '每日支出',
            type: 'line',
            stack: 'Total',
            data: seriesData,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(103, 194, 58, 0.6)'
                },
                {
                  offset: 1,
                  color: 'rgba(103, 194, 58, 0.1)'
                }
              ])
            },
            lineStyle: {
              width: 3,
              color: '#67C23A'
            },
            symbol: 'circle',
            symbolSize: 8
          }
        ]
      };
      
      // 设置图表选项
      dailyTrendChart.value.setOption(option);
      
      // 处理窗口大小变化
      window.addEventListener('resize', () => {
        dailyTrendChart.value?.resize();
      });
    };
    
    // 编辑费用
    const editExpense = (expense) => {
      editingExpense.value = { ...expense };
      showExpenseForm.value = true;
    };
    
    // 取消编辑费用
    const cancelExpenseEdit = () => {
      editingExpense.value = null;
      showExpenseForm.value = false;
    };
    
    // 处理费用提交
    const handleExpenseSubmit = (data) => {
      const travelPlanId = route.params.id;
      
      if (editingExpense.value) {
        // 更新现有费用
        const index = allExpenses.value.findIndex(item => item.id === editingExpense.value.id);
        if (index !== -1) {
          allExpenses.value[index] = { ...editingExpense.value, ...data };
        }
      } else {
        // 添加新费用
        const newExpense = {
          id: Date.now(), // 临时ID，实际应该由后端生成
          travelPlanId,
          ...data
        };
        allExpenses.value.push(newExpense);
      }
      
      cancelExpenseEdit();
      ElMessage.success(editingExpense.value ? '费用已更新' : '费用已添加');
      
      // 更新图表
      nextTick(() => {
        initCategoryChart();
        initDailyTrendChart();
      });
    };
    
    // 删除费用
    const deleteExpense = async (id) => {
      try {
        await ElMessageBox.confirm(
          '确定要删除这条费用记录吗？',
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
        
        allExpenses.value = allExpenses.value.filter(item => item.id !== id);
        ElMessage.success('费用记录已删除');
        
        // 更新图表
        nextTick(() => {
          initCategoryChart();
          initDailyTrendChart();
        });
      } catch (error) {
        // 用户取消删除
      }
    };
    
    // 处理选择变更
    const handleSelectionChange = (selection) => {
      selectedExpenses.value = selection;
    };
    
    // 批量删除费用
    const batchDeleteExpenses = async () => {
      if (selectedExpenses.value.length === 0) return;
      
      try {
        await ElMessageBox.confirm(
          `确定要删除选中的 ${selectedExpenses.value.length} 条费用记录吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
        
        const selectedIds = selectedExpenses.value.map(item => item.id);
        allExpenses.value = allExpenses.value.filter(item => !selectedIds.includes(item.id));
        selectedExpenses.value = [];
        
        ElMessage.success('批量删除成功');
        
        // 更新图表
        nextTick(() => {
          initCategoryChart();
          initDailyTrendChart();
        });
      } catch (error) {
        // 用户取消删除
      }
    };
    
    // 应用筛选
    const applyFilters = () => {
      currentPage.value = 1;
    };
    
    // 重置筛选
    const resetFilters = () => {
      filter.category = '';
      filter.dateRange = null;
      filter.paymentMethod = '';
      filter.minAmount = null;
      filter.maxAmount = null;
      searchQuery.value = '';
      sortField.value = 'date:desc';
      currentPage.value = 1;
    };
    
    // 处理导出
    const handleExport = (type) => {
      // 实际应该调用后端API进行导出
      ElMessage.success(`数据已导出为${type.toUpperCase()}格式`);
    };
    
    // 批量导出费用
    const batchExportExpenses = () => {
      if (selectedExpenses.value.length === 0) return;
      
      // 实际应该调用后端API进行导出
      ElMessage.success(`已导出 ${selectedExpenses.value.length} 条费用记录`);
    };
    
    onMounted(() => {
      fetchExpenseData();
    });
    
    // 监听窗口大小变化
    watch(
      () => window.innerWidth,
      () => {
        nextTick(() => {
          categoryChart.value?.resize();
          dailyTrendChart.value?.resize();
        });
      }
    );
    
    return {
      // 数据
      loading,
      error,
      travelPlanTitle,
      budget,
      allExpenses,
      showExpenseForm,
      editingExpense,
      selectedExpenses,
      searchQuery,
      currentPage,
      pageSize,
      sortField,
      filter,
      categoryChartRef,
      dailyTrendChartRef,
      expenseCategories,
      paymentMethods,
      
      // 计算属性
      totalExpenses,
      remainingBudget,
      budgetUsagePercentage,
      filteredExpenses,
      
      // 方法
      fetchExpenseData,
      getProgressColor,
      editExpense,
      cancelExpenseEdit,
      handleExpenseSubmit,
      deleteExpense,
      handleSelectionChange,
      batchDeleteExpenses,
      applyFilters,
      resetFilters,
      handleExport,
      batchExportExpenses,
      
      // 工具方法
      formatDate,
      formatAmount,
      getCategoryLabel,
      getCategoryTagType,
      getPaymentMethodLabel
    };
  }
};
</script>

<style scoped>
.expense-tracker {
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

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.overview-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-large);
  color: white;
}

.expense-icon {
  background-color: var(--primary-color);
}

.budget-icon {
  background-color: var(--success-color);
}

.remaining-icon {
  background-color: var(--warning-color);
}

.usage-icon {
  background-color: var(--info-color);
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin-bottom: var(--space-xs);
}

.card-value {
  font-size: var(--font-size-extra-large);
  font-weight: 500;
  color: var(--text-primary);
}

.over-budget {
  color: var(--danger-color);
}

.budget-progress-card {
  margin-bottom: var(--space-xl);
  padding: var(--space-lg);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.progress-title {
  font-size: var(--font-size-medium);
  color: var(--text-primary);
  font-weight: 500;
}

.progress-status {
  font-size: var(--font-size-small);
  color: var(--success-color);
}

.budget-progress {
  margin-bottom: var(--space-xs);
}

.over-budget-indicator {
  font-size: var(--font-size-small);
  color: var(--danger-color);
  text-align: right;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.chart-card {
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

.chart-container {
  width: 100%;
  height: 300px;
}

.chart {
  width: 100%;
  height: 100%;
}

.expense-list-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.filter-card {
  padding: var(--space-lg);
}

.filter-content {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-lg);
  align-items: flex-end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.filter-label {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.filter-select, .filter-date {
  width: 150px;
}

.amount-range {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.amount-input {
  width: 100px;
}

.amount-separator {
  color: var(--text-secondary);
}

.filter-actions {
  display: flex;
  gap: var(--space-sm);
}

.list-card {
  padding: var(--space-lg);
}

.card-actions {
  display: flex;
  gap: var(--space-md);
  align-items: center;
}

.search-input {
  width: 200px;
}

.sort-select {
  width: 120px;
}

.expense-description {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.expense-notes {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.expense-amount {
  font-weight: 500;
}

.expense-amount.negative {
  color: var(--danger-color);
}

.receipt-image {
  width: 100%;
  border-radius: var(--border-radius);
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-lg);
}

.batch-actions {
  margin-top: var(--space-lg);
  display: flex;
  gap: var(--space-md);
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
  .expense-tracker {
    padding: var(--space-md);
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .filter-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select, .filter-date {
    width: 100%;
  }
  
  .amount-range {
    justify-content: space-between;
  }
  
  .amount-input {
    flex: 1;
  }
  
  .filter-actions {
    justify-content: flex-end;
  }
  
  .card-actions {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-sm);
  }
  
  .search-input, .sort-select {
    width: 100%;
  }
  
  .batch-actions {
    justify-content: center;
  }
}
</style>