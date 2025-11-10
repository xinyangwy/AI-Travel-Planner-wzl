# 实时日志功能使用说明

## 功能概述

实时日志功能允许用户在生成旅行计划时,实时查看后端处理进度和详细日志信息。这提供了更好的用户体验,让用户了解系统正在做什么。

## 技术实现

### 后端实现

1. **日志流管理器** (`backend/app/utils/log_streamer.py`)
   - 使用队列管理每个请求的日志流
   - 支持多个并发请求的日志隔离
   - 提供异步日志生成器

2. **SSE端点** (`/api/trip/plan-stream`)
   - 使用Server-Sent Events (SSE)协议
   - 实时推送日志消息到前端
   - 在后台线程中执行旅行规划任务

3. **Agent日志集成**
   - 在`MultiAgentTripPlanner`中添加`_log()`方法
   - 所有关键步骤都会发送日志消息
   - 同时保持控制台输出

### 前端实现

1. **LogViewer组件** (`frontend/src/components/LogViewer.vue`)
   - 终端风格的日志显示界面
   - 自动滚动到最新日志
   - 根据日志内容自动着色(成功/错误/警告/信息)

2. **API服务** (`frontend/src/services/api.ts`)
   - `generateTripPlanWithLogs()` 函数处理SSE流
   - 解析日志消息并通过回调函数传递
   - 处理最终结果和错误

3. **Home页面集成**
   - 在加载时显示LogViewer组件
   - 实时接收并显示日志消息
   - 保持原有的进度条显示

## 使用方式

### 用户视角

1. 在首页填写旅行规划表单
2. 点击"开始规划我的旅行"按钮
3. 在进度条下方会出现实时日志窗口
4. 可以看到以下信息:
   - 📥 收到请求信息
   - 🚀 开始多智能体协作
   - ⚡ 并行查询景点、天气、酒店
   - 📝 查询天气信息
   - 🏨 搜索酒店信息
   - ✅ 各步骤完成状态
   - 📋 生成行程计划
   - 💾 保存到数据库

### 开发者视角

#### 添加新的日志消息

在`trip_planner_agent.py`中使用`_log()`方法:

```python
self._log(stream_id, "🔍 正在搜索景点...")
```

#### 创建新的流式端点

参考`/api/trip/plan-stream`的实现:

```python
@router.post("/your-endpoint")
async def your_endpoint_stream(request: YourRequest):
    stream_id = str(uuid.uuid4())
    log_streamer = get_log_streamer()
    
    async def generate():
        # 发送日志
        log_streamer.emit_log(stream_id, json.dumps({
            "type": "log",
            "message": "你的日志消息"
        }, ensure_ascii=False))
        
        # 执行任务...
        
        # 发送结果
        yield f"data: {json.dumps({'type': 'result', 'data': result})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")
```

## 日志类型

系统支持以下日志类型:

- **log**: 普通日志消息
- **result**: 最终结果数据
- **error**: 错误消息

日志会根据内容自动着色:
- ❌ 错误 (红色)
- ✅ 成功 (绿色)
- ⚠️ 警告 (黄色)
- 🚀 信息 (蓝色)

## 性能考虑

1. **并发支持**: 每个请求使用独立的stream_id,支持多用户并发
2. **内存管理**: 日志流在完成后自动清理
3. **非阻塞**: 使用异步生成器,不会阻塞主线程
4. **缓存优化**: 天气和酒店查询结果会被缓存,减少重复请求

## 兼容性

- 后端: FastAPI + SSE
- 前端: Fetch API + EventSource模拟
- 浏览器: 支持所有现代浏览器

## 故障排除

### 日志不显示

1. 检查后端是否正确启动
2. 检查浏览器控制台是否有错误
3. 确认`/api/trip/plan-stream`端点可访问

### 日志延迟

1. 检查网络连接
2. 确认后端没有被阻塞
3. 查看后端日志是否有异常

### 连接中断

1. SSE连接可能因网络问题中断
2. 前端会显示错误消息
3. 用户可以重新提交请求
