# 阿里云个人版镜像仓库配置指南

## 📋 你的实例信息

根据阿里云提供的凭证：

```
Registry 地址: crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com
用户名: 开发者信仰
密码: [你设置的固定密码]
地域: 上海 (cn-shanghai)
```

## 🔧 配置步骤

### 1. 更新 GitHub Actions 工作流

编辑文件：`.github/workflows/docker-build-push.yml`

将以下内容：
```yaml
env:
  REGISTRY: registry.cn-hangzhou.aliyuncs.com
  NAMESPACE: ai-travel-planner
```

修改为：
```yaml
env:
  REGISTRY: crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com
  NAMESPACE: ai-travel-planner  # 或你在阿里云创建的命名空间名称
```

### 2. 配置 GitHub Secrets

进入 GitHub 仓库设置：
1. 打开：https://github.com/xinyangwy/AI-Travel-Planner-wzl/settings/secrets/actions
2. 点击 "New repository secret"
3. 添加以下两个 secrets：

**Secret 1:**
```
Name: ALIYUN_REGISTRY_USERNAME
Value: 开发者信仰
```

**Secret 2:**
```
Name: ALIYUN_REGISTRY_PASSWORD
Value: [你的固定密码]
```

### 3. 在阿里云创建镜像仓库

登录阿里云容器镜像服务控制台：https://cr.console.aliyun.com/

#### 3.1 创建命名空间
1. 点击左侧 "命名空间"
2. 点击 "创建命名空间"
3. 输入名称：`ai-travel-planner`
4. 点击确定

#### 3.2 创建镜像仓库
创建两个仓库：

**后端仓库：**
- 命名空间：`ai-travel-planner`
- 仓库名称：`backend`
- 仓库类型：私有
- 摘要：AI Travel Planner Backend Service

**前端仓库：**
- 命名空间：`ai-travel-planner`
- 仓库名称：`frontend`
- 仓库类型：私有
- 摘要：AI Travel Planner Frontend Service

### 4. 本地测试登录

在终端执行：

```bash
# Windows (CMD)
docker login --username=开发者信仰 crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com

# Linux/Mac
sudo docker login --username=开发者信仰 crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com
```

输入你的固定密码，看到 "Login Succeeded" 表示成功。

### 5. 触发构建

配置完成后，推送代码触发 GitHub Actions：

```bash
git add .
git commit -m "chore: update aliyun registry to personal instance"
git push origin main
```

## 📝 完整的工作流配置示例

`.github/workflows/docker-build-push.yml` 应该包含：

```yaml
name: Build and Push Docker Images to Aliyun

on:
  push:
    branches:
      - main
      - develop
    tags:
      - 'v*'
  pull_request:
    branches:
      - main

env:
  # 阿里云个人版镜像仓库地址
  REGISTRY: crpi-1trut6hjzy84g1bf.cn-shanghai.personal.cr.aliyuncs.com
  # 命名空间
  NAMESPACE: ai-travel-planner
  # 镜像名称
  BACKEND_IMAGE: backend
  FRONTEND_IMAGE: frontend

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Aliyun Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ secrets.ALIYUN_REGISTRY_USERNAME }}
          password: ${{ secrets.ALIYUN_REGISTRY_PASSWORD }}

      - name: Extract metadata for Backend
        id: meta-backend
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.NAMESPACE }}/${{ env.BACKEND_IMAGE }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Extract metadata for Frontend
        id: meta-frontend
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.NAMESPACE }}/${{ env.FRONTEND_IMAGE }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Backend image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: true
          tags: ${{ steps.meta-backend.outputs.tags }}
          labels: ${{ steps.meta-backend.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          platforms: linux/amd64

      - name: Build and push Frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          push: true
          tags: ${{ steps.meta-frontend.outputs.tags }}
          labels: ${{ steps.meta-frontend.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          platforms: linux/amd64

      - name: Image digest
        run: |
          echo "Backend Image Tags: ${{ steps.meta-backend.outputs.tags }}"
          echo "Frontend Image Tags: ${{ steps.meta-frontend.outputs.tags }}"
```

## ⚠️ 注意事项

1. **固定密码安全**
   - 固定密码没有时效限制，请妥善保管
   - 不要将密码提交到代码仓库
   - 只在 GitHub Secrets 中配置

2. **RAM 用户限制**
   - 使用 RAM 用户（子账号）时，企业别名不能包含英文半角句号（.）

3. **网络访问**
   - 个人版实例有专有域名
   - 支持公网访问和专有网络访问
   - 根据网络环境选择对应的域名

4. **镜像平台**
   - 个人版实例建议只构建 `linux/amd64` 平台
   - 如需多平台支持，考虑升级到企业版

## 🔍 故障排查

### 登录失败 403 Forbidden

**可能原因：**
- GitHub Secrets 未配置或配置错误
- 用户名或密码不正确
- Registry 地址错误

**解决方法：**
1. 检查 GitHub Secrets 是否正确添加
2. 确认用户名是 `开发者信仰`（不是邮箱）
3. 确认密码是固定密码（不是阿里云账号密码）
4. 确认 Registry 地址是个人实例地址

### 推送失败 404 Not Found

**可能原因：**
- 命名空间或仓库不存在
- 命名空间名称不匹配

**解决方法：**
1. 登录阿里云控制台检查命名空间和仓库是否已创建
2. 确认工作流中的 NAMESPACE 与阿里云一致

### 构建超时

**可能原因：**
- 多平台构建耗时过长
- 网络问题

**解决方法：**
1. 移除 `platforms: linux/amd64,linux/arm64`，只保留 `linux/amd64`
2. 使用 GitHub Actions 缓存加速构建

## 📞 需要帮助？

如果遇到问题：
1. 查看 GitHub Actions 构建日志
2. 查看阿里云容器镜像服务控制台
3. 参考详细文档：`docs/GITHUB_ACTIONS_SETUP.md`

## 🔗 相关链接

- [阿里云容器镜像服务控制台](https://cr.console.aliyun.com/)
- [GitHub Actions 工作流](https://github.com/xinyangwy/AI-Travel-Planner-wzl/actions)
- [阿里云容器镜像服务文档](https://help.aliyun.com/product/60716.html)
