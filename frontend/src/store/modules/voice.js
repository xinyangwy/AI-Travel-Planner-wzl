/**
 * 语音助手相关 Vuex Module
 */
import { get, post } from '../../utils/request'
import { API, VOICE_ASSISTANT } from '../../constants'

const voice = {
  // 命名空间
  namespaced: true,
  
  // 状态
  state() {
    return {
      // 对话历史列表
      conversationHistory: [],
      // 当前对话内容
      currentConversation: [],
      // 语音识别状态
      recognitionStatus: {
        isListening: false,
        isProcessing: false,
        error: null,
        transcript: ''
      },
      // 语音合成状态
      synthesisStatus: {
        isSpeaking: false,
        isPaused: false
      },
      // 快捷指令列表
      quickCommands: VOICE_ASSISTANT.QUICK_COMMANDS,
      // 历史会话列表
      savedConversations: [],
      // 加载状态
      loading: {
        history: false,
        processing: false,
        saving: false
      },
      // 对话ID
      currentConversationId: null,
      // 系统提示信息
      systemMessages: [
        {
          id: 'welcome',
          content: '您好！我是您的AI旅行助手。请问有什么可以帮助您的？',
          type: VOICE_ASSISTANT.MESSAGE_TYPE.SYSTEM
        }
      ]
    }
  },
  
  // 获取器
  getters: {
    // 获取对话历史列表
    conversationHistory: state => state.conversationHistory,
    
    // 获取当前对话内容
    currentConversation: state => state.currentConversation,
    
    // 获取语音识别状态
    recognitionStatus: state => state.recognitionStatus,
    
    // 获取语音合成状态
    synthesisStatus: state => state.synthesisStatus,
    
    // 获取快捷指令列表
    quickCommands: state => state.quickCommands,
    
    // 获取历史会话列表
    savedConversations: state => state.savedConversations,
    
    // 获取加载状态
    loading: state => state.loading,
    
    // 获取当前对话ID
    currentConversationId: state => state.currentConversationId,
    
    // 获取系统提示信息
    systemMessages: state => state.systemMessages,
    
    // 判断是否正在录音
    isListening: state => state.recognitionStatus.isListening,
    
    // 判断是否正在处理语音
    isProcessing: state => state.recognitionStatus.isProcessing,
    
    // 判断是否正在播放语音
    isSpeaking: state => state.synthesisStatus.isSpeaking,
    
    // 获取最近的几条消息
    recentMessages: state => (count = 10) => {
      return state.currentConversation.slice(-count)
    },
    
    // 获取用户消息数量
    userMessageCount: state => {
      return state.currentConversation.filter(msg => 
        msg.type === VOICE_ASSISTANT.MESSAGE_TYPE.USER
      ).length
    },
    
    // 获取AI回复消息数量
    aiMessageCount: state => {
      return state.currentConversation.filter(msg => 
        msg.type === VOICE_ASSISTANT.MESSAGE_TYPE.AI
      ).length
    }
  },
  
  // 变更函数
  mutations: {
    // 设置对话历史列表
    SET_CONVERSATION_HISTORY(state, history) {
      state.conversationHistory = history
    },
    
    // 设置当前对话内容
    SET_CURRENT_CONVERSATION(state, conversation) {
      state.currentConversation = conversation
    },
    
    // 添加消息到当前对话
    ADD_MESSAGE(state, message) {
      state.currentConversation.push({
        ...message,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      })
    },
    
    // 设置语音识别状态
    SET_RECOGNITION_STATUS(state, status) {
      state.recognitionStatus = { ...state.recognitionStatus, ...status }
    },
    
    // 设置语音合成状态
    SET_SYNTHESIS_STATUS(state, status) {
      state.synthesisStatus = { ...state.synthesisStatus, ...status }
    },
    
    // 设置加载状态
    SET_LOADING(state, { key, status }) {
      if (state.loading.hasOwnProperty(key)) {
        state.loading[key] = status
      }
    },
    
    // 设置当前对话ID
    SET_CURRENT_CONVERSATION_ID(state, id) {
      state.currentConversationId = id
    },
    
    // 设置保存的对话列表
    SET_SAVED_CONVERSATIONS(state, conversations) {
      state.savedConversations = conversations
    },
    
    // 清空当前对话
    CLEAR_CURRENT_CONVERSATION(state) {
      state.currentConversation = []
      state.currentConversationId = null
    },
    
    // 更新消息内容
    UPDATE_MESSAGE(state, { id, content }) {
      const index = state.currentConversation.findIndex(msg => msg.id === id)
      if (index !== -1) {
        state.currentConversation[index].content = content
      }
    },
    
    // 设置识别文本
    SET_TRANSCRIPT(state, transcript) {
      state.recognitionStatus.transcript = transcript
    },
    
    // 设置识别错误
    SET_RECOGNITION_ERROR(state, error) {
      state.recognitionStatus.error = error
    }
  },
  
  // 动作函数
  actions: {
    // 初始化对话（添加欢迎消息）
    initConversation({ commit, state }) {
      commit('CLEAR_CURRENT_CONVERSATION')
      // 添加欢迎消息
      if (state.systemMessages.length > 0) {
        commit('ADD_MESSAGE', state.systemMessages[0])
      }
    },
    
    // 处理语音输入
    async processVoiceInput({ commit, dispatch }, audioData) {
      try {
        commit('SET_LOADING', { key: 'processing', status: true })
        commit('SET_RECOGNITION_STATUS', { isProcessing: true, error: null })
        
        // 调用语音处理接口
        const response = await post(API.ENDPOINTS.VOICE_PROCESS, {
          audioData,
          conversationId: this.state.voice.currentConversationId
        })
        
        const { transcript, response: aiResponse } = response
        
        // 添加用户消息
        commit('ADD_MESSAGE', {
          type: VOICE_ASSISTANT.MESSAGE_TYPE.USER,
          content: transcript
        })
        
        // 添加AI回复
        commit('ADD_MESSAGE', {
          type: VOICE_ASSISTANT.MESSAGE_TYPE.AI,
          content: aiResponse
        })
        
        // 如果有新的对话ID，更新它
        if (response.conversationId) {
          commit('SET_CURRENT_CONVERSATION_ID', response.conversationId)
        }
        
        // 可以选择自动播放AI回复
        dispatch('speakText', aiResponse)
        
        return response
      } catch (error) {
        console.error('处理语音输入失败:', error)
        commit('SET_RECOGNITION_STATUS', { error: error.message || '语音处理失败' })
        throw error
      } finally {
        commit('SET_LOADING', { key: 'processing', status: false })
        commit('SET_RECOGNITION_STATUS', { isProcessing: false })
      }
    },
    
    // 处理文本输入
    async processTextInput({ commit, dispatch }, text) {
      try {
        commit('SET_LOADING', { key: 'processing', status: true })
        
        // 调用文本处理接口
        const response = await post(API.ENDPOINTS.VOICE_PROCESS, {
          text,
          conversationId: this.state.voice.currentConversationId
        })
        
        // 添加用户消息
        commit('ADD_MESSAGE', {
          type: VOICE_ASSISTANT.MESSAGE_TYPE.USER,
          content: text
        })
        
        // 添加AI回复
        commit('ADD_MESSAGE', {
          type: VOICE_ASSISTANT.MESSAGE_TYPE.AI,
          content: response.response
        })
        
        // 如果有新的对话ID，更新它
        if (response.conversationId) {
          commit('SET_CURRENT_CONVERSATION_ID', response.conversationId)
        }
        
        return response
      } catch (error) {
        console.error('处理文本输入失败:', error)
        throw error
      } finally {
        commit('SET_LOADING', { key: 'processing', status: false })
      }
    },
    
    // 获取对话历史
    async getConversationHistory({ commit, dispatch }) {
      try {
        commit('SET_LOADING', { key: 'history', status: true })
        
        const history = await get(API.ENDPOINTS.VOICE_HISTORY)
        commit('SET_SAVED_CONVERSATIONS', history || [])
        
        return history
      } catch (error) {
        console.error('获取对话历史失败:', error)
        dispatch('showMessage', { message: '获取对话历史失败', type: 'error' }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { key: 'history', status: false })
      }
    },
    
    // 保存当前对话
    async saveCurrentConversation({ commit, state, dispatch }) {
      try {
        if (state.currentConversation.length <= 1) {
          dispatch('showMessage', { message: '对话内容为空，无需保存', type: 'info' }, { root: true })
          return
        }
        
        commit('SET_LOADING', { key: 'saving', status: true })
        
        // 生成对话标题（使用第一条用户消息或时间戳）
        const firstUserMessage = state.currentConversation.find(
          msg => msg.type === VOICE_ASSISTANT.MESSAGE_TYPE.USER
        )
        
        const title = firstUserMessage 
          ? firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '')
          : `对话 ${new Date().toLocaleString()}`
        
        // 这里可以调用保存对话的API
        // await post(API.ENDPOINTS.VOICE_SAVE, { title, messages: state.currentConversation })
        
        dispatch('showMessage', { message: '对话保存成功', type: 'success' }, { root: true })
        
        // 刷新历史对话列表
        dispatch('getConversationHistory')
      } catch (error) {
        console.error('保存对话失败:', error)
        dispatch('showMessage', { message: '保存对话失败', type: 'error' }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', { key: 'saving', status: false })
      }
    },
    
    // 开始语音识别
    startRecognition({ commit }) {
      commit('SET_RECOGNITION_STATUS', {
        isListening: true,
        transcript: '',
        error: null
      })
    },
    
    // 停止语音识别
    stopRecognition({ commit }) {
      commit('SET_RECOGNITION_STATUS', { isListening: false })
    },
    
    // 更新识别文本
    updateTranscript({ commit }, transcript) {
      commit('SET_TRANSCRIPT', transcript)
    },
    
    // 设置识别错误
    setRecognitionError({ commit }, error) {
      commit('SET_RECOGNITION_ERROR', error)
      commit('SET_RECOGNITION_STATUS', { isListening: false, isProcessing: false })
    },
    
    // 文本转语音播放
    speakText({ commit, state }, text) {
      return new Promise((resolve, reject) => {
        try {
          // 检查浏览器是否支持语音合成
          if (!('speechSynthesis' in window)) {
            throw new Error('浏览器不支持语音合成')
          }
          
          // 停止正在播放的语音
          window.speechSynthesis.cancel()
          
          // 创建语音合成实例
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.lang = 'zh-CN' // 设置为中文
          utterance.rate = 1.0 // 语速
          utterance.pitch = 1.0 // 音调
          utterance.volume = 1.0 // 音量
          
          // 开始播放回调
          utterance.onstart = () => {
            commit('SET_SYNTHESIS_STATUS', { isSpeaking: true, isPaused: false })
          }
          
          // 播放结束回调
          utterance.onend = () => {
            commit('SET_SYNTHESIS_STATUS', { isSpeaking: false })
            resolve()
          }
          
          // 播放错误回调
          utterance.onerror = (event) => {
            commit('SET_SYNTHESIS_STATUS', { isSpeaking: false })
            reject(new Error('语音播放失败: ' + event.error))
          }
          
          // 播放语音
          window.speechSynthesis.speak(utterance)
        } catch (error) {
          console.error('语音播放失败:', error)
          commit('SET_SYNTHESIS_STATUS', { isSpeaking: false })
          reject(error)
        }
      })
    },
    
    // 暂停语音播放
    pauseSpeaking({ commit, state }) {
      if (state.synthesisStatus.isSpeaking) {
        window.speechSynthesis.pause()
        commit('SET_SYNTHESIS_STATUS', { isPaused: true })
      }
    },
    
    // 恢复语音播放
    resumeSpeaking({ commit, state }) {
      if (state.synthesisStatus.isPaused) {
        window.speechSynthesis.resume()
        commit('SET_SYNTHESIS_STATUS', { isPaused: false })
      }
    },
    
    // 停止语音播放
    stopSpeaking({ commit }) {
      window.speechSynthesis.cancel()
      commit('SET_SYNTHESIS_STATUS', { isSpeaking: false, isPaused: false })
    },
    
    // 清空当前对话
    clearCurrentConversation({ commit }) {
      commit('CLEAR_CURRENT_CONVERSATION')
    },
    
    // 执行快捷指令
    executeQuickCommand({ dispatch }, command) {
      dispatch('processTextInput', command)
    }
  }
}

export default voice