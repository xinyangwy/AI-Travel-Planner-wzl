<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    :width="dialogWidth"
    :before-close="handleClose"
    class="itinerary-item-dialog"
    top="5vh"
  >
    <itinerary-item-form
      ref="itineraryForm"
      :isEditMode="isEditMode"
      :itemData="itemData"
      :defaultDate="defaultDate"
      @submit="handleSubmit"
      @cancel="handleClose"
    />
  </el-dialog>
</template>

<script>
import ItineraryItemForm from './ItineraryItemForm.vue'

export default {
  name: 'ItineraryItemDialog',
  components: {
    ItineraryItemForm
  },
  props: {
    // 对话框是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // 是否为编辑模式
    isEditMode: {
      type: Boolean,
      default: false
    },
    // 行程项数据（编辑模式下使用）
    itemData: {
      type: Object,
      default: () => ({})
    },
    // 默认日期（可选，新增行程项时使用）
    defaultDate: {
      type: String,
      default: ''
    },
    // 对话框宽度
    width: {
      type: String,
      default: '80%'
    },
    // 是否限制宽度最大值（针对大屏显示）
    maxWidth: {
      type: Boolean,
      default: true
    },
    // 最大宽度值
    maxWidthValue: {
      type: String,
      default: '800px'
    }
  },
  computed: {
    // 对话框标题
    dialogTitle() {
      return this.isEditMode ? '编辑行程项' : '添加行程项'
    },
    // 对话框宽度
    dialogWidth() {
      // 如果是大屏且开启最大宽度限制，则返回maxWidthValue
      if (this.maxWidth && window.innerWidth > parseInt(this.maxWidthValue)) {
        return this.maxWidthValue
      }
      return this.width
    }
  },
  watch: {
    // 监听窗口大小变化
    visible(newVal) {
      if (newVal) {
        // 对话框打开后，重新计算宽度以适应窗口
        this.$nextTick(() => {
          this.$forceUpdate()
        })
      }
    }
  },
  methods: {
    // 处理表单提交
    handleSubmit(formData) {
      // 发送表单数据给父组件
      this.$emit('submit', formData)
    },
    
    // 处理对话框关闭
    handleClose() {
      // 关闭对话框前，重置表单
      if (this.$refs.itineraryForm) {
        this.$refs.itineraryForm.resetForm()
      }
      // 通知父组件关闭对话框
      this.$emit('close')
    },
    
    // 重置表单（供父组件调用）
    resetForm() {
      if (this.$refs.itineraryForm) {
        this.$refs.itineraryForm.resetForm()
      }
    },
    
    // 获取表单数据（供父组件调用）
    getFormData() {
      if (this.$refs.itineraryForm) {
        return this.$refs.itineraryForm.getFormData()
      }
      return null
    },
    
    // 手动触发表单验证
    validateForm() {
      if (this.$refs.itineraryForm) {
        return this.$refs.itineraryForm.validateForm()
      }
      return Promise.resolve(true)
    }
  },
  // 监听窗口大小变化，调整对话框宽度
  mounted() {
    window.addEventListener('resize', this.$forceUpdate)
  },
  // 组件销毁前移除事件监听
  beforeDestroy() {
    window.removeEventListener('resize', this.$forceUpdate)
  }
}
</script>

<style scoped>
.itinerary-item-dialog {
  border-radius: 8px;
  overflow: hidden;
}

/* 对话框头部样式 */
:deep(.el-dialog__header) {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fafafa;
}

:deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

/* 对话框内容样式 */
:deep(.el-dialog__body) {
  padding: 24px;
  max-height: calc(90vh - 140px);
  overflow-y: auto;
}

/* 对话框底部样式 */
:deep(.el-dialog__footer) {
  padding: 16px 24px 20px;
  border-top: 1px solid #ebeef5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.el-dialog__header) {
    padding: 15px 20px 12px;
  }
  
  :deep(.el-dialog__body) {
    padding: 16px;
    max-height: calc(90vh - 120px);
  }
  
  :deep(.el-dialog__footer) {
    padding: 12px 16px 16px;
  }
}
</style>