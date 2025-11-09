# Supabase 配置指南

本文档说明如何配置 Supabase 以支持用户认证和数据存储功能。

## 1. Supabase 项目设置

### 1.1 创建 Supabase 项目
1. 访问 [Supabase](https://supabase.com/) 并创建账户
2. 创建新项目
3. 记录项目 URL 和 API Keys

### 1.2 获取配置信息
在 Supabase 项目设置中，找到以下信息：
- **Project URL**: 例如 `https://xxxxx.supabase.co`
- **anon/public key**: 用于前端认证
- **service_role key**: 用于后端服务（保密）

### 1.3 获取数据库连接字符串
在 Supabase 项目设置 -> Database -> Connection string 中：
- 选择 "Direct connection"
- 复制连接字符串，例如：`postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres`

## 2. 数据库表创建

在 Supabase SQL Editor 中执行以下 SQL 语句创建表：

```sql
-- 创建旅行规划表
CREATE TABLE IF NOT EXISTS trip_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    request_data JSONB NOT NULL,
    response_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_trip_plans_user_id 
ON trip_plans(user_id);

CREATE INDEX IF NOT EXISTS idx_trip_plans_created_at 
ON trip_plans(created_at DESC);

-- 启用 Row Level Security (RLS)
ALTER TABLE trip_plans ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看和插入自己的数据
CREATE POLICY "Users can view their own trip plans"
ON trip_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trip plans"
ON trip_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trip plans"
ON trip_plans FOR UPDATE
USING (auth.uid() = user_id);
```

## 3. 环境变量配置

### 3.1 前端配置 (frontend/.env)

创建 `frontend/.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3.2 后端配置 (backend/.env)

在 `backend/.env` 文件中添加：

```env
# Supabase配置
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
```

## 4. 功能说明

### 4.1 用户认证
- **注册**: 用户可以通过邮箱和密码注册账户
- **登录**: 已注册用户可以登录
- **登出**: 用户可以登出账户

### 4.2 数据存储
- **已登录用户**: 
  - 每次生成的旅行规划会自动保存到 Supabase
  - 可以在主页查看历史规划记录
  - 可以查看和重新加载之前的规划
  
- **未登录游客**:
  - 可以正常使用旅行规划功能
  - 数据不会保存到数据库
  - 无法查看历史记录

### 4.3 历史记录
- 已登录用户在主页可以看到自己的所有旅行规划历史
- 点击历史记录可以查看详细规划
- 历史记录按创建时间倒序排列

## 5. 测试

1. 启动后端服务：
```bash
cd backend
python run.py
```

2. 启动前端服务：
```bash
cd frontend
npm run dev
```

3. 测试流程：
   - 访问前端应用
   - 点击"登录/注册"按钮
   - 注册新账户
   - 生成旅行规划
   - 查看主页的历史记录
   - 点击历史记录查看详情

## 6. 注意事项

1. **安全性**: 
   - `SUPABASE_SERVICE_KEY` 和 `DATABASE_URL` 包含敏感信息，不要提交到版本控制
   - 使用 `.gitignore` 排除 `.env` 文件

2. **RLS策略**: 
   - 已配置 Row Level Security，确保用户只能访问自己的数据
   - 如果遇到权限问题，检查 RLS 策略是否正确配置

3. **数据库连接**: 
   - 使用 Direct connection 字符串用于后端服务
   - 前端使用 Supabase 客户端库，不需要直接连接数据库

## 7. 故障排除

### 问题：无法保存数据
- 检查 `SUPABASE_SERVICE_KEY` 是否正确
- 检查数据库表是否已创建
- 检查 RLS 策略是否正确配置

### 问题：无法查看历史记录
- 检查用户是否已登录
- 检查前端环境变量是否正确配置
- 检查后端 API 是否正常运行

### 问题：认证失败
- 检查 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 是否正确
- 检查 Supabase 项目设置中的认证配置



