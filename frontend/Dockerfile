# 前端 Dockerfile - 多阶段构建
# 阶段1: 构建
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 创建环境变量文件（构建时需要）
ENV VITE_API_BASE_URL=http://localhost:8000
ENV VITE_SUPABASE_URL=placeholder
ENV VITE_SUPABASE_ANON_KEY=placeholder

# 构建生产版本（使用 build:docker 跳过类型检查以加快构建速度）
RUN npm run build:docker

# 阶段2: 生产环境
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
