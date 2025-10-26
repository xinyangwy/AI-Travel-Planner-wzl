<template>
  <div class="voice-assistant-container">
    <div class="page-header">
      <h1 class="page-title">AI 语音助手</h1>
      <p class="page-description">通过语音对话，让AI为您规划旅行</p>
    </div>
    
    <!-- 语音助手主界面 -->
    <div class="assistant-main">
      <!-- 对话历史区域 -->
      <div class="conversation-container">
        <div class="conversation-header">
          <h2 class="conversation-title">与旅行助手对话</h2>
          <Button 
            variant="link" 
            @click="clearConversation"
            class="clear-button"
          >
            清空对话
          </Button>
        </div>
        
        <div class="conversation-history" ref="conversationHistory">
          <!-- 欢迎消息 -->
          <div v-if="messages.length === 0" class="welcome-message">
            <div class="assistant-avatar"></div>
            <div class="welcome-content">
              <p class="welcome-text">👋 您好！我是您的AI旅行助手。</p>
              <p class="welcome-subtext">有什么可以帮您规划旅行的需求吗？您可以：</p>
              <ul class="welcome-suggestions">
                <li>告诉我您想去的目的地和时间</li>
                <li>询问关于某个地方的旅游建议</li>
                <li>请我为您制定一份旅行计划</li>
                <li>询问当地的特色美食和景点</li>
              </ul>
            </div>
          </div>
          
          <!-- 消息列表 -->
          <div 
            v-for="(message, index) in messages" 
            :key="index"
            :class="['message-item', { 
              'message-user': message.sender === 'user', 
              'message-assistant': message.sender === 'assistant' 
            }]"
          >
            <!-- 用户消息 -->
            <div v-if="message.sender === 'user'" class="message-content">
              <div class="user-avatar"></div>
              <div class="message-bubble user-bubble">
                <p class="message-text">{{ message.content }}</p>
                <span class="message-time">{{ message.timestamp }}</span>
              </div>
            </div>
            
            <!-- 助手消息 -->
            <div v-else-if="message.sender === 'assistant'" class="message-content">
              <div class="assistant-avatar"></div>
              <div class="message-bubble assistant-bubble">
                <!-- 普通文本回复 -->
                <p v-if="!message.type || message.type === 'text'" class="message-text">{{ message.content }}</p>
                
                <!-- 旅行建议卡片 -->
                <div v-else-if="message.type === 'travel-suggestion'" class="travel-suggestion-card">
                  <h4 class="suggestion-title">{{ message.title }}</h4>
                  <p class="suggestion-description">{{ message.description }}</p>
                  
                  <div v-if="message.suggestions" class="suggestion-items">
                    <div 
                      v-for="(suggestion, i) in message.suggestions" 
                      :key="i"
                      class="suggestion-item"
                    >
                      <div class="suggestion-icon">{{ suggestion.icon }}</div>
                      <div class="suggestion-content">
                        <h5 class="suggestion-item-title">{{ suggestion.title }}</h5>
                        <p class="suggestion-item-desc">{{ suggestion.description }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="message.actions" class="suggestion-actions">
                    <Button 
                      v-for="(action, i) in message.actions" 
                      :key="i"
                      size="small"
                      :variant="action.primary ? 'primary' : 'default'"
                      @click="executeAction(action)"
                      class="action-button"
                    >
                      {{ action.label }}
                    </Button>
                  </div>
                </div>
                
                <!-- 快速回复选项 -->
                <div v-if="message.quickReplies" class="quick-replies">
                  <Button 
                    v-for="(reply, i) in message.quickReplies" 
                    :key="i"
                    variant="outline"
                    size="small"
                    @click="sendMessage(reply)"
                    class="quick-reply-button"
                  >
                    {{ reply }}
                  </Button>
                </div>
                
                <span class="message-time">{{ message.timestamp }}</span>
              </div>
            </div>
          </div>
          
          <!-- 正在输入指示器 -->
          <div v-if="isThinking" class="message-content">
            <div class="assistant-avatar"></div>
            <div class="typing-indicator">
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 输入区域 -->
      <div class="input-container">
        <div class="input-wrapper">
          <FormInput 
            v-model="inputMessage"
            type="textarea"
            :placeholder="'请输入您的问题...'"
            rows="1"
            :disabled="isThinking"
            class="message-input"
            @keyup.enter.ctrl="sendMessage"
          ></FormInput>
          
          <div class="input-actions">
            <Button 
              @click="toggleVoiceInput"
              :disabled="isThinking || isListening"
              :class="['voice-button', { 'voice-button-active': isListening }]"
              :title="isListening ? '停止录音' : '语音输入'"
            >
              <i class="voice-icon"></i>
            </Button>
            
            <Button 
              @click="sendMessage"
              :disabled="isThinking || !inputMessage.trim()"
              variant="primary"
              class="send-button"
              title="发送消息 (Ctrl+Enter)"
            >
              发送
            </Button>
          </div>
        </div>
        
        <!-- 语音输入状态 -->
        <div v-if="isListening" class="voice-input-status">
          <div class="voice-status-indicator">
            <div class="voice-wave"></div>
            <div class="voice-wave"></div>
            <div class="voice-wave"></div>
            <div class="voice-wave"></div>
            <div class="voice-wave"></div>
          </div>
          <p class="voice-status-text">正在聆听，请说话...</p>
          <Button 
            variant="link" 
            @click="stopVoiceInput"
            class="voice-cancel-button"
          >
            取消
          </Button>
        </div>
        
        <!-- 快捷操作 -->
        <div class="quick-actions">
          <QuickActionButton 
            v-for="action in quickActions" 
            :key="action.label"
            :label="action.label"
            :icon="action.icon"
            :tooltip="action.tooltip"
            @click="executeQuickAction(action)"
          />
        </div>
      </div>
    </div>
    
    <!-- 助手信息面板 -->
    <div class="assistant-panel">
      <div class="panel-header">
        <h3 class="panel-title">我的旅行助手</h3>
        <Button 
          variant="link" 
          @click="togglePanel"
          class="toggle-panel-button"
        >
          <i class="toggle-icon"></i>
        </Button>
      </div>
      
      <div class="panel-content">
        <!-- 助手介绍 -->
        <div class="assistant-info">
          <div class="assistant-profile">
            <div class="assistant-avatar large"></div>
            <h4 class="assistant-name">Travel AI</h4>
          </div>
          <p class="assistant-intro">
            我是您的智能旅行助手，可以帮您规划行程、推荐景点、预订酒店，解答旅行中的各种问题。
          </p>
        </div>
        
        <!-- 使用指南 -->
        <div class="usage-guide">
          <h4 class="guide-title">如何使用</h4>
          <ul class="guide-items">
            <li class="guide-item">
              <i class="guide-icon-text"></i>
              <span>在输入框中输入您的问题</span>
            </li>
            <li class="guide-item">
              <i class="guide-icon-voice"></i>
              <span>点击麦克风按钮进行语音对话</span>
            </li>
            <li class="guide-item">
              <i class="guide-icon-actions"></i>
              <span>使用快捷操作快速获取信息</span>
            </li>
          </ul>
        </div>
        
        <!-- 常见问题 -->
        <div class="faq-section">
          <h4 class="faq-title">常见问题</h4>
          <div 
            v-for="(faq, index) in faqs" 
            :key="index"
            class="faq-item"
          >
            <div class="faq-question" @click="toggleFaq(index)">
              <span class="faq-question-text">{{ faq.question }}</span>
              <i :class="['faq-toggle', { 'faq-toggle-active': expandedFaq === index }]"></i>
            </div>
            <div v-if="expandedFaq === index" class="faq-answer">
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Button, FormInput, QuickActionButton } from '../components'
import dayjs from 'dayjs'

export default {
  name: 'VoiceAssistant',
  
  components: {
    Button,
    FormInput,
    QuickActionButton
  },
  
  data() {
    return {
      // 消息历史
      messages: [],
      
      // 输入状态
      inputMessage: '',
      isThinking: false,
      
      // 语音输入状态
      isListening: false,
      
      // 面板状态
      isPanelVisible: true,
      
      // FAQ展开状态
      expandedFaq: null,
      
      // 快捷操作
      quickActions: [
        {
          label: '天气查询',
          icon: '☁️',
          tooltip: '查询目的地天气',
          action: 'weather'
        },
        {
          label: '景点推荐',
          icon: '🏛️',
          tooltip: '获取热门景点推荐',
          action: 'attractions'
        },
        {
          label: '美食推荐',
          icon: '🍜',
          tooltip: '推荐当地特色美食',
          action: 'food'
        },
        {
          label: '行程规划',
          icon: '📅',
          tooltip: '快速规划行程',
          action: 'plan'
        },
        {
          label: '旅行贴士',
          icon: '💡',
          tooltip: '获取实用旅行建议',
          action: 'tips'
        }
      ],
      
      // 常见问题
      faqs: [
        {
          question: '语音助手可以做什么？',
          answer: '语音助手可以帮助您查询目的地信息、规划旅行行程、推荐景点和餐厅、解答旅行中的各种问题等。'
        },
        {
          question: '如何使用语音输入功能？',
          answer: '点击输入框旁边的麦克风图标，系统会开始录音。请对着麦克风清晰地说出您的问题，说完后再次点击麦克风图标或等待自动停止。'
        },
        {
          question: '对话内容会被保存吗？',
          answer: '是的，您的对话内容会被临时保存在本地，以便您可以查看历史记录。您可以随时点击"清空对话"按钮删除所有历史记录。'
        },
        {
          question: '可以使用哪些语言与助手交流？',
          answer: '目前助手支持中文和英文交流。'
        }
      ]
    }
  },
  
  mounted() {
    // 初始化欢迎消息
    this.showWelcomeMessage()
    
    // 设置窗口大小变化监听，调整面板显示
    window.addEventListener('resize', this.checkScreenSize)
    this.checkScreenSize()
  },
  
  beforeDestroy() {
    window.removeEventListener('resize', this.checkScreenSize)
    // 清理语音识别
    if (this.speechRecognition) {
      this.speechRecognition.stop()
    }
  },
  
  watch: {
    // 监听消息变化，自动滚动到底部
    messages() {
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    
    // 监听语音输入状态
    isListening(active) {
      if (active) {
        this.startVoiceRecognition()
      } else {
        this.stopVoiceRecognition()
      }
    }
  },
  
  methods: {
    // 显示欢迎消息
    showWelcomeMessage() {
      // 可以选择在第一次访问时显示欢迎消息
      const hasVisited = localStorage.getItem('voiceAssistantVisited')
      
      if (!hasVisited) {
        // 添加欢迎消息
        setTimeout(() => {
          this.addAssistantMessage(
            '欢迎使用AI旅行助手！我可以帮您规划旅行行程、推荐景点、查询天气等。请告诉我您想去哪里旅行，或者有什么旅行问题需要咨询？',
            {
              quickReplies: [
                '帮我规划日本东京5日游',
                '巴黎有哪些必去景点',
                '巴厘岛最佳旅行时间',
                '查询伦敦未来7天天气'
              ]
            }
          )
          
          localStorage.setItem('voiceAssistantVisited', 'true')
        }, 500)
      }
    },
    
    // 添加助手消息
    addAssistantMessage(content, options = {}) {
      const message = {
        sender: 'assistant',
        content,
        timestamp: this.getCurrentTime(),
        ...options
      }
      
      this.messages.push(message)
    },
    
    // 添加用户消息
    addUserMessage(content) {
      const message = {
        sender: 'user',
        content,
        timestamp: this.getCurrentTime()
      }
      
      this.messages.push(message)
    },
    
    // 发送消息
    sendMessage(message = this.inputMessage.trim()) {
      if (!message || this.isThinking) return
      
      // 添加用户消息
      this.addUserMessage(message)
      
      // 清空输入框
      this.inputMessage = ''
      
      // 模拟思考状态
      this.isThinking = true
      
      // 模拟AI回复
      setTimeout(() => {
        this.generateAssistantResponse(message)
        this.isThinking = false
      }, 1500)
    },
    
    // 生成助手回复 (模拟)
    generateAssistantResponse(message) {
      // 关键词匹配回复
      if (message.includes('规划') || message.includes('行程')) {
        this.addAssistantMessage(
          '为您规划旅行行程，我需要了解一些基本信息：\n\n1. 您的目的地是哪里？\n2. 计划何时出发，行程几天？\n3. 有什么特别的兴趣爱好或需求？',
          {
            type: 'travel-suggestion',
            title: '行程规划助手',
            description: '告诉我您的旅行需求，我会为您定制完美行程',
            actions: [
              { label: '进入规划页面', primary: true, action: 'navigate', target: '/trip-planner' },
              { label: '继续对话', action: 'continue' }
            ]
          }
        )
      } else if (message.includes('天气') || message.includes('温度')) {
        this.addAssistantMessage(
          '查询天气需要知道您想了解哪个城市的天气信息。请告诉我城市名称，我可以为您查询未来几天的天气预报。',
          {
            quickReplies: ['东京天气', '纽约天气', '伦敦天气', '巴黎天气']
          }
        )
      } else if (message.includes('景点') || message.includes('参观')) {
        this.addAssistantMessage(
          '关于景点推荐，以下是一些常见目的地的热门景点：',
          {
            type: 'travel-suggestion',
            title: '热门景点推荐',
            suggestions: [
              {
                icon: '🗼',
                title: '东京',
                description: '东京塔、明治神宫、浅草寺、涩谷十字路口'
              },
              {
                icon: '🗽',
                title: '纽约',
                description: '自由女神像、时代广场、中央公园、帝国大厦'
              },
              {
                icon: '埃菲尔铁塔',
                title: '巴黎',
                description: '埃菲尔铁塔、卢浮宫、凯旋门、塞纳河游船'
              }
            ],
            actions: [
              { label: '查看更多景点', action: 'navigate', target: '/destinations' }
            ]
          }
        )
      } else if (message.includes('美食') || message.includes('吃')) {
        this.addAssistantMessage(
          '美食推荐是我的专长！请告诉我您想了解哪个地区或国家的美食，我会为您推荐当地特色。',
          {
            quickReplies: ['日本美食', '意大利美食', '泰国美食', '中国川菜']
          }
        )
      } else if (message.includes('贴士') || message.includes('建议')) {
        this.addAssistantMessage(
          '旅行小贴士：',
          {
            type: 'travel-suggestion',
            title: '实用旅行建议',
            suggestions: [
              {
                icon: '💼',
                title: '行李准备',
                description: '根据目的地天气和活动准备衣物，不要忘记护照和常用药品'
              },
              {
                icon: '💳',
                title: '财务安全',
                description: '携带适量现金，主要使用信用卡，注意保护个人信息'
              },
              {
                icon: '📱',
                title: '通讯准备',
                description: '开通国际漫游或购买当地SIM卡，下载离线地图'
              },
              {
                icon: '🏥',
                title: '健康安全',
                description: '购买旅行保险，了解当地紧急电话，注意饮食卫生'
              }
            ]
          }
        )
      } else {
        // 默认回复
        this.addAssistantMessage(
          '感谢您的咨询！如果您有具体的旅行问题，我很乐意为您提供帮助。您可以询问关于目的地信息、行程规划、景点推荐、美食推荐等问题。',
          {
            quickReplies: [
              '帮我规划行程',
              '推荐旅游目的地',
              '查询天气',
              '了解旅行贴士'
            ]
          }
        )
      }
    },
    
    // 切换语音输入
    toggleVoiceInput() {
      this.isListening = !this.isListening
    },
    
    // 停止语音输入
    stopVoiceInput() {
      this.isListening = false
    },
    
    // 开始语音识别 (模拟)
    startVoiceRecognition() {
      // 在实际项目中，这里应该使用Web Speech API或其他语音识别服务
      console.log('开始语音识别')
      
      // 模拟语音识别结果
      setTimeout(() => {
        if (this.isListening) {
          this.isListening = false
          const recognizedText = '帮我推荐巴黎的必去景点和美食'
          this.inputMessage = recognizedText
          this.$notification.success({
            title: '语音识别成功',
            message: `识别结果: ${recognizedText}`,
            duration: 3000
          })
        }
      }, 3000)
    },
    
    // 停止语音识别
    stopVoiceRecognition() {
      console.log('停止语音识别')
    },
    
    // 清空对话
    clearConversation() {
      this.$confirm({
        title: '确认清空对话',
        message: '您确定要清空所有对话记录吗？此操作不可恢复。',
        onOk: () => {
          this.messages = []
          this.$notification.success({
            title: '操作成功',
            message: '对话记录已清空',
            duration: 2000
          })
        }
      })
    },
    
    // 执行快捷操作
    executeQuickAction(action) {
      switch (action.action) {
        case 'weather':
          this.sendMessage('请帮我查询天气')
          break
        case 'attractions':
          this.sendMessage('请推荐热门景点')
          break
        case 'food':
          this.sendMessage('请推荐当地美食')
          break
        case 'plan':
          this.$router.push('/trip-planner')
          break
        case 'tips':
          this.sendMessage('请提供旅行贴士')
          break
        default:
          console.log('未知操作:', action.action)
      }
    },
    
    // 执行消息中的操作
    executeAction(action) {
      if (action.action === 'navigate') {
        this.$router.push(action.target)
      } else if (action.action === 'continue') {
        // 继续对话，将焦点设置到输入框
        this.$refs.messageInput?.focus()
      }
    },
    
    // 切换面板显示
    togglePanel() {
      this.isPanelVisible = !this.isPanelVisible
    },
    
    // 切换FAQ展开状态
    toggleFaq(index) {
      this.expandedFaq = this.expandedFaq === index ? null : index
    },
    
    // 获取当前时间
    getCurrentTime() {
      return dayjs().format('HH:mm')
    },
    
    // 滚动到底部
    scrollToBottom() {
      const conversationHistory = this.$refs.conversationHistory
      if (conversationHistory) {
        conversationHistory.scrollTop = conversationHistory.scrollHeight
      }
    },
    
    // 检查屏幕大小，在移动设备上默认隐藏侧边栏
    checkScreenSize() {
      if (window.innerWidth < 768) {
        this.isPanelVisible = false
      }
    }
  }
}
</script>

<style scoped>
/* 语音助手容器 */
.voice-assistant-container {
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  gap: 24px;
}

/* 页面标题 */
.page-header {
  text-align: center;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
}

.page-description {
  font-size: 16px;
  color: #666;
}

/* 主要内容区域 */
.assistant-main {
  display: flex;
  flex: 1;
  gap: 24px;
}

/* 对话容器 */
.conversation-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 对话标题栏 */
.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
}

.conversation-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.clear-button {
  font-size: 14px;
  color: #666;
}

/* 对话历史区域 */
.conversation-history {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 欢迎消息 */
.welcome-message {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background-color: #f0f9ff;
  border-radius: 8px;
  margin-bottom: 20px;
}

.welcome-content {
  flex: 1;
}

.welcome-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.welcome-subtext {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.welcome-suggestions {
  font-size: 14px;
  color: #666;
  padding-left: 20px;
  margin: 0;
}

.welcome-suggestions li {
  margin-bottom: 6px;
}

/* 消息项 */
.message-item {
  display: flex;
  width: 100%;
}

.message-user {
  justify-content: flex-end;
}

.message-assistant {
  justify-content: flex-start;
}

.message-content {
  display: flex;
  gap: 12px;
  max-width: 70%;
}

.message-user .message-content {
  flex-direction: row-reverse;
}

/* 头像 */
.user-avatar,
.assistant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.user-avatar {
  background-color: #d9d9d9;
}

.assistant-avatar {
  background-color: #1890ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.assistant-avatar::before {
  content: '🤖';
}

.assistant-avatar.large {
  width: 60px;
  height: 60px;
  font-size: 32px;
}

/* 消息气泡 */
.message-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;
  max-width: 100%;
  word-wrap: break-word;
}

.user-bubble {
  background-color: #1890ff;
  color: white;
  border-bottom-right-radius: 4px;
}

.assistant-bubble {
  background-color: #f0f0f0;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-text {
  margin: 0 0 4px 0;
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
  display: block;
  text-align: right;
}

.user-bubble .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.assistant-bubble .message-time {
  color: rgba(0, 0, 0, 0.5);
}

/* 旅行建议卡片 */
.travel-suggestion-card {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;
}

.suggestion-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.suggestion-description {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.suggestion-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.suggestion-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.suggestion-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;
}

.suggestion-item-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 4px 0;
}

.suggestion-item-desc {
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.suggestion-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-button {
  font-size: 12px;
}

/* 快速回复按钮 */
.quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0 4px;
}

.quick-reply-button {
  font-size: 12px;
  border: 1px solid #d9d9d9;
}

/* 正在输入指示器 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px;
  background-color: #f0f0f0;
  border-radius: 16px;
  border-bottom-left-radius: 4px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #999;
  animation: typingPulse 1.4s infinite ease-in-out both;
}

.typing-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typingPulse {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1.0);
  }
}

/* 输入区域 */
.input-container {
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.input-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.message-input {
  flex: 1;
}

.input-actions {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.voice-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
}

.voice-button:hover {
  background-color: #e8e8e8;
}

.voice-button-active {
  background-color: #fff1f0;
  color: #f5222d;
}

.voice-icon::before {
  content: '🎤';
  font-size: 20px;
}

.send-button {
  min-width: 80px;
}

/* 语音输入状态 */
.voice-input-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #f0f9ff;
  border-radius: 8px;
  margin-bottom: 16px;
}

.voice-status-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.voice-wave {
  width: 3px;
  height: 20px;
  background-color: #1890ff;
  border-radius: 2px;
  animation: wave 1.2s infinite ease-in-out;
}

.voice-wave:nth-child(1) {
  animation-delay: 0s;
  height: 15px;
}

.voice-wave:nth-child(2) {
  animation-delay: 0.2s;
  height: 25px;
}

.voice-wave:nth-child(3) {
  animation-delay: 0.4s;
  height: 20px;
}

.voice-wave:nth-child(4) {
  animation-delay: 0.6s;
  height: 30px;
}

.voice-wave:nth-child(5) {
  animation-delay: 0.8s;
  height: 15px;
}

@keyframes wave {
  0%, 100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1);
  }
}

.voice-status-text {
  flex: 1;
  font-size: 14px;
  color: #333;
  margin: 0;
}

.voice-cancel-button {
  font-size: 14px;
  color: #666;
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

/* 助手面板 */
.assistant-panel {
  width: 320px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: fit-content;
  transition: transform 0.3s, opacity 0.3s;
}

.assistant-panel.hidden {
  transform: translateX(100%);
  opacity: 0;
  pointer-events: none;
}

/* 面板标题栏 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.toggle-panel-button {
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-icon::before {
  content: '❌';
  font-size: 16px;
}

/* 面板内容 */
.panel-content {
  padding: 20px;
}

/* 助手信息 */
.assistant-info {
  text-align: center;
  margin-bottom: 24px;
}

.assistant-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
}

.assistant-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 12px 0 0;
}

.assistant-intro {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

/* 使用指南 */
.usage-guide {
  margin-bottom: 24px;
}

.guide-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
}

.guide-items {
  margin: 0;
  padding: 0;
  list-style: none;
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

.guide-icon-text::before {
  content: '📝';
}

.guide-icon-voice::before {
  content: '🎤';
}

.guide-icon-actions::before {
  content: '⚡';
}

/* 常见问题 */
.faq-section {
  margin-bottom: 16px;
}

.faq-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
}

.faq-item {
  margin-bottom: 8px;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.faq-question-text {
  font-size: 14px;
  color: #333;
  flex: 1;
}

.faq-toggle::before {
  content: '➕';
  font-size: 12px;
  transition: transform 0.3s;
}

.faq-toggle-active::before {
  content: '➖';
}

.faq-answer {
  padding: 10px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  border-bottom: 1px solid #f0f0f0;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .assistant-main {
    flex-direction: column;
  }
  
  .assistant-panel {
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .message-content {
    max-width: 85%;
  }
}

@media (max-width: 768px) {
  .voice-assistant-container {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .input-wrapper {
    flex-direction: column;
  }
  
  .input-actions {
    justify-content: space-between;
  }
  
  .voice-button {
    width: 44px;
    height: 44px;
  }
  
  .send-button {
    width: calc(100% - 52px);
  }
  
  .message-content {
    max-width: 90%;
  }
  
  .assistant-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 80%;
    z-index: 1000;
    max-height: none;
  }
}
</style>