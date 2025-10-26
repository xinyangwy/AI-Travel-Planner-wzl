<template>
  <div class="voice-input-container">
    <!-- 语音输入按钮 -->
    <button
      class="voice-button"
      :class="{
        'listening': isListening,
        'processing': isProcessing,
        'speaking': isSpeaking
      }"
      @click="toggleVoiceInput"
      :disabled="isProcessing"
      :title="buttonTitle"
    >
      <!-- 按钮图标 -->
      <i v-if="isListening" class="icon-microphone-active"></i>
      <i v-else-if="isProcessing" class="icon-spinner"></i>
      <i v-else-if="isSpeaking" class="icon-volume-high"></i>
      <i v-else class="icon-microphone"></i>
    </button>

    <!-- 语音识别文本显示 -->
    <div v-if="showTranscript && transcript" class="transcript-container">
      <div class="transcript-text">{{ transcript }}</div>
    </div>

    <!-- 语音处理状态提示 -->
    <div v-if="loading" class="status-message">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { VOICE_ASSISTANT } from '../constants'

export default {
  name: 'VoiceInput',
  
  props: {
    // 是否显示转录文本
    showTranscript: {
      type: Boolean,
      default: true
    },
    // 是否自动播放AI回复
    autoPlayResponse: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      // Web Speech API 语音识别实例
      recognition: null,
      // 音频流数据
      audioStream: null,
      // 录音器
      mediaRecorder: null,
      // 录音数据数组
      audioChunks: [],
      // 录音持续时间计时器
      recordingTimer: null,
      // 最大录音时长（毫秒）
      maxRecordingTime: 60000, // 1分钟
      // 录音开始时间
      startTime: null,
      // 录音时长
      recordingDuration: 0
    }
  },
  
  computed: {
    // 从store获取状态
    ...mapGetters('voice', [
      'isListening',
      'isProcessing',
      'isSpeaking',
      'transcript',
      'recognitionStatus'
    ]),
    
    // 按钮标题
    buttonTitle() {
      if (this.isListening) return '点击停止录音'
      if (this.isProcessing) return '处理中...'
      if (this.isSpeaking) return '正在播放语音'
      return '点击开始录音'
    },
    
    // 加载状态
    loading() {
      return this.isProcessing
    },
    
    // 状态消息
    statusMessage() {
      if (this.isProcessing) return '正在处理您的语音，请稍候...'
      if (this.recognitionStatus.error) return this.recognitionStatus.error
      return ''
    }
  },
  
  mounted() {
    // 初始化Web Speech API
    this.initializeSpeechRecognition()
  },
  
  beforeUnmount() {
    // 组件销毁前清理资源
    this.cleanupRecognition()
    this.stopRecording()
  },
  
  methods: {
    // 映射action
    ...mapActions('voice', [
      'startRecognition',
      'stopRecognition',
      'updateTranscript',
      'setRecognitionError',
      'processVoiceInput',
      'speakText'
    ]),
    
    // 初始化Web Speech API
    initializeSpeechRecognition() {
      // 检查浏览器是否支持语音识别
      if ('webkitSpeechRecognition' in window) {
        this.recognition = new webkitSpeechRecognition()
      } else if ('SpeechRecognition' in window) {
        this.recognition = new SpeechRecognition()
      } else {
        console.warn('您的浏览器不支持Web Speech API语音识别')
        return
      }
      
      // 配置语音识别实例
      this.recognition.continuous = false // 单次识别模式
      this.recognition.interimResults = true // 返回中间结果
      this.recognition.lang = 'zh-CN' // 设置为中文识别
      this.recognition.maxAlternatives = 1 // 最佳匹配结果
      
      // 监听识别开始事件
      this.recognition.onstart = () => {
        this.startRecognition()
        this.startRecording()
      }
      
      // 监听结果事件
      this.recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        // 遍历所有结果
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        // 更新识别文本
        const combinedTranscript = finalTranscript + interimTranscript
        this.updateTranscript(combinedTranscript)
      }
      
      // 监听结束事件
      this.recognition.onend = () => {
        if (this.isListening) {
          // 如果是用户主动停止，则调用processVoiceInput
          this.processVoiceInputData()
        }
      }
      
      // 监听错误事件
      this.recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error)
        let errorMessage = '语音识别失败'
        
        switch (event.error) {
          case 'network':
            errorMessage = '网络错误，无法连接到语音识别服务'
            break
          case 'not-allowed':
            errorMessage = '浏览器未授权使用麦克风，请检查麦克风权限'
            break
          case 'no-speech':
            errorMessage = '未检测到语音，请重试'
            break
          case 'audio-capture':
            errorMessage = '未检测到麦克风设备'
            break
        }
        
        this.setRecognitionError(errorMessage)
        this.stopRecording()
      }
    },
    
    // 开始录音（捕获音频流）
    async startRecording() {
      try {
        // 请求麦克风权限
        this.audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })
        
        // 创建MediaRecorder实例
        this.mediaRecorder = new MediaRecorder(this.audioStream)
        
        // 重置音频数据
        this.audioChunks = []
        
        // 收集录音数据
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data)
          }
        }
        
        // 开始录音
        this.mediaRecorder.start()
        this.startTime = Date.now()
        
        // 设置最大录音时长
        this.recordingTimer = setTimeout(() => {
          this.stopVoiceInput()
        }, this.maxRecordingTime)
      } catch (error) {
        console.error('开始录音失败:', error)
        this.setRecognitionError('无法访问麦克风，请确保已授予权限')
      }
    },
    
    // 停止录音
    stopRecording() {
      // 清除计时器
      if (this.recordingTimer) {
        clearTimeout(this.recordingTimer)
        this.recordingTimer = null
      }
      
      // 计算录音时长
      if (this.startTime) {
        this.recordingDuration = Date.now() - this.startTime
        this.startTime = null
      }
      
      // 停止录音
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop()
      }
      
      // 停止音频流
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop())
        this.audioStream = null
      }
    },
    
    // 处理语音输入数据
    async processVoiceInputData() {
      try {
        // 确保有音频数据
        if (this.audioChunks.length === 0) {
          throw new Error('未检测到音频数据')
        }
        
        // 创建音频Blob
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        
        // 转换为Base64（或其他适合后端处理的格式）
        const audioData = await this.blobToBase64(audioBlob)
        
        // 调用处理语音输入的action
        await this.processVoiceInput(audioData)
      } catch (error) {
        console.error('处理语音数据失败:', error)
        this.setRecognitionError(error.message || '处理语音数据失败')
      } finally {
        // 清理录音状态
        this.stopVoiceInput()
      }
    },
    
    // 切换语音输入状态
    toggleVoiceInput() {
      if (this.isListening) {
        this.stopVoiceInput()
      } else {
        this.startVoiceInput()
      }
    },
    
    // 开始语音输入
    startVoiceInput() {
      // 确保语音识别实例已初始化
      if (!this.recognition) {
        this.initializeSpeechRecognition()
        if (!this.recognition) {
          return
        }
      }
      
      // 重置错误状态
      this.setRecognitionError(null)
      
      // 开始语音识别
      try {
        this.recognition.start()
      } catch (error) {
        console.error('启动语音识别失败:', error)
        this.setRecognitionError('启动语音识别失败，请刷新页面重试')
      }
    },
    
    // 停止语音输入
    stopVoiceInput() {
      // 停止语音识别
      if (this.recognition) {
        try {
          this.recognition.stop()
        } catch (error) {
          console.warn('停止语音识别失败:', error)
        }
      }
      
      // 停止录音
      this.stopRecording()
      
      // 更新状态
      this.stopRecognition()
    },
    
    // 清理语音识别实例
    cleanupRecognition() {
      // 停止语音识别
      if (this.recognition) {
        try {
          this.recognition.stop()
          this.recognition.abort()
        } catch (error) {
          console.warn('清理语音识别失败:', error)
        }
        this.recognition = null
      }
    },
    
    // 将Blob转换为Base64
    blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => {
          // 移除data:URL前缀
          const base64data = reader.result.split(',')[1]
          resolve(base64data)
        }
        reader.onerror = reject
      })
    },
    
    // 手动播放语音
    async speak(text) {
      try {
        await this.speakText(text)
      } catch (error) {
        console.error('播放语音失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.voice-input-container {
  position: relative;
  display: inline-block;
}

.voice-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #1890ff;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
  font-size: 20px;
}

.voice-button:hover {
  background-color: #40a9ff;
  transform: scale(1.1);
}

.voice-button:active {
  transform: scale(0.95);
}

.voice-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.voice-button.listening {
  background-color: #f5222d;
  box-shadow: 0 2px 8px rgba(245, 34, 45, 0.3);
  animation: pulse 1.5s infinite;
}

.voice-button.processing {
  background-color: #fa8c16;
  box-shadow: 0 2px 8px rgba(250, 140, 22, 0.3);
}

.voice-button.speaking {
  background-color: #52c41a;
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.3);
  animation: wave 2s infinite;
}

.transcript-container {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  max-width: 300px;
  word-break: break-word;
  z-index: 10;
  animation: fadeIn 0.3s ease;
}

.transcript-container::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
}

.transcript-text {
  font-size: 14px;
  white-space: pre-wrap;
}

.status-message {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 8px;
  max-width: 300px;
  font-size: 14px;
  z-index: 10;
  animation: fadeIn 0.3s ease;
}

/* 动画效果 */
@keyframes pulse {
  0% {
    box-shadow: 0 2px 8px rgba(245, 34, 45, 0.3);
  }
  50% {
    box-shadow: 0 2px 16px rgba(245, 34, 45, 0.6), 0 0 20px rgba(245, 34, 45, 0.3);
  }
  100% {
    box-shadow: 0 2px 8px rgba(245, 34, 45, 0.3);
  }
}

@keyframes wave {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* 图标样式（这里使用文字替代，实际项目中可使用图标库） */
.icon-microphone::before {
  content: '🎤';
}

.icon-microphone-active::before {
  content: '🎙️';
}

.icon-spinner::before {
  content: '⏳';
  animation: spin 1s linear infinite;
}

.icon-volume-high::before {
  content: '🔊';
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>