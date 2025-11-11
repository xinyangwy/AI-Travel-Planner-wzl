# 🔐 Docker 本地配置说明

## ⚠️ 重要提示

`docker-compose.local.yml` 文件包含真实的 API Keys 和敏感信息，**不应该提交到 Git 仓库**。

## 📝 文件说明

### docker-compose.local.yml

这是一个**本地使用**的配置文件，包含了项目的实际 API Keys：

- ✅ **用途**: 本地开发和测试
- ❌ **不要**: 提交到 Git
- ❌ **不要**: 分享给他人
- ❌ **不要**: 上传到公开平台

### 已添加到 .gitignore

```gitignore
# docker compose local config (contains sensitive keys)
docker-compose.local.yml
```

这确保了即使你不小心执行 `git add .`，这个文件也不会被提交。

## 🚀 使用方法

### 本地开发

```bash
# 克隆项目
git clone https://github.com/xinyangwy/AI-Travel-Planner-wzl.git
cd AI-Travel-Planner-wzl

# 使用本地配置启动
docker-compose -f docker-compose.local.yml up -d

# 查看日志
docker-compose -f docker-compose.local.yml logs -f

# 停止服务
docker-compose -f docker-compose.local.yml down
```

### 其他用户

其他用户应该：

1. 复制 `docker-compose.local.yml.example`（如果提供）
2. 重命名为 `docker-compose.local.yml`
3. 填入自己的 API Keys
4. 使用该文件启动服务

## 🔑 API Keys 说明

### 必需的 Keys

1. **LLM_API_KEY** (ModelScope)
   - 获取: https://modelscope.cn/
   - 用途: LLM 服务

2. **AMAP_API_KEY** (高德地图)
   - 获取: https://lbs.amap.com/
   - 用途: 地图服务、POI 搜索、路线规划

### 可选的 Keys

3. **Supabase 配置**
   - 获取: https://supabase.com/
   - 用途: 用户认证、数据库
   - 如果不需要用户认证功能，可以不配置

## 📊 配置文件对比

| 文件 | 用途 | 是否提交 | 包含敏感信息 |
|------|------|----------|--------------|
| `docker-compose.yml` | 模板文件 | ✅ 是 | ❌ 否 |
| `docker-compose.prod.yml` | 生产环境模板 | ✅ 是 | ❌ 否 |
| `docker-compose.local.yml` | 本地配置 | ❌ 否 | ✅ 是 |

## 🛡️ 安全建议

### 1. 不要提交敏感信息

```bash
# 检查是否会被提交
git status

# 如果看到 docker-compose.local.yml，说明 .gitignore 没生效
# 立即执行：
git rm --cached docker-compose.local.yml
```

### 2. 定期更换 API Keys

如果 API Keys 泄露：
1. 立即在对应平台更换 Key
2. 更新本地配置文件
3. 重启服务

### 3. 使用环境变量

更安全的方式是使用环境变量：

```bash
# 创建 .env 文件（也在 .gitignore 中）
cat > .env << 'EOF'
LLM_API_KEY=your_key_here
AMAP_API_KEY=your_key_here
SUPABASE_URL=your_url_here
EOF

# 在 docker-compose.yml 中引用
environment:
  - LLM_API_KEY=${LLM_API_KEY}
  - AMAP_API_KEY=${AMAP_API_KEY}
```

## 📚 相关文档

- [Docker Desktop 快速开始](QUICK_START_DOCKER_DESKTOP.md)
- [Docker Desktop 详细指南](DOCKER_DESKTOP_GUIDE.md)
- [Docker 部署指南](DOCKER_DEPLOY_GUIDE.md)

---

**安全提示**: 保护好你的 API Keys，就像保护密码一样！🔐
