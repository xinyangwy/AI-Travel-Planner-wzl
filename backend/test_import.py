"""测试导入是否正常"""

try:
    print("测试导入配置...")
    from app.config import get_settings
    settings = get_settings()
    print(f"✅ 配置导入成功")
    print(f"   - 并行线程数: {settings.perf_max_workers}")
    print(f"   - 启用缓存: {settings.perf_enable_cache}")
    
    print("\n测试导入 Agent...")
    from app.agents.trip_planner_agent import get_trip_planner_agent
    print("✅ Agent 导入成功")
    
    print("\n✅ 所有导入测试通过！")
    
except Exception as e:
    print(f"❌ 导入失败: {e}")
    import traceback
    traceback.print_exc()
