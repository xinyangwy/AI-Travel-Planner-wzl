# GitHub Actions 配置指南

## 🚨 当前问题

GitHub Actions 构建失败，错误信息：
```
Error: Error response from daemon: login attempt to https://registry.cn-hangzhou.aliyuncs.com/v2/ failed with status: 403 Forbidden
```

**原因**: 未配置 GitHub Secrets 中的阿里云镜像仓库访问凭证。

## ✅ 解决方案

### 步骤 1: 获取阿里云容器镜像服务凭证

#### 1.1 登录阿里云控制台

访问: https://cr.console.aliyun.com/

#### 1.2 创建命名空间（如果还没有）

1. 点击左侧菜单 "命名空间"
2. 点击 "创建命名空间"
3. 输入命名空间名称: `ai-travel-planner`
4. 点击 "确定"

#### 1.3 创建镜像仓库

1. 点击左侧菜单 "镜像仓库"
2. 点击 "创建镜像仓库"
3. 创建两个仓库：

**后端仓库:**
- 命名空间: `ai-travel-planner`
- 仓库名称: `backend`
- 仓库类型: 私有
- 摘要: AI Travel Planner Backend Service

**前端仓库:**
- 命名空间: `ai-travel-planner`
- 仓库名称: `frontend`
- 仓库类型: 私有
- 摘要: AI Travel Planner Frontend Service

#### 1.4 获取访问凭证

1. 点击右上角头像
2. 选择 "访问凭证"
3. 如果没有设置过，点击 "设置Registry登录密码"
4. 设置并记住密码

**重要信息:**
- **用户名**: 通常是你的阿里云账号全名（邮箱或手机号）
- **密码**: 刚才设置的 Registry 登录密码
- **Registry地址**: `registry.cn-hangzhou.aliyuncs.com` (根据你选择的区域)

### 步骤 2: 配置 GitHub Secrets

#### 2.1 进入 GitHub 仓库设置

1. 打开你的 GitHub 仓库: https://github.com/xinyangwy/AI-Travel-Planner-wzl
2. 点击 "Settings" 标签
3. 在左侧菜单中找到 "Secrets and variables"
4. 点击 "Actions"

#### 2.2 添加 Secrets

点击 "New repository secret" 按钮，添加以下两个 secrets：

**Secret 1: ALIYUN_REGISTRY_USERNAME**
```
Name: ALIYUN_REGISTRY_USERNAME
Secret: 你的阿里云账号（邮箱或手机号）
```

示例:
- 如果是邮箱: `your-email@example.com`
- 如果是手机号: `13800138000`

**Secret 2: ALIYUN_REGISTRY_PASSWORD**
```
Name: ALIYUN_REGISTRY_PASSWORD
Secret: 你的 Registry 登录密码
```

⚠️ **注意**: 
- Secret 名称必须完全匹配（区分大小写）
- 密码是 Registry 登录密码，不是阿里云账号密码
- 添加后无法查看，只能更新

### 步骤 3: 验证配置

#### 3.1 检查 Secrets 是否添加成功

在 "Secrets and variables > Actions" 页面，你应该看到：
- ✅ ALIYUN_REGISTRY_USERNAME
- ✅ ALIYUN_REGISTRY_PASSWORD

#### 3.2 手动触发工作流

1. 进入 "Actions" 标签
2. 选择 "Build and Push Docker Images to Aliyun" 工作流
3. 点击 "Run workflow"
4. 选择 "main" 分支
5. 点击 "Run workflow" 按钮

#### 3.3 查看构建日志

等待几分钟，查看构建状态：
- ✅ 绿色勾号 = 构建成功
- ❌ 红色叉号 = 构建失败（查看日志排查问题）

### 步骤 4: 测试本地登录（可选）

在本地测试阿里云镜像仓库登录：

```bash
# 登录测试
docker login --username=your-username registry.cn-hangzhou.aliyuncs.com

# 输入密码后，如果看到 "Login Succeeded" 说明凭证正确
```

## 🔍 常见问题

### Q1: 403 Forbidden 错误

**原因**: 
- Secrets 未配置
- 用户名或密码错误
- Registry 地址错误

**解决方案**:
1. 检查 Secrets 是否正确添加
2. 确认用户名是完整的阿里云账号
3. 确认密码是 Registry 登录密码
4. 确认 Registry 地址与你的区域匹配

### Q2: 找不到镜像仓库

**原因**: 
- 命名空间或仓库名称不匹配
- 仓库未创建

**解决方案**:
1. 检查 `.github/workflows/docker-build-push.yml` 中的配置：
   ```yaml
   env:
     REGISTRY: registry.cn-hangzhou.aliyuncs.com
     NAMESPACE: ai-travel-planner
     BACKEND_IMAGE: backend
     FRONTEND_IMAGE: frontend
   ```
2. 确保阿里云上的命名空间和仓库名称与配置一致

### Q3: 构建超时

**原因**: 
- 网络问题
- 镜像体积过大
- 依赖下载慢

**解决方案**:
1. 使用 Docker 缓存加速
2. 优化 Dockerfile
3. 使用国内镜像源

### Q4: 推送失败

**原因**: 
- 权限不足
- 仓库配额已满

**解决方案**:
1. 检查阿里云账号权限
2. 检查镜像仓库配额
3. 清理旧镜像

## 📋 配置检查清单

在触发构建前，确认以下项目：

- [ ] 阿里云容器镜像服务已开通
- [ ] 命名空间 `ai-travel-planner` 已创建
- [ ] 镜像仓库 `backend` 已创建
- [ ] 镜像仓库 `frontend` 已创建
- [ ] Registry 登录密码已设置
- [ ] GitHub Secret `ALIYUN_REGISTRY_USERNAME` 已添加
- [ ] GitHub Secret `ALIYUN_REGISTRY_PASSWORD` 已添加
- [ ] Secret 名称拼写正确（区分大小写）
- [ ] 用户名是完整的阿里云账号
- [ ] 密码是 Registry 登录密码

## 🎯 下一步

配置完成后：

1. **推送代码触发构建**
   ```bash
   git add .
   git commit -m "fix: update github actions config"
   git push origin main
   ```

2. **查看构建状态**
   - 访问: https://github.com/xinyangwy/AI-Travel-Planner-wzl/actions
   - 查看最新的工作流运行

3. **验证镜像**
   ```bash
   # 登录阿里云镜像仓库
   docker login registry.cn-hangzhou.aliyuncs.com
   
   # 拉取镜像测试
   docker pull registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/backend:latest
   docker pull registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/frontend:latest
   ```

## 📞 需要帮助？

如果遇到问题：

1. 查看 GitHub Actions 日志
2. 查看阿里云容器镜像服务控制台
3. 提交 Issue: https://github.com/xinyangwy/AI-Travel-Planner-wzl/issues

## 🔗 相关文档

- [阿里云容器镜像服务文档](https://help.aliyun.com/product/60716.html)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Docker 官方文档](https://docs.docker.com/)
