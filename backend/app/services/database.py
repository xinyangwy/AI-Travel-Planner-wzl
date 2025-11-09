"""数据库服务模块 - 使用Supabase/PostgreSQL"""

import os
import json
from typing import Optional, List, Dict, Any
from datetime import datetime
from supabase import create_client, Client
from ..config import get_settings

settings = get_settings()

# 初始化Supabase客户端
supabase_client: Optional[Client] = None
if settings.supabase_url and settings.supabase_service_key:
    try:
        supabase_client = create_client(settings.supabase_url, settings.supabase_service_key)
    except Exception as e:
        print(f"⚠️  Supabase客户端初始化失败: {e}")
        supabase_client = None


def init_database():
    """初始化数据库表结构"""
    if not settings.database_url:
        print("⚠️  数据库URL未配置，跳过数据库初始化")
        print("💡 提示：请在Supabase控制台手动创建trip_plans表")
        return
    
    # 使用Supabase时，表结构应该在Supabase控制台创建
    # 这里只打印提示信息
    print("💡 提示：请确保在Supabase控制台已创建trip_plans表")
    print("   表结构：")
    print("   - id: UUID PRIMARY KEY DEFAULT gen_random_uuid()")
    print("   - user_id: UUID NOT NULL")
    print("   - request_data: JSONB NOT NULL")
    print("   - response_data: JSONB NOT NULL")
    print("   - created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()")
    print("   - updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()")
    print("   索引：")
    print("   - CREATE INDEX idx_trip_plans_user_id ON trip_plans(user_id)")
    print("   - CREATE INDEX idx_trip_plans_created_at ON trip_plans(created_at DESC)")


def save_trip_plan(user_id: str, request_data: Dict[str, Any], response_data: Dict[str, Any]) -> Optional[str]:
    """保存旅行规划数据"""
    if not supabase_client:
        return None
    
    try:
        data = {
            "user_id": user_id,
            "request_data": request_data,
            "response_data": response_data
        }
        
        result = supabase_client.table("trip_plans").insert(data).execute()
        
        if result.data and len(result.data) > 0:
            return str(result.data[0]['id'])
        return None
    except Exception as e:
        print(f"保存旅行规划失败: {e}")
        import traceback
        traceback.print_exc()
        return None


def get_trip_plans_by_user(user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    """获取用户的旅行规划历史记录"""
    if not supabase_client:
        return []
    
    try:
        result = supabase_client.table("trip_plans")\
            .select("id, request_data, response_data, created_at, updated_at")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        plans = []
        if result.data:
            for row in result.data:
                plans.append({
                    'id': str(row['id']),
                    'request_data': row['request_data'],
                    'response_data': row['response_data'],
                    'created_at': row['created_at'] if row.get('created_at') else None,
                    'updated_at': row['updated_at'] if row.get('updated_at') else None
                })
        
        return plans
    except Exception as e:
        print(f"获取旅行规划历史失败: {e}")
        import traceback
        traceback.print_exc()
        return []


def get_trip_plan_by_id(plan_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """根据ID获取旅行规划"""
    if not supabase_client:
        return None
    
    try:
        query = supabase_client.table("trip_plans")\
            .select("id, request_data, response_data, created_at, updated_at")\
            .eq("id", plan_id)
        
        if user_id:
            # 如果提供了user_id，验证所有权
            query = query.eq("user_id", user_id)
        
        result = query.execute()
        
        if result.data and len(result.data) > 0:
            row = result.data[0]
            return {
                'id': str(row['id']),
                'request_data': row['request_data'],
                'response_data': row['response_data'],
                'created_at': row['created_at'] if row.get('created_at') else None,
                'updated_at': row['updated_at'] if row.get('updated_at') else None
            }
        return None
    except Exception as e:
        print(f"获取旅行规划失败: {e}")
        import traceback
        traceback.print_exc()
        return None

