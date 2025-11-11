# Docker 部署指南

本指南将帮助你使用 Docker 快速部署 AI 旅行规划师应用。

## 前置要求

- 已安装 Docker（版本 20.10 或更高）
- 已安装 Docker Compose（版本 2.0 或更高）
- 确保 8000 和 8080 端口未被占用

### 检查 Docker 安装

```bash
docker --version
docker-compose --version
```

## 快速开始

### 1. 获取配置文件

确保你已经获得 `docker-compose.local.yml` 文件。

### 2. 拉取镜像并启动服务

在 `docker-compose.local.yml` 文件所在目录执行：

```bash
docker-compose -f docker-compose.local.yml up -d
```

这个命令会：
- 自动拉取最新的前端和后端镜像
- 创建并启动容器
- 在后台运行服务

### 3. 查看服务状态

```bash
docker-compose -f docker-compose.local.yml ps
```

你应该看到两个服务都处于 `running` 状态。

### 4. 访问应用

- **前端界面**: http://localhost:8080
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs

## 常用命令

### 查看日志

查看所有服务日志：
```bash
docker-compose -f docker-compose.local.yml logs -f
```

查看特定服务日志：
```bash
# 查看前端日志
docker-compose -f docker-compose.local.yml logs -f frontend

# 查看后端日志
docker-compose -f docker-compose.local.yml logs -f backend
```

### 停止服务

```bash
docker-compose -f docker-compose.local.yml stop
```

### 重启服务

```bash
docker-compose -f docker-compose.local.yml restart
```

### 停止并删除容器

```bash
docker-compose -f docker-compose.local.yml down
```

### 更新镜像

当有新版本发布时：

```bash
# 拉取最新镜像
docker-compose -f docker-compose.local.yml pull

# 重新创建并启动容器
docker-compose -f docker-compose.local.yml up -d
```

## 故障排查

### 服务无法启动

1. 检查端口是否被占用：
   ```bash
   # Windows
   netstat -ano | findstr :8000
   netstat -ano | findstr :8080
   
   # Linux/Mac
   lsof -i :8000
   lsof -i :8080
   ```

2. 查看详细错误日志：
   ```bash
   docker-compose -f docker-compose.local.yml logs
   ```

### 前端无法连接后端

1. 确保后端服务健康检查通过：
   ```bash
   docker-compose -f docker-compose.local.yml ps
   ```

2. 检查后端健康状态：
   ```bash
   curl http://localhost:8000/health
   ```

### 清理并重新开始

如果遇到问题，可以完全清理后重新启动：

```bash
# 停止并删除容器
docker-compose -f docker-compose.local.yml down

# 删除旧镜像（可选）
docker rmi crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/frontend:main
docker rmi crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/backend:main

# 重新拉取并启动
docker-compose -f docker-compose.local.yml up -d
```

## 配置说明

### 环境变量

如果需要修改配置，可以编辑 `docker-compose.local.yml` 文件中的环境变量：

**后端配置：**
- `LLM_MODEL_ID`: AI 模型名称
- `LLM_API_KEY`: AI 服务 API 密钥
- `AMAP_API_KEY`: 高德地图 API 密钥
- `SUPABASE_URL`: Supabase 项目地址
- `SUPABASE_ANON_KEY`: Supabase 匿名密钥

**前端配置：**
- `VITE_API_BASE_URL`: 后端 API 地址
- `VITE_AMAP_WEB_KEY`: 高德地图 Web API 密钥
- `VITE_SUPABASE_URL`: Supabase 项目地址
- `VITE_SUPABASE_ANON_KEY`: Supabase 匿名密钥

**注意：** 修改前端环境变量后需要重新构建镜像才能生效。

### 端口映射

默认端口映射：
- 前端：`8080:80`（主机端口 8080 映射到容器端口 80）
- 后端：`8000:8000`（主机端口 8000 映射到容器端口 8000）

如需修改主机端口，编辑 `docker-compose.local.yml` 中的 `ports` 配置。

## 性能优化

### 资源限制

如需限制容器资源使用，可以在 `docker-compose.local.yml` 中添加：

```yaml
services:
  backend:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## 生产环境部署建议

1. **使用 HTTPS**：配置反向代理（如 Nginx）并启用 SSL
2. **环境变量安全**：不要在配置文件中硬编码敏感信息，使用 Docker secrets 或环境变量文件
3. **日志管理**：配置日志驱动和日志轮转
4. **监控告警**：集成监控工具（如 Prometheus + Grafana）
5. **备份策略**：定期备份数据库和重要数据

## 技术支持

如遇到问题，请查看：
- 项目 README.md
- GitHub Issues
- 日志文件

---

**祝你使用愉快！** 🚀
