package com.aitravelplanner.service.impl;

import com.aitravelplanner.model.TravelPlan;
import com.aitravelplanner.model.User;
import com.aitravelplanner.repository.TravelPlanRepository;
import com.aitravelplanner.repository.UserRepository;
import com.aitravelplanner.service.TravelPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TravelPlanServiceImpl implements TravelPlanService {

    @Autowired
    private TravelPlanRepository travelPlanRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public TravelPlan createPlan(TravelPlan plan, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        plan.setUser(user);
        return travelPlanRepository.save(plan);
    }

    @Override
    public TravelPlan getPlanById(Long id, Long userId) {
        TravelPlan plan = travelPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("旅行计划不存在"));
        
        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权访问该旅行计划");
        }
        
        return plan;
    }

    @Override
    public List<TravelPlan> getUserPlans(Long userId) {
        return travelPlanRepository.findByUserId(userId);
    }

    @Override
    public List<TravelPlan> getUserPlansByStatus(Long userId, TravelPlan.PlanStatus status) {
        return travelPlanRepository.findByUserIdAndStatus(userId, status);
    }

    @Override
    @Transactional
    public TravelPlan updatePlan(Long id, TravelPlan plan, Long userId) {
        TravelPlan existingPlan = getPlanById(id, userId);
        
        // 更新字段
        existingPlan.setTitle(plan.getTitle());
        existingPlan.setDestination(plan.getDestination());
        existingPlan.setStartDate(plan.getStartDate());
        existingPlan.setEndDate(plan.getEndDate());
        existingPlan.setBudget(plan.getBudget());
        existingPlan.setTravelerCount(plan.getTravelerCount());
        existingPlan.setPreferences(plan.getPreferences());
        existingPlan.setItinerary(plan.getItinerary());
        if (plan.getStatus() != null) {
            existingPlan.setStatus(plan.getStatus());
        }
        
        return travelPlanRepository.save(existingPlan);
    }

    @Override
    @Transactional
    public void deletePlan(Long id, Long userId) {
        TravelPlan plan = getPlanById(id, userId);
        travelPlanRepository.delete(plan);
    }

    @Override
    public Map<String, Object> generateItinerary(Map<String, Object> requestData) {
        // 模拟AI行程生成逻辑
        String destination = (String) requestData.get("destination");
        String startDate = (String) requestData.get("startDate");
        String endDate = (String) requestData.get("endDate");
        Integer travelers = (Integer) requestData.get("travelers");
        String travelStyle = (String) requestData.getOrDefault("travelStyle", "综合");
        
        // 模拟行程数据
        Map<String, Object> itinerary = new HashMap<>();
        
        // 模拟行程天数
        int days = 3;
        List<Map<String, Object>> dayPlans = new ArrayList<>();
        
        for (int i = 1; i <= days; i++) {
            Map<String, Object> dayPlan = new HashMap<>();
            dayPlan.put("day", i);
            dayPlan.put("date", i == 1 ? startDate : "第" + i + "天");
            
            List<Map<String, Object>> activities = new ArrayList<>();
            activities.add(createActivity("08:00", "早餐", "在酒店享用早餐"));
            activities.add(createActivity("09:00", destination + "主要景点" + i, "参观当地著名景点"));
            activities.add(createActivity("12:30", "午餐", "品尝当地美食"));
            
            if ("购物".equals(travelStyle)) {
                activities.add(createActivity("14:00", "购物", "前往当地特色市场"));
            } else if ("文化".equals(travelStyle)) {
                activities.add(createActivity("14:00", "博物馆", "参观当地博物馆"));
            } else {
                activities.add(createActivity("14:00", "自由活动", "根据个人喜好安排"));
            }
            
            activities.add(createActivity("18:00", "晚餐", "享用晚餐"));
            
            dayPlan.put("activities", activities);
            dayPlans.add(dayPlan);
        }
        
        itinerary.put("days", dayPlans);
        itinerary.put("attractions", generateAttractions(destination));
        itinerary.put("accommodation", generateAccommodation(destination));
        itinerary.put("budgetDetails", generateBudgetDetails());
        itinerary.put("totalBudget", 5000);
        
        return itinerary;
    }
    
    private Map<String, Object> createActivity(String time, String title, String description) {
        Map<String, Object> activity = new HashMap<>();
        activity.put("time", time);
        activity.put("title", title);
        activity.put("description", description);
        return activity;
    }
    
    private List<Map<String, Object>> generateAttractions(String destination) {
        List<Map<String, Object>> attractions = new ArrayList<>();
        attractions.add(createAttraction(destination + "历史博物馆", "了解当地历史文化", "约2小时", destination + "市中心"));
        attractions.add(createAttraction(destination + "公园", "城市中的绿色空间", "约1小时", destination + "东区"));
        attractions.add(createAttraction(destination + "老街", "体验传统风情", "约3小时", destination + "老城区"));
        return attractions;
    }
    
    private Map<String, Object> createAttraction(String name, String description, String duration, String location) {
        Map<String, Object> attraction = new HashMap<>();
        attraction.put("name", name);
        attraction.put("description", description);
        attraction.put("duration", duration);
        attraction.put("location", location);
        return attraction;
    }
    
    private List<Map<String, Object>> generateAccommodation(String destination) {
        List<Map<String, Object>> accommodations = new ArrayList<>();
        accommodations.add(createAccommodation(destination + "大酒店", "豪华", destination + "市中心", 888, "全程"));
        return accommodations;
    }
    
    private Map<String, Object> createAccommodation(String name, String type, String address, int price, String duration) {
        Map<String, Object> accommodation = new HashMap<>();
        accommodation.put("name", name);
        accommodation.put("type", type);
        accommodation.put("address", address);
        accommodation.put("price", price);
        accommodation.put("duration", duration);
        return accommodation;
    }
    
    private List<Map<String, Object>> generateBudgetDetails() {
        List<Map<String, Object>> budgetDetails = new ArrayList<>();
        budgetDetails.add(createBudgetItem("交通", "往返交通", 1200));
        budgetDetails.add(createBudgetItem("住宿", "酒店住宿", 2664));
        budgetDetails.add(createBudgetItem("餐饮", "三餐费用", 600));
        budgetDetails.add(createBudgetItem("景点", "门票费用", 300));
        budgetDetails.add(createBudgetItem("购物", "纪念品", 236));
        return budgetDetails;
    }
    
    private Map<String, Object> createBudgetItem(String category, String details, int amount) {
        Map<String, Object> budgetItem = new HashMap<>();
        budgetItem.put("category", category);
        budgetItem.put("details", details);
        budgetItem.put("amount", amount);
        return budgetItem;
    }
}