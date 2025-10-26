<template>
  <div class="user-profile">
    <!-- 加载动画 -->
    <LoadingAnimation v-if="loading" :message="'加载用户资料中...'" />
    
    <!-- 错误提示 -->
    <div v-else-if="error" class="error-container">
      <el-empty description="获取用户资料失败" />
      <el-button type="primary" @click="fetchUserProfile">重试</el-button>
    </div>
    
    <!-- 用户资料内容 -->
    <div v-else class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1 class="page-title">个人资料</h1>
        <p class="page-subtitle">管理您的个人信息和偏好设置</p>
      </div>
      
      <!-- 个人资料卡片 -->
      <div class="custom-card profile-card">
        <div class="profile-header">
          <!-- 头像区域 -->
          <div class="avatar-section">
            <div class="avatar-container">
              <el-avatar
                :size="100"
                :src="user.avatar"
                fit="cover"
                class="user-avatar"
              >
                {{ getUserInitials }}
              </el-avatar>
              <div class="avatar-upload-overlay" @click="triggerAvatarUpload">
                <el-icon><Camera /></el-icon>
                <span>更换头像</span>
              </div>
            </div>
            <input 
              ref="avatarInput"
              type="file" 
              accept="image/*" 
              style="display: none" 
              @change="handleAvatarUpload"
            />
            <div class="user-name">
              <h2>{{ user.name }}</h2>
              <p class="user-email">{{ user.email }}</p>
            </div>
          </div>
          
          <!-- 账户状态 -->
          <div class="account-status">
            <div class="status-item">
              <div class="status-label">账户创建于</div>
              <div class="status-value">{{ formatDate(user.createdAt) }}</div>
            </div>
            <div class="status-item">
              <div class="status-label">最近登录</div>
              <div class="status-value">{{ formatDate(user.lastLoginAt) }}</div>
            </div>
            <div class="status-item">
              <div class="status-label">账户状态</div>
              <el-tag :type="user.isActive ? 'success' : 'danger'" size="small">
                {{ user.isActive ? '活跃' : '禁用' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 表单区域 -->
      <div class="profile-forms">
        <!-- 基本信息表单 -->
        <div class="custom-card form-card">
          <div class="form-header">
            <h2 class="form-title">基本信息</h2>
            <div class="form-actions">
              <el-button v-if="!editBasicInfo" type="primary" @click="editBasicInfo = true">
                <el-icon><EditPen /></el-icon> 编辑
              </el-button>
              <template v-else>
                <el-button type="success" @click="saveBasicInfo">
                  <el-icon><Check /></el-icon> 保存
                </el-button>
                <el-button @click="cancelEditBasicInfo">
                  <el-icon><Close /></el-icon> 取消
                </el-button>
              </template>
            </div>
          </div>
          
          <el-form :model="basicInfoForm" :rules="basicInfoRules" ref="basicInfoFormRef" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="姓名" prop="name">
                  <el-input 
                    v-model="basicInfoForm.name" 
                    :disabled="!editBasicInfo"
                    placeholder="请输入姓名"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="昵称" prop="nickname">
                  <el-input 
                    v-model="basicInfoForm.nickname" 
                    :disabled="!editBasicInfo"
                    placeholder="请输入昵称"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="电子邮箱" prop="email">
                  <el-input 
                    v-model="basicInfoForm.email" 
                    :disabled="!editBasicInfo"
                    placeholder="请输入电子邮箱"
                    type="email"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号码" prop="phone">
                  <el-input 
                    v-model="basicInfoForm.phone" 
                    :disabled="!editBasicInfo"
                    placeholder="请输入手机号码"
                    type="tel"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="出生日期" prop="birthdate">
                  <el-date-picker
                    v-model="basicInfoForm.birthdate"
                    :disabled="!editBasicInfo"
                    type="date"
                    placeholder="选择出生日期"
                    style="width: 100%"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="性别" prop="gender">
                  <el-select
                    v-model="basicInfoForm.gender"
                    :disabled="!editBasicInfo"
                    placeholder="请选择性别"
                    style="width: 100%"
                  >
                    <el-option label="男" value="male" />
                    <el-option label="女" value="female" />
                    <el-option label="不愿透露" value="other" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="个人简介" prop="bio">
              <el-input
                v-model="basicInfoForm.bio"
                :disabled="!editBasicInfo"
                type="textarea"
                :rows="3"
                placeholder="介绍一下自己..."
              />
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 安全设置表单 -->
        <div class="custom-card form-card">
          <div class="form-header">
            <h2 class="form-title">安全设置</h2>
          </div>
          
          <el-form :model="securityForm" :rules="securityRules" ref="securityFormRef" label-width="120px">
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input 
                v-model="securityForm.currentPassword" 
                type="password"
                placeholder="请输入当前密码"
              />
            </el-form-item>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="新密码" prop="newPassword">
                  <el-input 
                    v-model="securityForm.newPassword" 
                    type="password"
                    placeholder="请输入新密码"
                    @input="validatePassword"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input 
                    v-model="securityForm.confirmPassword" 
                    type="password"
                    placeholder="请再次输入新密码"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <!-- 密码强度指示器 -->
            <div v-if="securityForm.newPassword" class="password-strength">
              <div class="strength-label">密码强度:</div>
              <div class="strength-indicator">
                <div 
                  class="strength-bar" 
                  :class="['strength-' + passwordStrength.level]"
                  :style="{ width: passwordStrength.width + '%' }"
                ></div>
              </div>
              <div class="strength-text">{{ passwordStrength.text }}</div>
            </div>
            
            <el-form-item>
              <el-button type="primary" @click="changePassword">
                <el-icon><Lock /></el-icon> 修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 偏好设置表单 -->
        <div class="custom-card form-card">
          <div class="form-header">
            <h2 class="form-title">偏好设置</h2>
          </div>
          
          <el-form :model="preferencesForm" label-width="120px">
            <el-form-item label="默认货币">
              <el-select
                v-model="preferencesForm.defaultCurrency"
                placeholder="选择默认货币"
                style="width: 100%"
              >
                <el-option label="人民币 (¥)" value="CNY" />
                <el-option label="美元 ($)" value="USD" />
                <el-option label="欧元 (€)" value="EUR" />
                <el-option label="英镑 (£)" value="GBP" />
                <el-option label="日元 (¥)" value="JPY" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="语言偏好">
              <el-select
                v-model="preferencesForm.language"
                placeholder="选择语言"
                style="width: 100%"
              >
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English (US)" value="en-US" />
                <el-option label="日本語" value="ja-JP" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="温度单位">
              <el-radio-group v-model="preferencesForm.temperatureUnit">
                <el-radio-button label="celsius">摄氏度 (°C)</el-radio-button>
                <el-radio-button label="fahrenheit">华氏度 (°F)</el-radio-button>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="时间格式">
              <el-radio-group v-model="preferencesForm.timeFormat">
                <el-radio-button label="24h">24小时制</el-radio-button>
                <el-radio-button label="12h">12小时制</el-radio-button>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="通知设置">
              <el-checkbox v-model="preferencesForm.notifications.email">邮件通知</el-checkbox>
              <el-checkbox v-model="preferencesForm.notifications.app">应用内通知</el-checkbox>
              <el-checkbox v-model="preferencesForm.notifications.sms">短信通知</el-checkbox>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="savePreferences">
                <el-icon><Setting /></el-icon> 保存设置
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <!-- 账户管理 -->
      <div class="custom-card account-management-card">
        <div class="form-header">
          <h2 class="form-title">账户管理</h2>
        </div>
        
        <div class="danger-zone">
          <h3>危险区域</h3>
          <p class="warning-text">
            以下操作可能会对您的账户造成不可恢复的影响，请谨慎操作。
          </p>
          
          <div class="danger-actions">
            <el-button 
              type="danger" 
              plain 
              @click="exportUserData"
              class="danger-button"
            >
              <el-icon><Download /></el-icon> 导出我的数据
            </el-button>
            
            <el-button 
              type="danger" 
              @click="confirmAccountDeletion"
              class="danger-button"
            >
              <el-icon><Delete /></el-icon> 注销账户
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useStore } from 'vuex';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Camera, EditPen, Check, Close, Lock, Setting, Download, Delete } from '@element-plus/icons-vue';
import LoadingAnimation from '../components/LoadingAnimation.vue';
import * as api from '../services/api';
import { formatDate } from '../utils/helper';
import { isValidEmail, isValidPhone, isStrongPassword } from '../utils/validation';

export default {
  name: 'UserProfile',
  components: {
    LoadingAnimation,
    Camera,
    EditPen,
    Check,
    Close,
    Lock,
    Setting,
    Download,
    Delete
  },
  setup() {
    const store = useStore();
    
    // 响应式数据
    const loading = ref(false);
    const error = ref(false);
    const editBasicInfo = ref(false);
    const avatarInput = ref(null);
    const basicInfoFormRef = ref(null);
    const securityFormRef = ref(null);
    
    // 用户数据
    const user = reactive({
      id: '',
      name: '',
      email: '',
      avatar: '',
      createdAt: '',
      lastLoginAt: '',
      isActive: true
    });
    
    // 表单数据
    const basicInfoForm = reactive({
      name: '',
      nickname: '',
      email: '',
      phone: '',
      birthdate: '',
      gender: '',
      bio: ''
    });
    
    const securityForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    const preferencesForm = reactive({
      defaultCurrency: 'CNY',
      language: 'zh-CN',
      temperatureUnit: 'celsius',
      timeFormat: '24h',
      notifications: {
        email: true,
        app: true,
        sms: false
      }
    });
    
    // 验证规则
    const basicInfoRules = {
      name: [
        { required: true, message: '请输入姓名', trigger: 'blur' },
        { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符之间', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入电子邮箱', trigger: 'blur' },
        { validator: (rule, value, callback) => {
          if (isValidEmail(value)) {
            callback();
          } else {
            callback(new Error('请输入有效的电子邮箱地址'));
          }
        }, trigger: 'blur' }
      ],
      phone: [
        { required: false },
        { validator: (rule, value, callback) => {
          if (!value || isValidPhone(value)) {
            callback();
          } else {
            callback(new Error('请输入有效的手机号码'));
          }
        }, trigger: 'blur' }
      ]
    };
    
    const securityRules = {
      currentPassword: [
        { required: true, message: '请输入当前密码', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 8, message: '密码长度至少为 8 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        { validator: (rule, value, callback) => {
          if (value === securityForm.newPassword) {
            callback();
          } else {
            callback(new Error('两次输入的密码不一致'));
          }
        }, trigger: 'blur' }
      ]
    };
    
    // 密码强度
    const passwordStrength = reactive({
      level: 0, // 0-4: 非常弱、弱、中、强、非常强
      width: 0,
      text: '请输入密码'
    });
    
    // 计算属性
    const getUserInitials = computed(() => {
      if (!user.name) return '用';
      return user.name.charAt(0).toUpperCase();
    });
    
    // 方法
    const fetchUserProfile = async () => {
      loading.value = true;
      error.value = false;
      
      try {
        // 获取用户信息
        // const userData = await api.getCurrentUser();
        // Object.assign(user, userData);
        
        // 模拟用户数据
        Object.assign(user, {
          id: '1',
          name: '张三',
          email: 'zhangsan@example.com',
          avatar: '',
          createdAt: '2023-01-15T08:30:00Z',
          lastLoginAt: new Date().toISOString(),
          isActive: true
        });
        
        // 获取用户详情
        // const userDetail = await api.getUserProfile();
        
        // 模拟用户详情
        const userDetail = {
          nickname: '旅行者',
          phone: '13812345678',
          birthdate: '1990-01-15',
          gender: 'male',
          bio: '热爱旅行，喜欢探索世界各地的文化和美食。'
        };
        
        // 填充表单数据
        Object.assign(basicInfoForm, userDetail);
        
        // 获取用户偏好设置
        // const preferences = await api.getUserPreferences();
        // if (preferences) {
        //   Object.assign(preferencesForm, preferences);
        // }
      } catch (err) {
        console.error('获取用户资料失败:', err);
        error.value = true;
        ElMessage.error('获取用户资料失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    };
    
    // 触发头像上传
    const triggerAvatarUpload = () => {
      if (avatarInput.value) {
        avatarInput.value.click();
      }
    };
    
    // 处理头像上传
    const handleAvatarUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      // 验证文件大小和类型
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        ElMessage.error('文件大小不能超过 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        ElMessage.error('请上传图片文件');
        return;
      }
      
      try {
        // 创建 FormData 对象
        const formData = new FormData();
        formData.append('avatar', file);
        
        // 这里应该上传到服务器
        // const response = await api.uploadAvatar(formData);
        // user.avatar = response.avatarUrl;
        
        // 模拟上传成功
        const reader = new FileReader();
        reader.onload = (e) => {
          user.avatar = e.target.result;
        };
        reader.readAsDataURL(file);
        
        ElMessage.success('头像上传成功');
      } catch (err) {
        console.error('头像上传失败:', err);
        ElMessage.error('头像上传失败，请稍后重试');
      } finally {
        // 清空文件输入，允许重复选择同一文件
        if (avatarInput.value) {
          avatarInput.value.value = '';
        }
      }
    };
    
    // 保存基本信息
    const saveBasicInfo = async () => {
      if (!basicInfoFormRef.value) return;
      
      try {
        await basicInfoFormRef.value.validate();
        
        // 调用API更新用户信息
        // await api.updateUserProfile(basicInfoForm);
        
        // 更新user对象
        user.name = basicInfoForm.name;
        user.email = basicInfoForm.email;
        
        editBasicInfo.value = false;
        ElMessage.success('基本信息已更新');
      } catch (err) {
        if (err !== false) { // 不是验证失败
          console.error('更新用户信息失败:', err);
          ElMessage.error('更新用户信息失败，请稍后重试');
        }
      }
    };
    
    // 取消编辑基本信息
    const cancelEditBasicInfo = () => {
      // 重置表单为原始数据
      const originalData = {
        name: user.name,
        email: user.email,
        nickname: basicInfoForm.nickname,
        phone: basicInfoForm.phone,
        birthdate: basicInfoForm.birthdate,
        gender: basicInfoForm.gender,
        bio: basicInfoForm.bio
      };
      
      Object.assign(basicInfoForm, originalData);
      
      if (basicInfoFormRef.value) {
        basicInfoFormRef.value.resetFields();
      }
      
      editBasicInfo.value = false;
    };
    
    // 验证密码强度
    const validatePassword = (value) => {
      const strength = isStrongPassword(value);
      
      if (!value) {
        passwordStrength.level = 0;
        passwordStrength.width = 0;
        passwordStrength.text = '请输入密码';
      } else if (strength === 1) {
        passwordStrength.level = 1;
        passwordStrength.width = 25;
        passwordStrength.text = '非常弱';
      } else if (strength === 2) {
        passwordStrength.level = 2;
        passwordStrength.width = 50;
        passwordStrength.text = '弱';
      } else if (strength === 3) {
        passwordStrength.level = 3;
        passwordStrength.width = 75;
        passwordStrength.text = '中';
      } else if (strength === 4) {
        passwordStrength.level = 4;
        passwordStrength.width = 100;
        passwordStrength.text = '强';
      }
    };
    
    // 修改密码
    const changePassword = async () => {
      if (!securityFormRef.value) return;
      
      try {
        await securityFormRef.value.validate();
        
        // 调用API修改密码
        // await api.changePassword({
        //   currentPassword: securityForm.currentPassword,
        //   newPassword: securityForm.newPassword
        // });
        
        // 重置表单
        securityForm.currentPassword = '';
        securityForm.newPassword = '';
        securityForm.confirmPassword = '';
        securityFormRef.value.resetFields();
        
        // 重置密码强度指示器
        passwordStrength.level = 0;
        passwordStrength.width = 0;
        passwordStrength.text = '请输入密码';
        
        ElMessage.success('密码修改成功');
      } catch (err) {
        if (err !== false) { // 不是验证失败
          console.error('修改密码失败:', err);
          ElMessage.error('修改密码失败，请稍后重试');
        }
      }
    };
    
    // 保存偏好设置
    const savePreferences = async () => {
      try {
        // 调用API保存偏好设置
        // await api.updateUserPreferences(preferencesForm);
        
        ElMessage.success('偏好设置已保存');
      } catch (err) {
        console.error('保存偏好设置失败:', err);
        ElMessage.error('保存偏好设置失败，请稍后重试');
      }
    };
    
    // 导出用户数据
    const exportUserData = async () => {
      try {
        // 这里应该调用API导出用户数据
        // const response = await api.exportUserData();
        // const blob = new Blob([response], { type: 'application/json' });
        // const url = URL.createObjectURL(blob);
        // const link = document.createElement('a');
        // link.href = url;
        // link.download = `user_data_${new Date().toISOString().split('T')[0]}.json`;
        // link.click();
        // URL.revokeObjectURL(url);
        
        // 模拟导出
        ElMessage.success('数据导出成功');
      } catch (err) {
        console.error('导出用户数据失败:', err);
        ElMessage.error('导出用户数据失败，请稍后重试');
      }
    };
    
    // 确认账户删除
    const confirmAccountDeletion = async () => {
      try {
        await ElMessageBox.confirm(
          '您确定要注销您的账户吗？此操作不可撤销，您的所有数据将被永久删除。',
          '确认注销账户',
          {
            confirmButtonText: '确认注销',
            cancelButtonText: '取消',
            type: 'error',
            center: true
          }
        );
        
        // 二次确认
        await ElMessageBox.prompt(
          '请输入您的电子邮箱确认注销:',
          '二次确认',
          {
            confirmButtonText: '确认注销',
            cancelButtonText: '取消',
            type: 'error',
            inputPlaceholder: '请输入您的电子邮箱'
          }
        ).then(({ value }) => {
          if (value !== user.email) {
            ElMessage.error('电子邮箱不匹配，操作已取消');
            return Promise.reject();
          }
        });
        
        // 调用API删除账户
        // await api.deleteAccount();
        
        // 模拟注销后的跳转
        ElMessage.success('账户已成功注销');
        // router.push('/login');
      } catch (error) {
        // 用户取消操作
      }
    };
    
    onMounted(() => {
      fetchUserProfile();
    });
    
    return {
      // 数据
      loading,
      error,
      editBasicInfo,
      avatarInput,
      basicInfoFormRef,
      securityFormRef,
      user,
      basicInfoForm,
      securityForm,
      preferencesForm,
      basicInfoRules,
      securityRules,
      passwordStrength,
      
      // 计算属性
      getUserInitials,
      
      // 方法
      fetchUserProfile,
      triggerAvatarUpload,
      handleAvatarUpload,
      saveBasicInfo,
      cancelEditBasicInfo,
      validatePassword,
      changePassword,
      savePreferences,
      exportUserData,
      confirmAccountDeletion,
      
      // 工具方法
      formatDate
    };
  }
};
</script>

<style scoped>
.user-profile {
  min-height: 100vh;
  padding: var(--space-lg);
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-card {
  margin-bottom: var(--space-xl);
}

.profile-header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xl);
  padding: var(--space-lg);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.avatar-container {
  position: relative;
}

.user-avatar {
  cursor: pointer;
  transition: opacity var(--transition-time);
}

.avatar-container:hover .user-avatar {
  opacity: 0.7;
}

.avatar-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  opacity: 0;
  transition: opacity var(--transition-time);
  cursor: pointer;
  font-size: 12px;
  text-align: center;
}

.avatar-container:hover .avatar-upload-overlay {
  opacity: 1;
}

.user-name h2 {
  margin: 0 0 var(--space-xs) 0;
  font-size: var(--font-size-large);
  color: var(--text-primary);
}

.user-email {
  margin: 0;
  color: var(--text-secondary);
}

.account-status {
  display: flex;
  gap: var(--space-xl);
  align-items: center;
  margin-left: auto;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.status-label {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.status-value {
  font-size: var(--font-size-medium);
  color: var(--text-primary);
}

.profile-forms {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  margin-bottom: var(--space-xl);
}

.form-card {
  padding: var(--space-lg);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.form-title {
  margin: 0;
  font-size: var(--font-size-medium);
  color: var(--text-primary);
}

.form-actions {
  display: flex;
  gap: var(--space-sm);
}

.password-strength {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.strength-label {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  width: 80px;
}

.strength-indicator {
  flex: 1;
  height: 6px;
  background-color: var(--background-color-light);
  border-radius: 3px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  transition: width var(--transition-time), background-color var(--transition-time);
  border-radius: 3px;
}

.strength-0 {
  background-color: transparent;
}

.strength-1 {
  background-color: var(--danger-color);
}

.strength-2 {
  background-color: var(--warning-color);
}

.strength-3 {
  background-color: var(--success-color);
}

.strength-4 {
  background-color: var(--primary-color);
}

.strength-text {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  width: 80px;
}

.account-management-card {
  padding: var(--space-lg);
}

.danger-zone {
  padding: var(--space-lg);
  background-color: var(--danger-color-light);
  border-radius: var(--border-radius);
  border-left: 4px solid var(--danger-color);
}

.danger-zone h3 {
  margin-top: 0;
  color: var(--danger-color);
}

.warning-text {
  color: var(--text-secondary);
  margin-bottom: var(--space-lg);
}

.danger-actions {
  display: flex;
  gap: var(--space-md);
}

.danger-button {
  transition: all var(--transition-time);
}

.danger-button:hover {
  transform: scale(1.05);
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-xxl) 0;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .user-profile {
    padding: var(--space-md);
  }
  
  .profile-header {
    flex-direction: column;
    gap: var(--space-md);
    align-items: flex-start;
  }
  
  .avatar-section {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }
  
  .account-status {
    margin-left: 0;
    gap: var(--space-md);
    flex-wrap: wrap;
  }
  
  .form-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  
  .danger-actions {
    flex-direction: column;
  }
}
</style>