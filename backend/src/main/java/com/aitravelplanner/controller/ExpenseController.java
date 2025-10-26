package com.aitravelplanner.controller;

import com.aitravelplanner.model.Expense;
import com.aitravelplanner.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/expense")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<?> addExpense(@RequestBody Expense expense, HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            Expense addedExpense = expenseService.addExpense(expense, userId);
            return ResponseEntity.ok(addedExpense);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/plan/{planId}")
    public ResponseEntity<?> getExpensesByPlan(@PathVariable Long planId, HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            List<Expense> expenses = expenseService.getExpensesByPlanId(planId, userId);
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExpense(@PathVariable Long id, @RequestBody Expense expense, HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            Expense updatedExpense = expenseService.updateExpense(id, expense, userId);
            return ResponseEntity.ok(updatedExpense);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id, HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            expenseService.deleteExpense(id, userId);
            return ResponseEntity.ok(Map.of("message", "删除成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/statistics/{planId}")
    public ResponseEntity<?> getStatistics(@PathVariable Long planId, HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            Map<String, Object> statistics = expenseService.getExpenseStatistics(planId, userId);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}