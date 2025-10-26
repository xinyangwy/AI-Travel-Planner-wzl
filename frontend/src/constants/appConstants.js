/**
 * 应用程序常量定义
 */

// 路由路径常量
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TRAVEL: {
    LIST: '/travel/list',
    CREATE: '/travel/create',
    EDIT: '/travel/edit/:id',
    DETAIL: '/travel/detail/:id'
  },
  EXPENSE: {
    LIST: '/expense/list',
    CREATE: '/expense/create',
    EDIT: '/expense/edit/:id'
  },
  SETTINGS: '/settings'
}

// 旅行计划状态枚举
export const PLAN_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
}

// 旅行类型枚举
export const TRAVEL_TYPE = {
  BUSINESS: 'BUSINESS',
  LEISURE: 'LEISURE',
  ADVENTURE: 'ADVENTURE',
  CULTURAL: 'CULTURAL',
  RELAXATION: 'RELAXATION',
  SHOPPING: 'SHOPPING',
  FOOD: 'FOOD',
  FAMILY: 'FAMILY',
  OTHER: 'OTHER'
}

// 费用类型枚举
export const EXPENSE_TYPE = {
  TRANSPORTATION: 'TRANSPORTATION',
  ACCOMMODATION: 'ACCOMMODATION',
  FOOD: 'FOOD',
  ATTRACTION: 'ATTRACTION',
  SHOPPING: 'SHOPPING',
  ENTERTAINMENT: 'ENTERTAINMENT',
  OTHER: 'OTHER'
}

// 行程类型枚举
export const ITINERARY_TYPE = {
  TRANSPORTATION: 'TRANSPORTATION',
  ACCOMMODATION: 'ACCOMMODATION',
  FOOD: 'FOOD',
  ATTRACTION: 'ATTRACTION',
  SHOPPING: 'SHOPPING',
  ENTERTAINMENT: 'ENTERTAINMENT',
  REST: 'REST',
  OTHER: 'OTHER'
}

// 支付方式枚举
export const PAYMENT_METHOD = {
  CASH: 'CASH',
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  ALIPAY: 'ALIPAY',
  WECHAT_PAY: 'WECHAT_PAY',
  BANK_TRANSFER: 'BANK_TRANSFER',
  OTHER: 'OTHER'
}

// 日期格式化常量
export const DATE_FORMAT = {
  DEFAULT: 'YYYY-MM-DD',
  DISPLAY: 'YYYY年MM月DD日',
  SHORT: 'MM-DD',
  TIME: 'HH:mm',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY_DATETIME: 'YYYY年MM月DD日 HH:mm'
}

// 分页常量
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100']
}

// 费用统计时间范围
export const TIME_RANGE = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  ALL: 'all'
}

// 图表类型
export const CHART_TYPE = {
  PIE: 'pie',
  LINE: 'line',
  BAR: 'bar'
}

// 列表视图类型
export const VIEW_TYPE = {
  TABLE: 'table',
  LIST: 'list'
}

// 通用状态码
export const STATUS_CODE = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
}

// API相关常量
export const API = {
  BASE_URL: process.env.VUE_APP_API_BASE_URL || '/api',
  TIMEOUT: 10000
}

// 存储键名
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info',
  SETTINGS: 'app_settings',
  VIEW_PREFERENCES: 'view_preferences'
}

// 常用标签
export const COMMON_TAGS = {
  EXPENSE: ['紧急', '商务', '个人', '国外', '国内', '报销', '未报销'],
  ITINERARY: ['必去', '推荐', '可选', '家庭友好', '情侣', '冒险', '放松'],
  TRAVEL_PLAN: ['热门', '经典', '小众', '周末游', '长假', '短途', '长途']
}

// 默认配置
export const DEFAULT_CONFIG = {
  LANGUAGE: 'zh-CN',
  THEME: 'light',
  CURRENCY: 'CNY',
  DECIMAL_PLACES: 2
}

// 表单验证规则
export const VALIDATION_RULES = {
  MIN_TITLE_LENGTH: 2,
  MAX_TITLE_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 2,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 9999999.99
}

export default {
  ROUTES,
  PLAN_STATUS,
  TRAVEL_TYPE,
  EXPENSE_TYPE,
  ITINERARY_TYPE,
  PAYMENT_METHOD,
  DATE_FORMAT,
  PAGINATION,
  TIME_RANGE,
  CHART_TYPE,
  VIEW_TYPE,
  STATUS_CODE,
  API,
  STORAGE_KEYS,
  COMMON_TAGS,
  DEFAULT_CONFIG,
  VALIDATION_RULES
}