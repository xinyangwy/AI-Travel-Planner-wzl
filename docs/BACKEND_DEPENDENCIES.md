# 后端依赖说明

## 📦 完整依赖列表

### HelloAgents 框架
| 包名 | 版本 | 用途 |
|------|------|------|
| hello-agents[protocols] | >=0.2.4 | 多智能体框架核心 |
| huggingface_hub | >=0.20.0 | HelloAgents 的依赖，用于模型下载 |

### FastAPI 和 Web 框架
| 包名 | 版本 | 用途 |
|------|------|------|
| fastapi | >=0.115.0 | Web 框架 |
| uvicorn[standard] | >=0.32.0 | ASGI 服务器 |

### 数据验证和配置
| 包名 | 版本 | 用途 |
|------|------|------|
| pydantic | >=2.0.0 | 数据验证 |
| pydantic-settings | >=2.0.0 | 配置管理 |

### HTTP 客户端
| 包名 | 版本 | 用途 |
|------|------|------|
| httpx | >=0.27.0 | 异步 HTTP 客户端 |
| aiohttp | >=3.10.0 | 异步 HTTP 客户端 |
| requests | >=2.31.0 | 同步 HTTP 客户端（Unsplash 服务） |

### 数据库和认证
| 包名 | 版本 | 用途 |
|------|------|------|
| supabase | >=2.0.0 | Supabase 客户端 |
| postgrest | >=0.10.0 | PostgreSQL REST API 客户端 |

### 环境变量管理
| 包名 | 版本 | 用途 |
|------|------|------|
| python-dotenv | >=1.0.0 | 加载 .env 文件 |

### 文件上传和 CORS
| 包名 | 版本 | 用途 |
|------|------|------|
| python-multipart | >=0.0.9 | 文件上传支持 |

### 日志
| 包名 | 版本 | 用途 |
|------|------|------|
| loguru | >=0.7.0 | 日志记录 |

### MCP 相关
| 包名 | 版本 | 用途 |
|------|------|------|
| fastmcp | >=2.0.0 | MCP 协议支持 |
| uv | >=0.8.0 | Python 包管理器（用于 MCP 服务器） |

### 日期时间处理
| 包名 | 版本 | 用途 |
|------|------|------|
| python-dateutil | >=2.8.2 | 日期时间解析 |

### 标准库（无需安装）
- json - JSON 处理
- asyncio - 异步编程
- threading - 多线程
- concurrent.futures - 并发执行
- typing - 类型提示
- os - 操作系统接口
- pathlib - 路径操作
- uuid - UUID 生成
- warnings - 警告控制
- queue - 队列

## 🔍 依赖检查

### 自动检查脚本

运行依赖检查脚本：

```bash
cd backend
python check_dependencies.py
```

**输出示例**（所有依赖已安装）：
```
============================================================
🔍 检查 Python 依赖包
============================================================

📦 检查必需的包:
------------------------------------------------------------
✅ hello-agents                v0.2.4
✅ huggingface_hub             v0.20.0
✅ fastapi                     v0.115.0
✅ uvicorn                     v0.32.0
✅ pydantic                    v2.0.0
✅ pydantic-settings           v2.0.0
✅ httpx                       v0.27.0
✅ aiohttp                     v3.10.0
✅ requests                    v2.31.0
✅ supabase                    v2.0.0
✅ postgrest                   v0.10.0
✅ python-dotenv               v1.0.0
✅ loguru                      v0.7.0
✅ fastmcp                     v2.0.0
✅ python-dateutil             v2.8.2

------------------------------------------------------------

📚 标准库（无需安装）:
------------------------------------------------------------
✅ json
✅ asyncio
✅ threading
✅ concurrent
✅ typing
✅ os
✅ pathlib
✅ uuid
✅ warnings
✅ queue

============================================================
📊 统计信息:
   总计: 15 个包
   已安装: 15 个包
   缺失: 0 个包

✅ 所有必需的包都已安装！

============================================================
```

**输出示例**（有缺失的包）：
```
============================================================
🔍 检查 Python 依赖包
============================================================

📦 检查必需的包:
------------------------------------------------------------
✅ hello-agents                v0.2.4
❌ huggingface_hub             未安装
✅ fastapi                     v0.115.0
...

============================================================
📊 统计信息:
   总计: 15 个包
   已安装: 14 个包
   缺失: 1 个包

❌ 发现缺失的包！

请运行以下命令安装缺失的包:

   pip install huggingface_hub

或者安装所有依赖:

   pip install -r requirements.txt

============================================================
```

### 手动检查

```bash
# 检查单个包
python -c "import hello_agents; print(hello_agents.__version__)"

# 检查所有包
pip list | grep -E "hello-agents|fastapi|uvicorn|pydantic|httpx|aiohttp|requests|supabase|dotenv|loguru|fastmcp|dateutil|huggingface"
```

## 📥 安装依赖

### 方式 1: 使用 requirements.txt（推荐）

```bash
cd backend
pip install -r requirements.txt
```

### 方式 2: 手动安装

```bash
# HelloAgents 框架
pip install "hello-agents[protocols]>=0.2.4"
pip install "huggingface_hub>=0.20.0"

# FastAPI 和 Web 框架
pip install "fastapi>=0.115.0"
pip install "uvicorn[standard]>=0.32.0"

# 数据验证和配置
pip install "pydantic>=2.0.0"
pip install "pydantic-settings>=2.0.0"

# HTTP 客户端
pip install "httpx>=0.27.0"
pip install "aiohttp>=3.10.0"
pip install "requests>=2.31.0"

# 数据库和认证
pip install "supabase>=2.0.0"
pip install "postgrest>=0.10.0"

# 其他
pip install "python-dotenv>=1.0.0"
pip install "python-multipart>=0.0.9"
pip install "loguru>=0.7.0"
pip install "fastmcp>=2.0.0"
pip install "uv>=0.8.0"
pip install "python-dateutil>=2.8.2"
```

### 方式 3: 使用虚拟环境（推荐）

```bash
# 创建虚拟环境
cd backend
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

## 🐳 Docker 构建验证

### 本地测试 Docker 构建

```bash
# 构建镜像
cd backend
docker build -t backend-test .

# 运行容器
docker run -p 8000:8000 --env-file .env backend-test

# 检查日志
docker logs -f <container_id>
```

### 验证依赖安装

```bash
# 进入容器
docker exec -it <container_id> bash

# 运行依赖检查
python check_dependencies.py

# 或手动检查
pip list
```

## 🔧 常见问题

### Q1: huggingface_hub 安装失败

**问题**: `ModuleNotFoundError: No module named 'huggingface_hub'`

**解决方案**:
```bash
pip install huggingface_hub>=0.20.0
```

### Q2: supabase 安装失败

**问题**: `ModuleNotFoundError: No module named 'supabase'`

**解决方案**:
```bash
pip install supabase>=2.0.0 postgrest>=0.10.0
```

### Q3: requests 缺失

**问题**: `ModuleNotFoundError: No module named 'requests'`

**解决方案**:
```bash
pip install requests>=2.31.0
```

### Q4: Docker 构建时依赖安装失败

**问题**: Docker 构建过程中某些包安装失败

**解决方案**:

1. 检查 Dockerfile 中的系统依赖：
```dockerfile
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*
```

2. 使用 pip 缓存：
```dockerfile
RUN pip install --no-cache-dir -r requirements.txt
```

3. 分步安装：
```dockerfile
# 先安装基础依赖
RUN pip install --no-cache-dir wheel setuptools pip --upgrade

# 再安装项目依赖
RUN pip install --no-cache-dir -r requirements.txt
```

## 📊 依赖关系图

```
AI Travel Planner Backend
│
├── HelloAgents 框架
│   ├── hello-agents[protocols]
│   └── huggingface_hub (间接依赖)
│
├── Web 框架
│   ├── fastapi
│   └── uvicorn[standard]
│
├── 数据处理
│   ├── pydantic
│   └── pydantic-settings
│
├── HTTP 通信
│   ├── httpx (异步)
│   ├── aiohttp (异步)
│   └── requests (同步)
│
├── 数据库
│   ├── supabase
│   └── postgrest
│
├── 工具库
│   ├── python-dotenv
│   ├── python-multipart
│   ├── loguru
│   ├── fastmcp
│   ├── uv
│   └── python-dateutil
│
└── 标准库
    ├── json
    ├── asyncio
    ├── threading
    ├── concurrent.futures
    └── ...
```

## 🎯 最佳实践

### 1. 使用虚拟环境

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

### 2. 锁定依赖版本

```bash
# 生成精确的依赖版本
pip freeze > requirements-lock.txt
```

### 3. 定期更新依赖

```bash
# 检查过时的包
pip list --outdated

# 更新单个包
pip install --upgrade package_name

# 更新所有包
pip install --upgrade -r requirements.txt
```

### 4. 使用依赖检查

```bash
# 在 CI/CD 中添加依赖检查
python check_dependencies.py
```

## 📝 更新日志

### v2.0.3 (2025-11-10)
- ✅ 添加 `huggingface_hub>=0.20.0` - 修复 Docker 构建问题
- ✅ 添加 `requests>=2.31.0` - Unsplash 服务依赖
- ✅ 添加 `supabase>=2.0.0` - 数据库和认证
- ✅ 添加 `postgrest>=0.10.0` - PostgreSQL REST API
- ✅ 创建依赖检查脚本 `check_dependencies.py`
- ✅ 完善依赖文档

### v2.0.2 (2025-11-09)
- 初始版本

---

**文档版本**: v2.0.3  
**最后更新**: 2025-11-10  
**维护者**: AI Travel Planner Team
