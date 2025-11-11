# API 速率限制处理

## 问题描述

当使用 ModelScope API 时，可能会遇到 429 错误（请求限制超出）：

```
Error code: 429 - {'errors': {'message': 'Request limit exceeded.', 'request_id': '...'}}
```

## 解决方案

项目已实现自动重试机制来处理速率限制问题。

### 重试策略

**主要特性：**
- 自动检测 429 错误和速率限制相关错误
- 指数退避重试（2秒 → 4秒 → 8秒）
- 最多重试 3 次
- 实时日志显示重试进度

**重试逻辑：**
1. 检测到速率限制错误
2. 等待指定时间（初始 2 秒）
3. 重新执行请求
4. 如果再次失败，延迟时间翻倍
5. 最多重试 3 次

### 实现细节

#### 1. 重试装饰器

位置：`backend/app/utils/retry_handler.py`

```python
@retry_on_rate_limit(
    max_retries=3,           # 最大重试次数
    initial_delay=2.0,       # 初始延迟（秒）
    backoff_factor=2.0,      # 延迟倍增因子
    max_delay=60.0           # 最大延迟（秒）
)
def your_function():
    # 你的代码
    pass
```

#### 2. 应用位置

重试机制已应用于：

**旅行规划主流程：**
- `plan_trip()` - 整体规划流程
- 最多重试 3 次，初始延迟 2 秒

**子任务：**
- `_search_attractions_with_retry()` - 景点搜索
- `_get_weather_with_retry()` - 天气查询
- `_get_hotels_with_retry()` - 酒店搜索
- 每个子任务最多重试 2 次，初始延迟 1 秒

### 用户体验

**重试时的日志输出：**

```
🚀 开始生成旅行计划...
⚡ 并行查询景点、天气、酒店信息...
⚠️  遇到速率限制 (尝试 1/4)，2.0秒后重试...
⚠️  遇到速率限制 (尝试 2/4)，4.0秒后重试...
✅ 信息查询完成
📋 生成行程计划...
✅ 旅行计划生成完成!
```

**所有重试失败后：**

```
❌ API请求限制: 已达到最大重试次数，请稍后再试
💡 建议: 等待几分钟后重试，或联系管理员检查API配额
```

## 最佳实践

### 1. 避免频繁请求

- 使用缓存机制（已实现）
- 合理控制并发请求数量
- 避免短时间内大量请求

### 2. 监控 API 使用

定期检查 ModelScope API 配额：
- 访问 ModelScope 控制台
- 查看 API 调用统计
- 根据需要升级配额

### 3. 配置优化

在 `backend/.env` 中调整配置：

```env
# 减少并发工作线程
PERF_MAX_WORKERS=2

# 启用缓存
PERF_ENABLE_CACHE=true

# LLM 超时时间
LLM_TIMEOUT=180
```

### 4. 错误处理

如果频繁遇到速率限制：

**短期解决方案：**
- 等待几分钟后重试
- 减少并发请求数量
- 使用缓存避免重复请求

**长期解决方案：**
- 升级 API 配额
- 实现请求队列
- 使用多个 API 密钥轮换

## 技术细节

### 错误检测

重试机制会检测以下错误模式：

```python
is_rate_limit = (
    "429" in error_str or
    "rate limit" in error_str.lower() or
    "request limit exceeded" in error_str.lower() or
    "too many requests" in error_str.lower()
)
```

### 延迟计算

```python
# 第1次重试: 2秒
# 第2次重试: 4秒
# 第3次重试: 8秒
current_delay = min(initial_delay * (backoff_factor ** attempt), max_delay)
```

### 并发控制

使用 `ThreadPoolExecutor` 控制并发：

```python
with ThreadPoolExecutor(max_workers=3) as executor:
    # 最多同时执行3个任务
    attraction_future = executor.submit(...)
    weather_future = executor.submit(...)
    hotel_future = executor.submit(...)
```

## 故障排查

### 问题：仍然频繁遇到 429 错误

**可能原因：**
1. API 配额已用完
2. 并发请求过多
3. 短时间内重复请求

**解决方法：**
1. 检查 ModelScope API 配额
2. 减少 `PERF_MAX_WORKERS` 值
3. 增加重试延迟时间
4. 启用缓存机制

### 问题：重试时间过长

**调整重试参数：**

编辑 `backend/app/agents/trip_planner_agent.py`：

```python
@retry_on_rate_limit(
    max_retries=2,        # 减少重试次数
    initial_delay=1.0,    # 减少初始延迟
    backoff_factor=1.5    # 减少倍增因子
)
```

### 问题：需要更详细的日志

启用详细日志：

```env
# backend/.env
PERF_VERBOSE_LOGGING=true
LOG_LEVEL=DEBUG
```

## 相关文档

- [ModelScope API 文档](https://modelscope.cn/docs)
- [FastAPI 错误处理](https://fastapi.tiangolo.com/tutorial/handling-errors/)
- [Python 重试模式](https://docs.python.org/3/library/functools.html)

---

**更新日期**: 2025-11-11
**版本**: 1.0.0
