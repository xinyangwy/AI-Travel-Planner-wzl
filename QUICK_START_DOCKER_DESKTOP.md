# 🚀 Docker Desktop 快速开始（3分钟）

## 📋 准备工作

1. ✅ 安装并启动 Docker Desktop
2. ✅ 获取高德地图 API Key: https://lbs.amap.com/
3. ✅ 获取 ModelScope API Key: https://modelscope.cn/

---

## 🎯 三步启动

### 步骤 1: 下载配置文件（1分钟）

**方式 1: 使用项目提供的配置文件（推荐）**

项目已经提供了配置好的文件 `docker-compose.local.yml`，直接使用即可：

```bash
# 下载项目
git clone https://github.com/xinyangwy/AI-Travel-Planner-wzl.git
cd AI-Travel-Planner-wzl

# 使用本地配置文件
docker-compose -f docker-compose.local.yml up -d
```

**方式 2: 手动创建配置文件**

如果你想自己配置，创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  backend:
    image: crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/backend:main
    container_name: ai-travel-planner-backend
    ports:
      - "8000:8000"
    environment:
      # LLM 配置
      - LLM_MODEL_ID=Qwen/Qwen2.5-72B-Instruct
      - LLM_API_KEY=你的ModelScope_API_Key
      - LLM_BASE_URL=https://api-inference.modelscope.cn/v1/
      - LLM_TIMEOUT=180
      
      # 高德地图 API（必需）
      - AMAP_API_KEY=你的高德地图API_Key
      
      # Supabase 配置（可选）
      - SUPABASE_URL=你的Supabase_URL
      - SUPABASE_ANON_KEY=你的Supabase_Anon_Key
      - SUPABASE_SERVICE_KEY=你的Supabase_Service_Key
      - DATABASE_URL=你的数据库URL
      
      # 服务器配置
      - HOST=0.0.0.0
      - PORT=8000
      - LOG_LEVEL=INFO
      - CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost
      
      # 性能配置
      - PERF_MAX_WORKERS=3
      - PERF_ENABLE_CACHE=true
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

networks:
  app-network:
    driver: bridge
```

**⚠️ 重要**: 
- 必须替换 `LLM_API_KEY` 为你的 ModelScope API Key
- 必须替换 `AMAP_API_KEY` 为你的高德地图 API Key
- Supabase 配置是可选的，如果不需要用户认证功能可以删除

### 步骤 2: 启动服务（1分钟）

**方式 1: 使用命令行（推荐）**

```bash
# 如果使用项目提供的配置文件
docker-compose -f docker-compose.local.yml up -d

# 如果使用自己创建的 docker-compose.yml
docker-compose up -d
```

**方式 2: 使用 Docker Desktop GUI**

1. 打开 Docker Desktop
2. 点击 "Containers"
3. 点击 "Create"
4. 选择 "From Compose file"
5. 选择 `docker-compose.local.yml` 或你的 `docker-compose.yml`
6. 点击 "Run"

### 步骤 3: 访问应用（1分钟）

等待 1-2 分钟后，在浏览器访问：

**前端**: http://localhost  
**后端 API**: http://localhost:8000/docs

---

## ✅ 验证成功

在 Docker Desktop 的 "Containers" 标签中，应该看到：

```
● ai-travel-planner-backend   Up (healthy)   8000:8000
● ai-travel-planner-frontend  Up             80:80
```

两个容器都显示绿色圆点 ●

---

## 🐛 遇到问题？

### 问题 1: 后端启动失败

**错误**: "配置错误: AMAP_API_KEY未配置"

**解决**: 检查 `docker-compose.yml` 中的 API Key 是否已正确填写

### 问题 2: 前端启动失败

**错误**: "host not found in upstream 'backend'"

**解决**: 必须使用 `docker-compose up -d`，不要单独运行容器

### 问题 3: 端口被占用

**错误**: "port is already allocated"

**解决**: 修改端口映射：
```yaml
frontend:
  ports:
    - "8080:80"  # 改为 8080
```

然后访问: http://localhost:8080

---

## 📝 常用命令

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看状态
docker-compose ps
```

---

## 🎉 开始使用

1. 访问 http://localhost
2. 填写旅行信息
3. 点击"开始规划我的旅行"
4. 查看实时日志和结果

---

## 📚 详细文档

需要更多帮助？查看完整文档：

- [Docker Desktop 详细指南](DOCKER_DESKTOP_GUIDE.md)
- [Docker 部署指南](DOCKER_DEPLOY_GUIDE.md)
- [故障排除](DOCKER_COMPLETE_FIX.md)

---

**快速开始版本**: v1.0  
**更新时间**: 2025-11-10
