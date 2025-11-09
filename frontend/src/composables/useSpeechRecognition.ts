import { ref } from 'vue'
import { message } from 'ant-design-vue'

// 科大讯飞语音识别配置
const XFYUN_CONFIG = {
  APPID: import.meta.env.VITE_XFYUN_APPID || '',
  API_KEY: import.meta.env.VITE_XFYUN_API_KEY || '',
  API_SECRET: import.meta.env.VITE_XFYUN_API_SECRET || ''
}

export function useSpeechRecognition() {
  const isRecording = ref(false)
  const recognizedText = ref('')
  
  let mediaRecorder: MediaRecorder | null = null
  let audioChunks: Blob[] = []
  let websocket: WebSocket | null = null

  // 开始录音
  const startRecording = async () => {
    try {
      // 检查浏览器是否支持
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        message.error('您的浏览器不支持语音输入功能')
        return
      }

      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // 创建 MediaRecorder
      mediaRecorder = new MediaRecorder(stream)
      audioChunks = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        await sendToXFYun(audioBlob)
        
        // 停止所有音频轨道
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      isRecording.value = true
      message.success('开始录音...')
    } catch (error) {
      console.error('录音失败:', error)
      message.error('无法访问麦克风，请检查权限设置')
    }
  }

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop()
      isRecording.value = false
    }
  }

  // 发送音频到科大讯飞进行识别
  const sendToXFYun = async (audioBlob: Blob) => {
    try {
      // 如果没有配置科大讯飞，使用浏览器内置的语音识别
      if (!XFYUN_CONFIG.APPID) {
        await useBrowserSpeechRecognition()
        return
      }

      message.loading('正在识别中...', 0)

      // 这里需要实现科大讯飞的 WebSocket 连接和音频发送
      // 由于科大讯飞需要复杂的鉴权和 WebSocket 通信，这里提供简化版本
      // 实际使用时需要完整实现科大讯飞的协议
      
      // 转换音频格式为 base64
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)
      reader.onloadend = async () => {
        const base64Audio = reader.result as string
        
        // 调用后端 API 进行语音识别（推荐方式）
        try {
          const response = await fetch('/api/speech/recognize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              audio: base64Audio.split(',')[1] // 去掉 data:audio/webm;base64, 前缀
            })
          })

          const result = await response.json()
          
          if (result.success && result.text) {
            recognizedText.value = result.text
            message.destroy()
            message.success('识别成功！')
          } else {
            throw new Error(result.message || '识别失败')
          }
        } catch (error) {
          console.error('语音识别失败:', error)
          message.destroy()
          message.error('语音识别失败，请重试')
        }
      }
    } catch (error) {
      console.error('发送音频失败:', error)
      message.destroy()
      message.error('语音识别失败')
    }
  }

  // 使用浏览器内置的语音识别（备用方案）
  const useBrowserSpeechRecognition = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      
      if (!SpeechRecognition) {
        message.error('您的浏览器不支持语音识别')
        reject(new Error('不支持语音识别'))
        return
      }

      const recognition = new SpeechRecognition()
      recognition.lang = 'zh-CN'
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        isRecording.value = true
        message.success('开始录音，请说话...')
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        recognizedText.value = transcript
        message.success('识别成功！')
        resolve()
      }

      recognition.onerror = (event: any) => {
        console.error('语音识别错误:', event.error)
        message.error('语音识别失败: ' + event.error)
        isRecording.value = false
        reject(event.error)
      }

      recognition.onend = () => {
        isRecording.value = false
      }

      recognition.start()
    })
  }

  // 使用浏览器语音识别（简化版）
  const startBrowserRecognition = async () => {
    try {
      await useBrowserSpeechRecognition()
    } catch (error) {
      console.error('浏览器语音识别失败:', error)
    }
  }

  return {
    isRecording,
    recognizedText,
    startRecording,
    stopRecording,
    startBrowserRecognition
  }
}
