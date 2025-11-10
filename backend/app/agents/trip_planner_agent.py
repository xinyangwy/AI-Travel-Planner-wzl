"""多智能体旅行规划系统"""

import json
import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, List
from hello_agents import SimpleAgent
from hello_agents.tools import MCPTool
from ..services.llm_service import get_llm
from ..models.schemas import (
    TripRequest,
    TripPlan,
    DayPlan,
    Attraction,
    Meal,
    WeatherInfo,
    Location,
    Hotel,
)
from ..config import get_settings

# ============ Agent提示词 ============

ATTRACTION_AGENT_PROMPT = """你是景点搜索专家。你的任务是根据城市和用户偏好搜索合适的景点。

**重要提示:**
你必须使用工具来搜索景点!不要自己编造景点信息!

**工具调用格式:**
使用maps_text_search工具时,必须严格按照以下格式:
`[TOOL_CALL:amap_maps_text_search:keywords=景点关键词,city=城市名]`

**示例:**
用户: "搜索北京的历史文化景点"
你的回复: [TOOL_CALL:amap_maps_text_search:keywords=历史文化,city=北京]

用户: "搜索上海的公园"
你的回复: [TOOL_CALL:amap_maps_text_search:keywords=公园,city=上海]

**注意:**
1. 必须使用工具,不要直接回答
2. 格式必须完全正确,包括方括号和冒号
3. 参数用逗号分隔
"""

WEATHER_AGENT_PROMPT = """你是天气查询专家。你的任务是查询指定城市的天气信息。

**重要提示:**
你必须使用工具来查询天气!不要自己编造天气信息!

**工具调用格式:**
使用maps_weather工具时,必须严格按照以下格式:
`[TOOL_CALL:amap_maps_weather:city=城市名]`

**示例:**
用户: "查询北京天气"
你的回复: [TOOL_CALL:amap_maps_weather:city=北京]

用户: "上海的天气怎么样"
你的回复: [TOOL_CALL:amap_maps_weather:city=上海]

**注意:**
1. 必须使用工具,不要直接回答
2. 格式必须完全正确,包括方括号和冒号
"""

HOTEL_AGENT_PROMPT = """你是酒店推荐专家。你的任务是根据城市和景点位置推荐合适的酒店。

**重要提示:**
你必须使用工具来搜索酒店!不要自己编造酒店信息!

**工具调用格式:**
使用maps_text_search工具搜索酒店时,必须严格按照以下格式:
`[TOOL_CALL:amap_maps_text_search:keywords=酒店,city=城市名]`

**示例:**
用户: "搜索北京的酒店"
你的回复: [TOOL_CALL:amap_maps_text_search:keywords=酒店,city=北京]

**注意:**
1. 必须使用工具,不要直接回答
2. 格式必须完全正确,包括方括号和冒号
3. 关键词使用"酒店"或"宾馆"
"""

PLANNER_AGENT_PROMPT = """你是行程规划专家。你的任务是根据景点信息和天气信息,生成详细的旅行计划。

请严格按照以下JSON格式返回旅行计划:
```json
{
  "city": "城市名称",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "day_index": 0,
      "description": "第1天行程概述",
      "transportation": "交通方式",
      "accommodation": "住宿类型",
      "hotel": {
        "name": "酒店名称",
        "address": "酒店地址",
        "location": {"longitude": 116.397128, "latitude": 39.916527},
        "price_range": "300-500元",
        "rating": "4.5",
        "distance": "距离景点2公里",
        "type": "经济型酒店",
        "estimated_cost": 400
      },
      "attractions": [
        {
          "name": "景点名称",
          "address": "详细地址",
          "location": {"longitude": 116.397128, "latitude": 39.916527},
          "visit_duration": 120,
          "description": "景点详细描述",
          "category": "景点类别",
          "ticket_price": 60
        }
      ],
      "meals": [
        {"type": "breakfast", "name": "早餐推荐", "description": "早餐描述", "estimated_cost": 30},
        {"type": "lunch", "name": "午餐推荐", "description": "午餐描述", "estimated_cost": 50},
        {"type": "dinner", "name": "晚餐推荐", "description": "晚餐描述", "estimated_cost": 80}
      ]
    }
  ],
  "weather_info": [
    {
      "date": "YYYY-MM-DD",
      "day_weather": "晴",
      "night_weather": "多云",
      "day_temp": 25,
      "night_temp": 15,
      "wind_direction": "南风",
      "wind_power": "1-3级"
    }
  ],
  "overall_suggestions": "总体建议",
  "budget": {
    "total_attractions": 180,
    "total_hotels": 1200,
    "total_meals": 480,
    "total_transportation": 200,
    "total": 2060
  }
}
```

**重要提示:**
1. weather_info数组必须包含每一天的天气信息
2. 温度必须是纯数字(不要带°C等单位)
3. 每天安排2-3个景点
4. 考虑景点之间的距离和游览时间
5. 每天必须包含早中晚三餐
6. 提供实用的旅行建议
7. **必须包含预算信息**:
   - 景点门票价格(ticket_price)
   - 餐饮预估费用(estimated_cost)
   - 酒店预估费用(estimated_cost)
   - 预算汇总(budget)包含各项总费用
"""


class MultiAgentTripPlanner:
    """多智能体旅行规划系统"""

    def __init__(self):
        """初始化多智能体系统"""
        print("🔄 初始化多智能体旅行规划系统...")

        try:
            self.settings = get_settings()
            self.llm = get_llm()

            # 添加缓存机制
            self._cache = (
                {
                    "weather": {},  # 城市 -> 天气信息
                    "hotels": {},  # 城市+类型 -> 酒店信息
                }
                if self.settings.perf_enable_cache
                else None
            )

            # 创建共享的MCP工具(只创建一次，所有Agent共享)
            self.amap_tool = MCPTool(
                name="amap",
                description="高德地图服务",
                server_command=["uvx", "amap-mcp-server"],
                env={"AMAP_MAPS_API_KEY": self.settings.amap_api_key},
                auto_expand=True,
            )

            # 创建景点搜索Agent
            self.attraction_agent = SimpleAgent(
                name="景点搜索专家",
                llm=self.llm,
                system_prompt=ATTRACTION_AGENT_PROMPT
            )
            self.attraction_agent.add_tool(self.amap_tool)

            # 创建天气查询Agent
            self.weather_agent = SimpleAgent(
                name="天气查询专家",
                llm=self.llm,
                system_prompt=WEATHER_AGENT_PROMPT
            )
            self.weather_agent.add_tool(self.amap_tool)

            # 创建酒店推荐Agent
            self.hotel_agent = SimpleAgent(
                name="酒店推荐专家",
                llm=self.llm,
                system_prompt=HOTEL_AGENT_PROMPT
            )
            self.hotel_agent.add_tool(self.amap_tool)

            # 创建行程规划Agent(不需要工具)
            self.planner_agent = SimpleAgent(
                name="行程规划专家",
                llm=self.llm,
                system_prompt=PLANNER_AGENT_PROMPT
            )

            print(f"✅ 多智能体系统初始化成功 ({len(self.attraction_agent.list_tools())} 个工具)")

        except Exception as e:
            print(f"❌ 多智能体系统初始化失败: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
    
    def plan_trip(self, request: TripRequest, stream_id: str = None) -> TripPlan:
        """
        使用多智能体协作生成旅行计划（优化版：并行执行）

        Args:
            request: 旅行请求
            stream_id: 日志流ID（可选）

        Returns:
            旅行计划
        """
        try:
            self._log(stream_id, f"{'='*60}")
            self._log(stream_id, f"🚀 开始多智能体协作规划旅行...")
            self._log(stream_id, f"目的地: {request.city} | 日期: {request.start_date} 至 {request.end_date} | 天数: {request.travel_days}天")
            self._log(stream_id, f"{'='*60}")

            # 并行执行步骤1-3: 景点、天气、酒店查询
            self._log(stream_id, "⚡ 并行查询景点、天气、酒店信息...")

            with ThreadPoolExecutor(
                max_workers=self.settings.perf_max_workers
            ) as executor:
                # 构建查询
                attraction_query = self._build_attraction_query(request)
                
                # 并行执行（使用缓存优化）
                self._log(stream_id, f"🔍 开始搜索{request.city}的景点...")
                attraction_future = executor.submit(self._search_attractions_with_log, request, stream_id)
                weather_future = executor.submit(self._get_weather_cached, request.city, stream_id)
                hotel_future = executor.submit(self._get_hotels_cached, request.city, request.accommodation, stream_id)
                
                # 获取结果
                attraction_response = attraction_future.result()
                weather_response = weather_future.result()
                hotel_response = hotel_future.result()
            
            self._log(stream_id, "✅ 信息查询完成")

            # 步骤4: 行程规划Agent整合信息生成计划
            self._log(stream_id, "📋 生成行程计划...")
            planner_query = self._build_planner_query(request, attraction_response, weather_response, hotel_response)
            planner_response = self.planner_agent.run(planner_query)

            # 解析最终计划
            trip_plan = self._parse_response(planner_response, request)

            self._log(stream_id, f"✅ 旅行计划生成完成!")

            return trip_plan

        except Exception as e:
            self._log(stream_id, f"❌ 生成旅行计划失败: {str(e)}")
            import traceback
            traceback.print_exc()
            return self._create_fallback_plan(request)
    
    def _search_attractions_with_log(self, request: TripRequest, stream_id: str = None) -> str:
        """搜索景点并记录详细日志"""
        attraction_query = self._build_attraction_query(request)
        self._log(stream_id, f"🔧 使用工具: amap_maps_text_search")
        self._log(stream_id, f"📍 搜索关键词: {request.preferences[0] if request.preferences else '景点'}")
        
        result = self.attraction_agent.run(attraction_query)
        
        # 解析并显示景点列表
        try:
            import re
            
            self._log(stream_id, f"✅ 找到景点信息")
            
            # 解析格式化文本中的景点信息
            # 格式: 1. **西安城市运动公园**
            #       - 地址：未央路168号(行政中心地铁站B5口旁)
            
            # 提取所有景点
            pattern = r'\d+\.\s*\*\*([^*]+)\*\*\s*-\s*地址[：:]\s*([^\n]+)'
            matches = re.findall(pattern, result)
            
            if matches:
                # 只显示前5个
                for i, (name, address) in enumerate(matches[:5]):
                    name = name.strip()
                    address = address.strip()
                    self._log(stream_id, f"  📌 {name}")
                    if address:
                        # 限制地址长度
                        if len(address) > 50:
                            address = address[:50] + "..."
                        self._log(stream_id, f"     📍 {address}")
                
                total = len(matches)
                self._log(stream_id, f"✅ 共找到 {total} 个景点")
            else:
                self._log(stream_id, f"✅ 景点搜索完成")
                
        except Exception as e:
            self._log(stream_id, f"⚠️ 解析景点信息时出错: {str(e)}")
        
        return result
    
    def _log(self, stream_id: str, message: str):
        """发送日志消息"""
        print(message)  # 仍然打印到控制台
        
        if stream_id:
            from ..utils.log_streamer import get_log_streamer
            import json
            log_streamer = get_log_streamer()
            log_streamer.emit_log(stream_id, json.dumps({
                "type": "log",
                "message": message
            }, ensure_ascii=False))
    
    def _get_weather_cached(self, city: str, stream_id: str = None) -> str:
        """获取天气信息（带缓存）"""
        if self._cache and city in self._cache["weather"]:
            if self.settings.perf_verbose_logging:
                self._log(stream_id, "  ⚡ 使用缓存的天气信息")
            return self._cache["weather"][city]

        self._log(stream_id, f"🌤️ 查询{city}的天气信息...")
        self._log(stream_id, f"🔧 使用工具: amap_maps_weather")
        weather_query = f"请查询{city}的天气信息"
        result = self.weather_agent.run(weather_query)
        
        # 解析并显示天气信息
        try:
            import re
            
            self._log(stream_id, f"✅ 获取到天气数据")
            
            # 解析格式化文本中的天气信息
            # 格式: - **2025年11月10日（星期一）**
            #       - 白天：多云，气温 0°C，西风 1-3 级
            #       - 夜间：晴，气温 -8°C，西风 1-3 级
            
            lines = result.split('\n')
            day_count = 0
            
            for i, line in enumerate(lines):
                # 查找日期行
                date_match = re.search(r'\*\*(\d{4}年\d{1,2}月\d{1,2}日).*?\*\*', line)
                if date_match and day_count < 3:  # 只显示前3天
                    date_str = date_match.group(1)
                    self._log(stream_id, f"  📅 {date_str}")
                    
                    # 查找接下来的白天和夜间信息
                    if i + 1 < len(lines):
                        day_line = lines[i + 1]
                        # 提取白天信息: 白天：多云，气温 0°C，西风 1-3 级
                        day_match = re.search(r'白天[：:]\s*([^，,]+).*?气温\s*(-?\d+)°C.*?([东南西北]+风.*?\d+-?\d*\s*级)', day_line)
                        if day_match:
                            weather_desc = day_match.group(1).strip()
                            temp = day_match.group(2)
                            wind = day_match.group(3).strip()
                            self._log(stream_id, f"    ☀️ 白天: {weather_desc} {temp}°C {wind}")
                    
                    if i + 2 < len(lines):
                        night_line = lines[i + 2]
                        # 提取夜间信息
                        night_match = re.search(r'夜间[：:]\s*([^，,]+).*?气温\s*(-?\d+)°C.*?([东南西北]+风.*?\d+-?\d*\s*级)', night_line)
                        if night_match:
                            weather_desc = night_match.group(1).strip()
                            temp = night_match.group(2)
                            wind = night_match.group(3).strip()
                            self._log(stream_id, f"    🌙 夜间: {weather_desc} {temp}°C {wind}")
                    
                    day_count += 1
            
            if day_count > 0:
                self._log(stream_id, f"✅ 已显示 {day_count} 天天气预报")
                    
        except Exception as e:
            self._log(stream_id, f"⚠️ 解析天气信息时出错: {str(e)}")
        
        self._log(stream_id, f"✅ 天气信息查询完成")

        if self._cache:
            self._cache["weather"][city] = result
        return result

    def _get_hotels_cached(self, city: str, accommodation: str, stream_id: str = None) -> str:
        """获取酒店信息（带缓存）"""
        cache_key = f"{city}_{accommodation}"
        if self._cache and cache_key in self._cache["hotels"]:
            if self.settings.perf_verbose_logging:
                self._log(stream_id, "  ⚡ 使用缓存的酒店信息")
            return self._cache["hotels"][cache_key]

        self._log(stream_id, f"🏨 搜索{city}的{accommodation}...")
        self._log(stream_id, f"🔧 使用工具: amap_maps_text_search")
        hotel_query = f"请搜索{city}的{accommodation}酒店"
        result = self.hotel_agent.run(hotel_query)
        
        # 解析并显示酒店列表
        try:
            import re
            
            self._log(stream_id, f"✅ 找到酒店信息")
            
            # 解析格式化文本中的酒店信息
            # 格式: 1. **金悦酒店**
            #       - 地址：韦曲街道神禾一路何家营新村南6排西1号
            
            # 提取所有酒店
            pattern = r'\d+\.\s*\*\*([^*]+)\*\*\s*-\s*地址[：:]\s*([^\n]+)'
            matches = re.findall(pattern, result)
            
            if matches:
                # 只显示前5个
                for i, (name, address) in enumerate(matches[:5]):
                    name = name.strip()
                    address = address.strip()
                    self._log(stream_id, f"  🏨 {name}")
                    if address:
                        # 限制地址长度
                        if len(address) > 50:
                            address = address[:50] + "..."
                        self._log(stream_id, f"     📍 {address}")
                
                total = len(matches)
                self._log(stream_id, f"✅ 共找到 {total} 个酒店")
            else:
                self._log(stream_id, f"✅ 酒店搜索完成")
                
        except Exception as e:
            self._log(stream_id, f"⚠️ 解析酒店信息时出错: {str(e)}")
        
        self._log(stream_id, f"✅ 酒店信息查询完成")

        if self._cache:
            self._cache["hotels"][cache_key] = result
        return result

    def _build_attraction_query(self, request: TripRequest) -> str:
        """构建景点搜索查询 - 直接包含工具调用"""
        keywords = []
        if request.preferences:
            # 只取第一个偏好作为关键词
            keywords = request.preferences[0]
        else:
            keywords = "景点"

        # 直接返回工具调用格式
        query = f"请使用amap_maps_text_search工具搜索{request.city}的{keywords}相关景点。\n[TOOL_CALL:amap_maps_text_search:keywords={keywords},city={request.city}]"
        return query

    def _build_planner_query(self, request: TripRequest, attractions: str, weather: str, hotels: str = "") -> str:
        """构建行程规划查询"""
        query = f"""请根据以下信息生成{request.city}的{request.travel_days}天旅行计划:

**基本信息:**
- 城市: {request.city}
- 日期: {request.start_date} 至 {request.end_date}
- 天数: {request.travel_days}天
- 交通方式: {request.transportation}
- 住宿: {request.accommodation}
- 偏好: {', '.join(request.preferences) if request.preferences else '无'}

**景点信息:**
{attractions}

**天气信息:**
{weather}

**酒店信息:**
{hotels}

**要求:**
1. 每天安排2-3个景点
2. 每天必须包含早中晚三餐
3. 每天推荐一个具体的酒店(从酒店信息中选择)
3. 考虑景点之间的距离和交通方式
4. 返回完整的JSON格式数据
5. 景点的经纬度坐标要真实准确
"""
        if request.free_text_input:
            query += f"\n**额外要求:** {request.free_text_input}"

        return query
    
    def _parse_response(self, response: str, request: TripRequest) -> TripPlan:
        """
        解析Agent响应
        
        Args:
            response: Agent响应文本
            request: 原始请求
            
        Returns:
            旅行计划
        """
        try:
            # 尝试从响应中提取JSON
            # 查找JSON代码块
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
            elif "```" in response:
                json_start = response.find("```") + 3
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
            elif "{" in response and "}" in response:
                # 直接查找JSON对象
                json_start = response.find("{")
                json_end = response.rfind("}") + 1
                json_str = response[json_start:json_end]
            else:
                raise ValueError("响应中未找到JSON数据")
            
            # 解析JSON
            data = json.loads(json_str)
            
            # 转换为TripPlan对象
            trip_plan = TripPlan(**data)
            
            return trip_plan
            
        except Exception as e:
            print(f"⚠️  解析响应失败: {str(e)}")
            print(f"   将使用备用方案生成计划")
            return self._create_fallback_plan(request)
    
    def _create_fallback_plan(self, request: TripRequest) -> TripPlan:
        """创建备用计划(当Agent失败时)"""
        from datetime import datetime, timedelta
        
        # 解析日期
        start_date = datetime.strptime(request.start_date, "%Y-%m-%d")
        
        # 创建每日行程
        days = []
        for i in range(request.travel_days):
            current_date = start_date + timedelta(days=i)
            
            day_plan = DayPlan(
                date=current_date.strftime("%Y-%m-%d"),
                day_index=i,
                description=f"第{i+1}天行程",
                transportation=request.transportation,
                accommodation=request.accommodation,
                attractions=[
                    Attraction(
                        name=f"{request.city}景点{j+1}",
                        address=f"{request.city}市",
                        location=Location(longitude=116.4 + i*0.01 + j*0.005, latitude=39.9 + i*0.01 + j*0.005),
                        visit_duration=120,
                        description=f"这是{request.city}的著名景点",
                        category="景点"
                    )
                    for j in range(2)
                ],
                meals=[
                    Meal(type="breakfast", name=f"第{i+1}天早餐", description="当地特色早餐"),
                    Meal(type="lunch", name=f"第{i+1}天午餐", description="午餐推荐"),
                    Meal(type="dinner", name=f"第{i+1}天晚餐", description="晚餐推荐")
                ]
            )
            days.append(day_plan)
        
        return TripPlan(
            city=request.city,
            start_date=request.start_date,
            end_date=request.end_date,
            days=days,
            weather_info=[],
            overall_suggestions=f"这是为您规划的{request.city}{request.travel_days}日游行程,建议提前查看各景点的开放时间。"
        )


# 全局多智能体系统实例
_multi_agent_planner = None


def get_trip_planner_agent() -> MultiAgentTripPlanner:
    """获取多智能体旅行规划系统实例(单例模式)"""
    global _multi_agent_planner

    if _multi_agent_planner is None:
        _multi_agent_planner = MultiAgentTripPlanner()

    return _multi_agent_planner

