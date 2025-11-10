# 🐳 Docker 快速开始指南

## 一分钟快速部署

### 前置要求
- ✅ Docker 已安装
- ✅ Docker Compose 已安装
- ✅ 阿里云账号（用于镜像仓库）

### 步骤 1: 配置阿里云镜像仓库

1. 登录 [阿里云容器镜像服务](https://cr.console.aliyun.com/)
2. 创建命名空间: `ai-travel-planner`
3. 创建两个镜像仓库: `backend` 和 `frontend`
4. 获取访问凭证（用户名和密码）

### 步骤 2: 配置 GitHub Secrets

在 GitHub 仓库设置中添加：

```
Settings → Secrets and variables → Actions → New repository secret
```

添加两个 secrets:
- `ALIYUN_REGISTRY_USERNAME`: 阿里云用户名
- `ALIYUN_REGISTRY_PASSWORD`: 阿里云镜像仓库密码

### 步骤 3: 推送代码触发构建

```bash
git add .
git commit -m "feat: add docker support"
git push origin main
```

GitHub Actions 会自动：
1. 构建 Docker 镜像
2. 推送到阿里云镜像仓库
3. 打上版本标签

### 步骤 4: 在服务器上部署

```bash
# 1. 创建项目目录
mkdir -p /opt/ai-travel-planner
cd /opt/ai-travel-planner

# 2. 创建环境变量文件
cat > .env << 'EOF'
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_JWT_SECRET=your-jwt-secret
MODELSCOPE_API_KEY=your-modelscope-key
AMAP_API_KEY=your-amap-key
DATABASE_URL=your-database-url
EOF

# 3. 创建 docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  backend:
    image: registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/backend:latest
    container_name: ai-travel-planner-backend
    ports:
      - "8000:8000"
    env_file:
      - .env
    restart: unless-stopped

  frontend:
    image: registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/frontend:latest
    container_name: ai-travel-planner-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
EOF

# 4. 登录阿里云镜像仓库
docker login --username=your-username registry.cn-hangzhou.aliyuncs.com

# 5. 启动服务
docker-compose up -d

# 6. 查看日志
docker-compose logs -f
```

### 步骤 5: 访问应用

- 前端: http://your-server-ip
- 后端 API: http://your-server-ip:8000
- API 文档: http://your-server-ip:8000/docs

## 🔄 更新部署

```bash
# 拉取最新镜像
docker-compose pull

# 重启服务
docker-compose up -d

# 清理旧镜像
docker image prune -f
```

## 📊 监控

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看资源使用
docker stats
```

## 🛠️ 故障排除

### 问题: 镜像拉取失败
```bash
# 重新登录
docker login registry.cn-hangzhou.aliyuncs.com

# 手动拉取
docker pull registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/backend:latest
```

### 问题: 容器启动失败
```bash
# 查看详细日志
docker-compose logs backend

# 重新创建容器
docker-compose up -d --force-recreate
```

### 问题: 端口被占用
```bash
# 修改 docker-compose.yml 中的端口
ports:
  - "8080:80"  # 改为其他端口
```

## 📚 更多信息

详细文档请查看: [docs/DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md)
