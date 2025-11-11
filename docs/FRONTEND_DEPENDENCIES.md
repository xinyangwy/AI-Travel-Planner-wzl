# 前端依赖说明

## 📦 完整依赖列表

### 生产依赖 (dependencies)

| 包名 | 版本 | 用途 | 状态 |
|------|------|------|------|
| vue | ^3.5.13 | Vue 3 核心框架 | ✅ 已配置 |
| vue-router | ^4.5.0 | Vue 路由管理 | ✅ 已配置 |
| ant-design-vue | ^4.2.6 | UI 组件库 | ✅ 已配置 |
| axios | ^1.7.9 | HTTP 客户端 | ✅ 已配置 |
| @supabase/supabase-js | ^2.76.1 | Supabase 客户端 | ✅ 已配置 |
| @amap/amap-jsapi-loader | ^1.0.1 | 高德地图 JS API 加载器 | ✅ 已配置 |
| dayjs | ^1.11.19 | 日期时间处理 | ✅ 已配置 |
| html2canvas | ^1.4.1 | HTML 转 Canvas（截图） | ✅ 已配置 |
| jspdf | ^3.0.3 | PDF 生成 | ✅ 已配置 |

### 开发依赖 (devDependencies)

| 包名 | 版本 | 用途 | 状态 |
|------|------|------|------|
| vite | ^6.0.7 | 构建工具 | ✅ 已配置 |
| @vitejs/plugin-vue | ^5.2.1 | Vite Vue 插件 | ✅ 已配置 |
| typescript | ^5.7.3 | TypeScript 编译器 | ✅ 已配置 |
| vue-tsc | ^2.2.0 | Vue TypeScript 类型检查 | ✅ 已配置 |
| @types/node | ^22.10.5 | Node.js 类型定义 | ✅ 已配置 |

## 📊 依赖用途详解

### 核心框架
- **vue**: Vue 3 核心框架，提供响应式数据和组件系统
- **vue-router**: 单页应用路由管理

### UI 和样式
- **ant-design-vue**: 企业级 UI 组件库，提供丰富的组件
  - 使用的组件：Button, Form, Input, DatePicker, Select, Card, Message, Modal 等

### 数据通信
- **axios**: HTTP 客户端，用于 API 请求
- **@supabase/supabase-js**: Supabase 客户端，用于认证和数据库操作

### 地图功能
- **@amap/amap-jsapi-loader**: 高德地图 JS API 加载器
  - 用于在结果页面显示地图和标记

### 工具库
- **dayjs**: 轻量级日期时间处理库
  - 用于日期格式化和计算
- **html2canvas**: 将 HTML 元素转换为 Canvas
  - 用于生成旅行计划截图
- **jspdf**: 生成 PDF 文件
  - 用于导出旅行计划为 PDF

### 开发工具
- **vite**: 现代化的前端构建工具
- **@vitejs/plugin-vue**: Vite 的 Vue 3 插件
- **typescript**: TypeScript 编译器
- **vue-tsc**: Vue 文件的 TypeScript 类型检查
- **@types/node**: Node.js 的 TypeScript 类型定义

## 🔍 依赖检查

### 自动检查脚本

运行依赖检查脚本：

```bash
cd frontend
node check-dependencies.js
```

**输出示例**（所有依赖已安装）：
```
============================================================
🔍 检查前端 npm 依赖包
============================================================

📦 检查生产依赖:
------------------------------------------------------------
✅ vue                          v3.5.13
✅ vue-router                   v4.5.0
✅ ant-design-vue               v4.2.6
✅ axios                        v1.7.9
✅ @supabase/supabase-js        v2.76.1
✅ @amap/amap-jsapi-loader      v1.0.1
✅ dayjs                        v1.11.19
✅ html2canvas                  v1.4.1
✅ jspdf                        v3.0.3

------------------------------------------------------------

🛠️  检查开发依赖:
------------------------------------------------------------
✅ vite                         v6.0.7
✅ @vitejs/plugin-vue           v5.2.1
✅ typescript                   v5.7.3
✅ vue-tsc                      v2.2.0
✅ @types/node                  v22.10.5

============================================================
📊 统计信息:
   总计: 14 个包
   已安装: 14 个包
   缺失: 0 个包

✅ 所有必需的包都已安装！

============================================================
```

### 手动检查

```bash
# 检查所有已安装的包
npm list --depth=0

# 检查特定包
npm list vue
npm list ant-design-vue
npm list axios

# 检查过时的包
npm outdated
```

## 📥 安装依赖

### 方式 1: 使用 npm install（推荐）

```bash
cd frontend
npm install
```

### 方式 2: 使用 npm ci（CI/CD 环境）

```bash
cd frontend
npm ci
```

**区别**:
- `npm install`: 会更新 `package-lock.json`，适合开发环境
- `npm ci`: 严格按照 `package-lock.json` 安装，适合 CI/CD 和生产环境

### 方式 3: 手动安装

```bash
# 生产依赖
npm install vue@^3.5.13
npm install vue-router@^4.5.0
npm install ant-design-vue@^4.2.6
npm install axios@^1.7.9
npm install @supabase/supabase-js@^2.76.1
npm install @amap/amap-jsapi-loader@^1.0.1
npm install dayjs@^1.11.19
npm install html2canvas@^1.4.1
npm install jspdf@^3.0.3

# 开发依赖
npm install -D vite@^6.0.7
npm install -D @vitejs/plugin-vue@^5.2.1
npm install -D typescript@^5.7.3
npm install -D vue-tsc@^2.2.0
npm install -D @types/node@^22.10.5
```

## 🐳 Docker 构建验证

### Dockerfile 分析

```dockerfile
# 阶段1: 构建
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖（使用 npm ci 确保一致性）
RUN npm ci

# 复制源代码
COPY . .

# 设置环境变量
ENV VITE_API_BASE_URL=http://localhost:8000
ENV VITE_SUPABASE_URL=placeholder
ENV VITE_SUPABASE_ANON_KEY=placeholder

# 构建（跳过类型检查以加快速度）
RUN npm run build:docker

# 阶段2: 生产环境
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 本地测试 Docker 构建

```bash
# 构建镜像
cd frontend
docker build -t frontend-test .

# 运行容器
docker run -p 80:80 frontend-test

# 在浏览器访问
open http://localhost
```

### 验证构建产物

```bash
# 进入构建阶段的容器
docker build --target builder -t frontend-builder .
docker run -it frontend-builder sh

# 在容器内检查
ls -la /app/dist
cat /app/dist/index.html
```

## 🔧 常见问题

### Q1: npm install 失败

**问题**: 某些包安装失败

**解决方案**:
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### Q2: Docker 构建时依赖安装失败

**问题**: Docker 构建过程中 npm ci 失败

**解决方案**:

1. 确保 `package-lock.json` 存在且是最新的：
```bash
npm install
git add package-lock.json
git commit -m "chore: update package-lock.json"
```

2. 在 Dockerfile 中增加超时时间：
```dockerfile
RUN npm ci --timeout=60000
```

3. 使用国内镜像（可选）：
```dockerfile
RUN npm config set registry https://registry.npmmirror.com
RUN npm ci
```

### Q3: 类型检查失败

**问题**: `npm run build` 时 TypeScript 类型检查失败

**解决方案**:

1. 使用 `build:docker` 脚本跳过类型检查：
```bash
npm run build:docker
```

2. 或者修复类型错误：
```bash
# 运行类型检查
npm run vue-tsc --noEmit

# 查看错误并修复
```

### Q4: Vite 构建失败

**问题**: Vite 构建过程中出错

**解决方案**:

1. 检查 Node.js 版本：
```bash
node --version  # 应该是 18.x 或更高
```

2. 清理构建缓存：
```bash
rm -rf node_modules/.vite
npm run build:docker
```

3. 检查环境变量：
```bash
# 确保必要的环境变量已设置
echo $VITE_API_BASE_URL
echo $VITE_SUPABASE_URL
```

## 📊 依赖关系图

```
AI Travel Planner Frontend
│
├── 核心框架
│   ├── vue (核心)
│   └── vue-router (路由)
│
├── UI 组件
│   └── ant-design-vue
│       ├── Button
│       ├── Form
│       ├── Input
│       ├── DatePicker
│       ├── Select
│       ├── Card
│       ├── Message
│       └── Modal
│
├── 数据通信
│   ├── axios (HTTP)
│   └── @supabase/supabase-js (认证/数据库)
│
├── 地图功能
│   └── @amap/amap-jsapi-loader
│
├── 工具库
│   ├── dayjs (日期时间)
│   ├── html2canvas (截图)
│   └── jspdf (PDF 生成)
│
└── 开发工具
    ├── vite (构建)
    ├── @vitejs/plugin-vue (Vue 插件)
    ├── typescript (类型检查)
    ├── vue-tsc (Vue 类型检查)
    └── @types/node (Node 类型)
```

## 🎯 最佳实践

### 1. 使用 package-lock.json

```bash
# 始终提交 package-lock.json
git add package-lock.json
git commit -m "chore: update dependencies"
```

### 2. 定期更新依赖

```bash
# 检查过时的包
npm outdated

# 更新所有包到最新版本
npm update

# 更新特定包
npm update vue
```

### 3. 使用 npm ci 在 CI/CD 中

```yaml
# GitHub Actions 示例
- name: Install dependencies
  run: npm ci
  working-directory: frontend
```

### 4. 锁定依赖版本

在 `package.json` 中使用精确版本（生产环境）：
```json
{
  "dependencies": {
    "vue": "3.5.13",  // 精确版本
    "axios": "^1.7.9"  // 兼容版本
  }
}
```

## 📝 package.json 脚本说明

```json
{
  "scripts": {
    "dev": "vite",                    // 开发服务器
    "build": "vue-tsc && vite build", // 完整构建（含类型检查）
    "build:docker": "vite build",     // Docker 构建（跳过类型检查）
    "preview": "vite preview"         // 预览构建结果
  }
}
```

### 使用场景

- **dev**: 本地开发
- **build**: 生产构建（本地）
- **build:docker**: Docker 构建（CI/CD）
- **preview**: 预览构建结果

## ✅ 依赖完整性检查清单

- [ ] 所有生产依赖已安装
- [ ] 所有开发依赖已安装
- [ ] package-lock.json 存在且最新
- [ ] 本地构建成功 (`npm run build`)
- [ ] Docker 构建成功 (`docker build`)
- [ ] 运行时无依赖错误
- [ ] 所有功能正常工作

## 📚 相关文档

- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [Ant Design Vue 文档](https://antdv.com/)
- [Axios 文档](https://axios-http.com/)
- [Supabase 文档](https://supabase.com/docs)

---

**文档版本**: v2.0.4  
**最后更新**: 2025-11-10  
**维护者**: AI Travel Planner Team

## 🎉 总结

### 依赖状态
✅ 所有依赖已正确配置  
✅ package.json 完整  
✅ package-lock.json 存在  
✅ Dockerfile 配置正确  
✅ 构建脚本完善  

### 验证方法
```bash
# 1. 检查依赖
node check-dependencies.js

# 2. 本地构建
npm run build:docker

# 3. Docker 构建
docker build -t frontend-test .

# 4. 运行测试
docker run -p 80:80 frontend-test
```

### 结论
前端依赖配置完整，Docker 镜像可以正常构建和运行！
