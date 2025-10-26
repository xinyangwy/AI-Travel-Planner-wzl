<template>
  <div class="user-center-container">
    <!-- 页面标题 -->
    <div class="user-center-header">
      <h1 class="user-center-title">用户中心</h1>
      <div class="user-center-subtitle">管理您的个人信息和偏好设置</div>
    </div>
    
    <!-- 用户中心主体内容 -->
    <div class="user-center-body">
      <!-- 侧边导航栏 -->
      <aside class="user-center-sidebar">
        <div class="user-profile-card">
          <!-- 用户头像 -->
          <div class="user-avatar-container">
            <div class="user-avatar">
              <img :src="userInfo.avatar || defaultAvatar" :alt="userInfo.username" />
              <div class="user-avatar-edit" @click="showAvatarUpload = true">
                <i class="user-icon-edit"></i>
              </div>
            </div>
          </div>
          
          <!-- 用户信息 -->
          <div class="user-profile-info">
            <h3 class="user-profile-name">{{ userInfo.username }}</h3>
            <p class="user-profile-email">{{ userInfo.email }}</p>
            <div class="user-profile-level">
              <span class="user-level-badge">Lv.{{ userInfo.level || 1 }}</span>
              <ProgressBar 
                :percentage="userExperiencePercentage" 
                :showText="false"
                :height="4"
                :status="'primary'"
                size="small"
                class="user-level-progress"
              />
            </div>
          </div>
        </div>
        
        <!-- 导航菜单 -->
        <nav class="user-nav">
          <div 
            v-for="(item, index) in navItems" 
            :key="index"
            class="user-nav-item"
            :class="{ 'user-nav-item-active': activeTab === item.key }"
            @click="switchTab(item.key)"
          >
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </div>
        </nav>
      </aside>
      
      <!-- 主内容区域 -->
      <main class="user-center-main">
        <!-- 基本信息 -->
        <div v-if="activeTab === 'basic-info'" class="user-tab-content">
          <Card title="基本信息" class="user-info-card">
            <form @submit.prevent="updateBasicInfo" class="user-info-form">
              <div class="user-form-row">
                <div class="user-form-group">
                  <FormInput
                    v-model="basicInfo.username"
                    label="用户名"
                    type="text"
                    :placeholder="'请输入用户名'"
                    :required="true"
                    :errorMessage="basicInfoErrors.username"
                    :disabled="basicInfoLoading"
                    class="user-form-input"
                  />
                </div>
                <div class="user-form-group">
                  <FormInput
                    v-model="basicInfo.nickname"
                    label="昵称"
                    type="text"
                    :placeholder="'请输入昵称'"
                    :errorMessage="basicInfoErrors.nickname"
                    :disabled="basicInfoLoading"
                    class="user-form-input"
                  />
                </div>
              </div>
              
              <div class="user-form-row">
                <div class="user-form-group">
                  <FormInput
                    v-model="basicInfo.email"
                    label="邮箱"
                    type="email"
                    :placeholder="'请输入邮箱'"
                    :required="true"
                    :errorMessage="basicInfoErrors.email"
                    :disabled="basicInfoLoading"
                    class="user-form-input"
                  />
                </div>
                <div class="user-form-group">
                  <FormInput
                    v-model="basicInfo.phone"
                    label="手机号码"
                    type="tel"
                    :placeholder="'请输入手机号码'"
                    :errorMessage="basicInfoErrors.phone"
                    :disabled="basicInfoLoading"
                    class="user-form-input"
                  />
                </div>
              </div>
              
              <div class="user-form-row">
                <div class="user-form-group user-form-group-full">
                  <FormInput
                    v-model="basicInfo.bio"
                    label="个人简介"
                    type="textarea"
                    :placeholder="'介绍一下自己吧'"
                    :rows="3"
                    :maxLength="200"
                    :errorMessage="basicInfoErrors.bio"
                    :disabled="basicInfoLoading"
                    class="user-form-input"
                  >
                    <template #suffix>
                      <span class="user-form-counter">{{ basicInfo.bio.length }}/200</span>
                    </template>
                  </FormInput>
                </div>
              </div>
              
              <div class="user-form-actions">
                <Button 
                  type="button" 
                  variant="default" 
                  @click="resetBasicInfo"
                  :disabled="basicInfoLoading"
                  class="user-form-button"
                >
                  重置
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  :loading="basicInfoLoading"
                  class="user-form-button"
                >
                  保存修改
                </Button>
              </div>
            </form>
          </Card>
        </div>
        
        <!-- 安全设置 -->
        <div v-if="activeTab === 'security'" class="user-tab-content">
          <Card title="安全设置" class="user-info-card">
            <div class="security-section">
              <h3 class="security-section-title">账号安全</h3>
              
              <div class="security-item">
                <div class="security-item-label">
                  <i class="security-icon-password"></i>
                  <span>修改密码</span>
                </div>
                <div class="security-item-value">
                  <Button 
                    type="button" 
                    variant="link" 
                    @click="showChangePasswordDialog = true"
                    :disabled="passwordLoading"
                  >
                    修改
                  </Button>
                </div>
              </div>
              
              <div class="security-item">
                <div class="security-item-label">
                  <i class="security-icon-email"></i>
                  <span>邮箱验证</span>
                </div>
                <div class="security-item-value">
                  <span v-if="userInfo.emailVerified" class="security-status-verified">已验证</span>
                  <span v-else class="security-status-unverified">未验证</span>
                  <Button 
                    type="button" 
                    variant="link" 
                    @click="sendVerificationEmail"
                    :disabled="emailVerifyLoading"
                    class="security-action-button"
                  >
                    {{ userInfo.emailVerified ? '重新发送' : '验证邮箱' }}
                  </Button>
                </div>
              </div>
              
              <div class="security-item">
                <div class="security-item-label">
                  <i class="security-icon-phone"></i>
                  <span>手机验证</span>
                </div>
                <div class="security-item-value">
                  <span v-if="userInfo.phoneVerified" class="security-status-verified">已验证</span>
                  <span v-else class="security-status-unverified">未验证</span>
                  <Button 
                    type="button" 
                    variant="link" 
                    @click="verifyPhone"
                    :disabled="phoneVerifyLoading || !basicInfo.phone"
                    class="security-action-button"
                  >
                    {{ userInfo.phoneVerified ? '重新验证' : '验证手机' }}
                  </Button>
                </div>
              </div>
            </div>
            
            <div class="security-section security-section-mt">
              <h3 class="security-section-title">登录安全</h3>
              
              <div class="security-item">
                <div class="security-item-label">
                  <i class="security-icon-2fa"></i>
                  <span>两步验证</span>
                </div>
                <div class="security-item-value">
                  <span class="security-status-unverified">未开启</span>
                  <Button 
                    type="button" 
                    variant="link" 
                    @click="showTwoFactorDialog = true"
                    :disabled="twoFactorLoading"
                    class="security-action-button"
                  >
                    开启
                  </Button>
                </div>
              </div>
              
              <div class="security-item">
                <div class="security-item-label">
                  <i class="security-icon-login-history"></i>
                  <span>登录历史</span>
                </div>
                <div class="security-item-value">
                  <Button 
                    type="button" 
                    variant="link" 
                    @click="showLoginHistory = true"
                    :disabled="loginHistoryLoading"
                  >
                    查看
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <!-- 偏好设置 -->
        <div v-if="activeTab === 'preferences'" class="user-tab-content">
          <Card title="偏好设置" class="user-info-card">
            <form @submit.prevent="updatePreferences" class="preferences-form">
              <div class="preferences-section">
                <h3 class="preferences-section-title">界面设置</h3>
                
                <div class="preferences-item">
                  <div class="preferences-item-label">
                    <span>主题颜色</span>
                  </div>
                  <div class="preferences-item-value preferences-theme-colors">
                    <div 
                      v-for="theme in themeOptions" 
                      :key="theme.value"
                      class="preferences-theme-color"
                      :class="{ 'preferences-theme-color-active': preferences.theme === theme.value }"
                      :style="{ backgroundColor: theme.color }"
                      @click="preferences.theme = theme.value"
                      :title="theme.label"
                    ></div>
                  </div>
                </div>
                
                <div class="preferences-item">
                  <div class="preferences-item-label">
                    <span>字体大小</span>
                  </div>
                  <div class="preferences-item-value preferences-font-size">
                    <input 
                      type="range" 
                      min="12" 
                      max="18" 
                      v-model.number="preferences.fontSize"
                      @input="updateFontSize"
                      :disabled="preferencesLoading"
                      class="preferences-range"
                    />
                    <span class="preferences-font-size-value">{{ preferences.fontSize }}px</span>
                  </div>
                </div>
              </div>
              
              <div class="preferences-section preferences-section-mt">
                <h3 class="preferences-section-title">通知设置</h3>
                
                <div class="preferences-item">
                  <div class="preferences-item-label">
                    <span>接收邮件通知</span>
                  </div>
                  <div class="preferences-item-value">
                    <input 
                      type="checkbox" 
                      v-model="preferences.emailNotifications"
                      :disabled="preferencesLoading"
                    />
                  </div>
                </div>
                
                <div class="preferences-item">
                  <div class="preferences-item-label">
                    <span>接收消息通知</span>
                  </div>
                  <div class="preferences-item-value">
                    <input 
                      type="checkbox" 
                      v-model="preferences.messageNotifications"
                      :disabled="preferencesLoading"
                    />
                  </div>
                </div>
                
                <div class="preferences-item">
                  <div class="preferences-item-label">
                    <span>接收活动通知</span>
                  </div>
                  <div class="preferences-item-value">
                    <input 
                      type="checkbox" 
                      v-model="preferences.promotionNotifications"
                      :disabled="preferencesLoading"
                    />
                  </div>
                </div>
              </div>
              
              <div class="preferences-section preferences-section-mt">
                <h3 class="preferences-section-title">旅行偏好</h3>
                
                <div class="preferences-item">
                  <div class="preferences-item-label">
                    <span>常用旅行方式</span>
                  </div>
                  <div class="preferences-item-value preferences-travel-modes">
                    <label 
                      v-for="mode in travelModeOptions" 
                      :key="mode.value"
                      class="preferences-travel-mode"
                    >
                      <input 
                        type="checkbox" 
                        :value="mode.value"
                        v-model="preferences.travelModes"
                        :disabled="preferencesLoading"
                      />
                      <span>{{ mode.label }}</span>
                    </label>
                  </div>
                </div>
                
                <div class="preferences-item">
                  <div class="preferences-item-label">
                    <span>旅行预算范围</span>
                  </div>
                  <div class="preferences-item-value preferences-budget">
                    <FormInput
                      v-model="preferences.budgetRange.min"
                      type="number"
                      :placeholder="'最低'"
                      :disabled="preferencesLoading"
                      class="preferences-budget-input"
                    />
                    <span class="preferences-budget-separator">-</span>
                    <FormInput
                      v-model="preferences.budgetRange.max"
                      type="number"
                      :placeholder="'最高'"
                      :disabled="preferencesLoading"
                      class="preferences-budget-input"
                    />
                    <span class="preferences-budget-unit">元</span>
                  </div>
                </div>
              </div>
              
              <div class="user-form-actions">
                <Button 
                  type="button" 
                  variant="default" 
                  @click="resetPreferences"
                  :disabled="preferencesLoading"
                  class="user-form-button"
                >
                  重置
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  :loading="preferencesLoading"
                  class="user-form-button"
                >
                  保存设置
                </Button>
              </div>
            </form>
          </Card>
        </div>
        
        <!-- 账号管理 -->
        <div v-if="activeTab === 'account'" class="user-tab-content">
          <Card title="账号管理" class="user-info-card">
            <div class="account-section">
              <h3 class="account-section-title">账号操作</h3>
              
              <div class="account-item account-danger-item">
                <div class="account-item-label">
                  <i class="account-icon-delete"></i>
                  <span>注销账号</span>
                </div>
                <div class="account-item-value">
                  <Button 
                    type="button" 
                    variant="danger" 
                    @click="showDeleteAccountDialog = true"
                    :disabled="accountDeleteLoading"
                  >
                    注销
                  </Button>
                </div>
              </div>
            </div>
            
            <div class="account-section account-section-mt">
              <h3 class="account-section-title">账号信息</h3>
              
              <div class="account-info-item">
                <span class="account-info-label">账号创建时间：</span>
                <span class="account-info-value">{{ formatDate(userInfo.createdAt) }}</span>
              </div>
              
              <div class="account-info-item">
                <span class="account-info-label">最后登录时间：</span>
                <span class="account-info-value">{{ formatDate(userInfo.lastLoginAt) }}</span>
              </div>
              
              <div class="account-info-item">
                <span class="account-info-label">账号状态：</span>
                <span class="account-status-active">正常</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
    
    <!-- 头像上传弹窗 -->
    <ConfirmDialog 
      v-if="showAvatarUpload" 
      :title="'更换头像'" 
      :visible="showAvatarUpload"
      :width="400"
      :footer="false"
      @close="showAvatarUpload = false"
    >
      <div class="avatar-upload-content">
        <div class="avatar-upload-preview">
          <img :src="previewAvatar" alt="头像预览" class="avatar-preview-image" />
        </div>
        <div class="avatar-upload-actions">
          <input 
            type="file" 
            ref="avatarInput" 
            accept="image/*" 
            style="display: none"
            @change="handleAvatarChange"
          />
          <Button 
            type="button" 
            variant="primary" 
            @click="$refs.avatarInput.click()"
            :disabled="avatarUploading"
          >
            选择图片
          </Button>
          <Button 
            type="button" 
            variant="default" 
            @click="uploadAvatar"
            :loading="avatarUploading"
            :disabled="!avatarFile || avatarUploading"
          >
            上传
          </Button>
          <Button 
            type="button" 
            variant="link" 
            @click="showAvatarUpload = false"
            :disabled="avatarUploading"
          >
            取消
          </Button>
        </div>
        <p class="avatar-upload-tip">支持 JPG、PNG、GIF 格式，大小不超过 2MB</p>
      </div>
    </ConfirmDialog>
    
    <!-- 修改密码弹窗 -->
    <ConfirmDialog 
      v-if="showChangePasswordDialog" 
      :title="'修改密码'" 
      :visible="showChangePasswordDialog"
      :width="400"
      :footer="false"
      @close="closeChangePasswordDialog"
    >
      <form @submit.prevent="changePassword" class="change-password-form">
        <div class="form-group">
          <FormInput
            v-model="passwordForm.oldPassword"
            label="当前密码"
            type="password"
            :placeholder="'请输入当前密码'"
            :required="true"
            :errorMessage="passwordErrors.oldPassword"
            :disabled="passwordLoading"
          />
        </div>
        <div class="form-group">
          <FormInput
            v-model="passwordForm.newPassword"
            label="新密码"
            type="password"
            :placeholder="'请输入新密码'"
            :required="true"
            :minLength="6"
            :errorMessage="passwordErrors.newPassword"
            :disabled="passwordLoading"
          />
        </div>
        <div class="form-group">
          <FormInput
            v-model="passwordForm.confirmPassword"
            label="确认新密码"
            type="password"
            :placeholder="'请再次输入新密码'"
            :required="true"
            :errorMessage="passwordErrors.confirmPassword"
            :disabled="passwordLoading"
          />
        </div>
        <div class="form-actions">
          <Button 
            type="button" 
            variant="default" 
            @click="closeChangePasswordDialog"
            :disabled="passwordLoading"
          >
            取消
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            :loading="passwordLoading"
          >
            确认修改
          </Button>
        </div>
      </form>
    </ConfirmDialog>
    
    <!-- 删除账号确认弹窗 -->
    <ConfirmDialog 
      v-if="showDeleteAccountDialog" 
      :title="'注销账号'" 
      :visible="showDeleteAccountDialog"
      :width="450"
      :type="'error'"
      :confirmText="'确认注销'"
      :cancelText="'取消'"
      @close="showDeleteAccountDialog = false"
      @confirm="deleteAccount"
    >
      <div class="delete-account-content">
        <p class="delete-account-warning">⚠️ 注销账号将导致以下后果：</p>
        <ul class="delete-account-consequences">
          <li>账号内的所有数据将被永久删除，无法恢复</li>
          <li>您的个人信息将从系统中移除</li>
          <li>所有旅行计划和收藏将被删除</li>
          <li>该操作无法撤销，请谨慎操作</li>
        </ul>
        <div class="delete-account-verification">
          <FormInput
            v-model="deleteAccountVerify"
            label="确认注销"
            type="text"
            :placeholder="'请输入"确认注销"以继续'"
            :disabled="accountDeleteLoading"
          />
        </div>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { Card, FormInput, Button, ProgressBar, ConfirmDialog } from '../components'
import dayjs from 'dayjs'

export default {
  name: 'UserCenter',
  
  components: {
    Card,
    FormInput,
    Button,
    ProgressBar,
    ConfirmDialog
  },
  
  data() {
    return {
      // 当前选中的标签页
      activeTab: 'basic-info',
      // 默认头像
      defaultAvatar: '/assets/images/default-avatar.png',
      // 侧边栏导航项
      navItems: [
        { key: 'basic-info', label: '基本信息', icon: 'user-icon-user' },
        { key: 'security', label: '安全设置', icon: 'user-icon-lock' },
        { key: 'preferences', label: '偏好设置', icon: 'user-icon-settings' },
        { key: 'account', label: '账号管理', icon: 'user-icon-account' }
      ],
      
      // 基本信息表单
      basicInfo: {
        username: '',
        nickname: '',
        email: '',
        phone: '',
        bio: ''
      },
      basicInfoErrors: {
        username: '',
        nickname: '',
        email: '',
        phone: '',
        bio: ''
      },
      basicInfoLoading: false,
      
      // 密码表单
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordErrors: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordLoading: false,
      
      // 偏好设置
      preferences: {
        theme: 'default',
        fontSize: 14,
        emailNotifications: true,
        messageNotifications: true,
        promotionNotifications: false,
        travelModes: ['airplane', 'train'],
        budgetRange: {
          min: 0,
          max: 5000
        }
      },
      preferencesLoading: false,
      
      // 主题选项
      themeOptions: [
        { label: '默认蓝色', value: 'default', color: '#1890ff' },
        { label: '绿色', value: 'green', color: '#52c41a' },
        { label: '橙色', value: 'orange', color: '#fa8c16' },
        { label: '紫色', value: 'purple', color: '#722ed1' },
        { label: '红色', value: 'red', color: '#f5222d' }
      ],
      
      // 旅行方式选项
      travelModeOptions: [
        { label: '飞机', value: 'airplane' },
        { label: '火车', value: 'train' },
        { label: '汽车', value: 'car' },
        { label: '轮船', value: 'ship' },
        { label: '自行车', value: 'bike' },
        { label: '步行', value: 'walk' }
      ],
      
      // 弹窗状态
      showAvatarUpload: false,
      showChangePasswordDialog: false,
      showTwoFactorDialog: false,
      showLoginHistory: false,
      showDeleteAccountDialog: false,
      
      // 头像上传
      avatarFile: null,
      previewAvatar: '',
      avatarUploading: false,
      
      // 账号删除
      deleteAccountVerify: '',
      accountDeleteLoading: false,
      
      // 其他状态
      emailVerifyLoading: false,
      phoneVerifyLoading: false,
      twoFactorLoading: false,
      loginHistoryLoading: false
    }
  },
  
  computed: {
    // 从Vuex获取用户信息
    ...mapState('user', ['userInfo']),
    
    // 计算用户经验百分比
    userExperiencePercentage() {
      const currentExp = this.userInfo.experience || 0
      const currentLevel = this.userInfo.level || 1
      const expNeeded = currentLevel * 100 // 假设每级需要100经验
      return Math.min((currentExp % expNeeded) / expNeeded * 100, 100)
    }
  },
  
  created() {
    // 获取用户信息
    this.loadUserInfo()
  },
  
  mounted() {
    // 设置初始字体大小
    this.updateFontSize()
  },
  
  methods: {
    // 从Vuex导入actions
    ...mapActions('user', [
      'getUserInfo', 
      'updateUserInfo', 
      'changeUserPassword',
      'uploadUserAvatar',
      'deleteUserAccount'
    ]),
    
    // 加载用户信息
    async loadUserInfo() {
      try {
        await this.getUserInfo()
        
        // 初始化基本信息表单
        this.basicInfo = {
          username: this.userInfo.username || '',
          nickname: this.userInfo.nickname || '',
          email: this.userInfo.email || '',
          phone: this.userInfo.phone || '',
          bio: this.userInfo.bio || ''
        }
        
        // 初始化预览头像
        this.previewAvatar = this.userInfo.avatar || this.defaultAvatar
      } catch (error) {
        console.error('获取用户信息失败:', error)
        this.$notification.error({
          title: '获取失败',
          message: '无法获取用户信息，请刷新页面重试',
          duration: 3000
        })
      }
    },
    
    // 切换标签页
    switchTab(tab) {
      this.activeTab = tab
    },
    
    // 重置基本信息
    resetBasicInfo() {
      this.basicInfo = {
        username: this.userInfo.username || '',
        nickname: this.userInfo.nickname || '',
        email: this.userInfo.email || '',
        phone: this.userInfo.phone || '',
        bio: this.userInfo.bio || ''
      }
      this.basicInfoErrors = {
        username: '',
        nickname: '',
        email: '',
        phone: '',
        bio: ''
      }
    },
    
    // 更新基本信息
    async updateBasicInfo() {
      // 表单验证
      if (!this.validateBasicInfo()) {
        return
      }
      
      this.basicInfoLoading = true
      
      try {
        await this.updateUserInfo(this.basicInfo)
        
        this.$notification.success({
          title: '更新成功',
          message: '个人信息已成功更新',
          duration: 3000
        })
        
        // 重新加载用户信息
        await this.getUserInfo()
      } catch (error) {
        console.error('更新用户信息失败:', error)
        this.$notification.error({
          title: '更新失败',
          message: error.message || '无法更新个人信息，请重试',
          duration: 3000
        })
      } finally {
        this.basicInfoLoading = false
      }
    },
    
    // 验证基本信息
    validateBasicInfo() {
      this.basicInfoErrors = {
        username: '',
        nickname: '',
        email: '',
        phone: '',
        bio: ''
      }
      
      let isValid = true
      
      // 验证用户名
      if (!this.basicInfo.username.trim()) {
        this.basicInfoErrors.username = '请输入用户名'
        isValid = false
      } else if (this.basicInfo.username.length < 4) {
        this.basicInfoErrors.username = '用户名长度不能少于4位'
        isValid = false
      }
      
      // 验证邮箱
      if (!this.basicInfo.email.trim()) {
        this.basicInfoErrors.email = '请输入邮箱地址'
        isValid = false
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(this.basicInfo.email)) {
          this.basicInfoErrors.email = '请输入有效的邮箱地址'
          isValid = false
        }
      }
      
      // 验证手机号
      if (this.basicInfo.phone && !/^1[3-9]\d{9}$/.test(this.basicInfo.phone)) {
        this.basicInfoErrors.phone = '请输入有效的手机号码'
        isValid = false
      }
      
      return isValid
    },
    
    // 处理头像选择
    handleAvatarChange(event) {
      const file = event.target.files[0]
      if (!file) return
      
      // 检查文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        this.$notification.error({
          title: '文件类型错误',
          message: '只支持 JPG、PNG、GIF 格式的图片',
          duration: 3000
        })
        return
      }
      
      // 检查文件大小（2MB）
      if (file.size > 2 * 1024 * 1024) {
        this.$notification.error({
          title: '文件太大',
          message: '图片大小不能超过 2MB',
          duration: 3000
        })
        return
      }
      
      this.avatarFile = file
      
      // 生成预览
      const reader = new FileReader()
      reader.onload = e => {
        this.previewAvatar = e.target.result
      }
      reader.readAsDataURL(file)
    },
    
    // 上传头像
    async uploadAvatar() {
      if (!this.avatarFile) return
      
      this.avatarUploading = true
      
      try {
        const formData = new FormData()
        formData.append('avatar', this.avatarFile)
        
        await this.uploadUserAvatar(formData)
        
        this.$notification.success({
          title: '上传成功',
          message: '头像已成功更新',
          duration: 3000
        })
        
        // 重新加载用户信息
        await this.getUserInfo()
        
        // 关闭弹窗
        this.showAvatarUpload = false
        this.avatarFile = null
      } catch (error) {
        console.error('上传头像失败:', error)
        this.$notification.error({
          title: '上传失败',
          message: error.message || '无法上传头像，请重试',
          duration: 3000
        })
      } finally {
        this.avatarUploading = false
      }
    },
    
    // 关闭修改密码弹窗
    closeChangePasswordDialog() {
      this.showChangePasswordDialog = false
      this.passwordForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      this.passwordErrors = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    },
    
    // 修改密码
    async changePassword() {
      // 表单验证
      if (!this.validatePassword()) {
        return
      }
      
      this.passwordLoading = true
      
      try {
        await this.changeUserPassword({
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword
        })
        
        this.$notification.success({
          title: '修改成功',
          message: '密码已成功修改，请重新登录',
          duration: 3000
        })
        
        // 关闭弹窗
        this.closeChangePasswordDialog()
        
        // 延迟跳转到登录页，让用户可以看到成功消息
        setTimeout(() => {
          this.$store.dispatch('user/logout')
          this.$router.push('/login')
        }, 1500)
      } catch (error) {
        console.error('修改密码失败:', error)
        this.$notification.error({
          title: '修改失败',
          message: error.message || '无法修改密码，请检查当前密码是否正确',
          duration: 3000
        })
      } finally {
        this.passwordLoading = false
      }
    },
    
    // 验证密码
    validatePassword() {
      this.passwordErrors = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      
      let isValid = true
      
      // 验证当前密码
      if (!this.passwordForm.oldPassword) {
        this.passwordErrors.oldPassword = '请输入当前密码'
        isValid = false
      }
      
      // 验证新密码
      if (!this.passwordForm.newPassword) {
        this.passwordErrors.newPassword = '请输入新密码'
        isValid = false
      } else if (this.passwordForm.newPassword.length < 6) {
        this.passwordErrors.newPassword = '新密码长度不能少于6位'
        isValid = false
      }
      
      // 验证确认密码
      if (!this.passwordForm.confirmPassword) {
        this.passwordErrors.confirmPassword = '请确认新密码'
        isValid = false
      } else if (this.passwordForm.confirmPassword !== this.passwordForm.newPassword) {
        this.passwordErrors.confirmPassword = '两次输入的密码不一致'
        isValid = false
      }
      
      return isValid
    },
    
    // 发送邮箱验证
    async sendVerificationEmail() {
      this.emailVerifyLoading = true
      
      try {
        // TODO: 实现发送邮箱验证的API调用
        await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
        
        this.$notification.success({
          title: '发送成功',
          message: '验证邮件已发送至您的邮箱，请查收',
          duration: 3000
        })
      } catch (error) {
        console.error('发送验证邮件失败:', error)
        this.$notification.error({
          title: '发送失败',
          message: error.message || '无法发送验证邮件，请重试',
          duration: 3000
        })
      } finally {
        this.emailVerifyLoading = false
      }
    },
    
    // 验证手机
    async verifyPhone() {
      if (!this.basicInfo.phone) {
        this.$notification.warning({
          title: '请先填写手机号',
          message: '请在基本信息中填写手机号码后再进行验证',
          duration: 3000
        })
        return
      }
      
      this.phoneVerifyLoading = true
      
      try {
        // TODO: 实现手机验证的API调用
        await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
        
        this.$notification.success({
          title: '发送成功',
          message: '验证码已发送至您的手机，请查收',
          duration: 3000
        })
      } catch (error) {
        console.error('发送手机验证码失败:', error)
        this.$notification.error({
          title: '发送失败',
          message: error.message || '无法发送验证码，请重试',
          duration: 3000
        })
      } finally {
        this.phoneVerifyLoading = false
      }
    },
    
    // 更新字体大小
    updateFontSize() {
      document.documentElement.style.fontSize = `${this.preferences.fontSize}px`
    },
    
    // 重置偏好设置
    resetPreferences() {
      this.preferences = {
        theme: 'default',
        fontSize: 14,
        emailNotifications: true,
        messageNotifications: true,
        promotionNotifications: false,
        travelModes: ['airplane', 'train'],
        budgetRange: {
          min: 0,
          max: 5000
        }
      }
      this.updateFontSize()
    },
    
    // 更新偏好设置
    async updatePreferences() {
      this.preferencesLoading = true
      
      try {
        // TODO: 实现更新偏好设置的API调用
        await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
        
        this.$notification.success({
          title: '设置已保存',
          message: '您的偏好设置已成功更新',
          duration: 3000
        })
      } catch (error) {
        console.error('更新偏好设置失败:', error)
        this.$notification.error({
          title: '保存失败',
          message: error.message || '无法保存偏好设置，请重试',
          duration: 3000
        })
      } finally {
        this.preferencesLoading = false
      }
    },
    
    // 删除账号
    async deleteAccount() {
      if (this.deleteAccountVerify !== '确认注销') {
        this.$notification.warning({
          title: '请确认',
          message: '请输入"确认注销"以继续',
          duration: 3000
        })
        return
      }
      
      this.accountDeleteLoading = true
      
      try {
        await this.deleteUserAccount()
        
        this.$notification.success({
          title: '注销成功',
          message: '您的账号已成功注销',
          duration: 3000
        })
        
        // 延迟跳转到登录页
        setTimeout(() => {
          this.$router.push('/login')
        }, 1500)
      } catch (error) {
        console.error('注销账号失败:', error)
        this.$notification.error({
          title: '注销失败',
          message: error.message || '无法注销账号，请重试',
          duration: 3000
        })
      } finally {
        this.accountDeleteLoading = false
        this.showDeleteAccountDialog = false
      }
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '-'  
      return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>

<style scoped>
/* 用户中心容器 */
.user-center-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 页面标题 */
.user-center-header {
  margin-bottom: 30px;
  text-align: center;
}

.user-center-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.user-center-subtitle {
  font-size: 16px;
  color: #666;
}

/* 主体内容 */
.user-center-body {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* 侧边导航栏 */
.user-center-sidebar {
  width: 260px;
  flex-shrink: 0;
}

/* 用户个人信息卡片 */
.user-profile-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}

/* 用户头像 */
.user-avatar-container {
  margin-bottom: 16px;
}

.user-avatar {
  position: relative;
  display: inline-block;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #f0f0f0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-edit {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 4px 0;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}

.user-avatar:hover .user-avatar-edit {
  opacity: 1;
}

.user-icon-edit::before {
  content: '✏️';
}

/* 用户个人信息 */
.user-profile-info {
  text-align: center;
}

.user-profile-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
}

.user-profile-email {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.user-profile-level {
  margin-top: 12px;
}

.user-level-badge {
  display: inline-block;
  padding: 2px 8px;
  background-color: #e6f7ff;
  color: #1890ff;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
}

.user-level-progress {
  margin: 0 auto;
  max-width: 120px;
}

/* 导航菜单 */
.user-nav {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.user-nav-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
}

.user-nav-item:hover {
  background-color: #f5f5f5;
  color: #1890ff;
}

.user-nav-item-active {
  background-color: #e6f7ff;
  color: #1890ff;
  font-weight: 500;
}

.user-nav-item i {
  margin-right: 10px;
  font-size: 18px;
}

.user-icon-user::before {
  content: '👤';
}

.user-icon-lock::before {
  content: '🔒';
}

.user-icon-settings::before {
  content: '⚙️';
}

.user-icon-account::before {
  content: '📋';
}

/* 主内容区域 */
.user-center-main {
  flex: 1;
  min-width: 0;
}

.user-tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.user-info-card {
  margin-bottom: 24px;
}

/* 表单样式 */
.user-info-form {
  margin-top: 16px;
}

.user-form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.user-form-group {
  flex: 1;
}

.user-form-group-full {
  flex: 1 0 100%;
}

.user-form-input {
  width: 100%;
}

.user-form-counter {
  font-size: 12px;
  color: #999;
}

.user-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}

.user-form-button {
  min-width: 100px;
}

/* 安全设置 */
.security-section {
  margin-bottom: 32px;
}

.security-section-mt {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.security-section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
}

.security-item:last-child {
  border-bottom: none;
}

.security-item-label {
  display: flex;
  align-items: center;
  color: #333;
}

.security-item-label i {
  margin-right: 12px;
  font-size: 18px;
}

.security-icon-password::before {
  content: '🔑';
}

.security-icon-email::before {
  content: '📧';
}

.security-icon-phone::before {
  content: '📱';
}

.security-icon-2fa::before {
  content: '🔐';
}

.security-icon-login-history::before {
  content: '📊';
}

.security-item-value {
  display: flex;
  align-items: center;
  gap: 12px;
}

.security-status-verified {
  color: #52c41a;
  font-size: 14px;
}

.security-status-unverified {
  color: #faad14;
  font-size: 14px;
}

.security-action-button {
  margin-left: 8px;
}

/* 偏好设置 */
.preferences-section {
  margin-bottom: 32px;
}

.preferences-section-mt {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.preferences-section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.preferences-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
}

.preferences-item:last-child {
  border-bottom: none;
}

.preferences-item-label {
  color: #333;
}

/* 主题颜色选择器 */
.preferences-theme-colors {
  display: flex;
  gap: 12px;
}

.preferences-theme-color {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  border: 2px solid transparent;
}

.preferences-theme-color:hover {
  transform: scale(1.1);
}

.preferences-theme-color-active {
  border-color: #333;
}

.preferences-theme-color-active::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 16px;
}

/* 字体大小滑块 */
.preferences-font-size {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preferences-range {
  width: 120px;
}

.preferences-font-size-value {
  font-size: 14px;
  color: #666;
  min-width: 40px;
}

/* 旅行方式选项 */
.preferences-travel-modes {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.preferences-travel-mode {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

/* 预算范围 */
.preferences-budget {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preferences-budget-input {
  width: 80px;
}

.preferences-budget-separator {
  color: #999;
}

.preferences-budget-unit {
  color: #999;
}

/* 账号管理 */
.account-section {
  margin-bottom: 32px;
}

.account-section-mt {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.account-section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
}

.account-danger-item {
  border-bottom: none;
}

.account-item-label {
  display: flex;
  align-items: center;
  color: #333;
}

.account-icon-delete::before {
  content: '🗑️';
}

.account-item-label i {
  margin-right: 12px;
  font-size: 18px;
}

.account-info-item {
  padding: 8px 0;
  display: flex;
}

.account-info-label {
  color: #666;
  width: 120px;
}

.account-info-value {
  color: #333;
  font-weight: 500;
}

.account-status-active {
  color: #52c41a;
  font-weight: 500;
}

/* 头像上传弹窗 */
.avatar-upload-content {
  text-align: center;
}

.avatar-upload-preview {
  margin-bottom: 20px;
}

.avatar-preview-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px solid #f0f0f0;
  object-fit: cover;
}

.avatar-upload-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.avatar-upload-tip {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 修改密码表单 */
.change-password-form {
  margin-top: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* 删除账号确认 */
.delete-account-content {
  margin-top: 8px;
}

.delete-account-warning {
  color: #faad14;
  font-weight: 500;
  margin-bottom: 16px;
}

.delete-account-consequences {
  color: #666;
  margin-bottom: 20px;
  padding-left: 20px;
}

.delete-account-consequences li {
  margin-bottom: 8px;
}

.delete-account-verification {
  margin-top: 16px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .user-center-container {
    padding: 16px;
  }
  
  .user-center-body {
    flex-direction: column;
  }
  
  .user-center-sidebar {
    width: 100%;
  }
  
  .user-form-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .user-form-actions {
    flex-direction: column;
  }
  
  .user-form-button {
    width: 100%;
  }
  
  .security-item,
  .preferences-item,
  .account-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .security-item-value,
  .preferences-item-value {
    align-self: flex-end;
  }
}
</style>