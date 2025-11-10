import axios from 'axios'
import type { TripFormData, TripPlanResponse } from '@/types'
import { supabase } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 240000, // 4分钟超时
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  async (config) => {
    console.log('发送请求:', config.method?.toUpperCase(), config.url)
    
    // 获取当前会话并添加token
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
    
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    console.log('收到响应:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('响应错误:', error.response?.status, error.message)
    return Promise.reject(error)
  }
)

/**
 * 生成旅行计划
 */
export async function generateTripPlan(formData: TripFormData): Promise<TripPlanResponse> {
  try {
    const response = await apiClient.post<TripPlanResponse>('/api/trip/plan', formData)
    return response.data
  } catch (error: any) {
    console.error('生成旅行计划失败:', error)
    throw new Error(error.response?.data?.detail || error.message || '生成旅行计划失败')
  }
}

/**
 * 生成旅行计划（带实时日志流）
 */
export async function generateTripPlanWithLogs(
  formData: TripFormData,
  onLog: (message: string) => void
): Promise<TripPlanResponse> {
  try {
    // 获取token
    const { data: { session } } = await supabase.auth.getSession()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }

    const response = await fetch(`${API_BASE_URL}/api/trip/plan-stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify(formData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('无法读取响应流')
    }

    let result: any = null

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6))
          
          if (data.type === 'log') {
            onLog(data.message)
          } else if (data.type === 'result') {
            result = data.data
          } else if (data.type === 'error') {
            throw new Error(data.message)
          }
        }
      }
    }

    if (!result) {
      throw new Error('未收到结果数据')
    }

    return {
      success: true,
      message: '旅行计划生成成功',
      data: result
    }
  } catch (error: any) {
    console.error('生成旅行计划失败:', error)
    throw new Error(error.message || '生成旅行计划失败')
  }
}

/**
 * 健康检查
 */
export async function healthCheck(): Promise<any> {
  try {
    const response = await apiClient.get('/health')
    return response.data
  } catch (error: any) {
    console.error('健康检查失败:', error)
    throw new Error(error.message || '健康检查失败')
  }
}

/**
 * 获取用户的旅行规划历史记录
 */
export async function getTripHistory(): Promise<any> {
  try {
    const response = await apiClient.get('/api/trip/history')
    return response.data
  } catch (error: any) {
    console.error('获取历史记录失败:', error)
    throw new Error(error.response?.data?.detail || error.message || '获取历史记录失败')
  }
}

/**
 * 获取单个旅行规划的详细信息
 */
export async function getTripPlanById(id: string): Promise<TripPlanResponse> {
  try {
    const response = await apiClient.get(`/api/trip/${id}`)
    return response.data
  } catch (error: any) {
    console.error('获取旅行计划失败:', error)
    throw new Error(error.response?.data?.detail || error.message || '获取旅行计划失败')
  }
}

export default apiClient

