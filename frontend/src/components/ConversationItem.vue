<template>
  <div 
    class="conversation-item"
    :class="{
      'user-message': isUserMessage,
      'ai-message': isAiMessage,
      'system-message': isSystemMessage,
      'typing': isTyping,
      'error': hasError
    }"
  >
    <!-- 头像 -->
    <div class="avatar" v-if="showAvatar">
      <img 
        v-if="avatarUrl" 
        :src="avatarUrl" 
        :alt="senderName"
        class="avatar-img"
      />
      <div v-else class="avatar-placeholder">
        {{ avatarText }}
      </div>
    </div>

    <!-- 消息内容区域 -->
    <div class="message-content">
      <!-- 发送者名称（可选） -->
      <div class="sender-name" v-if="showSenderName">
        {{ senderName }}
      </div>

      <!-- 消息气泡 -->
      <div 
        class="message-bubble"
        :class="{
          'with-actions': showActions && !isSystemMessage,
          'with-timestamp': showTimestamp
        }"
      >
        <!-- 加载动画 -->
        <div v-if="isTyping" class="typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>

        <!-- 文本内容 -->
        <div 
          v-else-if="content" 
          class="message-text"
          v-html="formattedContent"
        ></div>

        <!-- 错误消息 -->
        <div v-else-if="hasError" class="error-content">
          <i class="error-icon"></i>
          {{ errorMessage }}
        </div>

        <!-- 空消息 -->
        <div v-else class="empty-content">
          <i class="empty-icon"></i>
          无内容
        </div>

        <!-- 消息操作按钮 -->
        <div v-if="showActions && !isSystemMessage" class="message-actions">
          <button 
            v-if="allowCopy" 
            class="action-button" 
            @click="copyToClipboard"
            title="复制消息"
          >
            <i class="copy-icon"></i>
          </button>
          
          <button 
            v-if="allowSpeech && isAiMessage" 
            class="action-button" 
            @click="playMessage"
            title="播放语音"
          >
            <i class="speech-icon"></i>
          </button>
          
          <button 
            v-if="allowReaction" 
            class="action-button" 
            @click="toggleReactions"
            title="添加反应"
          >
            <i class="reaction-icon"></i>
          </button>
        </div>
      </div>

      <!-- 时间戳 -->
      <div v-if="showTimestamp && timestamp" class="message-timestamp">
        {{ formattedTimestamp }}
      </div>

      <!-- 反应表情 -->
      <div v-if="showReactions && reactions.length > 0" class="message-reactions">
        <div 
          v-for="reaction in reactions" 
          :key="reaction.emoji"
          class="reaction-item"
        >
          <span class="reaction-emoji">{{ reaction.emoji }}</span>
          <span class="reaction-count">{{ reaction.count }}</span>
        </div>
      </div>
    </div>

    <!-- 反应选择面板 -->
    <div v-if="showReactionPanel" class="reaction-panel">
      <div 
        v-for="emoji in availableEmojis" 
        :key="emoji"
        class="emoji-option"
        @click="addReaction(emoji)"
      >
        {{ emoji }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { VOICE_ASSISTANT } from '../constants'

// 配置dayjs
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export default {
  name: 'ConversationItem',
  
  props: {
    // 消息数据
    message: {
      type: Object,
      default: () => ({
        id: '',
        type: '',
        content: '',
        timestamp: null
      })
    },
    // 是否显示头像
    showAvatar: {
      type: Boolean,
      default: true
    },
    // 是否显示发送者名称
    showSenderName: {
      type: Boolean,
      default: false
    },
    // 是否显示时间戳
    showTimestamp: {
      type: Boolean,
      default: true
    },
    // 是否显示操作按钮
    showActions: {
      type: Boolean,
      default: true
    },
    // 是否允许复制
    allowCopy: {
      type: Boolean,
      default: true
    },
    // 是否允许语音播放
    allowSpeech: {
      type: Boolean,
      default: true
    },
    // 是否允许反应
    allowReaction: {
      type: Boolean,
      default: true
    },
    // 是否显示反应
    showReactions: {
      type: Boolean,
      default: true
    },
    // 用户头像URL
    userAvatar: {
      type: String,
      default: ''
    },
    // AI头像URL
    aiAvatar: {
      type: String,
      default: ''
    },
    // 系统头像URL
    systemAvatar: {
      type: String,
      default: ''
    },
    // 是否为打字中状态
    isTyping: {
      type: Boolean,
      default: false
    },
    // 错误状态
    hasError: {
      type: Boolean,
      default: false
    },
    // 错误消息
    errorMessage: {
      type: String,
      default: '消息加载失败'
    }
  },
  
  data() {
    return {
      // 显示反应选择面板
      showReactionPanel: false,
      // 反应列表
      reactions: [],
      // 可用的表情符号
      availableEmojis: ['👍', '👎', '😂', '😮', '😢', '❤️', '🎉', '🤔'],
      // 是否正在播放语音
      isPlaying: false
    }
  },
  
  computed: {
    // 消息类型
    type() {
      return this.message.type || ''
    },
    
    // 消息内容
    content() {
      return this.message.content || ''
    },
    
    // 消息时间戳
    timestamp() {
      return this.message.timestamp
    },
    
    // 判断是否为用户消息
    isUserMessage() {
      return this.type === VOICE_ASSISTANT.MESSAGE_TYPE.USER
    },
    
    // 判断是否为AI消息
    isAiMessage() {
      return this.type === VOICE_ASSISTANT.MESSAGE_TYPE.AI
    },
    
    // 判断是否为系统消息
    isSystemMessage() {
      return this.type === VOICE_ASSISTANT.MESSAGE_TYPE.SYSTEM
    },
    
    // 发送者名称
    senderName() {
      if (this.isUserMessage) return '您'
      if (this.isAiMessage) return 'AI助手'
      if (this.isSystemMessage) return '系统'
      return '未知'
    },
    
    // 头像URL
    avatarUrl() {
      if (this.isUserMessage) return this.userAvatar
      if (this.isAiMessage) return this.aiAvatar
      if (this.isSystemMessage) return this.systemAvatar
      return ''
    },
    
    // 头像占位符文本
    avatarText() {
      if (this.isUserMessage) return '用'
      if (this.isAiMessage) return 'AI'
      if (this.isSystemMessage) return '系'
      return '?'
    },
    
    // 格式化的时间戳
    formattedTimestamp() {
      if (!this.timestamp) return ''
      
      // 如果是今天的消息，显示时间
      // 如果是一周内的消息，显示星期几
      // 其他情况显示完整日期
      const messageDate = dayjs(this.timestamp)
      const today = dayjs().startOf('day')
      const yesterday = dayjs().subtract(1, 'day').startOf('day')
      const weekAgo = dayjs().subtract(7, 'day')
      
      if (messageDate.isSame(today, 'day')) {
        return messageDate.format('HH:mm')
      } else if (messageDate.isSame(yesterday, 'day')) {
        return `昨天 ${messageDate.format('HH:mm')}`
      } else if (messageDate.isAfter(weekAgo)) {
        return messageDate.format('dddd HH:mm')
      } else {
        return messageDate.format('YYYY-MM-DD HH:mm')
      }
    },
    
    // 格式化的消息内容（支持基本的富文本）
    formattedContent() {
      if (!this.content) return ''
      
      // 替换换行符为HTML换行
      let formatted = this.content.replace(/\n/g, '<br>')
      
      // 高亮关键字（可选）
      // formatted = this.highlightKeywords(formatted)
      
      // 链接识别（可选）
      // formatted = this.formatLinks(formatted)
      
      return formatted
    }
  },
  
  mounted() {
    // 点击外部关闭反应面板
    document.addEventListener('click', this.closeReactionPanel)
  },
  
  beforeUnmount() {
    // 移除事件监听
    document.removeEventListener('click', this.closeReactionPanel)
  },
  
  methods: {
    // 映射action
    ...mapActions('voice', ['speakText']),
    
    // 复制到剪贴板
    async copyToClipboard() {
      try {
        await navigator.clipboard.writeText(this.content)
        // 可以添加成功提示
        this.showCopySuccess()
      } catch (err) {
        console.error('复制失败:', err)
        // 降级方案：使用旧的复制方法
        this.fallbackCopyToClipboard(this.content)
      }
    },
    
    // 降级复制方法
    fallbackCopyToClipboard(text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      
      try {
        document.execCommand('copy')
        this.showCopySuccess()
      } catch (err) {
        console.error('降级复制方法也失败了:', err)
      } finally {
        document.body.removeChild(textArea)
      }
    },
    
    // 显示复制成功提示
    showCopySuccess() {
      // 这里可以触发一个消息提示
      this.$emit('copy-success')
    },
    
    // 播放消息语音
    async playMessage() {
      if (!this.content || this.isPlaying) return
      
      try {
        this.isPlaying = true
        await this.speakText(this.content)
      } catch (error) {
        console.error('播放语音失败:', error)
      } finally {
        this.isPlaying = false
      }
    },
    
    // 切换反应面板
    toggleReactions(event) {
      event.stopPropagation()
      this.showReactionPanel = !this.showReactionPanel
    },
    
    // 关闭反应面板
    closeReactionPanel(event) {
      if (this.showReactionPanel && event && !event.target.closest('.reaction-panel') && 
          !event.target.closest('.reaction-icon')) {
        this.showReactionPanel = false
      }
    },
    
    // 添加反应
    addReaction(emoji) {
      // 检查是否已经添加过这个反应
      const existingIndex = this.reactions.findIndex(r => r.emoji === emoji)
      
      if (existingIndex !== -1) {
        // 增加计数
        this.reactions[existingIndex].count++
      } else {
        // 添加新反应
        this.reactions.push({ emoji, count: 1 })
      }
      
      // 关闭面板
      this.showReactionPanel = false
      
      // 触发事件
      this.$emit('reaction-added', { messageId: this.message.id, emoji })
    },
    
    // 高亮关键字（可选实现）
    highlightKeywords(text) {
      // 实现关键字高亮逻辑
      return text
    },
    
    // 格式化链接（可选实现）
    formatLinks(text) {
      // 简单的URL匹配正则
      const urlRegex = /(https?:\/\/[^\s]+)/g
      return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    },
    
    // 获取消息DOM元素
    getMessageElement() {
      return this.$el
    },
    
    // 滚动到视图中
    scrollIntoView(options = {}) {
      const element = this.getMessageElement()
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          ...options
        })
      }
    }
  }
}
</script>

<style scoped>
.conversation-item {
  display: flex;
  margin-bottom: 16px;
  position: relative;
  animation: fadeIn 0.3s ease;
}

.user-message {
  flex-direction: row-reverse;
}

.user-message .message-content {
  align-items: flex-end;
}

.user-message .message-bubble {
  background-color: #1890ff;
  color: white;
  margin-right: 8px;
  margin-left: auto;
}

.ai-message .message-bubble {
  background-color: #f0f0f0;
  color: #333;
  margin-left: 8px;
}

.system-message {
  justify-content: center;
}

.system-message .message-content {
  max-width: 80%;
}

.system-message .message-bubble {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #52c41a;
  padding: 6px 12px;
  border-radius: 18px;
  font-size: 13px;
  text-align: center;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 16px;
  font-weight: bold;
  color: #666;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.sender-name {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
  padding: 0 8px;
}

.message-bubble {
  padding: 8px 12px;
  border-radius: 18px;
  position: relative;
  word-break: break-word;
  min-height: 20px;
  display: flex;
  align-items: center;
  transition: background-color 0.2s ease;
}

.message-bubble.with-actions {
  padding-bottom: 28px;
}

.message-bubble.with-timestamp {
  padding-bottom: 20px;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
  white-space: pre-wrap;
}

.message-text :deep(a) {
  color: inherit;
  text-decoration: underline;
}

.message-text :deep(a:hover) {
  opacity: 0.8;
}

.typing-indicator {
  display: flex;
  align-items: center;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background-color: currentColor;
  border-radius: 50%;
  margin: 0 2px;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dot:nth-child(2) {
  animation-delay: -0.16s;
}

.error-content {
  display: flex;
  align-items: center;
  color: #f5222d;
  font-size: 14px;
}

.empty-content {
  color: #999;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.error-icon::before {
  content: '⚠️';
  margin-right: 6px;
}

.empty-icon::before {
  content: '📭';
  margin-right: 6px;
}

.message-actions {
  position: absolute;
  bottom: 4px;
  right: 8px;
  display: flex;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message-bubble:hover .message-actions {
  opacity: 1;
}

.action-button {
  background: transparent;
  border: none;
  padding: 2px;
  margin-left: 4px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
  opacity: 1;
}

.user-message .action-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.copy-icon::before {
  content: '📋';
}

.speech-icon::before {
  content: '🔊';
}

.reaction-icon::before {
  content: '👍';
}

.message-timestamp {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
  padding: 0 8px;
}

.message-reactions {
  display: flex;
  flex-wrap: wrap;
  margin-top: 4px;
  padding: 0 8px;
}

.reaction-item {
  background-color: #f0f0f0;
  border-radius: 12px;
  padding: 2px 8px;
  margin-right: 4px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  font-size: 12px;
}

.reaction-emoji {
  font-size: 14px;
  margin-right: 2px;
}

.reaction-count {
  font-weight: 500;
  color: #666;
}

.reaction-panel {
  position: absolute;
  bottom: 100%;
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  width: 150px;
  z-index: 100;
}

.emoji-option {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  font-size: 18px;
  transition: background-color 0.2s ease;
}

.emoji-option:hover {
  background-color: #f0f0f0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-4px);
  }
}
</style>