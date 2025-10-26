<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <div class="logo-section">
        <h1>AI旅行规划师</h1>
        <p>登录您的账户</p>
      </div>
      
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="0">
        <el-form-item prop="email">
          <el-input 
            v-model="loginForm.email" 
            placeholder="请输入邮箱" 
            prefix-icon="el-icon-Message"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="el-icon-Lock"
            :show-password="showPassword"
          />
        </el-form-item>
        
        <div class="form-options">
          <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
          <el-link type="primary" :underline="false">忘记密码？</el-link>
        </div>
        
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleLogin" 
            :loading="loading"
            style="width: 100%;"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="register-link">
        <span>还没有账号？</span>
        <el-link type="primary" :underline="false" @click="goToRegister">立即注册</el-link>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    
    // 表单数据
    const loginForm = {
      email: '',
      password: '',
      rememberMe: false
    }
    
    // 表单验证规则
    const rules = {
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
      ]
    }
    
    // 响应式数据
    const showPassword = false
    const loading = false
    const loginFormRef = null
    
    // 模拟登录处理
    const handleLogin = async () => {
      if (!loginFormRef) return
      
      try {
        await loginFormRef.validate()
        // 模拟登录请求
        // const res = await store.dispatch('login', loginForm)
        
        // 模拟成功登录
        const mockToken = 'mock_jwt_token_' + Date.now()
        const mockUser = {
          id: 1,
          email: loginForm.email,
          name: '用户' + loginForm.email.split('@')[0]
        }
        
        // 保存到 store
        store.commit('SET_TOKEN', mockToken)
        store.commit('SET_USER', mockUser)
        
        // 保存到本地存储
        localStorage.setItem('token', mockToken)
        if (loginForm.rememberMe) {
          localStorage.setItem('user', JSON.stringify(mockUser))
        } else {
          sessionStorage.setItem('user', JSON.stringify(mockUser))
        }
        
        ElMessage.success('登录成功')
        
        // 跳转到重定向页面或首页
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      } catch (error) {
        console.error('登录失败:', error)
        if (error !== false) {
          ElMessage.error('登录失败，请重试')
        }
      }
    }
    
    // 跳转到注册页
    const goToRegister = () => {
      router.push('/register')
    }
    
    return {
      loginForm,
      rules,
      showPassword,
      loading,
      loginFormRef,
      handleLogin,
      goToRegister
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--background-color);
  padding: var(--space-lg);
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
  background-color: var(--white-color);
  border-radius: var(--border-radius-lg);
  padding: var(--space-2xl);
  box-shadow: var(--box-shadow-lg);
}

.logo-section {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.logo-section h1 {
  font-size: var(--font-size-2xl);
  color: var(--primary-color);
  margin-bottom: var(--space-sm);
}

.logo-section p {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.register-link {
  text-align: center;
  margin-top: var(--space-xl);
  color: var(--text-secondary);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-form-wrapper {
    padding: var(--space-xl);
  }
  
  .logo-section h1 {
    font-size: var(--font-size-xl);
  }
}
</style>