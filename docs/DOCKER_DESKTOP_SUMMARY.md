# 📦 Docker Desktop 使用文档总结

## 🎯 文档概览

为了帮助用户使用 Docker Desktop 运行项目，我们创建了以下文档：

### 1. 快速开始文档

| 文档 | 适用人群 | 时间 | 说明 |
|------|----------|------|------|
| [QUICK_START_DOCKER_DESKTOP.md](QUICK_START_DOCKER_DESKTOP.md) | 所有用户 | 3分钟 | 最简化的快速开始指南 |
| [DOCKER_DESKTOP_GUIDE.md](DOCKER_DESKTOP_GUIDE.md) | 新手用户 | 10分钟 | 详细的图文教程 |

### 2. 完整部署文档

| 文档 | 适用人群 | 说明 |
|------|----------|------|
| [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md) | 开发者 | 命令行快速部署 |
| [DOCKER_DEPLOY_GUIDE.md](DOCKER_DEPLOY_GUIDE.md) | 运维人员 | 生产环境部署指南 |
| [docker-compose.prod.yml](docker-compose.prod.yml) | 所有用户 | 生产环境配置文件 |

### 3. 问题修复文档

| 文档 | 说明 |
|------|------|
| [DOCKER_DEPENDENCY_FIX.md](DOCKER_DEPENDENCY_FIX.md) | 后端依赖问题修复 |
| [DOCKER_FRONTEND_FIX.md](DOCKER_FRONTEND_FIX.md) | 前端网络问题修复 |
| [DOCKER_COMPLETE_FIX.md](DOCKER_COMPLETE_FIX.md) | 完整修复方案 |

### 4. 依赖说明文档

| 文档 | 说明 |
|------|------|
| [BACKEND_DEPENDENCIES.md](BACKEND_DEPENDENCIES.md) | 后端依赖详细说明 |
| [FRONTEND_DEPENDENCIES.md](FRONTEND_DEPENDENCIES.md) | 前端依赖详细说明 |
| [FRONTEND_DOCKER_VERIFICATION.md](FRONTEND_DOCKER_VERIFICATION.md) | 前端 Docker 验证 |

### 5. 检查清单

| 文档 | 说明 |
|------|------|
| [DOCKER_FINAL_CHECKLIST.md](DOCKER_FINAL_CHECKLIST.md) | 最终检查清单 |

---

## 🚀 推荐使用流程

### 新手用户（使用 Docker Desktop）

```
1. 阅读 QUICK_START_DOCKER_DESKTOP.md (3分钟)
   ↓
2. 按照步骤操作
   ↓
3. 如遇问题，查看 DOCKER_DESKTOP_GUIDE.md
   ↓
4. 成功运行！
```

### 开发者用户（使用命令行）

```
1. 阅读 DOCKER_QUICK_START.md
   ↓
2. 使用 docker-compose up -d
   ↓
3. 如遇问题，查看 DOCKER_COMPLETE_FIX.md
   ↓
4. 成功运行！
```

### 运维人员（生产部署）

```
1. 阅读 DOCKER_DEPLOY_GUIDE.md
   ↓
2. 配置生产环境
   ↓
3. 使用 docker-compose.prod.yml
   ↓
4. 监控和维护
```

---

## 📝 核心配置文件

### docker-compose.yml（必需）

```yaml
version: '3.8'

services:
  backend:
    image: crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/backend:main
    container_name: ai-travel-planner-backend
    ports:
      - "8000:8000"
    environment:
      # ⚠️ 必须配置
      - AMAP_API_KEY=你的高德地图API_Key
      - MODELSCOPE_API_KEY=你的ModelScope_API_Key
      
      # 可选配置
      - SUPABASE_URL=your_supabase_url
      - SUPABASE_SERVICE_KEY=your_supabase_service_key
      - SUPABASE_JWT_SECRET=your_supabase_jwt_secret
      - DATABASE_URL=your_database_url
      
      # 性能配置
      - PERF_MAX_WORKERS=3
      - PERF_ENABLE_CACHE=true
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

networks:
  app-network:
    driver: bridge
```

---

## ✅ 必需的 API Keys

### 1. 高德地图 API Key（必需）

- **获取地址**: https://lbs.amap.com/
- **用途**: 景点搜索、路线规划、天气查询
- **配置项**: `AMAP_API_KEY`

### 2. ModelScope API Key（必需）

- **获取地址**: https://modelscope.cn/
- **用途**: LLM 服务，生成旅行计划
- **配置项**: `MODELSCOPE_API_KEY`

### 3. Supabase 配置（可选）

- **获取地址**: https://supabase.com/
- **用途**: 用户认证、历史记录保存
- **配置项**: 
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
  - `SUPABASE_JWT_SECRET`
  - `DATABASE_URL`

**注意**: 如果不需要用户认证功能，可以不配置 Supabase

---

## 🎯 快速命令参考

### 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 启动并查看日志
docker-compose up

# 后台启动
docker-compose up -d
```

### 查看状态

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs

# 实时查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
```

### 管理服务

```bash
# 停止服务
docker-compose stop

# 启动服务
docker-compose start

# 重启服务
docker-compose restart

# 停止并删除容器
docker-compose down

# 停止并删除容器、网络、卷
docker-compose down -v
```

### 更新镜像

```bash
# 拉取最新镜像
docker-compose pull

# 重新创建容器
docker-compose up -d --force-recreate

# 一步完成
docker-compose pull && docker-compose up -d --force-recreate
```

---

## 🐛 常见问题快速解决

### 问题 1: 后端启动失败

**错误**: "配置错误: AMAP_API_KEY未配置"

**解决**: 
```bash
# 检查 docker-compose.yml 中的环境变量
# 确保 AMAP_API_KEY 和 MODELSCOPE_API_KEY 已正确填写
docker-compose down
docker-compose up -d
```

### 问题 2: 前端启动失败

**错误**: "host not found in upstream 'backend'"

**解决**: 
```bash
# 必须使用 docker-compose，不要单独运行容器
docker-compose up -d
```

### 问题 3: 端口被占用

**错误**: "port is already allocated"

**解决**: 
```yaml
# 修改 docker-compose.yml 中的端口
frontend:
  ports:
    - "8080:80"  # 改为 8080
```

### 问题 4: 镜像拉取失败

**解决**: 
```bash
# 检查网络连接
# 如果需要登录
docker login crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com
```

---

## 📊 成功标志

### ✅ Docker Desktop 中

**Containers 标签**:
```
● ai-travel-planner-backend   Up (healthy)   8000:8000
● ai-travel-planner-frontend  Up             80:80
```

### ✅ 命令行中

```bash
$ docker-compose ps
NAME                          STATUS         PORTS
ai-travel-planner-backend     Up (healthy)   0.0.0.0:8000->8000/tcp
ai-travel-planner-frontend    Up             0.0.0.0:80->80/tcp
```

### ✅ 浏览器中

- 前端: http://localhost ✅
- 后端 API: http://localhost:8000/docs ✅

---

## 🎉 总结

### 文档结构

```
Docker Desktop 使用文档
│
├── 快速开始
│   ├── QUICK_START_DOCKER_DESKTOP.md (3分钟)
│   └── DOCKER_DESKTOP_GUIDE.md (详细教程)
│
├── 完整部署
│   ├── DOCKER_QUICK_START.md
│   ├── DOCKER_DEPLOY_GUIDE.md
│   └── docker-compose.prod.yml
│
├── 问题修复
│   ├── DOCKER_DEPENDENCY_FIX.md
│   ├── DOCKER_FRONTEND_FIX.md
│   └── DOCKER_COMPLETE_FIX.md
│
├── 依赖说明
│   ├── BACKEND_DEPENDENCIES.md
│   ├── FRONTEND_DEPENDENCIES.md
│   └── FRONTEND_DOCKER_VERIFICATION.md
│
└── 检查清单
    └── DOCKER_FINAL_CHECKLIST.md
```

### 推荐阅读顺序

1. **新手**: QUICK_START_DOCKER_DESKTOP.md → DOCKER_DESKTOP_GUIDE.md
2. **开发者**: DOCKER_QUICK_START.md → DOCKER_DEPLOY_GUIDE.md
3. **遇到问题**: DOCKER_COMPLETE_FIX.md → 相关修复文档

### 核心要点

1. ✅ 必须配置 `AMAP_API_KEY` 和 `MODELSCOPE_API_KEY`
2. ✅ 必须使用 `docker-compose`，不要单独运行容器
3. ✅ 确保 Docker Desktop 正在运行
4. ✅ 检查端口是否被占用

---

**文档版本**: v2.0.7  
**最后更新**: 2025-11-10  
**维护者**: AI Travel Planner Team

---

## 🚀 开始使用

选择适合你的文档开始：

- 🆕 **新手**: [Docker Desktop 快速开始](QUICK_START_DOCKER_DESKTOP.md)
- 👨‍💻 **开发者**: [Docker 快速开始](DOCKER_QUICK_START.md)
- 🔧 **运维**: [Docker 部署指南](DOCKER_DEPLOY_GUIDE.md)

祝你使用愉快！🎊
