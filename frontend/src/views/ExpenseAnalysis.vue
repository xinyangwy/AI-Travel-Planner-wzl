<template>
  <div class="expense-analysis">
    <!-- 加载动画 -->
    <LoadingAnimation v-if="loading" :message="'加载中...'" />
    
    <!-- 错误提示 -->
    <div v-else-if="error" class="error-container">
      <el-empty description="获取费用分析数据失败" />
      <el-button type="primary" @click="fetchExpenseData">重试</el-button>
    </div>
    
    <!-- 费用分析内容 -->
    <div v-else class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1 class="page-title">费用分析</h1>
        <p class="page-subtitle">详细分析您的旅行支出和预算使用情况</p>
      </div>
      
      <!-- 旅行计划选择器 -->
      <div class="custom-card filter-card">
        <div class="filters">
          <div class="filter-item">
            <span class="filter-label">旅行计划:</span>
            <el-select 
              v-model="selectedTravelPlanId" 
              placeholder="选择旅行计划" 
              @change="onTravelPlanChange"
              style="width: 250px;"
            >
              <el-option 
                v-for="plan in travelPlans" 
                :key="plan.id" 
                :label="plan.title" 
                :value="plan.id"
              />
            </el-select>
          </div>
          
          <div class="filter-item">
            <span class="filter-label">日期范围:</span>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="onDateRangeChange"
              value-format="YYYY-MM-DD"
            />
          </div>
          
          <div class="filter-item">
            <span class="filter-label">费用分类:</span>
            <el-select 
              v-model="selectedCategories" 
              placeholder="选择分类" 
              multiple
              collapse-tags
              @change="onFilterChange"
              style="width: 200px;"
            >
              <el-option 
                v-for="category in expenseCategories" 
                :key="category.value" 
                :label="category.label" 
                :value="category.value"
              />
            </el-select>
          </div>
          
          <div class="filter-item">
            <span class="filter-label">支付方式:</span>
            <el-select 
              v-model="selectedPaymentMethods" 
              placeholder="选择支付方式" 
              multiple
              collapse-tags
              @change="onFilterChange"
              style="width: 200px;"
            >
              <el-option 
                v-for="method in paymentMethods" 
                :key="method.value" 
                :label="method.label" 
                :value="method.value"
              />
            </el-select>
          </div>
        </div>
      </div>
      
      <!-- 总览卡片 -->
      <div class="overview-cards">
        <div class="custom-card overview-card">
          <div class="card-icon" style="background-color: #409EFF;">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">总支出</div>
            <div class="card-value">{{ formatAmount(totalExpense) }}</div>
            <div class="card-trend" :class="{ 'trend-up': totalExpenseTrend > 0, 'trend-down': totalExpenseTrend < 0 }">
              <el-icon v-if="totalExpenseTrend > 0"><TrendCharts /></el-icon>
              <el-icon v-else-if="totalExpenseTrend < 0"><TrendCharts /></el-icon>
              <span>{{ totalExpenseTrend > 0 ? '+' : '' }}{{ totalExpenseTrend }}%</span>
            </div>
          </div>
        </div>
        
        <div class="custom-card overview-card">
          <div class="card-icon" style="background-color: #67C23A;">
            <el-icon><Document /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">支出笔数</div>
            <div class="card-value">{{ totalExpenseCount }}</div>
            <div class="card-subtitle">{{ formatAmount(averageExpense) }}/笔</div>
          </div>
        </div>
        
        <div class="custom-card overview-card">
          <div class="card-icon" style="background-color: #E6A23C;">
            <el-icon><WarningFilled /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">预算使用率</div>
            <div class="card-value">{{ budgetUsageRate }}%</div>
            <div class="card-trend" :class="{ 'trend-warning': budgetUsageRate > 80 }">
              <span>{{ budgetUsageRate > 80 ? '接近预算上限' : '预算充足' }}</span>
            </div>
          </div>
        </div>
        
        <div class="custom-card overview-card">
          <div class="card-icon" style="background-color: #909399;">
            <el-icon><Van /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">最大单笔支出</div>
            <div class="card-value">{{ formatAmount(maxExpense) }}</div>
            <div class="card-subtitle">{{ maxExpenseCategory }}</div>
          </div>
        </div>
      </div>
      
      <!-- 图表区域 -->
      <div class="charts-container">
        <!-- 分类支出饼图 -->
        <div class="custom-card chart-card">
          <div class="chart-header">
            <h2 class="chart-title">费用分类统计</h2>
            <el-radio-group v-model="pieChartType" size="small" @change="updateCategoryChart">
              <el-radio-button label="amount">金额</el-radio-button>
              <el-radio-button label="percentage">百分比</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="categoryChartContainer" class="chart-container"></div>
        </div>
        
        <!-- 时间趋势图 -->
        <div class="custom-card chart-card">
          <div class="chart-header">
            <h2 class="chart-title">支出趋势</h2>
            <el-select v-model="timeRange" size="small" @change="updateTrendChart">
              <el-option label="按日" value="daily" />
              <el-option label="按周" value="weekly" />
              <el-option label="按月" value="monthly" />
            </el-select>
          </div>
          <div ref="trendChartContainer" class="chart-container"></div>
        </div>
        
        <!-- 地点分析柱状图 -->
        <div class="custom-card chart-card">
          <div class="chart-header">
            <h2 class="chart-title">地点支出分析</h2>
          </div>
          <div ref="locationChartContainer" class="chart-container"></div>
        </div>
        
        <!-- 支付方式分析 -->
        <div class="custom-card chart-card">
          <div class="chart-header">
            <h2 class="chart-title">支付方式统计</h2>
          </div>
          <div ref="paymentChartContainer" class="chart-container"></div>
        </div>
      </div>
      
      <!-- 费用明细表格 -->
      <div class="custom-card">
        <div class="table-header">
          <h2 class="table-title">费用明细</h2>
          <el-button-group>
            <el-button type="primary" @click="exportExpenseData">
              <el-icon><Download /></el-icon> 导出数据
            </el-button>
          </el-button-group>
        </div>
        
        <el-table :data="paginatedExpenses" style="width: 100%" stripe>
          <el-table-column prop="date" label="日期" width="120">
            <template #default="scope">{{ formatDate(scope.row.date) }}</template>
          </el-table-column>
          <el-table-column prop="category" label="分类" width="120">
            <template #default="scope">
              <el-tag size="small" :type="getCategoryTagType(scope.row.category)">
                {{ getExpenseCategoryText(scope.row.category) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述"></el-table-column>
          <el-table-column prop="amount" label="金额" width="120" align="right">
            <template #default="scope">{{ formatAmount(scope.row.amount) }}</template>
          </el-table-column>
          <el-table-column prop="location" label="地点" width="120"></el-table-column>
          <el-table-column prop="paymentMethod" label="支付方式" width="120">
            <template #default="scope">{{ getPaymentMethodText(scope.row.paymentMethod) }}</template>
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
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import { Wallet, Document, WarningFilled, Van, Download, TrendCharts } from '@element-plus/icons-vue';
import LoadingAnimation from '../components/LoadingAnimation.vue';
import * as api from '../services/api';
import { formatAmount, formatDate, getExpenseCategoryText, getPaymentMethodText } from '../utils/helper';
import * as echarts from 'echarts/core';
import { PieChart, BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册 ECharts 组件
echarts.use(
  [TitleComponent, TooltipComponent, LegendComponent, GridComponent, PieChart, BarChart, LineChart, CanvasRenderer]
);

export default {
  name: 'ExpenseAnalysis',
  components: {
    LoadingAnimation,
    Wallet,
    Document,
    WarningFilled,
    Van,
    Download,
    TrendCharts
  },
  setup() {
    const store = useStore();
    
    // 响应式数据
    const loading = ref(false);
    const error = ref(false);
    const travelPlans = ref([]);
    const allExpenses = ref([]);
    const selectedTravelPlanId = ref('');
    const dateRange = ref([]);
    const selectedCategories = ref([]);
    const selectedPaymentMethods = ref([]);
    const pieChartType = ref('amount');
    const timeRange = ref('daily');
    
    // 分页
    const currentPage = ref(1);
    const pageSize = ref(10);
    
    // 图表引用
    const categoryChartContainer = ref(null);
    const trendChartContainer = ref(null);
    const locationChartContainer = ref(null);
    const paymentChartContainer = ref(null);
    
    // 图表实例
    let categoryChart = null;
    let trendChart = null;
    let locationChart = null;
    let paymentChart = null;
    
    // 费用分类选项
    const expenseCategories = [
      { label: '住宿', value: 'accommodation' },
      { label: '餐饮', value: 'food' },
      { label: '交通', value: 'transportation' },
      { label: '景点门票', value: 'attraction' },
      { label: '购物', value: 'shopping' },
      { label: '娱乐', value: 'entertainment' },
      { label: '通讯', value: 'communication' },
      { label: '保险', value: 'insurance' },
      { label: '医疗', value: 'medical' },
      { label: '其他', value: 'other' }
    ];
    
    // 支付方式选项
    const paymentMethods = [
      { label: '现金', value: 'cash' },
      { label: '信用卡', value: 'credit_card' },
      { label: '借记卡', value: 'debit_card' },
      { label: '移动支付', value: 'mobile_payment' },
      { label: '银行转账', value: 'bank_transfer' },
      { label: '其他', value: 'other' }
    ];
    
    // 计算属性
    const filteredExpenses = computed(() => {
      return allExpenses.value.filter(expense => {
        // 旅行计划过滤
        if (selectedTravelPlanId.value && expense.travelPlanId !== selectedTravelPlanId.value) {
          return false;
        }
        
        // 日期范围过滤
        if (dateRange.value && dateRange.value.length === 2) {
          const expenseDate = new Date(expense.date);
          const startDate = new Date(dateRange.value[0]);
          const endDate = new Date(dateRange.value[1]);
          if (expenseDate < startDate || expenseDate > endDate) {
            return false;
          }
        }
        
        // 分类过滤
        if (selectedCategories.value.length > 0 && !selectedCategories.value.includes(expense.category)) {
          return false;
        }
        
        // 支付方式过滤
        if (selectedPaymentMethods.value.length > 0 && !selectedPaymentMethods.value.includes(expense.paymentMethod)) {
          return false;
        }
        
        return true;
      });
    });
    
    const paginatedExpenses = computed(() => {
      const startIndex = (currentPage.value - 1) * pageSize.value;
      const endIndex = startIndex + pageSize.value;
      return filteredExpenses.value.slice(startIndex, endIndex);
    });
    
    const totalExpense = computed(() => {
      return filteredExpenses.value.reduce((sum, expense) => sum + expense.amount, 0);
    });
    
    const totalExpenseCount = computed(() => {
      return filteredExpenses.value.length;
    });
    
    const averageExpense = computed(() => {
      if (totalExpenseCount.value === 0) return 0;
      return totalExpense.value / totalExpenseCount.value;
    });
    
    const budgetUsageRate = computed(() => {
      if (!selectedTravelPlanId.value) return 0;
      
      const travelPlan = travelPlans.value.find(plan => plan.id === selectedTravelPlanId.value);
      if (!travelPlan || travelPlan.totalBudget === 0) return 0;
      
      return Math.min(Math.round((totalExpense.value / travelPlan.totalBudget) * 100), 100);
    });
    
    const maxExpense = computed(() => {
      if (filteredExpenses.value.length === 0) return 0;
      
      let max = 0;
      filteredExpenses.value.forEach(expense => {
        if (expense.amount > max) {
          max = expense.amount;
        }
      });
      
      return max;
    });
    
    const maxExpenseCategory = computed(() => {
      if (filteredExpenses.value.length === 0) return '';
      
      let max = 0;
      let category = '';
      filteredExpenses.value.forEach(expense => {
        if (expense.amount > max) {
          max = expense.amount;
          category = expense.category;
        }
      });
      
      return getExpenseCategoryText(category);
    });
    
    // 模拟趋势数据
    const totalExpenseTrend = computed(() => {
      // 这里应该根据实际历史数据计算趋势
      // 目前返回模拟数据
      return Math.floor(Math.random() * 20) - 10;
    });
    
    // 方法
    const fetchExpenseData = async () => {
      loading.value = true;
      error.value = false;
      
      try {
        // 获取所有旅行计划
        const plans = await api.getAllTravelPlans();
        travelPlans.value = plans;
        
        // 默认选择第一个旅行计划
        if (plans.length > 0 && !selectedTravelPlanId.value) {
          selectedTravelPlanId.value = plans[0].id;
        }
        
        // 获取所有费用记录
        const expenses = await api.getAllExpenses();
        allExpenses.value = expenses;
        
        // 如果有默认旅行计划，设置默认日期范围
        if (selectedTravelPlanId.value) {
          const selectedPlan = travelPlans.value.find(plan => plan.id === selectedTravelPlanId.value);
          if (selectedPlan) {
            dateRange.value = [selectedPlan.startDate, selectedPlan.endDate];
          }
        }
      } catch (err) {
        console.error('获取费用数据失败:', err);
        error.value = true;
        ElMessage.error('获取费用数据失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    };
    
    const onTravelPlanChange = () => {
      // 重置分页
      currentPage.value = 1;
      
      // 更新日期范围
      const selectedPlan = travelPlans.value.find(plan => plan.id === selectedTravelPlanId.value);
      if (selectedPlan) {
        dateRange.value = [selectedPlan.startDate, selectedPlan.endDate];
      }
      
      // 更新图表
      nextTick(() => {
        updateAllCharts();
      });
    };
    
    const onDateRangeChange = () => {
      // 重置分页
      currentPage.value = 1;
      
      // 更新图表
      nextTick(() => {
        updateAllCharts();
      });
    };
    
    const onFilterChange = () => {
      // 重置分页
      currentPage.value = 1;
      
      // 更新图表
      nextTick(() => {
        updateAllCharts();
      });
    };
    
    const getCategoryTagType = (category) => {
      const categoryTypes = {
        'accommodation': 'primary',
        'food': 'success',
        'transportation': 'warning',
        'attraction': 'info',
        'shopping': 'danger',
        'entertainment': 'purple',
        'communication': 'cyan',
        'insurance': 'blue',
        'medical': 'red',
        'other': 'gray'
      };
      
      return categoryTypes[category] || 'info';
    };
    
    // 初始化所有图表
    const initAllCharts = () => {
      nextTick(() => {
        initCategoryChart();
        initTrendChart();
        initLocationChart();
        initPaymentChart();
      });
    };
    
    // 更新所有图表
    const updateAllCharts = () => {
      updateCategoryChart();
      updateTrendChart();
      updateLocationChart();
      updatePaymentChart();
    };
    
    // 初始化分类支出饼图
    const initCategoryChart = () => {
      if (!categoryChartContainer.value) return;
      
      categoryChart = echarts.init(categoryChartContainer.value);
      updateCategoryChart();
    };
    
    // 更新分类支出饼图
    const updateCategoryChart = () => {
      if (!categoryChart) return;
      
      // 按分类汇总费用
      const categoryData = {};
      filteredExpenses.value.forEach(expense => {
        if (!categoryData[expense.category]) {
          categoryData[expense.category] = 0;
        }
        categoryData[expense.category] += expense.amount;
      });
      
      // 准备图表数据
      const total = Object.values(categoryData).reduce((sum, amount) => sum + amount, 0);
      const seriesData = Object.entries(categoryData).map(([category, amount]) => {
        const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : '0';
        
        return {
          name: getExpenseCategoryText(category),
          value: pieChartType.value === 'amount' ? amount : parseFloat(percentage),
          amount: amount, // 保存原始金额用于显示
          percentage: percentage // 保存百分比用于显示
        };
      });
      
      // 设置图表选项
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '费用分类',
            type: 'pie',
            radius: '60%',
            data: seriesData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      
      categoryChart.setOption(option);
    };
    
    // 初始化趋势图
    const initTrendChart = () => {
      if (!trendChartContainer.value) return;
      
      trendChart = echarts.init(trendChartContainer.value);
      updateTrendChart();
    };
    
    // 更新趋势图
    const updateTrendChart = () => {
      if (!trendChart) return;
      
      // 按日期分组
      const dateData = {};
      filteredExpenses.value.forEach(expense => {
        const date = expense.date;
        if (!dateData[date]) {
          dateData[date] = 0;
        }
        dateData[date] += expense.amount;
      });
      
      // 排序日期
      const sortedDates = Object.keys(dateData).sort();
      const sortedAmounts = sortedDates.map(date => dateData[date]);
      
      // 设置图表选项
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            return `${params[0].name}<br/>支出: ¥${params[0].value.toFixed(2)}`;
          }
        },
        xAxis: {
          type: 'category',
          data: sortedDates
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '¥{value}'
          }
        },
        series: [
          {
            name: '每日支出',
            type: 'line',
            data: sortedAmounts,
            smooth: true,
            areaStyle: {}
          }
        ]
      };
      
      trendChart.setOption(option);
    };
    
    // 初始化地点支出柱状图
    const initLocationChart = () => {
      if (!locationChartContainer.value) return;
      
      locationChart = echarts.init(locationChartContainer.value);
      updateLocationChart();
    };
    
    // 更新地点支出柱状图
    const updateLocationChart = () => {
      if (!locationChart) return;
      
      // 按地点汇总费用
      const locationData = {};
      filteredExpenses.value.forEach(expense => {
        if (!expense.location) return;
        
        if (!locationData[expense.location]) {
          locationData[expense.location] = 0;
        }
        locationData[expense.location] += expense.amount;
      });
      
      // 排序并取前10个地点
      const sortedLocations = Object.entries(locationData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      const locations = sortedLocations.map(item => item[0]);
      const amounts = sortedLocations.map(item => item[1]);
      
      // 设置图表选项
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            return `${params[0].name}<br/>支出: ¥${params[0].value.toFixed(2)}`;
          }
        },
        xAxis: {
          type: 'category',
          data: locations,
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '¥{value}'
          }
        },
        series: [
          {
            name: '地点支出',
            type: 'bar',
            data: amounts
          }
        ]
      };
      
      locationChart.setOption(option);
    };
    
    // 初始化支付方式图表
    const initPaymentChart = () => {
      if (!paymentChartContainer.value) return;
      
      paymentChart = echarts.init(paymentChartContainer.value);
      updatePaymentChart();
    };
    
    // 更新支付方式图表
    const updatePaymentChart = () => {
      if (!paymentChart) return;
      
      // 按支付方式汇总费用
      const paymentData = {};
      filteredExpenses.value.forEach(expense => {
        if (!paymentData[expense.paymentMethod]) {
          paymentData[expense.paymentMethod] = 0;
        }
        paymentData[expense.paymentMethod] += expense.amount;
      });
      
      // 准备图表数据
      const seriesData = Object.entries(paymentData).map(([method, amount]) => ({
        name: getPaymentMethodText(method),
        value: amount
      }));
      
      // 设置图表选项
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: ¥{c}'
        },
        series: [
          {
            name: '支付方式',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: seriesData
          }
        ]
      };
      
      paymentChart.setOption(option);
    };
    
    // 导出费用数据
    const exportExpenseData = () => {
      // 准备CSV数据
      const headers = ['日期', '分类', '描述', '金额', '地点', '支付方式', '备注'];
      const csvRows = [headers.join(',')];
      
      filteredExpenses.value.forEach(expense => {
        const row = [
          expense.date,
          getExpenseCategoryText(expense.category),
          `"${expense.description.replace(/"/g, '""')}"`, // 处理引号
          expense.amount,
          expense.location || '',
          getPaymentMethodText(expense.paymentMethod),
          `"${(expense.notes || '').replace(/"/g, '""')}"` // 处理引号
        ];
        csvRows.push(row.join(','));
      });
      
      // 创建Blob对象
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `费用数据_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      ElMessage.success('数据导出成功');
    };
    
    // 处理窗口大小变化，调整图表大小
    const handleResize = () => {
      if (categoryChart) categoryChart.resize();
      if (trendChart) trendChart.resize();
      if (locationChart) locationChart.resize();
      if (paymentChart) paymentChart.resize();
    };
    
    // 监听窗口大小变化
    onMounted(() => {
      fetchExpenseData().then(() => {
        initAllCharts();
      });
      
      window.addEventListener('resize', handleResize);
    });
    
    // 组件卸载时销毁图表
    onUnmounted(() => {
      if (categoryChart) categoryChart.dispose();
      if (trendChart) trendChart.dispose();
      if (locationChart) locationChart.dispose();
      if (paymentChart) paymentChart.dispose();
      
      window.removeEventListener('resize', handleResize);
    });
    
    return {
      // 数据
      loading,
      error,
      travelPlans,
      selectedTravelPlanId,
      dateRange,
      selectedCategories,
      selectedPaymentMethods,
      expenseCategories,
      paymentMethods,
      pieChartType,
      timeRange,
      currentPage,
      pageSize,
      categoryChartContainer,
      trendChartContainer,
      locationChartContainer,
      paymentChartContainer,
      
      // 计算属性
      filteredExpenses,
      paginatedExpenses,
      totalExpense,
      totalExpenseCount,
      averageExpense,
      budgetUsageRate,
      maxExpense,
      maxExpenseCategory,
      totalExpenseTrend,
      
      // 方法
      fetchExpenseData,
      onTravelPlanChange,
      onDateRangeChange,
      onFilterChange,
      getCategoryTagType,
      updateCategoryChart,
      updateTrendChart,
      exportExpenseData,
      
      // 工具方法
      formatAmount,
      formatDate,
      getExpenseCategoryText,
      getPaymentMethodText
    };
  }
};
</script>

<style scoped>
.expense-analysis {
  min-height: 100vh;
  padding: var(--space-lg);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.filter-card {
  margin-bottom: var(--space-lg);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.filter-label {
  white-space: nowrap;
  color: var(--text-regular);
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
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 24px;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.card-value {
  font-size: var(--font-size-extra-large);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: var(--font-size-extra-small);
  color: var(--text-secondary);
}

.card-trend {
  font-size: var(--font-size-small);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.trend-up {
  color: var(--danger-color);
}

.trend-down {
  color: var(--success-color);
}

.trend-warning {
  color: var(--warning-color);
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(550px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.chart-card {
  padding: var(--space-lg);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.chart-title {
  margin: 0;
  font-size: var(--font-size-medium);
  color: var(--text-primary);
}

.chart-container {
  height: 300px;
  width: 100%;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.table-title {
  margin: 0;
  font-size: var(--font-size-medium);
  color: var(--text-primary);
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

/* 响应式样式 */
@media (max-width: 768px) {
  .expense-analysis {
    padding: var(--space-md);
  }
  
  .overview-cards {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .filters {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
}
</style>