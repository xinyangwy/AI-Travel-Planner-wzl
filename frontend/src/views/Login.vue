<template>
  <div class="login-container">
    <div class="login-form">
      <h2 class="title">AI旅行规划助手</h2>
      <h3 class="subtitle">欢迎登录</h3>
      
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="0">
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="用户名/邮箱/手机号" 
            prefix-icon="el-icon-user"
          ></el-input>
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="密码" 
            prefix-icon="el-icon-lock"
            show-password
          ></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
          <div class="register-link">
            <router-link to="/register">注册账号</router-link>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            style="width: 100%" 
            :loading="loading" 
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        rememberMe: false
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名/邮箱/手机号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
        ]
      },
      loading: false,
      error: ''
    }
  },
  computed: {
    ...mapState(['error', 'loading'])
  },
  methods: {
    ...mapMutations(['SET_USER', 'SET_TOKEN']),
    async handleLogin() {
      try {
        await this.$refs.loginFormRef.validate()
        const response = await this.$store.dispatch('login', this.loginForm)
        
        // 如果记住我，存储token到localStorage，否则存储到sessionStorage
        if (this.loginForm.rememberMe) {
          localStorage.setItem('token', response.token)
          localStorage.setItem('user', JSON.stringify(response.user))
        } else {
          sessionStorage.setItem('token', response.token)
          sessionStorage.setItem('user', JSON.stringify(response.user))
        }
        
        // 登录成功后跳转到仪表盘
        this.$router.push('/dashboard')
      } catch (error) {
        this.error = this.$store.state.error || '登录失败，请检查用户名和密码'
      }
    }
  },
  mounted() {
    // 检查本地存储中是否有token，如果有则直接跳转到首页
    if (localStorage.getItem('token') || sessionStorage.getItem('token')) {
      this.$router.push('/dashboard')
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  background-image: linear-gradient(to right, #667eea 0%, #764ba2 100%);
}

.login-form {
  width: 400px;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  color: #409eff;
  margin-bottom: 10px;
}

.subtitle {
  text-align: center;
  color: #606266;
  margin-bottom: 30px;
}

.register-link {
  float: right;
}

.register-link a {
  color: #409eff;
  text-decoration: none;
}

.error-message {
  color: #f56c6c;
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
}
</style>