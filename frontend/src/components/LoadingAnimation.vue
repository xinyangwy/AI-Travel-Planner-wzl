<template>
  <div class="loading-container" :class="{ 'full-screen': fullScreen }">
    <div class="loading-content">
      <div class="loading-spinner" :class="spinnerType">
        <div v-if="spinnerType === 'dots'" class="dots-container">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        <div v-else-if="spinnerType === 'ring'" class="ring-container">
          <div class="ring"></div>
        </div>
        <div v-else-if="spinnerType === 'wave'" class="wave-container">
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
        </div>
        <el-icon v-else class="icon-spinner">
          <Loading />
        </el-icon>
      </div>
      <div v-if="message" class="loading-message">{{ message }}</div>
      <div v-if="progress !== undefined && showProgress" class="loading-progress">
        <el-progress :percentage="progress" :stroke-width="4" />
      </div>
    </div>
  </div>
</template>

<script>
import { Loading } from '@element-plus/icons-vue'

export default {
  name: 'LoadingAnimation',
  components: {
    Loading
  },
  props: {
    // 是否全屏显示
    fullScreen: {
      type: Boolean,
      default: false
    },
    // 加载消息
    message: {
      type: String,
      default: ''
    },
    // 加载动画类型: 'dots', 'ring', 'wave', 'icon'
    spinnerType: {
      type: String,
      default: 'dots',
      validator: (value) => ['dots', 'ring', 'wave', 'icon'].includes(value)
    },
    // 显示进度条
    showProgress: {
      type: Boolean,
      default: false
    },
    // 进度值 (0-100)
    progress: {
      type: Number,
      default: undefined,
      validator: (value) => value === undefined || (value >= 0 && value <= 100)
    }
  }
}
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.full-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
}

/* 点状加载动画 */
.dots-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #409EFF;
  animation: dotBounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes dotBounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 环形加载动画 */
.ring-container {
  position: relative;
  width: 40px;
  height: 40px;
}

.ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid rgba(64, 158, 255, 0.2);
  border-top-color: #409EFF;
  border-radius: 50%;
  animation: ringSpin 1s linear infinite;
}

@keyframes ringSpin {
  to {
    transform: rotate(360deg);
  }
}

/* 波浪加载动画 */
.wave-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 30px;
}

.wave {
  width: 5px;
  height: 100%;
  background-color: #409EFF;
  border-radius: 3px;
  animation: waveStretch 1.2s ease-in-out infinite;
}

.wave:nth-child(1) {
  animation-delay: -1.2s;
}

.wave:nth-child(2) {
  animation-delay: -1.1s;
}

.wave:nth-child(3) {
  animation-delay: -1s;
}

.wave:nth-child(4) {
  animation-delay: -0.9s;
}

@keyframes waveStretch {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}

/* 图标加载动画 */
.icon-spinner {
  font-size: 40px;
  color: #409EFF;
  animation: iconSpin 1s linear infinite;
}

@keyframes iconSpin {
  to {
    transform: rotate(360deg);
  }
}

/* 加载消息 */
.loading-message {
  color: #606266;
  font-size: 14px;
  text-align: center;
}

/* 进度条 */
.loading-progress {
  width: 180px;
}
</style>