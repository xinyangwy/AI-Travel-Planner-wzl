import { ref, onMounted } from 'vue'
import { authService, type User } from '@/services/auth'

const user = ref<User | null>(null)
const loading = ref(true)

export const useAuth = () => {
  // 初始化认证状态
  const initAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      user.value = currentUser as User | null
    } catch (error) {
      console.error('获取用户信息失败:', error)
      user.value = null
    } finally {
      loading.value = false
    }
  }

  // 登录
  const login = async (email: string, password: string) => {
    const data = await authService.signIn(email, password)
    user.value = data.user as User
    return data
  }

  // 注册
  const register = async (email: string, password: string) => {
    const data = await authService.signUp(email, password)
    if (data.user) {
      user.value = data.user as User
    }
    return data
  }

  // 登出
  const logout = async () => {
    await authService.signOut()
    user.value = null
  }

  // 监听认证状态变化
  onMounted(() => {
    initAuth()
    
    // 监听认证状态变化
    authService.onAuthStateChange((currentUser) => {
      user.value = currentUser
      loading.value = false
    })
  })

  return {
    user,
    loading,
    login,
    register,
    logout,
    initAuth
  }
}



