# 🔧 快速修复：Supabase URL 错误

## 问题

浏览器控制台显示错误：
```
Uncaught Error: Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.
```

## 原因

前端镜像在构建时使用了无效的 Supabase URL (`placeholder`)，导致 Supabase 客户端初始化失败。

## ✅ 解决方案

### 方案 1: 等待新镜像（推荐）

1. **提交修复到 GitHub**（已完成）
2. **等待 GitHub Actions 构建**（约 5-10 分钟）
3. **拉取新镜像并重启**

```bash
# 停止当前容器
docker-compose -f docker-compose.local.yml down

# 删除旧镜像
docker rmi crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/frontend:main

# 等待 GitHub Actions 构建完成后，拉取新镜像
docker pull crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/frontend:main

# 重新启动
docker-compose -f docker-compose.local.yml up -d
```

### 方案 2: 本地重新构建（立即可用）⭐

如果不想等待，可以本地重新构建前端镜像：

```bash
# 1. 确保在项目根目录
cd D:\Code\GitHub\AI-Travel-Planner-wzl

# 2. 构建前端镜像
docker build -t frontend-fixed ./frontend

# 3. 停止当前容器
docker-compose -f D:\Code\dockerCompose\docker-compose.local.yml down

# 4. 创建临时 docker-compose 文件
```

创建 `D:\Code\dockerCompose\docker-compose-fixed.yml`：

```yaml

```

然后启动：

```bash
# 5. 使用新配置启动
docker-compose -f D:\Code\dockerCompose\docker-compose-fixed.yml up -d

# 6. 查看日志
docker-compose -f D:\Code\dockerCompose\docker-compose-fixed.yml logs -f
```

### 方案 3: 临时禁用 Supabase（最快）

如果你不需要用户认证功能，可以修改前端代码临时禁用 Supabase。

但这需要修改源代码，不推荐。

## 📝 完整步骤（方案 2 - 推荐）

```bash
# 1. 进入项目目录
cd D:\Code\GitHub\AI-Travel-Planner-wzl

# 2. 拉取最新代码（包含修复）
git pull origin main

# 3. 构建前端镜像
docker build -t frontend-fixed ./frontend

# 4. 停止旧容器
cd D:\Code\dockerCompose
docker-compose -f docker-compose.local.yml down

# 5. 修改 docker-compose.local.yml
# 将 frontend 的 image 改为 frontend-fixed

# 6. 启动
docker-compose -f docker-compose.local.yml up -d

# 7. 访问
# 打开浏览器访问 http://localhost:8080
```

## ✅ 验证修复

1. 打开浏览器访问 http://localhost:8080
2. 按 F12 打开控制台
3. 应该不再看到 Supabase URL 错误
4. 页面应该正常显示

## 🎯 预期结果

修复后，你应该能看到：
- ✅ 首页正常显示
- ✅ 可以填写旅行表单
- ✅ 可以提交请求
- ✅ 可以查看实时日志
- ✅ 可以查看结果

---

**推荐**: 使用方案 2（本地重新构建），可以立即解决问题！
