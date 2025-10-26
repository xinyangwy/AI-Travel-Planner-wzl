<template>
  <div class="voice-assistant-container">
    <h2 class="page-title">AI语音助手</h2>
    
    <div class="voice-content">
      <!-- 对话区域 -->
      <div class="chat-container">
        <div class="chat-messages" ref="chatMessages">
          <!-- 系统欢迎消息 -->
          <div class="message system-message">
            <div class="message-avatar">
              <el-avatar icon="el-icon-robot" size="small" :src="robotAvatar"></el-avatar>
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <p>您好！我是您的AI旅行助手。请问有什么可以帮助您的？</p>
                <p>我可以帮您查询旅行信息、规划行程、记录费用等。</p>
              </div>
            </div>
          </div>
          
          <!-- 聊天消息列表 -->
          <div 
            v-for="(message, index) in messages" 
            :key="index"
            :class="['message', message.type === 'user' ? 'user-message' : 'bot-message']"
          >
            <div class="message-avatar">
              <el-avatar 
                :icon="message.type === 'user' ? 'el-icon-user' : 'el-icon-robot'" 
                size="small"
                :src="message.type === 'user' ? userAvatar : robotAvatar"
              ></el-avatar>
            </div>
            <div class="message-content">
              <div class="message-bubble">
                {{ message.content }}
              </div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
          
          <!-- 语音识别中的提示 -->
          <div v-if="isListening" class="message bot-message listening">
            <div class="message-avatar">
              <el-avatar icon="el-icon-robot" size="small" :src="robotAvatar"></el-avatar>
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <div class="listening-indicator">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <span>正在聆听...</span>
                </div>
                <div class="recognized-text" v-if="recognizedText">
                  {{ recognizedText }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- 正在输入的提示 -->
          <div v-if="isTyping" class="message bot-message">
            <div class="message-avatar">
              <el-avatar icon="el-icon-robot" size="small" :src="robotAvatar"></el-avatar>
            </div>
            <div class="message-content">
              <div class="message-bubble typing">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 输入控制区域 -->
        <div class="chat-input-area">
          <div class="input-container">
            <el-input
              v-model="textInput"
              type="textarea"
              :rows="2"
              placeholder="请输入问题，或点击麦克风按钮语音提问"
              @keydown.enter.ctrl="sendText"
              @keydown.enter.meta="sendText"
            ></el-input>
            
            <div class="input-actions">
              <el-button 
                circle 
                icon="el-icon-microphone" 
                :type="isListening ? 'danger' : 'primary'" 
                @click="toggleVoiceInput"
                :disabled="!isSpeechSupported || isTyping"
              ></el-button>
              <el-button 
                circle 
                icon="el-icon-paperclip" 
                @click="attachFile"
                :disabled="isListening || isTyping"
              ></el-button>
              <el-button 
                circle 
                type="success" 
                @click="sendText"
                :disabled="!textInput.trim() || isListening || isTyping"
              >
                发送
              </el-button>
            </div>
          </div>
          
          <div class="voice-hints">
            <p>💡 提示：您可以询问以下问题：</p>
            <div class="example-questions">
              <el-tag 
                v-for="(example, index) in exampleQuestions" 
                :key="index" 
                class="example-tag" 
                @click="useExample(example)"
              >
                {{ example }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧功能面板 -->
      <div class="sidebar">
        <el-card shadow="hover" class="function-card">
          <template #header>
            <div class="card-header">
              <span>快捷功能</span>
            </div>
          </template>
          
          <div class="function-buttons">
            <el-button 
              class="function-btn" 
              icon="el-icon-map-location" 
              @click="navigateTo('/travel/generate')"
            >
              智能生成行程
            </el-button>
            <el-button 
              class="function-btn" 
              icon="el-icon-edit" 
              @click="navigateTo('/travel/create')"
            >
              创建旅行计划
            </el-button>
            <el-button 
              class="function-btn" 
              icon="el-icon-plus" 
              @click="navigateTo('/expense/create')"
            >
              添加费用
            </el-button>
            <el-button 
              class="function-btn" 
              icon="el-icon-data-analysis" 
              @click="navigateTo('/expense/statistics')"
            >
              查看费用统计
            </el-button>
          </div>
        </el-card>
        
        <el-card shadow="hover" class="history-card">
          <template #header>
            <div class="card-header">
              <span>最近对话</span>
              <el-button type="text" size="small" @click="clearHistory">清空</el-button>
            </div>
          </template>
          
          <div class="history-list">
            <div 
              v-for="(item, index) in recentHistory" 
              :key="index" 
              class="history-item"
              @click="loadHistoryItem(item)"
            >
              <div class="history-question">{{ item.question }}</div>
              <div class="history-time">{{ formatDate(item.timestamp) }}</div>
            </div>
            
            <div v-if="recentHistory.length === 0" class="empty-history">
              <p>暂无对话历史</p>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { mapState, mapGetters } from 'vuex'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export default {
  name: 'VoiceAssistant',
  data() {
    return {
      messages: [],
      textInput: '',
      isListening: false,
      isTyping: false,
      recognizedText: '',
      recognition: null,
      isSpeechSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      robotAvatar: 'https://via.placeholder.com/40',
      userAvatar: 'https://via.placeholder.com/40',
      exampleQuestions: [
        '帮我规划一次北京三日游',
        '三亚有什么好玩的地方？',
        '本月我的旅行费用是多少？',
        '如何节省旅行开支？',
        '推荐几个适合夏季旅游的地方'
      ],
      recentHistory: []
    }
  },
  computed: {
    ...mapState(['user', 'travelPlans', 'expenses']),
    ...mapGetters(['getTotalExpensesByDateRange'])
  },
  mounted() {
    this.initVoiceRecognition()
    this.loadRecentHistory()
  },
  methods: {
    initVoiceRecognition() {
      if (!this.isSpeechSupported) {
        ElMessage.warning('您的浏览器不支持语音识别功能')
        return
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      this.recognition = new SpeechRecognition()
      this.recognition.lang = 'zh-CN'
      this.recognition.interimResults = true
      
      this.recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('')
          
        this.recognizedText = transcript
        
        if (event.results[0].isFinal) {
          this.handleVoiceInput(transcript)
        }
      }
      
      this.recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error)
        this.isListening = false
        this.recognizedText = ''
        
        if (event.error !== 'no-speech' && event.error !== 'audio-capture') {
          ElMessage.error('语音识别出错，请重试')
        }
      }
      
      this.recognition.onend = () => {
        this.isListening = false
      }
    },
    
    toggleVoiceInput() {
      if (this.isListening) {
        this.stopListening()
      } else {
        this.startListening()
      }
    },
    
    startListening() {
      if (!this.recognition) {
        ElMessage.warning('语音识别初始化失败')
        return
      }
      
      try {
        this.isListening = true
        this.recognizedText = ''
        this.recognition.start()
      } catch (error) {
        console.error('启动语音识别失败:', error)
        this.isListening = false
        ElMessage.error('启动语音识别失败，请重试')
      }
    },
    
    stopListening() {
      if (this.recognition && this.isListening) {
        this.recognition.stop()
        this.isListening = false
      }
    },
    
    async handleVoiceInput(text) {
      this.textInput = text
      await this.processQuery(text)
      this.recognizedText = ''
    },
    
    async sendText() {
      if (!this.textInput.trim()) return
      
      const text = this.textInput.trim()
      this.textInput = ''
      
      await this.processQuery(text)
    },
    
    async processQuery(query) {
      // 添加用户消息
      this.addMessage('user', query)
      
      // 模拟机器人思考和回复
      this.isTyping = true
      
      try {
        // 模拟处理延迟
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // 这里应该调用后端API获取回复
        // 现在使用模拟的回复逻辑
        const response = await this.generateResponse(query)
        
        // 添加机器人回复
        this.addMessage('bot', response)
        
        // 保存到历史记录
        this.saveToHistory(query, response)
      } catch (error) {
        console.error('处理查询失败:', error)
        this.addMessage('bot', '抱歉，我暂时无法回答这个问题，请稍后再试。')
      } finally {
        this.isTyping = false
      }
    },
    
    async generateResponse(query) {
      // 模拟智能回复逻辑
      const lowerQuery = query.toLowerCase()
      
      // 处理旅行规划相关问题
      if (lowerQuery.includes('规划') || lowerQuery.includes('行程') || lowerQuery.includes('安排')) {
        if (lowerQuery.includes('北京')) {
          return this.generateBeijingItinerary()
        } else if (lowerQuery.includes('上海')) {
          return this.generateShanghaiItinerary()
        } else if (lowerQuery.includes('三亚')) {
          return this.generateSanyaItinerary()
        } else {
          return '我可以帮您规划旅行行程。请告诉我您的目的地、旅行天数和旅行偏好，我会为您生成详细的行程安排。'
        }
      }
      
      // 处理费用查询
      else if (lowerQuery.includes('费用') || lowerQuery.includes('支出')) {
        if (lowerQuery.includes('本月') || lowerQuery.includes('这个月')) {
          const total = this.getCurrentMonthExpenses()
          return `您本月的旅行费用总计为¥${total.toFixed(2)}。您可以在费用统计页面查看详细的支出分析。`
        } else if (lowerQuery.includes('总计') || lowerQuery.includes('总共')) {
          const total = this.getTotalExpenses()
          return `您的旅行费用总计为¥${total.toFixed(2)}。您可以在费用统计页面查看详细的支出分析。`
        } else {
          return '您想查询哪个时间段的费用？我可以帮您查询本月、本季度或特定旅行计划的费用。'
        }
      }
      
      // 处理旅行计划查询
      else if (lowerQuery.includes('计划') || lowerQuery.includes('旅行')) {
        const planCount = this.travelPlans.length
        if (planCount > 0) {
          const recentPlans = this.travelPlans
            .slice(0, 3)
            .map(p => p.title)
            .join('、')
          return `您目前有${planCount}个旅行计划，最近的包括：${recentPlans}。您可以在旅行页面查看和管理所有计划。`
        } else {
          return '您还没有创建任何旅行计划。您可以点击"创建旅行计划"按钮开始规划您的下一次旅行。'
        }
      }
      
      // 处理推荐问题
      else if (lowerQuery.includes('推荐') || lowerQuery.includes('哪里')) {
        if (lowerQuery.includes('夏季') || lowerQuery.includes('夏天')) {
          return this.generateSummerRecommendations()
        } else if (lowerQuery.includes('冬季') || lowerQuery.includes('冬天')) {
          return this.generateWinterRecommendations()
        } else {
          return '我可以为您推荐适合不同季节和旅行类型的目的地。请告诉我您计划什么时候出行，以及您喜欢什么样的旅行体验？'
        }
      }
      
      // 处理帮助请求
      else if (lowerQuery.includes('帮助') || lowerQuery.includes('怎么用')) {
        return this.generateHelpMessage()
      }
      
      // 默认回复
      return '抱歉，我没有理解您的问题。我可以帮助您规划旅行、记录费用、查询旅行信息等。请问您有什么具体需求？'
    },
    
    addMessage(type, content) {
      this.messages.push({
        type,
        content,
        timestamp: new Date().toISOString()
      })
      
      // 滚动到底部
      this.$nextTick(() => {
        const messagesContainer = this.$refs.chatMessages
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight
        }
      })
    },
    
    formatTime(timestamp) {
      return dayjs(timestamp).format('HH:mm')
    },
    
    formatDate(timestamp) {
      return dayjs(timestamp).format('MM-DD HH:mm')
    },
    
    attachFile() {
      ElMessage.info('文件上传功能开发中')
    },
    
    useExample(example) {
      this.textInput = example
    },
    
    navigateTo(path) {
      this.$router.push(path)
    },
    
    saveToHistory(question, answer) {
      // 保存到本地存储
      const history = JSON.parse(localStorage.getItem('voiceAssistantHistory') || '[]')
      history.unshift({
        question,
        answer,
        timestamp: new Date().toISOString()
      })
      
      // 只保留最近10条记录
      const trimmedHistory = history.slice(0, 10)
      localStorage.setItem('voiceAssistantHistory', JSON.stringify(trimmedHistory))
      
      // 更新最近历史列表
      this.recentHistory = trimmedHistory
    },
    
    loadRecentHistory() {
      const history = JSON.parse(localStorage.getItem('voiceAssistantHistory') || '[]')
      this.recentHistory = history
    },
    
    clearHistory() {
      this.$confirm('确定要清空对话历史吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('voiceAssistantHistory')
        this.recentHistory = []
        ElMessage.success('对话历史已清空')
      }).catch(() => {})
    },
    
    loadHistoryItem(item) {
      this.textInput = item.question
    },
    
    getCurrentMonthExpenses() {
      const now = dayjs()
      const startDate = now.startOf('month').format('YYYY-MM-DD')
      const endDate = now.endOf('month').format('YYYY-MM-DD')
      
      return this.getTotalExpensesByDateRange(startDate, endDate)
    },
    
    getTotalExpenses() {
      return this.expenses.reduce((total, expense) => total + (expense.amount || 0), 0)
    },
    
    // 生成各种回复内容的辅助方法
    generateBeijingItinerary() {
      return `北京三日游推荐行程：\n\n第一天：\n- 上午：天安门广场、故宫博物院\n- 下午：景山公园、什刹海\n- 晚上：王府井步行街\n\n第二天：\n- 上午：八达岭长城\n- 下午：明十三陵\n\n第三天：\n- 上午：颐和园\n- 下午：圆明园、北京大学\n- 晚上：鸟巢、水立方夜景\n\n建议提前预订故宫和长城的门票，避开节假日人流高峰。`
    },
    
    generateShanghaiItinerary() {
      return `上海三日游推荐行程：\n\n第一天：\n- 上午：外滩、南京路步行街\n- 下午：豫园、城隍庙\n- 晚上：外滩夜景\n\n第二天：\n- 上午：上海博物馆\n- 下午：田子坊、新天地\n- 晚上：东方明珠塔夜景\n\n第三天：\n- 上午：迪士尼乐园（需全天）\n或\n- 上午：朱家角古镇\n- 下午：上海科技馆\n\n上海交通便利，建议使用地铁出行，购买一日票更划算。`
    },
    
    generateSanyaItinerary() {
      return `三亚三日游推荐行程：\n\n第一天：\n- 上午：亚龙湾海滩\n- 下午：亚龙湾森林公园\n- 晚上：第一市场海鲜\n\n第二天：\n- 上午：蜈支洲岛\n- 下午：岛上水上活动\n\n第三天：\n- 上午：天涯海角\n- 下午：南山文化旅游区\n- 晚上：三亚湾椰梦长廊\n\n三亚阳光强烈，记得做好防晒措施，建议携带泳衣、防晒霜、遮阳帽等物品。`
    },
    
    generateSummerRecommendations() {
      return `适合夏季旅游的目的地推荐：\n\n1. 海滨城市：三亚、青岛、厦门、大连\n2. 避暑胜地：庐山、莫干山、鸡公山、承德避暑山庄\n3. 水上乐园：上海玛雅海滩水公园、广州长隆水上乐园\n4. 高海拔地区：云南丽江、香格里拉、贵州六盘水\n\n夏季出行注意防暑降温，多喝水，避免在中午高温时段进行户外活动。`
    },
    
    generateWinterRecommendations() {
      return `适合冬季旅游的目的地推荐：\n\n1. 滑雪胜地：长白山、张家口崇礼、亚布力\n2. 避寒城市：三亚、海口、西双版纳\n3. 温泉度假：北京小汤山、南京汤山、广东从化\n4. 冰雪景观：哈尔滨冰雪大世界、吉林雾凇岛\n\n冬季出行注意保暖，特别是前往北方地区，要做好防寒准备。`
    },
    
    generateHelpMessage() {
      return `我是您的AI旅行助手，可以为您提供以下帮助：\n\n1. 旅行规划：根据您的需求生成详细的行程安排\n2. 费用管理：查询、记录和统计您的旅行支出\n3. 目的地推荐：根据季节和您的偏好推荐旅游目的地\n4. 旅行知识：提供旅行小贴士和实用信息\n\n您可以通过文字输入或语音提问与我交流。例如：\n- "帮我规划一次周末游"\n- "三亚有什么好玩的地方？"\n- "我这个月花了多少钱？"\n\n请问我能为您做些什么？`
    }
  },
  beforeDestroy() {
    // 停止语音识别
    this.stopListening()
  }
}
</script>

<style scoped>
.voice-assistant-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  color: #303133;
  font-size: 24px;
}

.voice-content {
  display: flex;
  gap: 20px;
  height: calc(100vh - 120px);
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}

.message {
  display: flex;
  margin-bottom: 20px;
}

.user-message {
  flex-direction: row-reverse;
}

.user-message .message-content {
  margin-right: 0;
  margin-left: 10px;
}

.user-message .message-bubble {
  background-color: #409eff;
  color: #fff;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  margin-right: 10px;
}

.message-bubble {
  padding: 10px 15px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  text-align: right;
}

.user-message .message-time {
  text-align: left;
}

.listening-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.recognized-text {
  margin-top: 10px;
  color: #606266;
  font-style: italic;
}

.typing {
  min-height: 40px;
  display: flex;
  align-items: center;
}

.typing-indicator {
  display: flex;
  gap: 5px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background-color: #909399;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.5);
  }
}

.chat-input-area {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  background-color: #fff;
}

.input-container {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.input-container .el-input {
  flex: 1;
}

.input-actions {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  padding-bottom: 5px;
}

.voice-hints {
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
}

.voice-hints p {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
}

.example-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.example-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.example-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.function-card, .history-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.function-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 10px;
}

.function-btn {
  justify-content: flex-start;
}

.history-list {
  padding-top: 10px;
  overflow-y: auto;
  flex: 1;
}

.history-item {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.history-item:hover {
  background-color: #f5f7fa;
}

.history-question {
  color: #303133;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  font-size: 12px;
  color: #909399;
}

.empty-history {
  text-align: center;
  color: #909399;
  padding: 20px 0;
}
</style>