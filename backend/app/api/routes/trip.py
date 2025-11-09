"""旅行规划API路由"""

from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional
from ...models.schemas import (
    TripRequest,
    TripPlanResponse,
    TripHistoryResponse,
    ErrorResponse
)
from ...agents.trip_planner_agent import get_trip_planner_agent
from ...services.auth_service import get_user_id_from_token
from ...services.database import save_trip_plan, get_trip_plans_by_user, get_trip_plan_by_id

router = APIRouter(prefix="/trip", tags=["旅行规划"])


@router.post(
    "/plan",
    response_model=TripPlanResponse,
    summary="生成旅行计划",
    description="根据用户输入的旅行需求,生成详细的旅行计划。已登录用户的数据会自动保存。"
)
async def plan_trip(
    request: TripRequest,
    authorization: Optional[str] = Header(None)
):
    """
    生成旅行计划

    Args:
        request: 旅行请求参数
        authorization: 可选的认证token（Bearer token）

    Returns:
        旅行计划响应
    """
    try:
        print(f"\n{'='*60}")
        print(f"📥 收到旅行规划请求:")
        print(f"   城市: {request.city}")
        print(f"   日期: {request.start_date} - {request.end_date}")
        print(f"   天数: {request.travel_days}")
        print(f"{'='*60}\n")

        # 获取用户ID（如果已登录）
        user_id = None
        if authorization:
            token = authorization.replace("Bearer ", "").strip()
            user_id = get_user_id_from_token(token)
            if user_id:
                print(f"👤 用户已登录: {user_id}")

        # 获取Agent实例
        print("🔄 获取多智能体系统实例...")
        agent = get_trip_planner_agent()

        # 生成旅行计划
        print("🚀 开始生成旅行计划...")
        trip_plan = agent.plan_trip(request)

        print("✅ 旅行计划生成成功,准备返回响应\n")

        # 如果用户已登录，保存数据到数据库
        if user_id:
            try:
                # 将请求和响应数据转换为字典
                request_data = request.model_dump()
                response_data = trip_plan.model_dump() if hasattr(trip_plan, 'model_dump') else trip_plan.dict()
                
                plan_id = save_trip_plan(user_id, request_data, response_data)
                if plan_id:
                    print(f"💾 旅行规划已保存到数据库: {plan_id}")
            except Exception as e:
                print(f"⚠️  保存旅行规划到数据库失败: {e}")
                # 不影响主要功能，继续返回结果

        return TripPlanResponse(
            success=True,
            message="旅行计划生成成功",
            data=trip_plan
        )

    except Exception as e:
        print(f"❌ 生成旅行计划失败: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"生成旅行计划失败: {str(e)}"
        )


@router.get(
    "/history",
    response_model=TripHistoryResponse,
    summary="获取旅行规划历史记录",
    description="获取当前用户的旅行规划历史记录（需要登录）"
)
async def get_history(
    authorization: Optional[str] = Header(None)
):
    """获取用户的旅行规划历史记录"""
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="需要登录才能查看历史记录"
        )
    
    token = authorization.replace("Bearer ", "").strip()
    user_id = get_user_id_from_token(token)
    
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="无效的认证token"
        )
    
    try:
        plans = get_trip_plans_by_user(user_id)
        
        # 转换数据格式，只返回请求数据用于列表显示
        history_items = []
        for plan in plans:
            history_items.append({
                "id": plan["id"],
                "request_data": plan["request_data"],
                "response_data": None,  # 列表不返回完整响应数据
                "created_at": plan["created_at"],
                "updated_at": plan["updated_at"]
            })
        
        return TripHistoryResponse(
            success=True,
            message="获取历史记录成功",
            data=history_items
        )
    except Exception as e:
        print(f"❌ 获取历史记录失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"获取历史记录失败: {str(e)}"
        )


@router.get(
    "/{plan_id}",
    response_model=TripPlanResponse,
    summary="获取旅行规划详情",
    description="根据ID获取旅行规划的详细信息（需要登录）"
)
async def get_trip_plan(
    plan_id: str,
    authorization: Optional[str] = Header(None)
):
    """获取旅行规划详情"""
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="需要登录才能查看详情"
        )
    
    token = authorization.replace("Bearer ", "").strip()
    user_id = get_user_id_from_token(token)
    
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="无效的认证token"
        )
    
    try:
        plan = get_trip_plan_by_id(plan_id, user_id)
        
        if not plan:
            raise HTTPException(
                status_code=404,
                detail="旅行规划不存在或无权访问"
            )
        
        # 从response_data中恢复TripPlan对象
        from ...models.schemas import TripPlan
        response_data = plan["response_data"]
        trip_plan = TripPlan(**response_data)
        
        return TripPlanResponse(
            success=True,
            message="获取旅行规划成功",
            data=trip_plan
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 获取旅行规划详情失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"获取旅行规划详情失败: {str(e)}"
        )


@router.get(
    "/health",
    summary="健康检查",
    description="检查旅行规划服务是否正常"
)
async def health_check():
    """健康检查"""
    try:
        # 检查Agent是否可用
        agent = get_trip_planner_agent()
        
        return {
            "status": "healthy",
            "service": "trip-planner",
            "agent_name": agent.agent.name,
            "tools_count": len(agent.agent.list_tools())
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"服务不可用: {str(e)}"
        )

