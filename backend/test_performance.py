"""性能测试脚本"""

import time
from app.agents.trip_planner_agent import get_trip_planner_agent
from app.models.schemas import TripRequest

def test_performance():
    """测试旅行规划性能"""
    
    # 创建测试请求
    request = TripRequest(
        city="南京",
        start_date="2025-11-09",
        end_date="2025-11-12",
        travel_days=4,
        transportation="公共交通",
        accommodation="豪华酒店",
        preferences=["历史文化", "购物"],
        free_text_input=""
    )
    
    print("=" * 60)
    print("🧪 开始性能测试")
    print("=" * 60)
    
    # 获取规划器实例
    planner = get_trip_planner_agent()
    
    # 第一次请求（无缓存）
    print("\n📊 测试1: 首次请求（无缓存）")
    start_time = time.time()
    result1 = planner.plan_trip(request)
    elapsed1 = time.time() - start_time
    print(f"⏱️  耗时: {elapsed1:.2f}秒")
    
    # 第二次请求（有缓存）
    print("\n📊 测试2: 重复请求（有缓存）")
    start_time = time.time()
    result2 = planner.plan_trip(request)
    elapsed2 = time.time() - start_time
    print(f"⏱️  耗时: {elapsed2:.2f}秒")
    
    # 性能对比
    print("\n" + "=" * 60)
    print("📈 性能对比")
    print("=" * 60)
    print(f"首次请求: {elapsed1:.2f}秒")
    print(f"缓存请求: {elapsed2:.2f}秒")
    print(f"提速: {((elapsed1 - elapsed2) / elapsed1 * 100):.1f}%")
    print("=" * 60)

if __name__ == "__main__":
    test_performance()
