<template>
  <div class="register-container">
    <div class="register-form-wrapper">
      <div class="logo-section">
        <h1>AI旅行规划师</h1>
        <p>创建新账户</p>
      </div>
      
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef" label-width="0">
        <el-form-item prop="name">
          <el-input 
            v-model="registerForm.name" 
            placeholder="请输入姓名" 
            prefix-icon="el-icon-User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="email">
          <el-input 
            v-model="registerForm.email" 
            placeholder="请输入邮箱" 
            prefix-icon="el-icon-Message"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="el-icon-Lock"
            :show-password="showPassword"
          />
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input 
            v-model="registerForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入密码" 
            prefix-icon="el-icon-Lock"
            :show-password="showPassword"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleRegister" 
            :loading="loading"
            style="width: 100%;"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-link">
        <span>已有账号？</span>
        <el-link type="primary" :underline="false" @click="goToLogin">立即登录</el-link>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
  name: 'RegisterPage',
  setup() {
    const router = useRouter()
    const store = useStore()
    
    // 表单数据
    const registerForm = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
    
    // 表单验证规则
    const rules = {
      name: [
        { required: true, message: '请输入姓名', trigger: 'blur' },
        { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== registerForm.password) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }
    
    // 响应式数据
    const showPassword = false
    const loading = false
    const registerFormRef = null
    
    // 模拟注册处理
    const handleRegister = async () => {
      if (!registerFormRef) return
      
      try {
        await registerFormRef.validate()
        // 模拟注册请求
        // const res = await store.dispatch('register', registerForm)
        
        // 模拟成功注册
        ElMessage.success('注册成功，请登录')
        
        // 跳转到登录页
        router.push('/login')
      } catch (error) {
        console.error('注册失败:', error)
        if (error !== false) {
          ElMessage.error('注册失败，请重试')
        }
      }
    }
    
    // 跳转到登录页
    const goToLogin = () => {
      router.push('/login')
    }
    
    return {
      registerForm,
      rules,
      showPassword,
      loading,
      registerFormRef,
      handleRegister,
      goToLogin
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--background-color);
  padding: var(--space-lg);
}

.register-form-wrapper {
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

.login-link {
  text-align: center;
  margin-top: var(--space-xl);
  color: var(--text-secondary);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .register-form-wrapper {
    padding: var(--space-xl);
  }
  
  .logo-section h1 {
    font-size: var(--font-size-xl);
  }
}
</style>