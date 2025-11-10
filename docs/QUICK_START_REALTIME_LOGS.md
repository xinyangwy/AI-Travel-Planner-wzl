# 🚀 实时日志功能 - 快速开始

## 一分钟快速体验

### 1️⃣ 启动后端 (终端1)
```bash
cd backend
python run.py
```

等待看到:
```
✅ 多智能体系统初始化成功
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2️⃣ 启动前端 (终端2)
```bash
cd frontend
npm run dev
```

等待看到:
```
➜  Local:   http://localhost:5173/
```

### 3️⃣ 测试功能

1. 打开浏览器访问: http://localhost:5173
2. 填写表单:
   - 城市: `南京`
   - 日期: 选择今天和明天
   - 其他: 保持默认
3. 点击 **"开始规划我的旅行"**
4. 🎉 观察实时日志输出!

## 📸 预期效果

你会看到:
- ✅ 进度条开始加载
- ✅ 黑色终端风格的日志窗口出现
- ✅ 日志消息逐条实时显示:
  ```
  📥 收到旅行规划请求:
  城市: 南京
  🚀 开始多智能体协作规划旅行...
  ⚡ 并行查询景点、天气、酒店信息...
  📝 查询南京的天气信息...
  ✅ 天气信息查询完成
  🏨 搜索南京的经济型酒店酒店...
  ✅ 酒店信息查询完成
  📋 生成行程计划...
  ✅ 旅行计划生成完成!
  ```
- ✅ 日志自动着色(成功=绿色, 信息=蓝色)
- ✅ 自动滚动到最新日志
- ✅ 完成后跳转到结果页面

## 🎨 日志着色说明

- 🔴 **红色**: 错误消息 (包含 ❌ 或 "失败")
- 🟢 **绿色**: 成功消息 (包含 ✅ 或 "成功"/"完成")
- 🟡 **黄色**: 警告消息 (包含 ⚠️ 或 "警告")
- 🔵 **蓝色**: 信息消息 (包含 🚀 或 "开始")
- ⚪ **灰白**: 普通消息

## 🔧 故障排除

### 问题: 日志不显示
**解决方案:**
1. 检查后端是否正常运行 (终端1)
2. 检查浏览器控制台是否有错误 (F12)
3. 确认 http://localhost:8000 可访问

### 问题: 后端启动失败
**解决方案:**
```bash
# 检查依赖
cd backend
pip install -r requirements.txt

# 检查环境变量
# 确保 .env 文件存在并配置正确
```

### 问题: 前端启动失败
**解决方案:**
```bash
# 重新安装依赖
cd frontend
rm -rf node_modules
npm install
npm run dev
```

## 📚 更多信息

- **详细使用说明**: [docs/REALTIME_LOGS_USAGE.md](docs/REALTIME_LOGS_USAGE.md)
- **架构设计**: [docs/REALTIME_LOGS_ARCHITECTURE.md](docs/REALTIME_LOGS_ARCHITECTURE.md)
- **测试指南**: [test_realtime_logs.md](test_realtime_logs.md)
- **完整总结**: [REALTIME_LOGS_SUMMARY.md](REALTIME_LOGS_SUMMARY.md)

## 🎯 核心文件

### 后端
- `backend/app/api/routes/trip.py` - SSE 端点
- `backend/app/utils/log_streamer.py` - 日志流管理
- `backend/app/agents/trip_planner_agent.py` - Agent 日志集成

### 前端
- `frontend/src/components/LogViewer.vue` - 日志显示组件
- `frontend/src/services/api.ts` - SSE 客户端
- `frontend/src/views/Home.vue` - 页面集成

## ✨ 功能亮点

1. **实时性**: 使用 SSE 协议,日志实时推送
2. **并发支持**: 多用户同时使用,互不干扰
3. **用户友好**: 终端风格,自动着色,自动滚动
4. **性能优化**: 缓存机制,并行查询,非阻塞 I/O
5. **错误处理**: 友好的错误提示和恢复机制

## 🎉 开始使用吧!

现在你已经准备好体验实时日志功能了。如果遇到任何问题,请查看上面的故障排除部分或相关文档。

祝你使用愉快! 🚀
