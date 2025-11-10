# Docker 依赖问题修复

## 🐛 问题描述

### 错误信息
```
ModuleNotFoundError: No module named 'huggingface_hub'
```

### 完整错误堆栈
```python
File "/app/app/api/main.py", line 6, in <module>
    from .routes import trip, poi, map as map_routes
File "/app/app/api/routes/trip.py", line 15, in <module>
    from ...agents.trip_planner_agent import get_trip_planner_agent
File "/app/app/agents/trip_planner_agent.py", line 7, in <module>
    from hello_agents import SimpleAgent
...
File "/usr/local/lib/python3.11/site-packages/hello_agents/evaluation/benchmarks/data_generation/dataset.py", line 14, in <module>
    from huggingface_hub import snapshot_download
ModuleNotFoundError: No module named 'huggingface_hub'
```

### 问题原因

`hello-agents` 库依赖 `huggingface_hub`，但在某些情况下（特别是 Docker 构建环境），这个间接依赖可能不会被自动安装。

## ✅ 解决方案

### 修改 requirements.txt

在 `backend/requirements.txt` 中显式添加 `huggingface_hub` 依赖：

```txt
# HelloAgents框架
hello-agents[protocols]>=0.2.4

# HelloAgents 依赖（显式添加以确保 Docker 构建成功）
huggingface_hub>=0.20.0

# FastAPI和相关依赖
fastapi>=0.115.0
...
```

## 🔄 重新构建和部署

### 方式 1: 推送代码触发自动构建（推荐）

```bash
# 1. 提交修改
git add backend/requirements.txt
git commit -m "fix: add huggingface_hub dependency for Docker build"
git push origin main

# 2. GitHub Actions 会自动构建并推送新镜像到阿里云
# 3. 等待构建完成（约 5-10 分钟）
```

### 方式 2: 本地构建测试

```bash
# 1. 进入后端目录
cd backend

# 2. 构建镜像
docker build -t ai-travel-planner-backend:test .

# 3. 测试运行
docker run -p 8000:8000 --env-file .env ai-travel-planner-backend:test

# 4. 验证是否正常启动
curl http://localhost:8000/health
```

### 方式 3: 拉取新镜像并重启

等待 GitHub Actions 构建完成后：

```bash
# 1. 登录阿里云镜像仓库
docker login crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com

# 2. 拉取最新镜像
docker pull crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/backend:main

# 3. 停止旧容器
docker stop ai-travel-planner-backend

# 4. 删除旧容器
docker rm ai-travel-planner-backend

# 5. 启动新容器
docker run -d \
  --name ai-travel-planner-backend \
  -p 8000:8000 \
  --env-file .env \
  crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/backend:main
```

## 🧪 验证修复

### 1. 检查容器日志

```bash
docker logs ai-travel-planner-backend
```

**预期输出**（正常启动）：
```
✅ LLM服务初始化成功
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. 测试 API 端点

```bash
# 健康检查
curl http://localhost:8000/health

# API 文档
curl http://localhost:8000/docs
```

### 3. 测试完整功能

访问前端应用，创建一个旅行计划，确认后端正常工作。

## 📊 相关依赖说明

### hello-agents 依赖树

```
hello-agents
├── huggingface_hub  ← 缺失的依赖
├── pydantic
├── httpx
└── ...
```

### 为什么需要显式添加？

1. **间接依赖问题**: `huggingface_hub` 是 `hello-agents` 的间接依赖
2. **Docker 构建环境**: 在某些情况下，pip 可能不会自动解析所有间接依赖
3. **版本锁定**: 显式指定版本可以避免兼容性问题

## 🔍 类似问题排查

如果遇到其他 `ModuleNotFoundError`，按以下步骤排查：

### 1. 查看完整错误堆栈

```bash
docker logs ai-travel-planner-backend
```

### 2. 识别缺失的模块

错误信息会显示：`ModuleNotFoundError: No module named 'xxx'`

### 3. 添加到 requirements.txt

```bash
# 在 backend/requirements.txt 中添加
xxx>=version
```

### 4. 重新构建

```bash
git add backend/requirements.txt
git commit -m "fix: add missing dependency xxx"
git push origin main
```

## 🛠️ 预防措施

### 1. 本地测试 Docker 构建

在推送代码前，先在本地测试 Docker 构建：

```bash
cd backend
docker build -t backend-test .
docker run -p 8000:8000 --env-file .env backend-test
```

### 2. 使用 pip freeze

生成完整的依赖列表：

```bash
# 在虚拟环境中
pip freeze > requirements-full.txt

# 对比差异
diff requirements.txt requirements-full.txt
```

### 3. 添加依赖检查

在 Dockerfile 中添加依赖检查：

```dockerfile
# 安装依赖后验证
RUN pip install --no-cache-dir -r requirements.txt && \
    python -c "import hello_agents; import huggingface_hub" || \
    (echo "Dependency check failed" && exit 1)
```

## 📚 相关文档

- [Docker 快速开始](DOCKER_QUICK_START.md)
- [Docker 部署指南](docs/DOCKER_DEPLOYMENT.md)
- [Docker 构建修复](DOCKER_BUILD_FIX.md)
- [GitHub Actions 配置](docs/GITHUB_ACTIONS_SETUP.md)

## 🎯 总结

### 问题
- Docker 容器启动失败
- 缺少 `huggingface_hub` 模块

### 原因
- `hello-agents` 的间接依赖未被自动安装

### 解决
- 在 `requirements.txt` 中显式添加 `huggingface_hub>=0.20.0`

### 验证
- 推送代码触发自动构建
- 拉取新镜像并重启容器
- 检查容器日志确认正常启动

---

**修复状态**: ✅ 已修复  
**影响范围**: Docker 部署  
**修复时间**: 2025-11-10  
**版本**: v2.0.1
