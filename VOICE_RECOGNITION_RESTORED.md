# ✅ 语音识别已还原为 Web Speech API

## 📖 说明

语音识别功能已还原为使用浏览器原生的 Web Speech API，不再使用科大讯飞 API。

## 🔄 还原内容

### 1. 前端代码
- ✅ 还原 `frontend/src/composables/useSpeechRecognition.ts`
- ✅ 使用浏览器原生 Web Speech API
- ✅ 更新 `frontend/src/views/Home.vue` 使用方式

### 2. 后端代码
- ✅ 删除 `backend/app/api/routes/speech.py`（如果存在）
- ✅ 移除 main.py 中的 speech 路由引用
- ✅ 移除 config.py 中的科大讯飞配置

### 3. 文档
- ✅ 删除 `docs/XFYUN_SPEECH_SETUP.md`
- ✅ 删除 `XFYUN_SPEECH_QUICK_START.md`
- ✅ 保留 `docs/VOICE_RECOGNITION_FEATURE.md`（Web Speech API 文档）
- ✅ 保留 `VOICE_RECOGNITION_QUICK_START.md`（快速开始指南）

## ✨ 当前功能

### Web Speech API 方案

#### 优点
- ✅ **零成本** - 完全免费
- ✅ **零配置** - 无需 API Key
- ✅ **高准确率** - 基于 Google 语音引擎
- ✅ **即开即用** - 无需后端支持
- ✅ **隐私保护** - 语音数据不经过第三方

#### 限制
- ⚠️ **浏览器限制** - 仅支持 Chrome/Edge/Safari
- ⚠️ **不支持 Firefox** - Firefox 不支持 Web Speech API
- ⚠️ **需要网络** - 调用 Google 服务

## 🚀 使用方法

### 1. 启动应用

```bash
# 启动前端
cd frontend
npm run dev
```

### 2. 使用语音输入

1. 访问 http://localhost:5173
2. 在"额外要求"输入框下方，点击 **🎤 语音输入**
3. 允许麦克风权限（首次使用）
4. 开始说话
5. 识别结果自动填充

## 🌐 浏览器支持

| 浏览器 | 支持情况 | 推荐 |
|--------|----------|------|
| Chrome | ✅ 完全支持 | ⭐⭐⭐⭐⭐ |
| Edge | ✅ 完全支持 | ⭐⭐⭐⭐⭐ |
| Safari | ✅ 支持 | ⭐⭐⭐⭐ |
| Firefox | ❌ 不支持 | - |
| Opera | ✅ 完全支持 | ⭐⭐⭐⭐ |

## 📊 功能特性

### 1. 一键录音
- 点击麦克风按钮即可开始
- 无需长按或其他复杂操作

### 2. 实时反馈
- 🎤 未录音：灰色麦克风图标
- 🔴 录音中：红色按钮 + 脉动动画
- ✅ 识别成功：绿色提示

### 3. 自动填充
- 识别结果自动填入输入框
- 支持追加模式（多次录音）

### 4. 友好提示
- 开始录音："开始录音，请说话..."
- 识别成功："识别成功！"
- 识别失败："语音识别失败: [原因]"

## 💡 使用技巧

### 提高识别准确率

✅ **环境**
- 在安静的环境中使用
- 避免背景噪音

✅ **说话方式**
- 说话清晰、语速适中
- 使用标准普通话
- 避免方言和口音

✅ **设备**
- 使用高质量麦克风
- 确保麦克风正常工作

## 🔐 权限管理

### 麦克风权限

首次使用时，浏览器会弹出权限请求：

```
localhost 想要使用您的麦克风
[阻止] [允许]
```

点击 **[允许]** 即可使用。

### 权限被拒绝？

**Chrome/Edge:**
1. 点击地址栏左侧的 🔒 图标
2. 找到"麦克风"权限
3. 选择"允许"
4. 刷新页面

**Safari:**
1. Safari → 偏好设置 → 网站
2. 找到"麦克风"
3. 允许 localhost

## ❓ 常见问题

### Q: 为什么点击麦克风没反应？

**A**: 可能的原因：
1. 浏览器不支持（如 Firefox）
2. 没有授予麦克风权限
3. 没有检测到麦克风设备
4. 不是 HTTPS 环境（生产环境）

**解决方法：**
- 使用 Chrome 或 Edge 浏览器
- 检查浏览器权限设置
- 确保麦克风已连接
- 使用 HTTPS 或 localhost

### Q: 识别准确率不高？

**A**: 提高准确率的方法：
1. 使用高质量麦克风
2. 在安静环境中使用
3. 说话清晰、语速适中
4. 使用标准普通话
5. 避免方言和口音

### Q: 如何支持 Firefox？

**A**: Firefox 不支持 Web Speech API。如果需要支持 Firefox，可以：
1. 使用科大讯飞等第三方服务
2. 或者提示用户使用 Chrome/Edge 浏览器

## 📚 相关文档

- 📖 详细功能文档：`docs/VOICE_RECOGNITION_FEATURE.md`
- 🚀 快速开始指南：`VOICE_RECOGNITION_QUICK_START.md`
- 💻 实现代码：`frontend/src/composables/useSpeechRecognition.ts`

## 🎉 总结

语音识别功能已成功还原为使用 Web Speech API：

✅ **优点**
- 零成本、零配置
- 高准确率
- 即开即用

⚠️ **限制**
- 仅支持 Chrome/Edge/Safari
- 不支持 Firefox

适合大多数用户使用，特别是使用 Chrome 浏览器的用户！

---

**状态**: ✅ 已还原  
**方案**: Web Speech API  
**配置要求**: 无  
**推荐浏览器**: Chrome/Edge
