<template>
  <div id="app">
    <a-layout style="min-height: 100vh">
      <a-layout-header style="background: #001529; padding: 0 50px; display: flex; align-items: center; justify-content: space-between">
        <div style="color: white; font-size: 24px; font-weight: bold">
          🌍 AI旅行规划师 (AI Travel Planner)
        </div>
        <a-space v-if="!authLoading">
          <span v-if="user" style="color: white; margin-right: 16px">
            👤 {{ user.email }}
          </span>
          <a-button v-if="user" type="primary" @click="handleLogout">
            登出
          </a-button>
          <a-button v-else type="primary" @click="goToLogin">
            登录/注册
          </a-button>
        </a-space>
      </a-layout-header>
      <a-layout-content style="padding: 24px">
        <router-view />
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        AI旅行规划师 ©2025 基于HelloAgents框架
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user, loading: authLoading, logout } = useAuth()

const goToLogin = () => {
  router.push('/login')
}

const handleLogout = async () => {
  try {
    await logout()
    message.success('已登出')
    if (router.currentRoute.value.path !== '/') {
      router.push('/')
    }
  } catch (error: any) {
    message.error(error.message || '登出失败')
  }
}
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif;
}
</style>

