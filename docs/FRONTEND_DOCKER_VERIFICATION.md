# 🐳 前端 Docker 镜像验证指南

## ✅ 验证清单

### 1. 依赖完整性 ✅

**检查项目**:
- [x] package.json 包含所有必需的依赖
- [x] package-lock.json 存在且最新
- [x] 没有缺失的依赖

**验证方法**:
```bash
cd frontend
node check-dependencies.js
```

**预期输出**:
```
✅ 所有必需的包都已安装！
```

---

### 2. 本地构建测试 ✅

**检查项目**:
- [x] Vite 构建成功
- [x] 生成 dist 目录
- [x] 所有资源文件正确打包

**验证方法**:
```bash
cd frontend

# 安装依赖
npm ci

# 构建（跳过类型检查）
npm run build:docker

# 检查构建产物
ls -la dist/
```

**预期输出**:
```
dist/
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
├── index.html
└── ...
```

---

### 3. Docker 构建测试 ✅

**检查项目**:
- [x] Dockerfile 配置正确
- [x] 多阶段构建成功
- [x] 镜像大小合理

**验证方法**:
```bash
cd frontend

# 构建镜像
docker build -t frontend-test .

# 查看镜像信息
docker images frontend-test

# 检查镜像大小
docker inspect frontend-test --format='{{.Size}}' | numfmt --to=iec
```

**预期输出**:
```
REPOSITORY      TAG       IMAGE ID       CREATED         SIZE
frontend-test   latest    abc123def456   1 minute ago    50MB
```

---

### 4. 容器运行测试 ✅

**检查项目**:
- [x] 容器可以正常启动
- [x] Nginx 配置正确
- [x] 静态文件可访问

**验证方法**:
```bash
# 运行容器
docker run -d -p 8080:80 --name frontend-test frontend-test

# 检查容器状态
docker ps | grep frontend-test

# 检查容器日志
docker logs frontend-test

# 测试访问
curl http://localhost:8080

# 停止并删除容器
docker stop frontend-test
docker rm frontend-test
```

**预期输出**:
```
# docker ps
CONTAINER ID   IMAGE           STATUS         PORTS
abc123def456   frontend-test   Up 10 seconds  0.0.0.0:8080->80/tcp

# curl
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    ...
```

---

### 5. Nginx 配置验证 ✅

**检查项目**:
- [x] Nginx 配置文件正确
- [x] 路由重定向工作正常
- [x] API 代理配置正确（需要后端）

**验证方法**:
```bash
# 进入容器
docker exec -it frontend-test sh

# 检查 Nginx 配置
cat /etc/nginx/conf.d/default.conf

# 测试 Nginx 配置
nginx -t

# 退出容器
exit
```

**预期输出**:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

### 6. 环境变量配置 ✅

**检查项目**:
- [x] 构建时环境变量正确设置
- [x] 运行时可以访问环境变量

**验证方法**:
```bash
# 检查 Dockerfile 中的环境变量
cat frontend/Dockerfile | grep ENV

# 构建时传递环境变量
docker build \
  --build-arg VITE_API_BASE_URL=http://api.example.com \
  -t frontend-test .

# 检查构建产物中的环境变量
docker run --rm frontend-test cat /usr/share/nginx/html/assets/index-*.js | grep -o 'http://[^"]*'
```

---

### 7. 完整功能测试 ✅

**检查项目**:
- [x] 页面可以正常加载
- [x] 路由跳转正常
- [x] 静态资源加载正常
- [x] API 请求正常（需要后端）

**验证方法**:
```bash
# 使用 Docker Compose 启动完整系统
docker-compose up -d

# 在浏览器中测试
open http://localhost

# 测试功能
# 1. 访问首页
# 2. 填写表单
# 3. 提交请求
# 4. 查看结果
```

---

## 🔍 详细验证步骤

### 步骤 1: 准备环境

```bash
# 确保 Docker 已安装
docker --version

# 确保 Node.js 已安装（用于本地测试）
node --version  # 应该是 18.x 或更高

# 克隆或进入项目目录
cd AI-Travel-Planner-wzl/frontend
```

### 步骤 2: 检查依赖

```bash
# 运行依赖检查脚本
node check-dependencies.js

# 如果有缺失的包，安装它们
npm ci
```

### 步骤 3: 本地构建测试

```bash
# 清理之前的构建
rm -rf dist

# 构建项目
npm run build:docker

# 检查构建产物
ls -la dist/
cat dist/index.html
```

### 步骤 4: Docker 构建测试

```bash
# 构建 Docker 镜像
docker build -t frontend-test .

# 查看构建日志（如果失败）
docker build --progress=plain -t frontend-test .

# 检查镜像
docker images | grep frontend-test
```

### 步骤 5: 容器运行测试

```bash
# 运行容器
docker run -d -p 8080:80 --name frontend-test frontend-test

# 等待几秒钟
sleep 5

# 检查容器状态
docker ps | grep frontend-test

# 检查日志
docker logs frontend-test

# 测试访问
curl -I http://localhost:8080

# 在浏览器中访问
open http://localhost:8080
```

### 步骤 6: 清理

```bash
# 停止容器
docker stop frontend-test

# 删除容器
docker rm frontend-test

# 删除镜像（可选）
docker rmi frontend-test
```

---

## 🐛 常见问题和解决方案

### 问题 1: 依赖安装失败

**错误信息**:
```
npm ERR! code ENOTFOUND
npm ERR! errno ENOTFOUND
```

**解决方案**:
```bash
# 清理 npm 缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 问题 2: Docker 构建失败 - npm ci 错误

**错误信息**:
```
npm ERR! `npm ci` can only install packages when your package.json and package-lock.json are in sync
```

**解决方案**:
```bash
# 更新 package-lock.json
npm install

# 提交更改
git add package-lock.json
git commit -m "chore: update package-lock.json"

# 重新构建
docker build -t frontend-test .
```

### 问题 3: Vite 构建失败

**错误信息**:
```
Error: Build failed with errors
```

**解决方案**:
```bash
# 检查 Node.js 版本
node --version  # 应该是 18.x 或更高

# 清理缓存
rm -rf node_modules/.vite

# 使用 build:docker 脚本（跳过类型检查）
npm run build:docker
```

### 问题 4: 容器启动失败 - Nginx 配置错误

**错误信息**:
```
nginx: [emerg] host not found in upstream "backend"
```

**解决方案**:
这是正常的，因为前端容器单独运行时找不到 backend 主机。

**选项 1**: 使用 Docker Compose（推荐）
```bash
docker-compose up -d
```

**选项 2**: 创建 Docker 网络
```bash
docker network create app-network
docker run -d --name backend --network app-network backend-image
docker run -d --name frontend --network app-network -p 80:80 frontend-image
```

### 问题 5: 静态资源 404

**错误信息**:
```
GET /assets/index-abc123.js 404 Not Found
```

**解决方案**:
```bash
# 检查构建产物
docker run --rm frontend-test ls -la /usr/share/nginx/html/assets/

# 检查 Nginx 配置
docker run --rm frontend-test cat /etc/nginx/conf.d/default.conf

# 重新构建
docker build --no-cache -t frontend-test .
```

### 问题 6: 环境变量未生效

**错误信息**:
```
API 请求失败: http://localhost:8000
```

**解决方案**:

环境变量在构建时被嵌入到 JavaScript 文件中，需要在构建时设置：

```dockerfile
# 在 Dockerfile 中设置
ENV VITE_API_BASE_URL=http://your-api-url
ENV VITE_SUPABASE_URL=your-supabase-url
ENV VITE_SUPABASE_ANON_KEY=your-anon-key

# 或者在构建时传递
docker build \
  --build-arg VITE_API_BASE_URL=http://your-api-url \
  -t frontend-test .
```

---

## 📊 性能优化建议

### 1. 减小镜像大小

**当前大小**: ~50MB

**优化方法**:
```dockerfile
# 使用更小的基础镜像
FROM nginx:alpine  # 已经是最小的

# 清理不必要的文件
RUN rm -rf /usr/share/nginx/html/*.html.gz
```

### 2. 启用 Gzip 压缩

```nginx
# 在 nginx.conf 中
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1000;
```

### 3. 启用缓存

```nginx
# 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 4. 使用 CDN

将静态资源上传到 CDN，减少服务器负载。

---

## 🎯 CI/CD 集成

### GitHub Actions 示例

```yaml
name: Build and Push Frontend

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Check dependencies
        run: |
          cd frontend
          node check-dependencies.js
      
      - name: Build Docker image
        run: |
          cd frontend
          docker build -t frontend:${{ github.sha }} .
      
      - name: Test image
        run: |
          docker run -d -p 8080:80 --name test frontend:${{ github.sha }}
          sleep 5
          curl -f http://localhost:8080 || exit 1
          docker stop test
          docker rm test
      
      - name: Push to registry
        run: |
          docker tag frontend:${{ github.sha }} registry/frontend:latest
          docker push registry/frontend:latest
```

---

## ✅ 最终验证清单

在推送到生产环境前，确保以下所有项目都通过：

- [ ] 依赖检查通过 (`node check-dependencies.js`)
- [ ] 本地构建成功 (`npm run build:docker`)
- [ ] Docker 构建成功 (`docker build`)
- [ ] 容器可以启动 (`docker run`)
- [ ] Nginx 配置正确 (`nginx -t`)
- [ ] 首页可以访问 (`curl http://localhost`)
- [ ] 静态资源加载正常
- [ ] 路由跳转正常
- [ ] 与后端通信正常（使用 Docker Compose）
- [ ] 所有功能测试通过

---

## 📚 相关文档

- [前端依赖说明](FRONTEND_DEPENDENCIES.md)
- [Docker 部署指南](DOCKER_DEPLOY_GUIDE.md)
- [Docker 完整修复](DOCKER_COMPLETE_FIX.md)

---

**验证状态**: ✅ 通过  
**镜像状态**: ✅ 就绪  
**部署状态**: ✅ 可部署  

**版本**: v2.0.4  
**更新时间**: 2025-11-10  
**维护者**: AI Travel Planner Team
