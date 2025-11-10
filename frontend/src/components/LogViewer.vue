<template>
  <div class="log-viewer">
    <div class="log-header">
      <span class="log-title">📋 实时日志</span>
      <a-button size="small" @click="clearLogs" type="text">清空</a-button>
    </div>
    <div class="log-content" ref="logContainer">
      <div
        v-for="(log, index) in logs"
        :key="index"
        class="log-line"
        :class="getLogClass(log)"
      >
        {{ log }}
      </div>
      <div v-if="logs.length === 0" class="log-empty">
        等待日志输出...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'

const logs = ref<string[]>([])
const logContainer = ref<HTMLElement | null>(null)

const addLog = (message: string) => {
  logs.value.push(message)
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
}

const clearLogs = () => {
  logs.value = []
}

const getLogClass = (log: string) => {
  if (log.includes('❌') || log.includes('失败')) {
    return 'log-error'
  } else if (log.includes('✅') || log.includes('成功') || log.includes('完成')) {
    return 'log-success'
  } else if (log.includes('⚠️') || log.includes('警告')) {
    return 'log-warning'
  } else if (log.includes('🚀') || log.includes('开始')) {
    return 'log-info'
  }
  return ''
}

defineExpose({
  addLog,
  clearLogs
})
</script>

<style scoped>
.log-viewer {
  background: #1e1e1e;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
}

.log-title {
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
}

.log-content {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.log-content::-webkit-scrollbar {
  width: 8px;
}

.log-content::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.log-content::-webkit-scrollbar-thumb {
  background: #4d4d4d;
  border-radius: 4px;
}

.log-content::-webkit-scrollbar-thumb:hover {
  background: #5d5d5d;
}

.log-line {
  color: #d4d4d4;
  padding: 4px 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.log-error {
  color: #f48771;
}

.log-success {
  color: #89d185;
}

.log-warning {
  color: #e5c07b;
}

.log-info {
  color: #61afef;
}

.log-empty {
  color: #888;
  text-align: center;
  padding: 40px 0;
  font-style: italic;
}
</style>
