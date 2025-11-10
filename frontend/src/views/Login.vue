<template>
  <div class="login-container">
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="login-card">
      <div class="login-header">
        <span class="icon">🌍</span>
        <h1>AI旅行规划师</h1>
        <p>{{ isLogin ? '欢迎回来' : '创建新账户' }}</p>
      </div>

      <a-form
        :model="formData"
        layout="vertical"
        @finish="handleSubmit"
        class="login-form"
      >
        <a-form-item
          name="email"
          :rules="[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]"
        >
          <a-input
            v-model:value="formData.email"
            placeholder="邮箱"
            size="large"
            prefix="📧"
          />
        </a-form-item>

        <a-form-item
          name="password"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6位' }
          ]"
        >
          <a-input-password
            v-model:value="formData.password"
            placeholder="密码"
            size="large"
            prefix="🔒"
          />
        </a-form-item>

        <a-form-item v-if="!isLogin" name="confirmPassword">
          <a-input-password
            v-model:value="formData.confirmPassword"
            placeholder="确认密码"
            size="large"
            prefix="🔒"
          />
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            :loading="loading"
            size="large"
            block
            class="submit-button"
          >
            {{ isLogin ? '登录' : '注册' }}
          </a-button>
        </a-form-item>

        <a-form-item>
          <div class="switch-mode">
            <span>{{ isLogin ? '还没有账户？' : '已有账户？' }}</span>
            <a-button type="link" @click="toggleMode" class="switch-button">
              {{ isLogin ? '立即注册' : '立即登录' }}
            </a-button>
          </div>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { authService } from '@/services/auth'

const router = useRouter()
const isLogin = ref(true)
const loading = ref(false)

const formData = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  formData.email = ''
  formData.password = ''
  formData.confirmPassword = ''
}

const handleSubmit = async () => {
  if (!isLogin.value && formData.password !== formData.confirmPassword) {
    message.error('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    if (isLogin.value) {
      await authService.signIn(formData.email, formData.password)
      message.success('登录成功')
      router.push('/')
    } else {
      await authService.signUp(formData.email, formData.password)
      message.success('注册成功，请检查邮箱验证')
      // 注册后自动登录
      setTimeout(() => {
        router.push('/')
      }, 1000)
    }
  } catch (error: any) {
    message.error(error.message || (isLogin.value ? '登录失败' : '注册失败'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  top: 50%;
  right: -50px;
  animation-delay: 5s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  bottom: -50px;
  left: 30%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
  }
}

.login-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header .icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.login-header h1 {
  font-size: 32px;
  font-weight: 800;
  color: #333;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.login-form :deep(.ant-input),
.login-form :deep(.ant-input-password) {
  border-radius: 12px;
  border: 2px solid #e8e8e8;
}

.login-form :deep(.ant-input:hover),
.login-form :deep(.ant-input-password:hover) {
  border-color: #667eea;
}

.login-form :deep(.ant-input:focus),
.login-form :deep(.ant-input-password:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.submit-button {
  height: 48px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
}

.switch-mode {
  text-align: center;
  color: #666;
}

.switch-button {
  padding: 0;
  height: auto;
  font-weight: 600;
}
</style>



