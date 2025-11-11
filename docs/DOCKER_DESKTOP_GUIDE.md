# 🐳 Docker Desktop 运行指南

## 📋 目录

- [前置要求](#前置要求)
- [快速开始（5分钟）](#快速开始5分钟)
- [详细步骤](#详细步骤)
- [常见问题](#常见问题)
- [故障排除](#故障排除)

---

## 前置要求

### 1. 安装 Docker Desktop

**Windows**:
- 下载: https://www.docker.com/products/docker-desktop/
- 安装并启动 Docker Desktop
- 确保 Docker Desktop 正在运行（系统托盘有 Docker 图标）

**Mac**:
- 下载: https://www.docker.com/products/docker-desktop/
- 安装并启动 Docker Desktop
- 确保 Docker Desktop 正在运行（菜单栏有 Docker 图标）

### 2. 验证 Docker 安装

打开终端（Windows 使用 PowerShell 或 CMD），运行：

```bash
docker --version
docker-compose --version
```

应该看到类似输出：
```
Docker version 24.0.0
Docker Compose version v2.20.0
```

---

## 快速开始（5分钟）

### 步骤 1: 创建项目目录

```bash
# Windows (PowerShell)
mkdir C:\ai-travel-planner
cd C:\ai-travel-planner

# Mac/Linux
mkdir ~/ai-travel-planner
cd ~/ai-travel-planner
```

### 步骤 2: 创建配置文件

#### 2.1 创建 `docker-compose.yml`

```yaml
version: '3.8'

services:
  backend:
    image: crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/backend:main
    container_name: ai-travel-planner-backend
    ports:
      - "8000:8000"
    environment:
      # 高德地图 API Key（必需）
      - AMAP_API_KEY=your_amap_api_key_here
      
      # ModelScope API Key（必需）
      - MODELSCOPE_API_KEY=your_modelscope_api_key_here
      
      # Supabase 配置（可选，用于用户认证和历史记录）
      - SUPABASE_URL=your_supabase_url
      - SUPABASE_SERVICE_KEY=your_supabase_service_key
      - SUPABASE_JWT_SECRET=your_supabase_jwt_secret
      - DATABASE_URL=your_database_url
      
      # 性能配置（可选）
      - PERF_MAX_WORKERS=3
      - PERF_ENABLE_CACHE=true
      - PERF_VERBOSE_LOGGING=false
      
      # 服务器配置
      - HOST=0.0.0.0
      - PORT=8000
      - LOG_LEVEL=INFO
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    image: crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/frontend:main
    container_name: ai-travel-planner-frontend
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

networks:
  app-network:
    driver: bridge
    name: ai-travel-planner-network
```

#### 2.2 编辑配置

**重要**：必须修改以下配置项：

1. **AMAP_API_KEY**: 你的高德地图 API Key
   - 获取地址: https://lbs.amap.com/
   
2. **MODELSCOPE_API_KEY**: 你的 ModelScope API Key
   - 获取地址: https://modelscope.cn/

3. **Supabase 配置**（可选，如果不需要用户认证功能可以不配置）
   - SUPABASE_URL
   - SUPABASE_SERVICE_KEY
   - SUPABASE_JWT_SECRET
   - DATABASE_URL

### 步骤 3: 启动服务

在 Docker Desktop 中：

#### 方式 1: 使用 Docker Desktop GUI（推荐新手）

1. 打开 Docker Desktop
2. 点击左侧 "Images" 标签
3. 在搜索框输入镜像地址并拉取：
   - `crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/backend:main`
   - `crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/frontend:main`

4. 点击左侧 "Containers" 标签
5. 点击右上角 "Create" 按钮
6. 选择 "From Compose file"
7. 选择你创建的 `docker-compose.yml` 文件
8. 点击 "Run"

#### 方式 2: 使用命令行

```bash
# 进入项目目录
cd C:\ai-travel-planner  # Windows
# 或
cd ~/ai-travel-planner   # Mac/Linux

# 启动服务
docker-compose up -d
```

### 步骤 4: 验证运行

1. 打开 Docker Desktop
2. 点击 "Containers" 标签
3. 应该看到两个容器正在运行：
   - `ai-travel-planner-backend` (绿色圆点)
   - `ai-travel-planner-frontend` (绿色圆点)

4. 在浏览器访问：
   - 前端: http://localhost
   - 后端 API: http://localhost:8000/docs

---

## 详细步骤

### 1. 获取 API Keys

#### 1.1 高德地图 API Key（必需）

1. 访问: https://lbs.amap.com/
2. 注册/登录账号
3. 进入控制台
4. 创建应用
5. 添加 Key（选择 "Web 服务"）
6. 复制 API Key

#### 1.2 ModelScope API Key（必需）

1. 访问: https://modelscope.cn/
2. 注册/登录账号
3. 进入个人中心
4. 找到 API Key 设置
5. 创建或复制 API Key

#### 1.3 Supabase 配置（可选）

如果需要用户认证和历史记录功能：

1. 访问: https://supabase.com/
2. 创建项目
3. 获取以下信息：
   - Project URL (SUPABASE_URL)
   - Service Role Key (SUPABASE_SERVICE_KEY)
   - JWT Secret (SUPABASE_JWT_SECRET)
   - Database URL (DATABASE_URL)

详细配置请参考: [SETUP_SUPABASE.md](SETUP_SUPABASE.md)

### 2. 配置 docker-compose.yml

将上面的 `docker-compose.yml` 内容保存到文件，并修改以下配置：

```yaml
environment:
  # 替换为你的实际 API Key
  - AMAP_API_KEY=你的高德地图API_Key
  - MODELSCOPE_API_KEY=你的ModelScope_API_Key
  
  # 如果不需要用户认证，可以删除或注释掉以下配置
  # - SUPABASE_URL=...
  # - SUPABASE_SERVICE_KEY=...
  # - SUPABASE_JWT_SECRET=...
  # - DATABASE_URL=...
```

### 3. 在 Docker Desktop 中操作

#### 3.1 拉取镜像

**方式 1: 使用 GUI**

1. 打开 Docker Desktop
2. 点击左侧 "Images"
3. 点击右上角 "Pull"
4. 输入镜像地址：
   ```
   crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/backend:main
   ```
5. 点击 "Pull"
6. 重复步骤拉取前端镜像：
   ```
   crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/frontend:main
   ```

**方式 2: 使用命令行**

```bash
docker pull crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/backend:main
docker pull crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/frontend:main
```

#### 3.2 启动容器

**方式 1: 使用 Docker Compose（推荐）**

```bash
# 在 docker-compose.yml 所在目录
docker-compose up -d
```

**方式 2: 使用 Docker Desktop GUI**

1. 点击 "Containers"
2. 点击 "Create"
3. 选择 "From Compose file"
4. 选择 `docker-compose.yml`
5. 点击 "Run"

#### 3.3 查看日志

**在 Docker Desktop 中**:

1. 点击 "Containers"
2. 点击容器名称（如 `ai-travel-planner-backend`）
3. 点击 "Logs" 标签
4. 查看实时日志

**使用命令行**:

```bash
# 查看所有日志
docker-compose logs

# 实时查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
```

### 4. 验证运行状态

#### 4.1 检查容器状态

**在 Docker Desktop 中**:

1. 打开 "Containers" 标签
2. 确认两个容器都显示绿色圆点（Running）
3. 查看 "Status" 列，应该显示 "Up" 和运行时间

**使用命令行**:

```bash
docker-compose ps
```

应该看到：
```
NAME                          STATUS         PORTS
ai-travel-planner-backend     Up (healthy)   0.0.0.0:8000->8000/tcp
ai-travel-planner-frontend    Up             0.0.0.0:80->80/tcp
```

#### 4.2 测试访问

**后端 API**:
```bash
# 健康检查
curl http://localhost:8000/health

# 或在浏览器访问
http://localhost:8000/docs
```

**前端**:
```bash
# 在浏览器访问
http://localhost
```

### 5. 使用应用

1. 打开浏览器访问: http://localhost
2. 填写旅行信息：
   - 目的地城市
   - 旅行日期
   - 交通方式
   - 住宿偏好
   - 旅行风格
3. 点击 "开始规划我的旅行"
4. 查看实时日志输出
5. 等待规划完成
6. 查看详细的旅行计划

---

## 常见问题

### Q1: 后端容器启动失败，显示 "配置错误: AMAP_API_KEY未配置"

**原因**: 环境变量未正确配置

**解决方案**:

1. 检查 `docker-compose.yml` 中的环境变量配置
2. 确保 `AMAP_API_KEY` 已设置为实际的 API Key
3. 重新启动容器：
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Q2: 前端容器启动失败，显示 "host not found in upstream 'backend'"

**原因**: 前端容器找不到后端容器

**解决方案**:

**必须使用 Docker Compose**，不要单独运行容器：

```bash
# ✅ 正确方式
docker-compose up -d

# ❌ 错误方式（不要这样做）
docker run frontend-image
```

### Q3: 无法访问 http://localhost

**原因**: 端口被占用或容器未正常启动

**解决方案**:

1. 检查端口占用：
   ```bash
   # Windows
   netstat -ano | findstr :80
   
   # Mac/Linux
   lsof -i :80
   ```

2. 如果端口被占用，修改 `docker-compose.yml` 中的端口映射：
   ```yaml
   frontend:
     ports:
       - "8080:80"  # 改为 8080
   ```

3. 重新启动：
   ```bash
   docker-compose down
   docker-compose up -d
   ```

4. 访问: http://localhost:8080

### Q4: 镜像拉取失败

**原因**: 网络问题或镜像地址错误

**解决方案**:

1. 检查网络连接
2. 确认镜像地址正确：
   ```
   crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/backend:main
   crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/frontend:main
   ```

3. 如果需要登录，先登录阿里云镜像仓库：
   ```bash
   docker login crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com
   # 用户名: 开发者信仰
   # 密码: [你的固定密码]
   ```

### Q5: 容器运行但功能不正常

**检查步骤**:

1. 查看后端日志：
   ```bash
   docker-compose logs backend
   ```

2. 查看前端日志：
   ```bash
   docker-compose logs frontend
   ```

3. 检查环境变量是否正确配置

4. 确认 API Keys 是否有效

---

## 故障排除

### 1. 查看详细日志

```bash
# 查看所有日志
docker-compose logs

# 实时查看日志
docker-compose logs -f

# 查看最近 100 行日志
docker-compose logs --tail=100

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
```

### 2. 重启容器

```bash
# 重启所有容器
docker-compose restart

# 重启特定容器
docker-compose restart backend
docker-compose restart frontend
```

### 3. 完全重新部署

```bash
# 停止并删除容器
docker-compose down

# 删除旧镜像（可选）
docker rmi crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/backend:main
docker rmi crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/frontend:main

# 重新拉取镜像
docker-compose pull

# 启动服务
docker-compose up -d
```

### 4. 检查容器健康状态

```bash
# 查看容器详细信息
docker inspect ai-travel-planner-backend

# 查看健康检查状态
docker inspect ai-travel-planner-backend | grep -A 10 Health
```

### 5. 进入容器调试

```bash
# 进入后端容器
docker exec -it ai-travel-planner-backend bash

# 在容器内检查
python check_dependencies.py
curl http://localhost:8000/health

# 退出容器
exit
```

---

## 🎯 完整操作流程图

```
1. 安装 Docker Desktop
   ↓
2. 创建项目目录
   ↓
3. 创建 docker-compose.yml
   ↓
4. 配置 API Keys
   ↓
5. 拉取镜像
   docker-compose pull
   ↓
6. 启动服务
   docker-compose up -d
   ↓
7. 检查状态
   docker-compose ps
   ↓
8. 查看日志
   docker-compose logs -f
   ↓
9. 访问应用
   http://localhost
   ↓
10. 使用完毕后停止
    docker-compose down
```

---

## 📊 Docker Desktop 界面说明

### Containers 标签

显示所有运行中的容器：

```
┌─────────────────────────────────────────────────────────┐
│ Name                    Status      Ports               │
├─────────────────────────────────────────────────────────┤
│ ● ai-travel-planner-backend   Up (healthy)  8000:8000  │
│ ● ai-travel-planner-frontend  Up            80:80      │
└─────────────────────────────────────────────────────────┘
```

- **绿色圆点**: 容器正在运行
- **红色圆点**: 容器已停止
- **黄色圆点**: 容器正在启动

### Images 标签

显示所有已下载的镜像：

```
┌─────────────────────────────────────────────────────────┐
│ Repository                                    Tag  Size │
├─────────────────────────────────────────────────────────┤
│ crpi-.../ai-travel-planner-wzl/backend       main 500MB│
│ crpi-.../ai-travel-planner-wzl/frontend      main 50MB │
└─────────────────────────────────────────────────────────┘
```

### Volumes 标签

显示数据卷（本项目不使用）

### Networks 标签

显示网络：

```
┌─────────────────────────────────────────────────────────┐
│ Name                          Driver                    │
├─────────────────────────────────────────────────────────┤
│ ai-travel-planner-network     bridge                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🎉 成功标志

当你看到以下所有标志时，说明部署成功：

### ✅ Docker Desktop 中

1. **Containers 标签**:
   - `ai-travel-planner-backend`: 绿色圆点，Status 显示 "Up (healthy)"
   - `ai-travel-planner-frontend`: 绿色圆点，Status 显示 "Up"

2. **日志中**:
   - 后端: `INFO: Uvicorn running on http://0.0.0.0:8000`
   - 前端: `Configuration complete; ready for start up`

### ✅ 浏览器中

1. 访问 http://localhost 可以看到首页
2. 访问 http://localhost:8000/docs 可以看到 API 文档

### ✅ 功能测试

1. 可以填写旅行表单
2. 可以提交请求
3. 可以看到实时日志
4. 可以查看结果页面

---

## 📚 相关文档

- [Docker 快速开始](DOCKER_QUICK_START.md)
- [Docker 部署指南](DOCKER_DEPLOY_GUIDE.md)
- [Docker 完整修复](DOCKER_COMPLETE_FIX.md)
- [最终检查清单](DOCKER_FINAL_CHECKLIST.md)

---

## 💡 提示

### 最小配置（快速测试）

如果只想快速测试，只需配置以下两个必需的 API Key：

```yaml
environment:
  - AMAP_API_KEY=你的高德地图API_Key
  - MODELSCOPE_API_KEY=你的ModelScope_API_Key
```

其他配置可以暂时不设置，但会缺少以下功能：
- 用户认证
- 历史记录保存
- 数据持久化

### 性能优化

如果电脑性能较好，可以调整性能配置：

```yaml
environment:
  - PERF_MAX_WORKERS=4  # 增加并行线程数
  - PERF_ENABLE_CACHE=true  # 启用缓存
```

### 日志级别

如果需要更详细的日志：

```yaml
environment:
  - LOG_LEVEL=DEBUG  # 改为 DEBUG
  - PERF_VERBOSE_LOGGING=true  # 启用详细日志
```

---

**文档版本**: v2.0.6  
**最后更新**: 2025-11-10  
**适用平台**: Windows / Mac / Linux  
**Docker Desktop 版本**: 4.0+

---

## 🎊 开始使用吧！

现在你已经了解了如何在 Docker Desktop 中运行 AI 旅行规划师项目。

如果遇到任何问题，请查看 [故障排除](#故障排除) 部分或相关文档。

祝你使用愉快！🚀
