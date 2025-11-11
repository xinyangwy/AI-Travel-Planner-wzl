"""重试处理工具"""

import time
import functools
from typing import Callable, Any
import logging

logger = logging.getLogger(__name__)


def retry_on_rate_limit(
    max_retries: int = 3,
    initial_delay: float = 2.0,
    backoff_factor: float = 2.0,
    max_delay: float = 60.0
):
    """
    装饰器：在遇到速率限制时自动重试
    
    Args:
        max_retries: 最大重试次数
        initial_delay: 初始延迟时间（秒）
        backoff_factor: 延迟时间的倍增因子
        max_delay: 最大延迟时间（秒）
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            delay = initial_delay
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    error_str = str(e)
                    last_exception = e
                    
                    # 检查是否是速率限制错误
                    is_rate_limit = (
                        "429" in error_str or
                        "rate limit" in error_str.lower() or
                        "request limit exceeded" in error_str.lower() or
                        "too many requests" in error_str.lower()
                    )
                    
                    if not is_rate_limit or attempt >= max_retries:
                        # 不是速率限制错误，或已达到最大重试次数
                        raise
                    
                    # 计算延迟时间
                    current_delay = min(delay, max_delay)
                    logger.warning(
                        f"⚠️  遇到速率限制 (尝试 {attempt + 1}/{max_retries + 1})，"
                        f"{current_delay:.1f}秒后重试..."
                    )
                    print(
                        f"⚠️  遇到速率限制 (尝试 {attempt + 1}/{max_retries + 1})，"
                        f"{current_delay:.1f}秒后重试..."
                    )
                    
                    time.sleep(current_delay)
                    delay *= backoff_factor
            
            # 所有重试都失败
            raise last_exception
        
        return wrapper
    return decorator


def async_retry_on_rate_limit(
    max_retries: int = 3,
    initial_delay: float = 2.0,
    backoff_factor: float = 2.0,
    max_delay: float = 60.0
):
    """
    异步装饰器：在遇到速率限制时自动重试
    
    Args:
        max_retries: 最大重试次数
        initial_delay: 初始延迟时间（秒）
        backoff_factor: 延迟时间的倍增因子
        max_delay: 最大延迟时间（秒）
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            import asyncio
            
            delay = initial_delay
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    error_str = str(e)
                    last_exception = e
                    
                    # 检查是否是速率限制错误
                    is_rate_limit = (
                        "429" in error_str or
                        "rate limit" in error_str.lower() or
                        "request limit exceeded" in error_str.lower() or
                        "too many requests" in error_str.lower()
                    )
                    
                    if not is_rate_limit or attempt >= max_retries:
                        # 不是速率限制错误，或已达到最大重试次数
                        raise
                    
                    # 计算延迟时间
                    current_delay = min(delay, max_delay)
                    logger.warning(
                        f"⚠️  遇到速率限制 (尝试 {attempt + 1}/{max_retries + 1})，"
                        f"{current_delay:.1f}秒后重试..."
                    )
                    print(
                        f"⚠️  遇到速率限制 (尝试 {attempt + 1}/{max_retries + 1})，"
                        f"{current_delay:.1f}秒后重试..."
                    )
                    
                    await asyncio.sleep(current_delay)
                    delay *= backoff_factor
            
            # 所有重试都失败
            raise last_exception
        
        return wrapper
    return decorator
