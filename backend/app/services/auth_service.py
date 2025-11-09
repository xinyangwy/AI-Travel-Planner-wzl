"""认证服务模块 - 使用Supabase进行用户认证"""

from typing import Optional
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from ..config import get_settings

settings = get_settings()

# 初始化Supabase客户端
supabase: Optional[Client] = None
if settings.supabase_url and settings.supabase_service_key:
    supabase = create_client(settings.supabase_url, settings.supabase_service_key)

# HTTP Bearer认证
security = HTTPBearer()


async def verify_token(credentials: HTTPAuthorizationCredentials) -> dict:
    """验证JWT token并返回用户信息"""
    if not supabase:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="认证服务未配置"
        )
    
    token = credentials.credentials
    
    try:
        # 使用Supabase验证token
        response = supabase.auth.get_user(token)
        
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的token"
            )
        
        return {
            "user_id": response.user.id,
            "email": response.user.email,
            "user": response.user
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"token验证失败: {str(e)}"
        )


def get_user_id_from_token(token: str) -> Optional[str]:
    """从token中提取用户ID（不抛出异常，用于可选认证）"""
    if not supabase:
        return None
    
    try:
        response = supabase.auth.get_user(token)
        if response.user:
            return response.user.id
    except Exception:
        pass
    
    return None



