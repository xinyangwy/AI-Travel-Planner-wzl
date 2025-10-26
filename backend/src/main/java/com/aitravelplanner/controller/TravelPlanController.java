package com.aitravelplanner.controller;

import com.aitravelplanner.model.TravelPlan;
import com.aitravelplanner.service.TravelPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/travel")
public class TravelPlanController {

    @Autowired
    private TravelPlanService travelPlanService;

    @PostMapping("/plan")
    public ResponseEntity<?> createPlan(@RequestBody TravelPlan plan, HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            TravelPlan createdPlan = travelPlanService.createPlan(plan, userId);
            return ResponseEntity.ok(createdPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/plans")
    public ResponseEntity<?> getPlans(HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            List<TravelPlan> plans = travelPlanService.getUserPlans(userId);
            return ResponseEntity.ok(plans);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/plan/{id}")
    public ResponseEntity<?> getPlan(@PathVariable Long id, HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            TravelPlan plan = travelPlanService.getPlanById(id, userId);
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/plan/{id}")
    public ResponseEntity<?> updatePlan(@PathVariable Long id, @RequestBody TravelPlan plan, HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            TravelPlan updatedPlan = travelPlanService.updatePlan(id, plan, userId);
            return ResponseEntity.ok(updatedPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/plan/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable Long id, HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            travelPlanService.deletePlan(id, userId);
            return ResponseEntity.ok(Map.of("message", "删除成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateItinerary(@RequestBody Map<String, Object> requestData) {
        try {
            Map<String, Object> itinerary = travelPlanService.generateItinerary(requestData);
            return ResponseEntity.ok(itinerary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}