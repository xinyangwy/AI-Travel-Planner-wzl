# 🚨 GitHub Actions 快速修复指南

## 当前问题

GitHub Actions 构建失败：
```
Error: login attempt to https://registry.cn-hangzhou.aliyuncs.com/v2/ failed with status: 403 Forbidden
```

## ⚡ 快速修复（5分钟）

### 1️⃣ 获取阿里云凭证

访问: https://cr.console.aliyun.com/

1. 点击右上角头像 → "访问凭证"
2. 设置 Registry 登录密码（如果还没有）
3. 记录：
   - 用户名（你的阿里云账号）
   - 密码（Registry 登录密码）

### 2️⃣ 配置 GitHub Secrets

访问: https://github.com/xinyangwy/AI-Travel-Planner-wzl/settings/secrets/actions

点击 "New repository secret"，添加两个 secrets：

**Secret 1:**
```
Name: ALIYUN_REGISTRY_USERNAME
Value: 你的阿里云账号（邮箱或手机号）
```

**Secret 2:**
```
Name: ALIYUN_REGISTRY_PASSWORD
Value: 你的 Registry 登录密码
```

### 3️⃣ 创建阿里云镜像仓库

访问: https://cr.console.aliyun.com/

1. 创建命名空间: `ai-travel-planner`
2. 创建镜像仓库: `backend` (私有)
3. 创建镜像仓库: `frontend` (私有)

### 4️⃣ 重新运行工作流

访问: https://github.com/xinyangwy/AI-Travel-Planner-wzl/actions

1. 选择失败的工作流
2. 点击 "Re-run all jobs"

## ✅ 验证

构建成功后，你应该看到：
- ✅ 绿色勾号
- ✅ "Build and push Backend image" 成功
- ✅ "Build and push Frontend image" 成功

## 📚 详细文档

查看完整配置指南: [docs/GITHUB_ACTIONS_SETUP.md](docs/GITHUB_ACTIONS_SETUP.md)

## 🆘 仍然失败？

1. 检查 Secret 名称是否完全匹配（区分大小写）
2. 确认用户名是完整的阿里云账号
3. 确认密码是 Registry 登录密码（不是阿里云账号密码）
4. 查看详细日志排查问题

## 💡 提示

配置完成后，每次推送代码到 main 分支都会自动触发构建和部署！
