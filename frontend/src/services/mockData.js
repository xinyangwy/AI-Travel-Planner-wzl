/**
 * 模拟数据服务
 * 用于开发和测试阶段提供模拟数据
 */

// 模拟延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 生成唯一ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

// 模拟旅行计划数据
export const mockTravelPlans = [
  {
    id: '1',
    title: '日本东京之旅',
    type: 'VACATION',
    status: 'PLANNED',
    location: '日本东京',
    startDate: '2023-10-15',
    endDate: '2023-10-22',
    budget: 15000,
    travelerCount: 2,
    description: '东京是一座融合了现代与传统的城市，有着众多的景点和美食。这次旅行我们将游览东京塔、浅草寺、涩谷十字路口等著名景点，并品尝各种日本美食。',
    tags: ['日本', '美食', '文化', '购物'],
    notes: '记得提前兑换日元，购买西瓜卡。',
    createdAt: '2023-08-20T10:00:00Z',
    updatedAt: '2023-09-05T14:30:00Z'
  },
  {
    id: '2',
    title: '上海出差',
    type: 'BUSINESS',
    status: 'ONGOING',
    location: '中国上海',
    startDate: '2023-09-28',
    endDate: '2023-10-05',
    budget: 8000,
    travelerCount: 1,
    description: '参加上海国际会议及客户拜访，了解最新行业动态和技术发展趋势。',
    tags: ['商务', '短期', '会议'],
    notes: '带上公司介绍材料和笔记本电脑。',
    createdAt: '2023-09-10T09:15:00Z',
    updatedAt: '2023-09-28T10:20:00Z'
  },
  {
    id: '3',
    title: '成都美食之旅',
    type: 'VACATION',
    status: 'COMPLETED',
    location: '中国成都',
    startDate: '2023-08-10',
    endDate: '2023-08-15',
    budget: 5000,
    travelerCount: 3,
    description: '探索成都的美食和文化，品尝正宗川菜，参观大熊猫基地和锦里古街。',
    tags: ['美食', '休闲', '国内', '文化'],
    notes: '成都天气较热，注意防晒和补水。',
    createdAt: '2023-07-15T11:30:00Z',
    updatedAt: '2023-08-15T18:45:00Z'
  },
  {
    id: '4',
    title: '泰国清迈自由行',
    type: 'VACATION',
    status: 'PLANNED',
    location: '泰国清迈',
    startDate: '2023-11-05',
    endDate: '2023-11-12',
    budget: 12000,
    travelerCount: 2,
    description: '体验泰国北部的文化和自然风光，参加水灯节，骑大象，探访寺庙。',
    tags: ['泰国', '文化', '自然', '节日'],
    notes: '需要提前办理泰国签证。',
    createdAt: '2023-09-20T14:20:00Z',
    updatedAt: '2023-09-20T14:20:00Z'
  },
  {
    id: '5',
    title: '北京探亲之旅',
    type: 'FAMILY',
    status: 'COMPLETED',
    location: '中国北京',
    startDate: '2023-02-10',
    endDate: '2023-02-17',
    budget: 6000,
    travelerCount: 4,
    description: '春节期间回北京探望家人，一起过春节，游览北京的冬季景色。',
    tags: ['家庭', '春节', '国内'],
    notes: '北京冬季寒冷，注意保暖。',
    createdAt: '2023-01-05T16:40:00Z',
    updatedAt: '2023-02-17T20:10:00Z'
  }
]

// 模拟行程数据
export const mockItineraries = [
  // 东京之旅行程
  {
    id: '101',
    travelPlanId: '1',
    date: '2023-10-15',
    time: '14:00',
    activity: '抵达东京羽田机场',
    location: '东京羽田国际机场',
    notes: '记得拿好护照和行李，在机场兑换一些日元。',
    transportation: '飞机',
    cost: 0,
    createdAt: '2023-08-20T10:30:00Z',
    updatedAt: '2023-08-20T10:30:00Z'
  },
  {
    id: '102',
    travelPlanId: '1',
    date: '2023-10-15',
    time: '17:00',
    activity: '入住酒店',
    location: '东京新宿王子酒店',
    notes: '酒店地址：东京都新宿区歌舞伎町1-30-1',
    transportation: '机场巴士',
    cost: 0,
    createdAt: '2023-08-20T10:35:00Z',
    updatedAt: '2023-08-20T10:35:00Z'
  },
  {
    id: '103',
    travelPlanId: '1',
    date: '2023-10-16',
    time: '09:00',
    activity: '参观浅草寺',
    location: '浅草寺',
    notes: '东京最古老的寺庙，可以品尝周边小吃。',
    transportation: '地铁',
    cost: 0,
    createdAt: '2023-08-20T10:40:00Z',
    updatedAt: '2023-08-20T10:40:00Z'
  },
  {
    id: '104',
    travelPlanId: '1',
    date: '2023-10-16',
    time: '13:00',
    activity: '午餐 - 筑地市场',
    location: '筑地市场',
    notes: '品尝新鲜寿司和海鲜。',
    transportation: '地铁',
    cost: 1500,
    createdAt: '2023-08-20T10:45:00Z',
    updatedAt: '2023-08-20T10:45:00Z'
  },
  
  // 上海出差行程
  {
    id: '201',
    travelPlanId: '2',
    date: '2023-09-28',
    time: '09:00',
    activity: '前往上海',
    location: '出发地机场',
    notes: '带上笔记本电脑和会议材料。',
    transportation: '飞机',
    cost: 0,
    createdAt: '2023-09-10T09:30:00Z',
    updatedAt: '2023-09-10T09:30:00Z'
  },
  {
    id: '202',
    travelPlanId: '2',
    date: '2023-09-29',
    time: '13:00',
    activity: '上海国际会议',
    location: '上海国际会议中心',
    notes: '下午1点开始，带上名片。',
    transportation: '出租车',
    cost: 0,
    createdAt: '2023-09-10T09:35:00Z',
    updatedAt: '2023-09-10T09:35:00Z'
  },
  
  // 成都美食之旅行程
  {
    id: '301',
    travelPlanId: '3',
    date: '2023-08-10',
    time: '11:00',
    activity: '抵达成都双流机场',
    location: '成都双流国际机场',
    notes: '',
    transportation: '飞机',
    cost: 0,
    createdAt: '2023-07-15T11:45:00Z',
    updatedAt: '2023-07-15T11:45:00Z'
  },
  {
    id: '302',
    travelPlanId: '3',
    date: '2023-08-10',
    time: '13:30',
    activity: '午餐 - 陈麻婆豆腐',
    location: '陈麻婆豆腐旗舰店',
    notes: '品尝正宗麻婆豆腐。',
    transportation: '出租车',
    cost: 300,
    createdAt: '2023-07-15T11:50:00Z',
    updatedAt: '2023-07-15T11:50:00Z'
  }
]

// 模拟费用数据
export const mockExpenses = [
  // 东京之旅费用
  {
    id: '1001',
    travelPlanId: '1',
    category: 'TRANSPORT',
    amount: 4500,
    date: '2023-08-25',
    description: '往返机票',
    paymentMethod: 'CREDIT_CARD',
    location: '线上',
    receiptUrl: '',
    notes: '提前一个月预订的折扣机票',
    createdAt: '2023-08-25T14:20:00Z',
    updatedAt: '2023-08-25T14:20:00Z'
  },
  {
    id: '1002',
    travelPlanId: '1',
    category: 'ACCOMMODATION',
    amount: 5600,
    date: '2023-09-01',
    description: '酒店住宿（7晚）',
    paymentMethod: 'CREDIT_CARD',
    location: '线上',
    receiptUrl: '',
    notes: '东京新宿王子酒店，含早餐',
    createdAt: '2023-09-01T10:15:00Z',
    updatedAt: '2023-09-01T10:15:00Z'
  },
  {
    id: '1003',
    travelPlanId: '1',
    category: 'SHOPPING',
    amount: 3000,
    date: '2023-09-05',
    description: '购物预算',
    paymentMethod: 'CREDIT_CARD',
    location: '',
    receiptUrl: '',
    notes: '预留用于购物的费用',
    createdAt: '2023-09-05T16:40:00Z',
    updatedAt: '2023-09-05T16:40:00Z'
  },
  
  // 上海出差费用
  {
    id: '2001',
    travelPlanId: '2',
    category: 'TRANSPORT',
    amount: 1800,
    date: '2023-09-10',
    description: '往返机票',
    paymentMethod: 'COMPANY_CARD',
    location: '线上',
    receiptUrl: '',
    notes: '商务出差报销',
    createdAt: '2023-09-10T13:25:00Z',
    updatedAt: '2023-09-10T13:25:00Z'
  },
  {
    id: '2002',
    travelPlanId: '2',
    category: 'ACCOMMODATION',
    amount: 2800,
    date: '2023-09-10',
    description: '酒店住宿（7晚）',
    paymentMethod: 'COMPANY_CARD',
    location: '线上',
    receiptUrl: '',
    notes: '上海静安香格里拉大酒店',
    createdAt: '2023-09-10T13:30:00Z',
    updatedAt: '2023-09-10T13:30:00Z'
  },
  
  // 成都美食之旅费用
  {
    id: '3001',
    travelPlanId: '3',
    category: 'TRANSPORT',
    amount: 1200,
    date: '2023-07-20',
    description: '往返高铁票',
    paymentMethod: 'CREDIT_CARD',
    location: '线上',
    receiptUrl: '',
    notes: '',
    createdAt: '2023-07-20T09:10:00Z',
    updatedAt: '2023-07-20T09:10:00Z'
  },
  {
    id: '3002',
    travelPlanId: '3',
    category: 'ACCOMMODATION',
    amount: 1500,
    date: '2023-07-20',
    description: '酒店住宿（5晚）',
    paymentMethod: 'CREDIT_CARD',
    location: '线上',
    receiptUrl: '',
    notes: '成都春熙路附近酒店',
    createdAt: '2023-07-20T09:15:00Z',
    updatedAt: '2023-07-20T09:15:00Z'
  },
  {
    id: '3003',
    travelPlanId: '3',
    category: 'FOOD',
    amount: 1000,
    date: '2023-08-12',
    description: '锦里古街美食',
    paymentMethod: 'CASH',
    location: '成都锦里古街',
    receiptUrl: '',
    notes: '各种小吃和晚餐',
    createdAt: '2023-08-12T20:30:00Z',
    updatedAt: '2023-08-12T20:30:00Z'
  }
]

// 模拟模板数据
export const mockTemplates = [
  {
    id: 't1',
    name: '周末城市游',
    type: 'VACATION',
    duration: 2,
    description: '适合周末短期城市游览的行程模板',
    tags: ['周末', '城市', '短期'],
    createdAt: '2023-07-01T10:00:00Z',
    updatedAt: '2023-07-01T10:00:00Z',
    itineraryItems: [
      {
        day: 1,
        time: '09:00',
        activity: '城市主要景点参观',
        notes: '建议提前查看开放时间'
      },
      {
        day: 1,
        time: '12:00',
        activity: '当地特色午餐',
        notes: '可尝试当地著名餐厅'
      },
      {
        day: 1,
        time: '14:00',
        activity: '博物馆/艺术馆参观',
        notes: '增长见识的好去处'
      },
      {
        day: 1,
        time: '18:00',
        activity: '晚餐和夜景欣赏',
        notes: '体验城市夜景魅力'
      },
      {
        day: 2,
        time: '09:00',
        activity: '特色街区/市场游览',
        notes: '可购买纪念品'
      },
      {
        day: 2,
        time: '12:00',
        activity: '午餐',
        notes: '尝试不同的当地美食'
      },
      {
        day: 2,
        time: '14:00',
        activity: '休闲购物时间',
        notes: '根据个人喜好安排'
      }
    ]
  },
  {
    id: 't2',
    name: '商务出差',
    type: 'BUSINESS',
    duration: 3,
    description: '标准商务出差行程安排模板',
    tags: ['商务', '出差'],
    createdAt: '2023-07-10T15:30:00Z',
    updatedAt: '2023-07-10T15:30:00Z',
    itineraryItems: [
      {
        day: 1,
        time: '全天',
        activity: '抵达目的地，入住酒店',
        notes: '确认第二天会议安排'
      },
      {
        day: 2,
        time: '09:00',
        activity: '商务会议/客户拜访',
        notes: '准备相关材料和演示文稿'
      },
      {
        day: 2,
        time: '12:00',
        activity: '商务午餐',
        notes: '可能与客户一起'
      },
      {
        day: 2,
        time: '14:00',
        activity: '继续会议/拜访',
        notes: '记录重要事项和后续计划'
      },
      {
        day: 3,
        time: '09:00',
        activity: '总结会议/整理资料',
        notes: '准备返程'
      },
      {
        day: 3,
        time: '下午',
        activity: '返程',
        notes: '确认交通安排'
      }
    ]
  }
]

// 模拟统计数据
export const mockStatistics = {
  totalTravelPlans: 5,
  ongoingTravels: 1,
  totalExpenses: 21400,
  upcomingTravels: 2,
  travelTypeDistribution: [
    { name: '休闲度假', value: 3 },
    { name: '商务出差', value: 1 },
    { name: '家庭聚会', value: 1 }
  ],
  expenseCategoryDistribution: [
    { name: '交通', value: 7500 },
    { name: '住宿', value: 9900 },
    { name: '餐饮', value: 1000 },
    { name: '购物', value: 3000 }
  ],
  monthlyExpenseTrend: [
    { month: '1月', amount: 0 },
    { month: '2月', amount: 6000 },
    { month: '3月', amount: 0 },
    { month: '4月', amount: 0 },
    { month: '5月', amount: 0 },
    { month: '6月', amount: 0 },
    { month: '7月', amount: 2700 },
    { month: '8月', amount: 10100 },
    { month: '9月', amount: 8600 },
    { month: '10月', amount: 0 },
    { month: '11月', amount: 0 },
    { month: '12月', amount: 0 }
  ]
}

// 模拟用户数据
export const mockUser = {
  id: 'u1',
  name: '旅行者',
  email: 'traveler@example.com',
  avatar: '',
  preferences: {
    currency: 'CNY',
    language: 'zh-CN',
    theme: 'default'
  },
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-09-01T10:30:00Z'
}

// 模拟认证数据
export const mockAuthData = {
  token: 'mock-jwt-token-123456',
  refreshToken: 'mock-refresh-token-654321',
  expiresIn: 3600,
  user: mockUser
}

/**
 * 模拟API服务
 */
const mockApi = {
  // 认证相关
  auth: {
    login: async (credentials) => {
      await delay(500)
      // 模拟登录成功
      return {
        success: true,
        data: mockAuthData
      }
    },
    
    register: async (userData) => {
      await delay(800)
      return {
        success: true,
        data: {
          ...mockUser,
          ...userData,
          id: generateId()
        }
      }
    },
    
    logout: async () => {
      await delay(300)
      return { success: true }
    }
  },
  
  // 用户相关
  user: {
    getProfile: async () => {
      await delay(300)
      return mockUser
    },
    
    updateProfile: async (userData) => {
      await delay(500)
      return {
        ...mockUser,
        ...userData,
        updatedAt: new Date().toISOString()
      }
    }
  },
  
  // 旅行计划相关
  travel: {
    getTravelPlans: async (params) => {
      await delay(600)
      let plans = [...mockTravelPlans]
      
      // 模拟筛选
      if (params?.status) {
        plans = plans.filter(plan => plan.status === params.status)
      }
      
      if (params?.type) {
        plans = plans.filter(plan => plan.type === params.type)
      }
      
      return {
        data: plans,
        total: plans.length
      }
    },
    
    getTravelPlan: async (id) => {
      await delay(400)
      const plan = mockTravelPlans.find(p => p.id === id)
      if (!plan) {
        throw new Error('旅行计划未找到')
      }
      return plan
    },
    
    createTravelPlan: async (travelData) => {
      await delay(800)
      const newPlan = {
        id: generateId(),
        ...travelData,
        status: 'PLANNED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      mockTravelPlans.unshift(newPlan)
      return newPlan
    },
    
    updateTravelPlan: async (id, travelData) => {
      await delay(600)
      const index = mockTravelPlans.findIndex(p => p.id === id)
      if (index === -1) {
        throw new Error('旅行计划未找到')
      }
      
      const updatedPlan = {
        ...mockTravelPlans[index],
        ...travelData,
        updatedAt: new Date().toISOString()
      }
      
      mockTravelPlans[index] = updatedPlan
      return updatedPlan
    },
    
    deleteTravelPlan: async (id) => {
      await delay(400)
      const index = mockTravelPlans.findIndex(p => p.id === id)
      if (index === -1) {
        throw new Error('旅行计划未找到')
      }
      
      mockTravelPlans.splice(index, 1)
      // 同时删除相关的行程和费用记录
      const itineraryIndices = []
      mockItineraries.forEach((itinerary, i) => {
        if (itinerary.travelPlanId === id) {
          itineraryIndices.push(i)
        }
      })
      
      for (let i = itineraryIndices.length - 1; i >= 0; i--) {
        mockItineraries.splice(itineraryIndices[i], 1)
      }
      
      const expenseIndices = []
      mockExpenses.forEach((expense, i) => {
        if (expense.travelPlanId === id) {
          expenseIndices.push(i)
        }
      })
      
      for (let i = expenseIndices.length - 1; i >= 0; i--) {
        mockExpenses.splice(expenseIndices[i], 1)
      }
      
      return { success: true }
    }
  },
  
  // 行程相关
  itinerary: {
    getItineraries: async (travelPlanId) => {
      await delay(500)
      return mockItineraries.filter(item => item.travelPlanId === travelPlanId)
    },
    
    createItinerary: async (travelPlanId, itineraryData) => {
      await delay(600)
      const newItinerary = {
        id: generateId(),
        travelPlanId,
        ...itineraryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      mockItineraries.unshift(newItinerary)
      return newItinerary
    },
    
    updateItinerary: async (travelPlanId, itineraryId, itineraryData) => {
      await delay(500)
      const index = mockItineraries.findIndex(item => 
        item.id === itineraryId && item.travelPlanId === travelPlanId
      )
      
      if (index === -1) {
        throw new Error('行程项未找到')
      }
      
      const updatedItinerary = {
        ...mockItineraries[index],
        ...itineraryData,
        updatedAt: new Date().toISOString()
      }
      
      mockItineraries[index] = updatedItinerary
      return updatedItinerary
    },
    
    deleteItinerary: async (travelPlanId, itineraryId) => {
      await delay(400)
      const index = mockItineraries.findIndex(item => 
        item.id === itineraryId && item.travelPlanId === travelPlanId
      )
      
      if (index === -1) {
        throw new Error('行程项未找到')
      }
      
      mockItineraries.splice(index, 1)
      return { success: true }
    }
  },
  
  // 费用相关
  expense: {
    getExpenses: async (params) => {
      await delay(500)
      let expenses = [...mockExpenses]
      
      if (params?.travelPlanId) {
        expenses = expenses.filter(exp => exp.travelPlanId === params.travelPlanId)
      }
      
      if (params?.category) {
        expenses = expenses.filter(exp => exp.category === params.category)
      }
      
      return {
        data: expenses,
        total: expenses.length
      }
    },
    
    createExpense: async (expenseData) => {
      await delay(600)
      const newExpense = {
        id: generateId(),
        ...expenseData,
        date: expenseData.date || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      mockExpenses.unshift(newExpense)
      return newExpense
    },
    
    updateExpense: async (expenseId, expenseData) => {
      await delay(500)
      const index = mockExpenses.findIndex(exp => exp.id === expenseId)
      
      if (index === -1) {
        throw new Error('费用记录未找到')
      }
      
      const updatedExpense = {
        ...mockExpenses[index],
        ...expenseData,
        updatedAt: new Date().toISOString()
      }
      
      mockExpenses[index] = updatedExpense
      return updatedExpense
    },
    
    deleteExpense: async (expenseId) => {
      await delay(400)
      const index = mockExpenses.findIndex(exp => exp.id === expenseId)
      
      if (index === -1) {
        throw new Error('费用记录未找到')
      }
      
      mockExpenses.splice(index, 1)
      return { success: true }
    }
  },
  
  // 模板相关
  template: {
    getTemplates: async () => {
      await delay(400)
      return mockTemplates
    },
    
    getTemplate: async (id) => {
      await delay(300)
      const template = mockTemplates.find(t => t.id === id)
      if (!template) {
        throw new Error('模板未找到')
      }
      return template
    },
    
    createTemplate: async (templateData) => {
      await delay(700)
      const newTemplate = {
        id: generateId(),
        ...templateData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      mockTemplates.unshift(newTemplate)
      return newTemplate
    },
    
    deleteTemplate: async (id) => {
      await delay(400)
      const index = mockTemplates.findIndex(t => t.id === id)
      
      if (index === -1) {
        throw new Error('模板未找到')
      }
      
      mockTemplates.splice(index, 1)
      return { success: true }
    }
  },
  
  // 统计相关
  statistics: {
    getDashboardData: async () => {
      await delay(800)
      return mockStatistics
    }
  },
  
  // AI行程生成相关
  aiGenerate: {
    generateItinerary: async (generateData) => {
      await delay(1500) // 模拟AI处理时间
      
      // 生成模拟行程
      const mockGeneratedItinerary = {
        taskId: generateId(),
        status: 'COMPLETED',
        travelPlanId: generateData.travelPlanId,
        generatedAt: new Date().toISOString(),
        itineraryItems: [
          {
            date: generateData.startDate,
            time: '09:00',
            activity: '早餐后前往第一个景点',
            location: `${generateData.destination}主要景点`,
            notes: '建议提前预约门票'
          },
          {
            date: generateData.startDate,
            time: '12:30',
            activity: '当地特色午餐',
            location: `${generateData.destination}市中心`,
            notes: '尝试当地招牌菜'
          },
          {
            date: generateData.startDate,
            time: '14:30',
            activity: '文化体验活动',
            location: `${generateData.destination}文化区`,
            notes: '了解当地传统文化'
          },
          {
            date: generateData.startDate,
            time: '18:00',
            activity: '晚餐',
            location: `${generateData.destination}餐厅`,
            notes: '享用精美晚餐'
          }
        ]
      }
      
      return mockGeneratedItinerary
    }
  }
}

export default mockApi