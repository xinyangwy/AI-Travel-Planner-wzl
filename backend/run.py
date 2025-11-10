"""启动脚本"""

import warnings
import uvicorn
import asyncio
from app.config import get_settings

# 过滤所有弃用警告（包括 Supabase）
warnings.filterwarnings("ignore", category=DeprecationWarning)

if __name__ == "__main__":
    settings = get_settings()
    
    try:
        uvicorn.run(
            "app.api.main:app",
            host=settings.host,
            port=settings.port,
            reload=True,
            log_level=settings.log_level.lower()
        )
    except (KeyboardInterrupt, asyncio.CancelledError):
        print("✅ 服务器已正常关闭")
    except Exception as e:
        print(f"❌ 服务器异常退出: {e}")
        raise

