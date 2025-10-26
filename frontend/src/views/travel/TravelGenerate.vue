<template>
  <div class="travel-generate-container">
    <h3 class="section-title">智能行程规划</h3>
    <p class="section-subtitle">告诉我们你的旅行需求，我们将为你生成完美的行程安排</p>
    
    <el-form :model="generateForm" :rules="rules" ref="generateFormRef" label-width="120px">
      <el-form-item label="目的地" prop="destination">
        <el-input 
          v-model="generateForm.destination" 
          placeholder="例如：北京、上海、三亚等" 
          maxlength="100"
        ></el-input>
      </el-form-item>
      
      <el-form-item label="旅行时长" prop="duration">
        <el-input-number 
          v-model="generateForm.duration" 
          :min="1" 
          :max="30" 
          placeholder="请输入旅行天数"
        ></el-input-number>
        <span class="unit">天</span>
      </el-form-item>
      
      <el-form-item label="旅行日期" prop="startDate">
        <el-date-picker
          v-model="generateForm.startDate"
          type="date"
          placeholder="选择开始日期"
          style="width: 100%;"
          value-format="YYYY-MM-DD"
        ></el-date-picker>
      </el-form-item>
      
      <el-form-item label="旅行类型" prop="travelType">
        <el-select v-model="generateForm.travelType" placeholder="选择旅行类型">
          <el-option label="休闲度假" value="leisure" />
          <el-option label="文化体验" value="culture" />
          <el-option label="美食探索" value="food" />
          <el-option label="自然景观" value="nature" />
          <el-option label="城市观光" value="city" />
          <el-option label="亲子游" value="family" />
          <el-option label="探险旅行" value="adventure" />
          <el-option label="蜜月旅行" value="honeymoon" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="兴趣点" prop="interests">
        <el-select 
          v-model="generateForm.interests" 
          placeholder="选择你感兴趣的景点类型" 
          multiple
          filterable
          collapse-tags
          style="width: 100%;"
        >
          <el-option label="历史古迹" value="history" />
          <el-option label="博物馆" value="museum" />
          <el-option label="自然风光" value="nature" />
          <el-option label="主题公园" value="park" />
          <el-option label="购物" value="shopping" />
          <el-option label="美食" value="food" />
          <el-option label="艺术文化" value="art" />
          <el-option label="娱乐设施" value="entertainment" />
          <el-option label="宗教场所" value="religion" />
          <el-option label="户外运动" value="outdoor" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="旅行预算" prop="budget">
        <el-input-number 
          v-model="generateForm.budget" 
          :min="0" 
          :step="100" 
          placeholder="请输入旅行预算"
        ></el-input-number>
        <span class="unit">元</span>
      </el-form-item>
      
      <el-form-item label="特殊要求" prop="requirements">
        <el-input 
          v-model="generateForm.requirements" 
          type="textarea" 
          :rows="4" 
          placeholder="请输入你的特殊要求，如：不吃辣、需要无障碍设施、希望包含购物场所等"
        ></el-input>
      </el-form-item>
      
      <el-form-item label="交通方式" prop="transportation">
        <el-radio-group v-model="generateForm.transportation">
          <el-radio value="public">公共交通</el-radio>
          <el-radio value="taxi">出租车/网约车</el-radio>
          <el-radio value="rental">租车自驾</el-radio>
          <el-radio value="walking">主要步行</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="generateItinerary" :loading="loading">
          生成行程
        </el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    
    <!-- 生成结果展示 -->
    <div v-if="showResult" class="result-section">
      <h3 class="result-title">行程规划结果</h3>
      
      <el-card class="result-card">
        <div v-if="loading" class="loading">
          <el-skeleton :rows="10" animated />
        </div>
        
        <div v-else>
          <div class="result-header">
            <h4>{{ destination }} {{ duration }}日游行程</h4>
            <div class="save-options">
              <el-button type="primary" size="small" @click="saveAsNewPlan">保存为新计划</el-button>
              <el-button size="small" @click="shareItinerary">分享行程</el-button>
            </div>
          </div>
          
          <div class="itinerary-result">
            <div v-for="(day, index) in itineraryResult.days" :key="index" class="day-itinerary">
              <div class="day-header">
                <h5>第{{ index + 1 }}天</h5>
                <div class="day-date">{{ formatDate(day.date) }}</div>
              </div>
              
              <div v-for="(item, itemIndex) in day.schedule" :key="itemIndex" class="schedule-item">
                <div class="schedule-time">{{ item.time }}</div>
                <div class="schedule-content">
                  <div class="schedule-title">{{ item.activity }}</div>
                  <div class="schedule-detail">{{ item.details }}</div>
                  <div v-if="item.location" class="schedule-location">
                    <i class="el-icon-location"></i> {{ item.location }}
                  </div>
                  <div v-if="item.transportation" class="schedule-transport">
                    <i class="el-icon-truck"></i> {{ item.transportation }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="trip-tips">
            <h5>旅行小贴士</h5>
            <ul>
              <li v-for="(tip, index) in itineraryResult.tips" :key="index">{{ tip }}</li>
            </ul>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import dayjs from 'dayjs'

export default {
  name: 'TravelGenerate',
  data() {
    return {
      generateForm: {
        destination: '',
        duration: 3,
        startDate: dayjs().format('YYYY-MM-DD'),
        travelType: '',
        interests: [],
        budget: 1000,
        requirements: '',
        transportation: 'public'
      },
      rules: {
        destination: [
          { required: true, message: '请输入目的地', trigger: 'blur' }
        ],
        duration: [
          { required: true, message: '请输入旅行天数', trigger: 'blur' }
        ],
        startDate: [
          { required: true, message: '请选择开始日期', trigger: 'change' }
        ],
        travelType: [
          { required: true, message: '请选择旅行类型', trigger: 'change' }
        ]
      },
      showResult: false,
      itineraryResult: {
        days: [],
        tips: []
      },
      // 计算属性使用的中间变量
      _destination: '',
      _duration: 0
    }
  },
  computed: {
    ...mapState(['loading']),
    destination() {
      return this._destination || this.generateForm.destination
    },
    duration() {
      return this._duration || this.generateForm.duration
    }
  },
  methods: {
    resetForm() {
      this.$refs.generateFormRef.resetFields()
      this.showResult = false
    },
    formatDate(date) {
      if (!date) return ''
      return dayjs(date).format('YYYY-MM-DD')
    },
    async generateItinerary() {
      try {
        await this.$refs.generateFormRef.validate()
        
        // 保存输入的目的地和天数，用于结果展示
        this._destination = this.generateForm.destination
        this._duration = this.generateForm.duration
        
        // 调用后端API生成行程
        const response = await this.$store.dispatch('generateItinerary', {
          destination: this.generateForm.destination,
          duration: this.generateForm.duration,
          startDate: this.generateForm.startDate,
          travelType: this.generateForm.travelType,
          interests: this.generateForm.interests,
          budget: this.generateForm.budget,
          requirements: this.generateForm.requirements,
          transportation: this.generateForm.transportation
        })
        
        // 保存生成的行程结果
        this.itineraryResult = response
        this.showResult = true
      } catch (error) {
        console.error('生成行程失败:', error)
        this.$message.error('生成行程失败，请稍后再试')
      }
    },
    async saveAsNewPlan() {
      try {
        // 构建旅行计划对象
        const endDate = dayjs(this.generateForm.startDate)
          .add(this.generateForm.duration - 1, 'day')
          .format('YYYY-MM-DD')
          
        const planData = {
          title: `${this.generateForm.destination} ${this.generateForm.duration}日游`,
          destination: this.generateForm.destination,
          startDate: this.generateForm.startDate,
          endDate: endDate,
          travelers: 1,
          budget: this.generateForm.budget,
          type: this.getTravelType(),
          status: 'PENDING',
          itinerary: this.formatItineraryForSaving(this.itineraryResult),
          description: `智能生成的${this.generateForm.destination}行程，类型：${this.getTravelTypeText()}`
        }
        
        // 保存为新的旅行计划
        const response = await this.$store.dispatch('createTravelPlan', planData)
        
        this.$message.success('行程已保存为新的旅行计划')
        this.$router.push(`/travel/detail/${response.id}`)
      } catch (error) {
        console.error('保存旅行计划失败:', error)
        this.$message.error('保存失败，请稍后再试')
      }
    },
    shareItinerary() {
      // 分享行程功能
      this.$message.info('分享功能开发中')
    },
    getTravelType() {
      // 将前端旅行类型映射到后端的枚举值
      const typeMap = {
        'leisure': 'VACATION',
        'culture': 'CULTURE',
        'food': 'VACATION',
        'nature': 'ADVENTURE',
        'city': 'VACATION',
        'family': 'FAMILY',
        'adventure': 'ADVENTURE',
        'honeymoon': 'HONEYMOON'
      }
      return typeMap[this.generateForm.travelType] || 'VACATION'
    },
    getTravelTypeText() {
      // 旅行类型中文名称
      const typeMap = {
        'leisure': '休闲度假',
        'culture': '文化体验',
        'food': '美食探索',
        'nature': '自然景观',
        'city': '城市观光',
        'family': '亲子游',
        'adventure': '探险旅行',
        'honeymoon': '蜜月旅行'
      }
      return typeMap[this.generateForm.travelType] || '休闲度假'
    },
    formatItineraryForSaving(result) {
      // 将生成的行程结果格式化为文本，保存到旅行计划中
      let text = ''
      
      result.days.forEach((day, index) => {
        text += `第${index + 1}天 (${this.formatDate(day.date)}):\n`
        day.schedule.forEach(item => {
          text += `- ${item.time} ${item.activity}\n`
          text += `  ${item.details}\n`
          if (item.location) {
            text += `  地点: ${item.location}\n`
          }
          if (item.transportation) {
            text += `  交通: ${item.transportation}\n`
          }
          text += '\n'
        })
        text += '\n'
      })
      
      if (result.tips && result.tips.length > 0) {
        text += '旅行小贴士:\n'
        result.tips.forEach(tip => {
          text += `- ${tip}\n`
        })
      }
      
      return text
    }
  },
  mounted() {
    // 模拟数据，用于展示效果
    // 在实际项目中，这里会是空的，等待用户输入并点击生成按钮
    this.itineraryResult = {
      days: [
        {
          date: dayjs().format('YYYY-MM-DD'),
          schedule: [
            {
              time: '08:00',
              activity: '酒店早餐',
              details: '享用酒店提供的自助早餐，为一天的行程补充能量。',
              location: '酒店餐厅',
              transportation: '步行'
            },
            {
              time: '09:30',
              activity: '参观故宫博物院',
              details: '游览中国明清两代的皇家宫殿，欣赏珍贵文物和古代建筑。',
              location: '北京市东城区景山前街4号',
              transportation: '地铁1号线天安门东站下车'
            },
            {
              time: '12:30',
              activity: '午餐',
              details: '在附近品尝北京传统小吃。',
              location: '王府井大街',
              transportation: '步行'
            },
            {
              time: '14:00',
              activity: '游览景山公园',
              details: '登景山俯瞰故宫全景，欣赏皇家园林风光。',
              location: '北京市西城区景山西街4号',
              transportation: '步行'
            },
            {
              time: '16:30',
              activity: '什刹海地区游览',
              details: '漫步什刹海胡同，体验老北京胡同文化。',
              location: '北京市西城区什刹海',
              transportation: '地铁6号线北海北站下车'
            },
            {
              time: '19:00',
              activity: '晚餐',
              details: '品尝正宗北京烤鸭。',
              location: '全聚德烤鸭店(和平门店)',
              transportation: '出租车'
            }
          ]
        },
        {
          date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
          schedule: [
            {
              time: '08:30',
              activity: '八达岭长城',
              details: '游览世界文化遗产，体验不到长城非好汉的豪迈。',
              location: '北京市延庆区八达岭镇',
              transportation: '旅游专线巴士'
            },
            {
              time: '12:30',
              activity: '长城脚下午餐',
              details: '品尝当地特色农家菜。',
              location: '长城脚下农家乐',
              transportation: '步行'
            },
            {
              time: '14:00',
              activity: '明十三陵',
              details: '参观明朝皇帝陵墓群，了解明朝历史文化。',
              location: '北京市昌平区十三陵镇',
              transportation: '旅游专线巴士'
            },
            {
              time: '17:30',
              activity: '返回市区',
              details: '乘车返回北京市区。',
              transportation: '旅游专线巴士'
            },
            {
              time: '19:30',
              activity: '晚餐',
              details: '在市区享用晚餐。',
              location: '三里屯',
              transportation: '出租车'
            }
          ]
        }
      ],
      tips: [
        '建议提前在网上预订故宫和长城的门票，避免排队。',
        '夏季北京天气炎热，建议携带防晒用品和充足的水。',
        '北京交通拥堵，建议预留充足的交通时间。',
        '在景点购物时注意价格，适当砍价。',
        '尊重当地文化习俗，文明旅游。'
      ]
    }
  }
}
</script>

<style scoped>
.travel-generate-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.section-title {
  margin-bottom: 5px;
  color: #303133;
}

.section-subtitle {
  margin-bottom: 30px;
  color: #606266;
}

.unit {
  margin-left: 10px;
  color: #606266;
}

.loading {
  padding: 20px 0;
}

.result-section {
  margin-top: 40px;
}

.result-title {
  margin-bottom: 20px;
  color: #303133;
}

.result-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.result-header h4 {
  margin: 0;
  color: #303133;
}

.itinerary-result {
  margin-bottom: 30px;
}

.day-itinerary {
  margin-bottom: 30px;
  border-left: 2px solid #409eff;
  padding-left: 20px;
  position: relative;
}

.day-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.day-header:before {
  content: '';
  position: absolute;
  left: -28px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background-color: #409eff;
  border-radius: 50%;
}

.day-header h5 {
  margin: 0;
  margin-right: 15px;
  color: #303133;
}

.day-date {
  color: #606266;
  font-size: 14px;
}

.schedule-item {
  display: flex;
  margin-bottom: 20px;
}

.schedule-time {
  flex-shrink: 0;
  width: 80px;
  font-weight: bold;
  color: #303133;
}

.schedule-content {
  flex-grow: 1;
}

.schedule-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #303133;
}

.schedule-detail {
  margin-bottom: 5px;
  color: #606266;
}

.schedule-location, .schedule-transport {
  color: #909399;
  font-size: 14px;
  margin-top: 3px;
}

.schedule-location i, .schedule-transport i {
  margin-right: 5px;
}

.trip-tips {
  background-color: #f2f6fc;
  padding: 15px;
  border-radius: 4px;
  margin-top: 30px;
}

.trip-tips h5 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
}

.trip-tips ul {
  margin: 0;
  padding-left: 20px;
}

.trip-tips li {
  margin-bottom: 8px;
  color: #606266;
}
</style>