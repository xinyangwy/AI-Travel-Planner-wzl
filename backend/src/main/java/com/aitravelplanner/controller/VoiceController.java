package com.aitravelplanner.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/voice")
public class VoiceController {

    @PostMapping("/recognize")
    public ResponseEntity<?> recognizeVoice(@RequestBody Map<String, Object> requestData) {
        try {
            // 模拟语音识别功能
            // 在实际应用中，这里会调用科大讯飞语音识别API
            String recognizedText = "我想去北京旅行，安排三天行程";
            
            Map<String, Object> response = new HashMap<>();
            response.put("text", recognizedText);
            response.put("confidence", 0.95);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/expense")
    public ResponseEntity<?> voiceExpense(@RequestBody Map<String, Object> requestData, HttpServletRequest request) {
        try {
            // 模拟语音记录费用功能
            // 实际应用中会调用语音识别API并解析结果
            Map<String, Object> expenseData = new HashMap<>();
            expenseData.put("category", "FOOD");
            expenseData.put("amount", 128.5);
            expenseData.put("description", "午餐");
            expenseData.put("expenseDate", "2024-01-15");
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "语音录入成功");
            response.put("expenseData", expenseData);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}