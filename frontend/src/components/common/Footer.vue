<template>
  <footer class="app-footer">
    <div class="footer-container">
      <!-- 左侧链接区域 -->
      <div class="footer-left">
        <div class="footer-links">
          <a href="#" class="footer-link" @click.prevent="openAbout">关于我们</a>
          <a href="#" class="footer-link" @click.prevent="openPrivacy">隐私政策</a>
          <a href="#" class="footer-link" @click.prevent="openTerms">服务条款</a>
          <a href="#" class="footer-link" @click.prevent="openHelp">帮助中心</a>
          <a href="#" class="footer-link" @click.prevent="openFeedback">意见反馈</a>
        </div>
      </div>

      <!-- 中间版权信息 -->
      <div class="footer-center">
        <div class="footer-logo">
          <i class="fas fa-paper-plane"></i>
          <span>AI旅行规划助手</span>
        </div>
        <div class="footer-copyright">
          &copy; {{ currentYear }} AI旅行规划助手 版权所有
        </div>
      </div>

      <!-- 右侧社交媒体和信息 -->
      <div class="footer-right">
        <div class="social-links">
          <a href="#" class="social-link" title="微信" @click.prevent="shareOnWechat">
            <i class="fab fa-weixin"></i>
          </a>
          <a href="#" class="social-link" title="微博" @click.prevent="shareOnWeibo">
            <i class="fab fa-weibo"></i>
          </a>
          <a href="#" class="social-link" title="QQ" @click.prevent="shareOnQQ">
            <i class="fab fa-qq"></i>
          </a>
          <a href="#" class="social-link" title="Github" @click.prevent="openGithub">
            <i class="fab fa-github"></i>
          </a>
          <a href="#" class="social-link" title="邮箱" @click.prevent="sendEmail">
            <i class="fas fa-envelope"></i>
          </a>
        </div>
        <div class="footer-info">
          <span class="footer-contact">联系电话: 400-123-4567</span>
        </div>
      </div>
    </div>

    <!-- 备案信息 -->
    <div class="footer-bottom">
      <div class="icp-info">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
          京ICP备XXXXXXXX号-X
        </a>
        <span>|</span>
        <a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=XXXXXXXXXXX" target="_blank" rel="noopener noreferrer">
          <img src="https://static.dingtalk.com/media/lALOAC7U8z2wMK8zNAfNAfQ_40_40.png" alt="备案图标" class="beian-icon">
          京公网安备XXXXXXXXXXXXXX号
        </a>
      </div>
    </div>

    <!-- 分享弹窗 -->
    <div class="share-modal" v-if="showShareModal">
      <div class="share-modal-content">
        <div class="share-modal-header">
          <h3>分享到 {{ sharePlatformName }}</h3>
          <button class="close-modal-btn" @click="closeShareModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="share-modal-body">
          <div class="qrcode-container" v-if="sharePlatform === 'wechat'">
            <div class="qrcode-placeholder">
              <i class="fab fa-weixin fa-5x"></i>
              <p>微信扫一扫分享</p>
            </div>
          </div>
          <div class="share-text" v-else>
            <p>{{ shareText }}</p>
          </div>
        </div>
        <div class="share-modal-footer">
          <button class="btn btn-default" @click="closeShareModal">取消</button>
          <button class="btn btn-primary" @click="confirmShare">确认分享</button>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  
  data() {
    return {
      showShareModal: false,
      sharePlatform: '',
      sharePlatformName: '',
      shareText: ''
    }
  },
  
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  },
  
  methods: {
    /**
     * 打开关于我们页面
     */
    openAbout() {
      this.$router.push('/about')
    },
    
    /**
     * 打开隐私政策页面
     */
    openPrivacy() {
      this.$router.push('/privacy')
    },
    
    /**
     * 打开服务条款页面
     */
    openTerms() {
      this.$router.push('/terms')
    },
    
    /**
     * 打开帮助中心页面
     */
    openHelp() {
      this.$router.push('/help')
    },
    
    /**
     * 打开意见反馈页面
     */
    openFeedback() {
      this.$router.push('/feedback')
    },
    
    /**
     * 打开Github页面
     */
    openGithub() {
      window.open('https://github.com/yourusername/ai-travel-planner', '_blank', 'noopener,noreferrer')
    },
    
    /**
     * 发送邮件
     */
    sendEmail() {
      window.location.href = 'mailto:contact@aitravelplanner.com?subject=反馈建议'
    },
    
    /**
     * 微信分享
     */
    shareOnWechat() {
      this.showShareModal = true
      this.sharePlatform = 'wechat'
      this.sharePlatformName = '微信'
      this.shareText = '快来试试AI旅行规划助手，智能规划您的完美旅行！'
    },
    
    /**
     * 微博分享
     */
    shareOnWeibo() {
      this.showShareModal = true
      this.sharePlatform = 'weibo'
      this.sharePlatformName = '微博'
      this.shareText = '快来试试AI旅行规划助手，智能规划您的完美旅行！ #AI旅行规划#'
    },
    
    /**
     * QQ分享
     */
    shareOnQQ() {
      this.showShareModal = true
      this.sharePlatform = 'qq'
      this.sharePlatformName = 'QQ'
      this.shareText = '快来试试AI旅行规划助手，智能规划您的完美旅行！'
    },
    
    /**
     * 关闭分享弹窗
     */
    closeShareModal() {
      this.showShareModal = false
    },
    
    /**
     * 确认分享
     */
    confirmShare() {
      // 实现分享逻辑
      console.log(`分享到${this.sharePlatformName}: ${this.shareText}`)
      
      if (this.sharePlatform === 'weibo') {
        const url = encodeURIComponent(window.location.href)
        const title = encodeURIComponent(this.shareText)
        window.open(`http://service.weibo.com/share/share.php?url=${url}&title=${title}`, '_blank', 'noopener,noreferrer')
      } else if (this.sharePlatform === 'qq') {
        const url = encodeURIComponent(window.location.href)
        const title = encodeURIComponent(this.shareText)
        window.open(`http://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}`, '_blank', 'noopener,noreferrer')
      }
      
      this.closeShareModal()
    }
  }
}
</script>

<style scoped>
.app-footer {
  background-color: #f5f5f5;
  color: #666;
  padding: 20px 0;
  margin-top: auto;
}

.dark-theme .app-footer {
  background-color: #1f1f1f;
  color: #999;
}

.footer-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-left,
.footer-center,
.footer-right {
  flex: 1;
}

/* 左侧链接区域 */
.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.footer-link {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #1890ff;
}

.dark-theme .footer-link {
  color: #999;
}

.dark-theme .footer-link:hover {
  color: #40a9ff;
}

/* 中间版权信息 */
.footer-center {
  text-align: center;
}

.footer-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 10px;
}

.footer-logo i {
  margin-right: 8px;
  font-size: 20px;
}

.footer-copyright {
  font-size: 14px;
  margin-bottom: 5px;
}

/* 右侧社交媒体和信息 */
.footer-right {
  text-align: right;
}

.social-links {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-bottom: 10px;
}

.social-link {
  color: #666;
  font-size: 18px;
  transition: color 0.2s;
}

.social-link:hover {
  color: #1890ff;
}

.dark-theme .social-link {
  color: #999;
}

.dark-theme .social-link:hover {
  color: #40a9ff;
}

.footer-info {
  font-size: 14px;
}

.footer-contact {
  margin-left: 10px;
}

/* 备案信息 */
.footer-bottom {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e8e8e8;
  text-align: center;
  font-size: 12px;
}

.dark-theme .footer-bottom {
  border-top-color: #333;
}

.icp-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.icp-info a {
  color: #666;
  text-decoration: none;
  transition: color 0.2s;
}

.icp-info a:hover {
  color: #1890ff;
}

.dark-theme .icp-info a {
  color: #999;
}

.dark-theme .icp-info a:hover {
  color: #40a9ff;
}

.beian-icon {
  width: 14px;
  height: 14px;
  vertical-align: middle;
  margin-right: 3px;
}

/* 分享弹窗 */
.share-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.share-modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease-out;
}

.dark-theme .share-modal-content {
  background-color: #262626;
  color: #fff;
}

.share-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.dark-theme .share-modal-header {
  border-bottom-color: #333;
}

.share-modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.close-modal-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.close-modal-btn:hover {
  color: #333;
}

.dark-theme .close-modal-btn:hover {
  color: #fff;
}

.share-modal-body {
  padding: 20px;
  text-align: center;
}

.qrcode-container {
  margin-bottom: 15px;
}

.qrcode-placeholder {
  width: 200px;
  height: 200px;
  background-color: #f5f5f5;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.dark-theme .qrcode-placeholder {
  background-color: #333;
  border-color: #555;
}

.qrcode-placeholder i {
  color: #1890ff;
  margin-bottom: 10px;
}

.qrcode-placeholder p {
  margin: 0;
  font-size: 14px;
}

.share-text {
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 15px;
}

.dark-theme .share-text {
  background-color: #333;
}

.share-text p {
  margin: 0;
  font-size: 14px;
}

.share-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #f0f0f0;
}

.dark-theme .share-modal-footer {
  border-top-color: #333;
}

.btn {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-default {
  background-color: #fff;
  border: 1px solid #d9d9d9;
  color: #333;
}

.btn-default:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-primary:hover {
  background-color: #40a9ff;
}

.dark-theme .btn-default {
  background-color: #333;
  border-color: #555;
  color: #fff;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-left,
  .footer-center,
  .footer-right {
    margin-bottom: 20px;
  }
  
  .footer-links {
    justify-content: center;
  }
  
  .social-links {
    justify-content: center;
    margin-bottom: 10px;
  }
  
  .footer-info {
    text-align: center;
  }
  
  .footer-contact {
    margin-left: 0;
  }
  
  .icp-info {
    flex-direction: column;
    gap: 5px;
  }
}

@media (max-width: 480px) {
  .footer-links {
    flex-direction: column;
    gap: 8px;
  }
  
  .footer-logo {
    font-size: 16px;
  }
  
  .social-links {
    gap: 15px;
  }
  
  .social-link {
    font-size: 20px;
  }
}
</style>