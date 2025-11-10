# Docker 部署指南

## 📋 目录

- [前置要求](#前置要求)
- [阿里云镜像仓库配置](#阿里云镜像仓库配置)
- [GitHub Secrets 配置](#github-secrets-配置)
- [本地构建测试](#本地构建测试)
- [自动化部署](#自动化部署)
- [生产环境部署](#生产环境部署)

## 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 阿里云账号
- GitHub 仓库

## 阿里云镜像仓库配置

### 1. 创建容器镜像服务实例

1. 登录 [阿里云控制台](https://cr.console.aliyun.com/)
2. 选择"容器镜像服务 ACR"
3. 选择"个人版"或"企业版"

### 2. 创建命名空间

```
命名空间名称: ai-travel-planner
```

### 3. 创建镜像仓库

创建两个仓库：

**后端仓库:**
- 仓库名称: `backend`
- 仓库类型: 私有
- 摘要: AI Travel Planner Backend

**前端仓库:**
- 仓库名称: `frontend`
- 仓库类型: 私有
- 摘要: AI Travel Planner Frontend

### 4. 获取访问凭证

在"访问凭证"页面：
- 设置 Registry 登录密码
- 记录用户名（通常是阿里云账号）
- 记录密码

## GitHub Secrets 配置

在 GitHub 仓库设置中添加以下 Secrets：

### 必需的 Secrets

1. **ALIYUN_REGISTRY_USERNAME**
   - 值: 阿里云容器镜像服务用户名
   - 示例: `your-aliyun-account@aliyun.com`

2. **ALIYUN_REGISTRY_PASSWORD**
   - 值: 阿里云容器镜像服务密码
   - 示例: `your-registry-password`

### 配置步骤

```bash
# 1. 进入 GitHub 仓库
# 2. 点击 Settings
# 3. 点击 Secrets and variables > Actions
# 4. 点击 New repository secret
# 5. 添加上述两个 secrets
```

## 本地构建测试

### 1. 构建镜像

```bash
# 构建后端镜像
docker build -t ai-travel-planner-backend:latest ./backend

# 构建前端镜像
docker build -t ai-travel-planner-frontend:latest ./frontend
```

### 2. 运行容器

```bash
# 使用 docker-compose
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 3. 测试访问

- 前端: http://localhost
- 后端: http://localhost:8000
- 后端 API 文档: http://localhost:8000/docs

## 自动化部署

### 触发条件

GitHub Actions 会在以下情况自动触发：

1. **推送到 main 分支**
   ```bash
   git push origin main
   ```

2. **推送到 develop 分支**
   ```bash
   git push origin develop
   ```

3. **创建版本标签**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. **创建 Pull Request**
   - 针对 main 分支的 PR 会触发构建（但不推送）

### 镜像标签规则

- `main` 分支 → `latest` 标签
- `develop` 分支 → `develop` 标签
- `v1.0.0` 标签 → `1.0.0`, `1.0`, `v1.0.0` 标签
- Git SHA → `main-abc1234` 标签

### 查看构建状态

1. 进入 GitHub 仓库
2. 点击 "Actions" 标签
3. 查看最新的工作流运行状态

## 生产环境部署

### 方式 1: 使用 docker-compose

1. **在服务器上创建配置文件**

```bash
# 创建项目目录
mkdir -p /opt/ai-travel-planner
cd /opt/ai-travel-planner

# 创建 .env 文件
cat > .env << EOF
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_JWT_SECRET=your-jwt-secret
MODELSCOPE_API_KEY=your-modelscope-key
AMAP_API_KEY=your-amap-key
DATABASE_URL=your-database-url
EOF

# 创建 docker-compose.yml
cat > docker-compose.yml << EOF
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
    networks:
      - app-network

  frontend:
    image: registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/frontend:latest
    container_name: ai-travel-planner-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
EOF
```

2. **登录阿里云镜像仓库**

```bash
docker login --username=your-username registry.cn-hangzhou.aliyuncs.com
```

3. **拉取并启动服务**

```bash
# 拉取最新镜像
docker-compose pull

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 方式 2: 使用 Kubernetes

创建 Kubernetes 部署文件：

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-travel-planner-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: supabase-url
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
  - port: 8000
    targetPort: 8000
```

部署：

```bash
kubectl apply -f k8s-deployment.yaml
```

## 更新部署

### 自动更新

推送代码到 main 分支后，GitHub Actions 会自动构建并推送新镜像。

在服务器上更新：

```bash
# 拉取最新镜像
docker-compose pull

# 重启服务
docker-compose up -d

# 清理旧镜像
docker image prune -f
```

### 回滚版本

```bash
# 使用特定版本
docker-compose down
docker pull registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/backend:v1.0.0
docker pull registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/frontend:v1.0.0
docker-compose up -d
```

## 监控和日志

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 查看最近 100 行日志
docker-compose logs --tail=100 backend
```

### 健康检查

```bash
# 检查容器状态
docker-compose ps

# 检查后端健康
curl http://localhost:8000/health

# 检查前端
curl http://localhost
```

## 故障排除

### 问题 1: 镜像拉取失败

```bash
# 检查登录状态
docker login registry.cn-hangzhou.aliyuncs.com

# 手动拉取镜像
docker pull registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/backend:latest
```

### 问题 2: 容器启动失败

```bash
# 查看详细日志
docker-compose logs backend

# 检查环境变量
docker-compose config

# 重新构建
docker-compose up -d --force-recreate
```

### 问题 3: 端口冲突

```bash
# 修改 docker-compose.yml 中的端口映射
ports:
  - "8080:80"  # 将前端端口改为 8080
```

## 安全建议

1. **使用私有镜像仓库**
   - 设置仓库为私有
   - 定期更新访问凭证

2. **环境变量管理**
   - 不要在代码中硬编码敏感信息
   - 使用 .env 文件或 Kubernetes Secrets

3. **镜像安全**
   - 定期更新基础镜像
   - 扫描镜像漏洞
   - 使用最小化镜像

4. **网络安全**
   - 使用 HTTPS
   - 配置防火墙规则
   - 限制容器间通信

## 性能优化

1. **多阶段构建**
   - 减小镜像体积
   - 提高构建速度

2. **缓存优化**
   - 使用 BuildKit 缓存
   - 合理安排 Dockerfile 层级

3. **资源限制**
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 1G
           reservations:
             cpus: '0.5'
             memory: 512M
   ```

## 参考链接

- [Docker 官方文档](https://docs.docker.com/)
- [阿里云容器镜像服务](https://help.aliyun.com/product/60716.html)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
