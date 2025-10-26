/**
 * 系统常量定义
 * 集中管理应用中使用的各种常量，方便维护和修改
 */

// API相关常量
export const API = {
  BASE_URL: process.env.VUE_APP_BASE_API || '/api',
  TIMEOUT: 10000,
  // 接口路径
  ENDPOINTS: {
    // 用户相关
    USER_LOGIN: '/user/login',
    USER_REGISTER: '/user/register',
    USER_INFO: '/user/info',
    USER_UPDATE: '/user/update',
    USER_PASSWORD: '/user/password',
    USER_LOGOUT: '/user/logout',
    
    // 旅行计划相关
    TRAVEL_LIST: '/travel/list',
    TRAVEL_CREATE: '/travel/create',
    TRAVEL_UPDATE: '/travel/update',
    TRAVEL_DELETE: '/travel/delete',
    TRAVEL_DETAIL: '/travel/detail',
    TRAVEL_GENERATE: '/travel/generate',
    
    // 行程安排相关
    ITINERARY_LIST: '/itinerary/list',
    ITINERARY_CREATE: '/itinerary/create',
    ITINERARY_UPDATE: '/itinerary/update',
    ITINERARY_DELETE: '/itinerary/delete',
    
    // 费用相关
    EXPENSE_LIST: '/expense/list',
    EXPENSE_CREATE: '/expense/create',
    EXPENSE_UPDATE: '/expense/update',
    EXPENSE_DELETE: '/expense/delete',
    EXPENSE_DETAIL: '/expense/detail',
    EXPENSE_STATISTICS: '/expense/statistics',
    
    // 语音助手相关
    VOICE_PROCESS: '/voice/process',
    VOICE_HISTORY: '/voice/history',
    
    // 上传相关
    UPLOAD_FILE: '/upload/file'
  }
}

// 存储键名常量
export const STORAGE_KEYS = {
  // 用户相关
  USER_TOKEN: 'user_token',
  USER_INFO: 'user_info',
  USER_SETTINGS: 'user_settings',
  REMEMBER_USERNAME: 'remember_username',
  
  // 应用相关
  APP_THEME: 'app_theme',
  LANGUAGE: 'language',
  LAST_LOGIN_TIME: 'last_login_time',
  
  // 搜索历史
  SEARCH_HISTORY: 'search_history',
  
  // 缓存相关
  CACHED_TRAVELS: 'cached_travels',
  CACHED_EXPENSES: 'cached_expenses'
}

// 旅行计划相关常量
export const TRAVEL = {
  // 状态枚举
  STATUS: {
    PENDING: { value: 'PENDING', label: '待执行', color: '#e6a23c' },
    IN_PROGRESS: { value: 'IN_PROGRESS', label: '进行中', color: '#67c23a' },
    COMPLETED: { value: 'COMPLETED', label: '已完成', color: '#409EFF' },
    CANCELLED: { value: 'CANCELLED', label: '已取消', color: '#909399' }
  },
  
  // 类型枚举
  TYPE: {
    VACATION: { value: 'VACATION', label: '休闲度假', icon: 'el-icon-beach-access' },
    ADVENTURE: { value: 'ADVENTURE', label: '探险旅行', icon: 'el-icon-compass' },
    CULTURE: { value: 'CULTURE', label: '文化体验', icon: 'el-icon-culture' },
    FAMILY: { value: 'FAMILY', label: '家庭游', icon: 'el-icon-family' },
    BUSINESS: { value: 'BUSINESS', label: '商务旅行', icon: 'el-icon-briefcase' },
    HONEYMOON: { value: 'HONEYMOON', label: '蜜月旅行', icon: 'el-icon-heart' },
    OTHER: { value: 'OTHER', label: '其他', icon: 'el-icon-more' }
  }
}

// 费用相关常量
export const EXPENSE = {
  // 类型枚举
  TYPE: {
    TRANSPORTATION: { value: 'TRANSPORTATION', label: '交通', color: '#409EFF', icon: 'el-icon-truck' },
    ACCOMMODATION: { value: 'ACCOMMODATION', label: '住宿', color: '#67c23a', icon: 'el-icon-building' },
    FOOD: { value: 'FOOD', label: '餐饮', color: '#e6a23c', icon: 'el-icon-food' },
    ATTRACTION: { value: 'ATTRACTION', label: '景点门票', color: '#f56c6c', icon: 'el-icon-ticket' },
    SHOPPING: { value: 'SHOPPING', label: '购物', color: '#909399', icon: 'el-icon-shopping-cart' },
    ENTERTAINMENT: { value: 'ENTERTAINMENT', label: '娱乐', color: '#b1b3b8', icon: 'el-icon-film' },
    OTHER: { value: 'OTHER', label: '其他', color: '#c0c4cc', icon: 'el-icon-more' }
  },
  
  // 支付方式枚举
  PAYMENT_METHOD: {
    CASH: { value: 'CASH', label: '现金', icon: 'el-icon-money' },
    CREDIT_CARD: { value: 'CREDIT_CARD', label: '信用卡', icon: 'el-icon-credit-card' },
    DEBIT_CARD: { value: 'DEBIT_CARD', label: '借记卡', icon: 'el-icon-debit-card' },
    ALIPAY: { value: 'ALIPAY', label: '支付宝', icon: 'el-icon-alipay' },
    WECHAT_PAY: { value: 'WECHAT_PAY', label: '微信支付', icon: 'el-icon-wechat' },
    BANK_TRANSFER: { value: 'BANK_TRANSFER', label: '银行转账', icon: 'el-icon-bank' },
    OTHER: { value: 'OTHER', label: '其他', icon: 'el-icon-more' }
  }
}

// 用户相关常量
export const USER = {
  // 性别枚举
  GENDER: {
    MALE: { value: 'MALE', label: '男' },
    FEMALE: { value: 'FEMALE', label: '女' },
    OTHER: { value: 'OTHER', label: '其他' }
  },
  
  // 角色枚举
  ROLE: {
    USER: { value: 'USER', label: '普通用户' },
    ADMIN: { value: 'ADMIN', label: '管理员' }
  },
  
  // 状态枚举
  STATUS: {
    ACTIVE: { value: 'ACTIVE', label: '活跃', color: '#67c23a' },
    INACTIVE: { value: 'INACTIVE', label: '非活跃', color: '#909399' },
    BANNED: { value: 'BANNED', label: '已禁用', color: '#f56c6c' }
  }
}

// 日期格式常量
export const DATE_FORMAT = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  SHORT_DATE: 'MM-DD',
  CHINESE_DATE: 'YYYY年MM月DD日',
  CHINESE_DATETIME: 'YYYY年MM月DD日 HH:mm:ss'
}

// 分页相关常量
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  LAYOUT: 'total, sizes, prev, pager, next, jumper'
}

// 响应状态码常量
export const HTTP_STATUS = {
  // 成功状态码
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  
  // 客户端错误状态码
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  
  // 服务器错误状态码
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
}

// 系统状态码常量
export const SYSTEM_STATUS = {
  // 成功
  SUCCESS: 200,
  
  // 错误
  ERROR: -1,
  
  // 未登录
  UNAUTHORIZED: 401,
  
  // 权限不足
  FORBIDDEN: 403,
  
  // 参数错误
  PARAM_ERROR: 400,
  
  // 服务器错误
  SERVER_ERROR: 500
}

// 主题相关常量
export const THEME = {
  DEFAULT: 'default',
  DARK: 'dark',
  LIGHT: 'light'
}

// 语言相关常量
export const LANGUAGE = {
  ZH_CN: 'zh-CN',
  EN_US: 'en-US'
}

// 文件上传相关常量
export const UPLOAD = {
  // 最大文件大小（5MB）
  MAX_SIZE: 5 * 1024 * 1024,
  
  // 允许的图片类型
  IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  
  // 允许的文档类型
  DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  DOCUMENT_EXTENSIONS: ['pdf', 'doc', 'docx'],
  
  // 上传路径
  PATH: {
    AVATAR: '/uploads/avatar/',
    RECEIPT: '/uploads/receipt/',
    OTHER: '/uploads/other/'
  }
}

// 语音助手相关常量
export const VOICE_ASSISTANT = {
  // 消息类型
  MESSAGE_TYPE: {
    USER: 'user',
    SYSTEM: 'system',
    AI: 'ai'
  },
  
  // 快捷指令
  QUICK_COMMANDS: [
    { name: '创建旅行计划', command: '帮我创建一个旅行计划' },
    { name: '统计本月支出', command: '统计我本月的旅行支出' },
    { name: '查看待执行计划', command: '显示我所有待执行的旅行计划' },
    { name: '智能推荐目的地', command: '推荐适合下个月旅行的目的地' },
    { name: '计算预算', command: '帮我计算去日本旅行一周的预算' }
  ]
}

// 图表相关常量
export const CHART = {
  // 颜色配置
  COLORS: ['#409EFF', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#b1b3b8', '#c0c4cc'],
  
  // 费用类型颜色映射
  EXPENSE_TYPE_COLORS: {
    'TRANSPORTATION': '#409EFF',
    'ACCOMMODATION': '#67c23a',
    'FOOD': '#e6a23c',
    'ATTRACTION': '#f56c6c',
    'SHOPPING': '#909399',
    'ENTERTAINMENT': '#b1b3b8',
    'OTHER': '#c0c4cc'
  }
}

// 时间范围常量
export const TIME_RANGE = {
  TODAY: { label: '今天', value: 'today' },
  THIS_WEEK: { label: '本周', value: 'thisWeek' },
  THIS_MONTH: { label: '本月', value: 'thisMonth' },
  LAST_MONTH: { label: '上月', value: 'lastMonth' },
  THIS_QUARTER: { label: '本季度', value: 'thisQuarter' },
  THIS_YEAR: { label: '今年', value: 'thisYear' },
  LAST_3_MONTHS: { label: '最近3个月', value: 'last3Months' },
  LAST_6_MONTHS: { label: '最近6个月', value: 'last6Months' },
  LAST_12_MONTHS: { label: '最近12个月', value: 'last12Months' },
  CUSTOM: { label: '自定义', value: 'custom' }
}

// 导出所有常量
export default {
  API,
  STORAGE_KEYS,
  TRAVEL,
  EXPENSE,
  USER,
  DATE_FORMAT,
  PAGINATION,
  HTTP_STATUS,
  SYSTEM_STATUS,
  THEME,
  LANGUAGE,
  UPLOAD,
  VOICE_ASSISTANT,
  CHART,
  TIME_RANGE
}