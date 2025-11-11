# 🔧 前端页面空白问题排查

## 问题描述

访问 http://localhost:8080 时页面显示空白。

## ✅ 已确认正常的部分

- ✅ 前端容器正在运行
- ✅ Nginx 正常工作
- ✅ HTML 文件正确返回
- ✅ CSS 和 JS 文件正常加载（从日志可以看到 200 状态码）
- ✅ 后端 API 正常工作

## 🔍 排查步骤

### 步骤 1: 清除浏览器缓存并硬刷新

**Windows/Linux**:
- Chrome/Edge: 按 `Ctrl + Shift + R` 或 `Ctrl + F5`
- Firefox: 按 `Ctrl + Shift + R`

**Mac**:
- Chrome/Edge: 按 `Cmd + Shift + R`
- Firefox: 按 `Cmd + Shift + R`

### 步骤 2: 检查浏览器控制台

1. 打开浏览器开发者工具：
   - Windows/Linux: 按 `F12` 或 `Ctrl + Shift + I`
   - Mac: 按 `Cmd + Option + I`

2. 切换到 "Console" 标签

3. 查看是否有红色错误信息

**常见错误和解决方案**:

#### 错误 1: CORS 错误
```
Access to XMLHttpRequest at 'http://localhost:8000' from origin 'http://localhost:8080' has been blocked by CORS policy
```

**解决方案**: 后端需要允许 8080 端口的跨域请求。已经在配置中添加了，应该不会有这个问题。

#### 错误 2: 网络错误
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

**解决方案**: 确认后端容器正在运行：
```bash
docker ps | findstr backend
curl http://localhost:8000/health
```

#### 错误 3: JavaScript 错误
```
Uncaught TypeError: Cannot read property 'xxx' of undefined
```

**解决方案**: 这可能是前端代码问题，需要查看具体错误信息。

### 步骤 3: 检查网络请求

1. 在开发者工具中切换到 "Network" 标签
2. 刷新页面（F5）
3. 查看所有请求的状态码

**应该看到**:
- `GET /` - 200 OK
- `GET /assets/index-xxx.js` - 200 OK
- `GET /assets/index-xxx.css` - 200 OK

**如果看到 404**:
- 说明文件路径不对，可能是构建问题

### 步骤 4: 测试后端 API

在浏览器控制台中执行：

```javascript
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

**应该看到**:
```json
{
  "status": "healthy",
  "service": "AI旅行规划师",
  "version": "1.0.0"
}
```

### 步骤 5: 检查 Vue 应用是否挂载

在浏览器控制台中执行：

```javascript
document.getElementById('app')
```

**应该看到**:
- 如果返回 `<div id="app"></div>`（空的），说明 Vue 应用没有挂载
- 如果返回包含内容的 div，说明 Vue 应用已挂载

### 步骤 6: 尝试不同的浏览器

- Chrome
- Edge
- Firefox

如果在某个浏览器中正常，说明可能是浏览器兼容性问题。

## 🛠️ 解决方案

### 方案 1: 重新构建前端镜像（推荐）

如果是镜像构建问题，需要重新构建：

```bash
# 停止容器
docker-compose -f docker-compose.local.yml down

# 删除旧镜像
docker rmi crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/frontend:main

# 重新拉取
docker pull crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com/ai-travel-planner-wzl/frontend:main

# 启动
docker-compose -f docker-compose.local.yml up -d
```

### 方案 2: 使用本地构建

如果拉取的镜像有问题，可以尝试本地构建：

```bash
# 克隆项目
git clone https://github.com/xinyangwy/AI-Travel-Planner-wzl.git
cd AI-Travel-Planner-wzl

# 本地构建前端
cd frontend
docker build -t frontend-local .

# 修改 docker-compose.local.yml，将 image 改为 frontend-local
# 然后启动
cd ..
docker-compose -f docker-compose.local.yml up -d
```

### 方案 3: 检查前端环境变量

前端需要正确的 API 地址。检查前端容器中的配置：

```bash
# 进入前端容器
docker exec -it ai-travel-planner-frontend sh

# 查看 index.html
cat /usr/share/nginx/html/index.html

# 查看 JS 文件中的 API 地址
grep -r "localhost:8000" /usr/share/nginx/html/assets/

# 退出
exit
```

### 方案 4: 查看详细日志

```bash
# 查看前端日志
docker logs ai-travel-planner-frontend -f

# 查看后端日志
docker logs ai-travel-planner-backend -f
```

## 📝 收集信息

如果以上方法都不能解决，请收集以下信息：

1. **浏览器控制台截图**（Console 标签）
2. **网络请求截图**（Network 标签）
3. **前端容器日志**:
   ```bash
   docker logs ai-travel-planner-frontend > frontend.log
   ```
4. **后端容器日志**:
   ```bash
   docker logs ai-travel-planner-backend > backend.log
   ```

## 🎯 快速测试

运行以下命令快速测试所有组件：

```bash
# 测试后端
curl http://localhost:8000/health

# 测试前端 HTML
curl http://localhost:8080

# 测试前端 JS
curl http://localhost:8080/assets/index-P9nwq1oT.js | head -n 10

# 测试前端 CSS
curl http://localhost:8080/assets/index-CrWjAs8U.css | head -n 10

# 查看容器状态
docker ps

# 查看容器日志
docker-compose -f docker-compose.local.yml logs
```

## 💡 最可能的原因

根据日志分析，最可能的原因是：

1. **浏览器缓存** - 尝试硬刷新（Ctrl + Shift + R）
2. **JavaScript 错误** - 查看浏览器控制台
3. **API 连接问题** - 确认后端正常运行

## 🆘 临时解决方案

如果前端一直有问题，可以直接使用后端 API：

访问 http://localhost:8000/docs 使用 Swagger UI 测试 API。

---

**提示**: 大多数情况下，硬刷新浏览器（Ctrl + Shift + R）就能解决问题！
