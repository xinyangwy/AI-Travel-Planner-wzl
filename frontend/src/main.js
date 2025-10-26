import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(ElementPlus)

// 请求拦截器 - 统一处理token
import axios from 'axios'

axios.defaults.baseURL = '/api'

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器 - 统一处理错误
axios.interceptors.response.use(response => {
  return response.data
}, error => {
  if (error.response) {
    if (error.response.status === 401) {
      // token失效，清除本地存储并重定向到登录
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
  }
  return Promise.reject(error)
})

app.config.globalProperties.$axios = axios
app.mount('#app')