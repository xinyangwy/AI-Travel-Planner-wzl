"""实时日志流工具"""

import asyncio
from typing import AsyncGenerator
from queue import Queue
import threading


class LogStreamer:
    """日志流管理器"""
    
    def __init__(self):
        self._queues: dict[str, Queue] = {}
        self._lock = threading.Lock()
    
    def create_stream(self, stream_id: str) -> Queue:
        """创建新的日志流"""
        with self._lock:
            queue = Queue()
            self._queues[stream_id] = queue
            return queue
    
    def emit_log(self, stream_id: str, message: str):
        """发送日志消息"""
        with self._lock:
            if stream_id in self._queues:
                self._queues[stream_id].put(message)
    
    def close_stream(self, stream_id: str):
        """关闭日志流"""
        with self._lock:
            if stream_id in self._queues:
                del self._queues[stream_id]


# 全局日志流管理器
_log_streamer = LogStreamer()


def get_log_streamer() -> LogStreamer:
    """获取日志流管理器实例"""
    return _log_streamer
