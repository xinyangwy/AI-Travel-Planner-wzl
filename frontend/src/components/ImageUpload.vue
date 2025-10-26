<template>
  <div class="image-upload" :class="{ 'disabled': disabled }">
    <!-- 上传按钮区域 -->
    <div 
      v-if="!disabled && (!multiple ? modelValue.length === 0 : modelValue.length < maxCount)" 
      class="upload-button"
      :class="{ 'drag-over': isDragOver }"
      @click="triggerUpload"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <!-- 上传图标 -->
      <div class="upload-icon">
        <i class="upload-icon-inner"></i>
      </div>
      
      <!-- 上传文本 -->
      <div class="upload-text">
        <div class="upload-title">{{ uploadText }}</div>
        <div v-if="fileSizeLimit" class="upload-desc">
          {{ fileTypeList }}，最大 {{ formatFileSize(fileSizeLimit) }}
        </div>
      </div>
      
      <!-- 文件输入框 (隐藏) -->
      <input
        ref="fileInput"
        type="file"
        :multiple="multiple"
        :accept="accept"
        style="display: none"
        @change="handleFileChange"
      />
    </div>
    
    <!-- 已上传图片展示区域 -->
    <div class="image-list">
      <div 
        v-for="(file, index) in modelValue" 
        :key="`${file.uid || index}-${file.url || file.name}`"
        class="image-item"
        :class="{ 'error': file.status === 'error' }"
      >
        <!-- 图片预览 -->
        <div class="image-preview" @click="handleImageClick(file, index)">
          <!-- 图片加载 -->
          <img 
            v-if="file.url || file.thumbUrl || file.objectUrl" 
            :src="file.url || file.thumbUrl || file.objectUrl"
            :alt="file.name"
            class="image"
            @load="handleImageLoad(file)"
            @error="handleImageError(file)"
          />
          <!-- 图片加载中 -->
          <div v-else class="image-loading">
            <div class="loading-spinner"></div>
          </div>
          
          <!-- 图片覆盖层 -->
          <div class="image-overlay">
            <!-- 图片状态标识 -->
            <div v-if="file.status === 'uploading'" class="status-indicator uploading">
              <div class="loading-dot"></div>
              <div class="loading-dot"></div>
              <div class="loading-dot"></div>
            </div>
            <div v-else-if="file.status === 'error'" class="status-indicator error">
              <i class="error-icon">!</i>
            </div>
            <div v-else-if="file.status === 'success'" class="status-indicator success">
              <i class="success-icon">✓</i>
            </div>
            
            <!-- 图片操作按钮组 -->
            <div v-if="!disabled" class="image-actions">
              <!-- 预览按钮 -->
              <button 
                v-if="showPreview" 
                class="action-btn preview-btn"
                @click.stop="handlePreview(file, index)"
                title="预览"
              >
                <i class="preview-icon"></i>
              </button>
              
              <!-- 编辑按钮 -->
              <button 
                v-if="showEdit" 
                class="action-btn edit-btn"
                @click.stop="handleEdit(file, index)"
                title="编辑"
              >
                <i class="edit-icon"></i>
              </button>
              
              <!-- 删除按钮 -->
              <button 
                v-if="showRemove" 
                class="action-btn remove-btn"
                @click.stop="handleRemove(file, index)"
                title="删除"
              >
                <i class="remove-icon"></i>
              </button>
            </div>
          </div>
          
          <!-- 上传进度条 -->
          <div v-if="file.status === 'uploading' && file.percent !== undefined" class="upload-progress">
            <div 
              class="upload-progress-bar" 
              :style="{ width: `${file.percent}%` }"
            ></div>
          </div>
        </div>
        
        <!-- 文件名和大小 -->
        <div v-if="showFileName" class="file-info">
          <div class="file-name" :title="file.name">{{ truncateFileName(file.name) }}</div>
          <div v-if="showFileSize" class="file-size">
            {{ formatFileSize(file.size) }}
          </div>
        </div>
        
        <!-- 错误信息 -->
        <div v-if="file.status === 'error' && file.errorMsg" class="error-message">
          {{ file.errorMsg }}
        </div>
      </div>
    </div>
    
    <!-- 图片数量限制提示 -->
    <div v-if="multiple && maxCount > 0" class="image-count-hint">
      已上传 {{ modelValue.length }}/{{ maxCount }}
    </div>
    
    <!-- 图片查看器 -->
    <div v-if="previewVisible" class="image-viewer-overlay" @click="closePreview">
      <div class="image-viewer" @click.stop>
        <!-- 关闭按钮 -->
        <button class="viewer-close-btn" @click="closePreview">
          <i class="close-icon">×</i>
        </button>
        
        <!-- 图片导航 -->
        <div v-if="multiple && modelValue.length > 1" class="viewer-nav">
          <button 
            class="nav-btn prev-btn" 
            @click="prevImage"
            :disabled="currentPreviewIndex <= 0"
          >
            <i class="prev-icon">←</i>
          </button>
          
          <div class="nav-info">
            {{ currentPreviewIndex + 1 }} / {{ modelValue.length }}
          </div>
          
          <button 
            class="nav-btn next-btn" 
            @click="nextImage"
            :disabled="currentPreviewIndex >= modelValue.length - 1"
          >
            <i class="next-icon">→</i>
          </button>
        </div>
        
        <!-- 图片内容 -->
        <div class="viewer-content">
          <img 
            :src="previewImageSrc" 
            :alt="previewImageAlt"
            class="viewer-image"
            @load="handleViewerImageLoad"
            @error="handleViewerImageError"
          />
          
          <!-- 加载状态 -->
          <div v-if="viewerLoading" class="viewer-loading">
            <div class="loading-spinner"></div>
          </div>
          
          <!-- 加载失败 -->
          <div v-if="viewerError" class="viewer-error">
            <i class="error-icon">!</i>
            <div class="error-text">图片加载失败</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'ImageUpload',
  
  props: {
    // 绑定值（文件列表）
    modelValue: {
      type: Array,
      default: () => []
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否支持多选
    multiple: {
      type: Boolean,
      default: true
    },
    // 最大文件数量
    maxCount: {
      type: Number,
      default: 9
    },
    // 文件大小限制（字节）
    fileSizeLimit: {
      type: Number,
      default: 5 * 1024 * 1024 // 默认5MB
    },
    // 允许的文件类型
    fileType: {
      type: String,
      default: 'image/*'
    },
    // 上传前的钩子函数
    beforeUpload: {
      type: Function,
      default: null
    },
    // 上传方法
    uploader: {
      type: Function,
      default: null
    },
    // 是否显示文件名
    showFileName: {
      type: Boolean,
      default: true
    },
    // 是否显示文件大小
    showFileSize: {
      type: Boolean,
      default: true
    },
    // 是否显示预览按钮
    showPreview: {
      type: Boolean,
      default: true
    },
    // 是否显示编辑按钮
    showEdit: {
      type: Boolean,
      default: false
    },
    // 是否显示删除按钮
    showRemove: {
      type: Boolean,
      default: true
    },
    // 上传按钮文本
    uploadText: {
      type: String,
      default: '点击或拖拽图片到此处上传'
    },
    // 图片预览尺寸
    previewSize: {
      type: String,
      default: '120px'
    },
    // 图片裁剪选项
    cropOptions: {
      type: Object,
      default: () => ({})
    }
  },
  
  data() {
    return {
      isDragOver: false,
      previewVisible: false,
      currentPreviewIndex: 0,
      viewerLoading: false,
      viewerError: false,
      objectUrls: [] // 用于存储创建的ObjectURL，避免内存泄漏
    }
  },
  
  computed: {
    // 文件接受类型
    accept() {
      if (this.fileType === 'image/*') {
        return 'image/jpeg,image/png,image/gif,image/bmp,image/svg+xml,image/webp'
      }
      return this.fileType
    },
    
    // 文件类型列表文本
    fileTypeList() {
      if (this.fileType === 'image/*') {
        return '支持 JPG、PNG、GIF 等图片格式'
      }
      return `支持 ${this.fileType.split(',').map(type => type.split('/')[1] || type).join('、')} 格式`
    },
    
    // 预览图片源
    previewImageSrc() {
      if (this.modelValue.length === 0 || this.currentPreviewIndex < 0 || this.currentPreviewIndex >= this.modelValue.length) {
        return ''
      }
      
      const file = this.modelValue[this.currentPreviewIndex]
      return file.url || file.thumbUrl || file.objectUrl || ''
    },
    
    // 预览图片alt文本
    previewImageAlt() {
      if (this.modelValue.length === 0 || this.currentPreviewIndex < 0 || this.currentPreviewIndex >= this.modelValue.length) {
        return ''
      }
      
      return this.modelValue[this.currentPreviewIndex].name || '预览图片'
    }
  },
  
  watch: {
    // 监听模型值变化，清理不再使用的ObjectURL
    modelValue: {
      handler(newVal, oldVal) {
        if (oldVal && oldVal.length > 0) {
          const oldUrls = oldVal.map(file => file.objectUrl).filter(Boolean)
          const newUrls = (newVal || []).map(file => file.objectUrl).filter(Boolean)
          
          // 找出不再使用的ObjectURL并释放
          oldUrls.forEach(url => {
            if (!newUrls.includes(url)) {
              URL.revokeObjectURL(url)
            }
          })
        }
      },
      deep: true
    }
  },
  
  beforeUnmount() {
    // 清理所有ObjectURL，避免内存泄漏
    this.objectUrls.forEach(url => {
      URL.revokeObjectURL(url)
    })
  },
  
  methods: {
    // 触发文件选择
    triggerUpload() {
      if (this.disabled) return
      this.$refs.fileInput?.click()
    },
    
    // 处理文件选择
    handleFileChange(e) {
      const files = Array.from(e.target.files || [])
      if (files.length === 0) return
      
      // 清空文件输入，以便再次选择相同的文件
      this.$refs.fileInput.value = ''
      
      // 处理选择的文件
      this.handleFiles(files)
    },
    
    // 处理拖拽悬停
    handleDragOver() {
      if (this.disabled) return
      this.isDragOver = true
    },
    
    // 处理拖拽离开
    handleDragLeave() {
      this.isDragOver = false
    },
    
    // 处理拖拽放置
    handleDrop(e) {
      this.isDragOver = false
      if (this.disabled) return
      
      const files = Array.from(e.dataTransfer.files || [])
      if (files.length === 0) return
      
      // 过滤出图片文件
      const imageFiles = files.filter(file => file.type.startsWith('image/'))
      
      // 处理图片文件
      this.handleFiles(imageFiles)
    },
    
    // 处理文件
    handleFiles(files) {
      // 检查文件数量限制
      const remainingCount = this.multiple ? this.maxCount - this.modelValue.length : 1
      if (remainingCount <= 0) {
        this.$emit('error', { code: 'MAX_COUNT_EXCEEDED', message: `最多只能上传${this.maxCount}个文件` })
        return
      }
      
      // 限制文件数量
      const processFiles = files.slice(0, remainingCount)
      
      // 处理每个文件
      processFiles.forEach(file => {
        this.processFile(file)
      })
    },
    
    // 处理单个文件
    processFile(file) {
      // 创建文件对象
      const fileObj = {
        uid: uuidv4(),
        name: file.name,
        size: file.size,
        type: file.type,
        raw: file,
        status: 'ready'
      }
      
      // 检查文件大小
      if (file.size > this.fileSizeLimit) {
        fileObj.status = 'error'
        fileObj.errorMsg = `文件大小不能超过${this.formatFileSize(this.fileSizeLimit)}`
        this.addFile(fileObj)
        this.$emit('error', { code: 'FILE_TOO_LARGE', file: fileObj, message: fileObj.errorMsg })
        return
      }
      
      // 检查文件类型
      if (!this.accept.includes(file.type) && !this.accept.includes('image/*')) {
        fileObj.status = 'error'
        fileObj.errorMsg = '不支持的文件类型'
        this.addFile(fileObj)
        this.$emit('error', { code: 'INVALID_FILE_TYPE', file: fileObj, message: fileObj.errorMsg })
        return
      }
      
      // 调用上传前钩子
      if (this.beforeUpload) {
        try {
          const beforeResult = this.beforeUpload(fileObj)
          
          // 如果返回false，则停止上传
          if (beforeResult === false) {
            return
          }
          
          // 如果返回Promise
          if (beforeResult && typeof beforeResult.then === 'function') {
            beforeResult
              .then(processedFile => {
                this.createObjectUrl(fileObj)
                this.addFile(processedFile || fileObj)
                if (this.uploader) {
                  this.uploadFile(processedFile || fileObj)
                }
              })
              .catch(error => {
                fileObj.status = 'error'
                fileObj.errorMsg = error.message || '上传前处理失败'
                this.addFile(fileObj)
                this.$emit('error', { code: 'BEFORE_UPLOAD_FAILED', file: fileObj, error })
              })
            return
          }
        } catch (error) {
          fileObj.status = 'error'
          fileObj.errorMsg = error.message || '上传前处理失败'
          this.addFile(fileObj)
          this.$emit('error', { code: 'BEFORE_UPLOAD_FAILED', file: fileObj, error })
          return
        }
      }
      
      // 创建ObjectURL用于预览
      this.createObjectUrl(fileObj)
      
      // 添加文件到列表
      this.addFile(fileObj)
      
      // 如果有上传器，则上传文件
      if (this.uploader) {
        this.uploadFile(fileObj)
      }
    },
    
    // 创建ObjectURL用于预览
    createObjectUrl(fileObj) {
      if (fileObj.raw) {
        try {
          fileObj.objectUrl = URL.createObjectURL(fileObj.raw)
          // 保存到objectUrls数组以便后续清理
          this.objectUrls.push(fileObj.objectUrl)
        } catch (error) {
          console.error('创建文件预览URL失败:', error)
        }
      }
    },
    
    // 添加文件到列表
    addFile(fileObj) {
      const newFileList = [...this.modelValue]
      
      // 如果是单选模式，清空列表
      if (!this.multiple) {
        newFileList.length = 0
      }
      
      newFileList.push(fileObj)
      
      // 更新modelValue
      this.$emit('update:modelValue', newFileList)
      
      // 触发change事件
      this.$emit('change', newFileList, fileObj)
    },
    
    // 上传文件
    uploadFile(fileObj) {
      // 更新文件状态
      this.updateFileStatus(fileObj.uid, 'uploading', 0)
      
      // 调用上传器
      if (this.uploader && typeof this.uploader === 'function') {
        try {
          // 包装上传器结果为Promise
          Promise.resolve(this.uploader(fileObj, this.onUploadProgress.bind(this, fileObj.uid)))
            .then(response => {
              // 上传成功
              this.updateFileStatus(fileObj.uid, 'success', 100)
              
              // 如果响应中包含url，则更新文件对象
              if (response && response.url) {
                this.updateFileUrl(fileObj.uid, response.url, response.thumbUrl)
              }
              
              // 触发success事件
              this.$emit('success', response, fileObj)
            })
            .catch(error => {
              // 上传失败
              this.updateFileStatus(fileObj.uid, 'error', 0, error.message || '上传失败')
              
              // 触发error事件
              this.$emit('error', { code: 'UPLOAD_FAILED', file: fileObj, error })
            })
        } catch (error) {
          // 上传器执行出错
          this.updateFileStatus(fileObj.uid, 'error', 0, error.message || '上传失败')
          
          // 触发error事件
          this.$emit('error', { code: 'UPLOADER_ERROR', file: fileObj, error })
        }
      } else {
        // 无上传器，直接标记为成功
        this.updateFileStatus(fileObj.uid, 'success', 100)
      }
    },
    
    // 上传进度回调
    onUploadProgress(uid, percent) {
      this.updateFileProgress(uid, percent)
    },
    
    // 更新文件进度
    updateFileProgress(uid, percent) {
      const newFileList = this.modelValue.map(file => {
        if (file.uid === uid) {
          return { ...file, percent: Math.min(Math.max(0, percent), 100) }
        }
        return file
      })
      
      this.$emit('update:modelValue', newFileList)
      this.$emit('progress', percent, this.findFileByUid(uid))
    },
    
    // 更新文件状态
    updateFileStatus(uid, status, percent = undefined, errorMsg = '') {
      const newFileList = this.modelValue.map(file => {
        if (file.uid === uid) {
          const updates = { status }
          if (percent !== undefined) updates.percent = percent
          if (errorMsg) updates.errorMsg = errorMsg
          return { ...file, ...updates }
        }
        return file
      })
      
      this.$emit('update:modelValue', newFileList)
    },
    
    // 更新文件URL
    updateFileUrl(uid, url, thumbUrl = '') {
      const newFileList = this.modelValue.map(file => {
        if (file.uid === uid) {
          const updates = { url }
          if (thumbUrl) updates.thumbUrl = thumbUrl
          return { ...file, ...updates }
        }
        return file
      })
      
      this.$emit('update:modelValue', newFileList)
    },
    
    // 通过UID查找文件
    findFileByUid(uid) {
      return this.modelValue.find(file => file.uid === uid)
    },
    
    // 处理图片点击
    handleImageClick(file, index) {
      // 如果启用预览，点击图片时打开预览
      if (this.showPreview) {
        this.handlePreview(file, index)
      }
    },
    
    // 预览图片
    handlePreview(file, index) {
      this.currentPreviewIndex = index
      this.previewVisible = true
      this.viewerLoading = true
      this.viewerError = false
      
      this.$emit('preview', file, index)
    },
    
    // 关闭预览
    closePreview() {
      this.previewVisible = false
      this.$emit('close-preview')
    },
    
    // 上一张图片
    prevImage() {
      if (this.currentPreviewIndex > 0) {
        this.currentPreviewIndex--
        this.viewerLoading = true
        this.viewerError = false
      }
    },
    
    // 下一张图片
    nextImage() {
      if (this.currentPreviewIndex < this.modelValue.length - 1) {
        this.currentPreviewIndex++
        this.viewerLoading = true
        this.viewerError = false
      }
    },
    
    // 处理图片加载
    handleImageLoad(file) {
      if (file.status === 'loading') {
        this.updateFileStatus(file.uid, 'success')
      }
    },
    
    // 处理图片加载失败
    handleImageError(file) {
      this.updateFileStatus(file.uid, 'error', 0, '图片加载失败')
    },
    
    // 处理查看器图片加载
    handleViewerImageLoad() {
      this.viewerLoading = false
      this.viewerError = false
    },
    
    // 处理查看器图片加载失败
    handleViewerImageError() {
      this.viewerLoading = false
      this.viewerError = true
    },
    
    // 编辑图片
    handleEdit(file, index) {
      this.$emit('edit', file, index)
    },
    
    // 删除图片
    handleRemove(file, index) {
      // 触发删除前事件
      const beforeRemoveEvent = this.$emit('before-remove', file, index)
      if (beforeRemoveEvent === false) {
        return
      }
      
      // 从列表中移除
      const newFileList = this.modelValue.filter(f => f.uid !== file.uid)
      this.$emit('update:modelValue', newFileList)
      
      // 触发删除事件
      this.$emit('remove', file, index)
      
      // 清理ObjectURL
      if (file.objectUrl) {
        URL.revokeObjectURL(file.objectUrl)
        this.objectUrls = this.objectUrls.filter(url => url !== file.objectUrl)
      }
    },
    
    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes || bytes <= 0) return '0 Bytes'
      
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    // 截断文件名
    truncateFileName(name, maxLength = 10) {
      if (!name || name.length <= maxLength) return name
      
      const ext = name.substring(name.lastIndexOf('.') + 1)
      const baseName = name.substring(0, name.lastIndexOf('.'))
      
      if (baseName.length <= maxLength - 3) {
        return name
      }
      
      return baseName.substring(0, maxLength - 3) + '...' + (ext ? '.' + ext : '')
    },
    
    // 清空所有图片
    clear() {
      // 清理所有ObjectURL
      this.modelValue.forEach(file => {
        if (file.objectUrl) {
          URL.revokeObjectURL(file.objectUrl)
        }
      })
      this.objectUrls = []
      
      // 清空列表
      this.$emit('update:modelValue', [])
      this.$emit('clear')
    }
  }
}
</script>

<style scoped>
.image-upload {
  position: relative;
}

.image-upload.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 上传按钮 */
.upload-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-button:hover {
  border-color: #40a9ff;
  background-color: #e6f7ff;
}

.upload-button.drag-over {
  border-color: #1890ff;
  background-color: #e6f7ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 上传图标 */
.upload-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.upload-icon-inner {
  width: 24px;
  height: 24px;
  border: 2px solid #d9d9d9;
  border-radius: 50%;
  position: relative;
}

.upload-icon-inner::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 2px;
  background-color: #d9d9d9;
  transform: translate(-50%, -50%);
}

.upload-icon-inner::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 10px;
  background-color: #d9d9d9;
  transform: translate(-50%, -50%);
}

.upload-button:hover .upload-icon-inner,
.upload-button.drag-over .upload-icon-inner {
  border-color: #40a9ff;
}

.upload-button:hover .upload-icon-inner::before,
.upload-button:hover .upload-icon-inner::after,
.upload-button.drag-over .upload-icon-inner::before,
.upload-button.drag-over .upload-icon-inner::after {
  background-color: #40a9ff;
}

/* 上传文本 */
.upload-text {
  text-align: center;
}

.upload-title {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 4px;
}

.upload-desc {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

/* 图片列表 */
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}

/* 图片项 */
.image-item {
  position: relative;
  width: 120px;
  transition: all 0.3s;
}

.image-item.error {
  border: 1px solid #ffccc7;
  border-radius: 4px;
}

/* 图片预览容器 */
.image-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f5f5;
  cursor: pointer;
  border: 1px solid #e8e8e8;
}

/* 预览图片 */
.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.image-preview:hover .image {
  transform: scale(1.05);
}

/* 图片加载中 */
.image-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

/* 加载动画 */
.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #40a9ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 图片覆盖层 */
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

/* 状态指示器 */
.status-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #fff;
}

.status-indicator.uploading {
  background-color: rgba(24, 144, 255, 0.8);
  padding: 2px;
}

.status-indicator.success {
  background-color: rgba(82, 196, 26, 0.8);
}

.status-indicator.error {
  background-color: rgba(245, 34, 45, 0.8);
}

/* 上传中动画 */
.loading-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #fff;
  margin: 0 1px;
  animation: loading 1.4s infinite ease-in-out both;
}

.loading-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading {
  0%, 80%, 100% { 
    transform: scale(0);
    opacity: 0.5;
  }
  40% { 
    transform: scale(1);
    opacity: 1;
  }
}

/* 图片操作按钮 */
.image-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.action-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: rgba(0, 0, 0, 0.65);
}

.action-btn:hover {
  background-color: #fff;
  color: #1890ff;
  transform: scale(1.1);
}

/* 上传进度条 */
.upload-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: rgba(0, 0, 0, 0.1);
}

.upload-progress-bar {
  height: 100%;
  background-color: #1890ff;
  transition: width 0.3s;
}

/* 文件信息 */
.file-info {
  margin-top: 8px;
}

.file-name {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.file-size {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 2px;
}

/* 错误信息 */
.error-message {
  font-size: 11px;
  color: #f5222d;
  margin-top: 4px;
}

/* 数量提示 */
.image-count-hint {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 12px;
}

/* 图片查看器 */
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.image-viewer {
  position: relative;
  width: 90%;
  height: 90%;
  display: flex;
  flex-direction: column;
  color: #fff;
}

/* 查看器关闭按钮 */
.viewer-close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s;
  z-index: 10;
}

.viewer-close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 查看器导航 */
.viewer-nav {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transform: translateY(-50%);
  padding: 0 20px;
  z-index: 5;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s;
}

.nav-btn:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.7);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-info {
  background-color: rgba(0, 0, 0, 0.5);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
}

/* 查看器内容 */
.viewer-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.viewer-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.viewer-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-loading .loading-spinner {
  width: 40px;
  height: 40px;
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
}

.viewer-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.viewer-error .error-icon {
  width: 40px;
  height: 40px;
  border: 2px solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 16px;
}

.error-text {
  font-size: 16px;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .image-item {
    width: 100px;
  }
  
  .image-preview {
    width: 100px;
    height: 100px;
  }
  
  .upload-button {
    height: 100px;
  }
  
  .viewer-nav {
    padding: 0 10px;
  }
  
  .nav-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .viewer-close-btn {
    top: 10px;
    right: 10px;
  }
}
</style>