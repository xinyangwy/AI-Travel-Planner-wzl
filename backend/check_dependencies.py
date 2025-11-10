#!/usr/bin/env python3
"""
依赖检查脚本
检查所有必需的 Python 包是否已安装
"""

import sys
import importlib
from typing import List, Tuple

# 定义所有需要的包
REQUIRED_PACKAGES = [
    # HelloAgents 框架
    ("hello_agents", "hello-agents"),
    ("huggingface_hub", "huggingface_hub"),
    
    # FastAPI 和 Web 框架
    ("fastapi", "fastapi"),
    ("uvicorn", "uvicorn"),
    
    # 数据验证和配置
    ("pydantic", "pydantic"),
    ("pydantic_settings", "pydantic-settings"),
    
    # HTTP 客户端
    ("httpx", "httpx"),
    ("aiohttp", "aiohttp"),
    ("requests", "requests"),
    
    # 数据库和认证
    ("supabase", "supabase"),
    ("postgrest", "postgrest"),
    
    # 环境变量管理
    ("dotenv", "python-dotenv"),
    
    # 日志
    ("loguru", "loguru"),
    
    # MCP 相关
    ("fastmcp", "fastmcp"),
    
    # 日期时间处理
    ("dateutil", "python-dateutil"),
]

# 标准库（不需要安装）
STDLIB_PACKAGES = [
    "json",
    "asyncio",
    "threading",
    "concurrent",
    "typing",
    "os",
    "pathlib",
    "uuid",
    "warnings",
    "queue",
]


def check_package(import_name: str, package_name: str) -> Tuple[bool, str]:
    """
    检查单个包是否已安装
    
    Args:
        import_name: 导入时使用的名称
        package_name: pip 安装时使用的名称
    
    Returns:
        (是否安装, 版本信息或错误信息)
    """
    try:
        module = importlib.import_module(import_name)
        version = getattr(module, "__version__", "unknown")
        return True, version
    except ImportError as e:
        return False, str(e)


def main():
    """主函数"""
    print("=" * 60)
    print("🔍 检查 Python 依赖包")
    print("=" * 60)
    print()
    
    missing_packages = []
    installed_packages = []
    
    # 检查必需的包
    print("📦 检查必需的包:")
    print("-" * 60)
    
    for import_name, package_name in REQUIRED_PACKAGES:
        is_installed, info = check_package(import_name, package_name)
        
        if is_installed:
            print(f"✅ {package_name:30s} v{info}")
            installed_packages.append(package_name)
        else:
            print(f"❌ {package_name:30s} 未安装")
            missing_packages.append(package_name)
    
    print()
    print("-" * 60)
    
    # 检查标准库（仅供参考）
    print()
    print("📚 标准库（无需安装）:")
    print("-" * 60)
    
    for stdlib_name in STDLIB_PACKAGES:
        is_available, _ = check_package(stdlib_name, stdlib_name)
        status = "✅" if is_available else "⚠️"
        print(f"{status} {stdlib_name}")
    
    print()
    print("=" * 60)
    
    # 输出统计信息
    total_required = len(REQUIRED_PACKAGES)
    total_installed = len(installed_packages)
    total_missing = len(missing_packages)
    
    print(f"📊 统计信息:")
    print(f"   总计: {total_required} 个包")
    print(f"   已安装: {total_installed} 个包")
    print(f"   缺失: {total_missing} 个包")
    print()
    
    # 如果有缺失的包，提供安装命令
    if missing_packages:
        print("❌ 发现缺失的包！")
        print()
        print("请运行以下命令安装缺失的包:")
        print()
        print(f"   pip install {' '.join(missing_packages)}")
        print()
        print("或者安装所有依赖:")
        print()
        print("   pip install -r requirements.txt")
        print()
        print("=" * 60)
        sys.exit(1)
    else:
        print("✅ 所有必需的包都已安装！")
        print()
        print("=" * 60)
        sys.exit(0)


if __name__ == "__main__":
    main()
