package com.aitravelplanner.service;

import com.aitravelplanner.model.TravelPlan;

import java.util.List;
import java.util.Map;

public interface TravelPlanService {

    TravelPlan createPlan(TravelPlan plan, Long userId);
    TravelPlan getPlanById(Long id, Long userId);
    List<TravelPlan> getUserPlans(Long userId);
    List<TravelPlan> getUserPlansByStatus(Long userId, TravelPlan.PlanStatus status);
    TravelPlan updatePlan(Long id, TravelPlan plan, Long userId);
    void deletePlan(Long id, Long userId);
    Map<String, Object> generateItinerary(Map<String, Object> requestData);
}