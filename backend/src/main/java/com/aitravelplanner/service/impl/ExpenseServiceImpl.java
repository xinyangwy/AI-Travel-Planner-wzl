package com.aitravelplanner.service.impl;

import com.aitravelplanner.model.Expense;
import com.aitravelplanner.model.TravelPlan;
import com.aitravelplanner.repository.ExpenseRepository;
import com.aitravelplanner.repository.TravelPlanRepository;
import com.aitravelplanner.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private TravelPlanRepository travelPlanRepository;

    private void validatePlanOwner(Long planId, Long userId) {
        TravelPlan plan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("旅行计划不存在"));
        
        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权访问该旅行计划");
        }
    }

    @Override
    @Transactional
    public Expense addExpense(Expense expense, Long userId) {
        validatePlanOwner(expense.getTravelPlan().getId(), userId);
        return expenseRepository.save(expense);
    }

    @Override
    public Expense getExpenseById(Long id, Long userId) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("费用记录不存在"));
        
        validatePlanOwner(expense.getTravelPlan().getId(), userId);
        return expense;
    }

    @Override
    public List<Expense> getExpensesByPlanId(Long planId, Long userId) {
        validatePlanOwner(planId, userId);
        return expenseRepository.findByTravelPlanId(planId);
    }

    @Override
    public List<Expense> getExpensesByCategory(Long planId, Expense.ExpenseCategory category, Long userId) {
        validatePlanOwner(planId, userId);
        return expenseRepository.findByTravelPlanIdAndCategory(planId, category);
    }

    @Override
    @Transactional
    public Expense updateExpense(Long id, Expense expense, Long userId) {
        Expense existingExpense = getExpenseById(id, userId);
        
        existingExpense.setCategory(expense.getCategory());
        existingExpense.setAmount(expense.getAmount());
        existingExpense.setDescription(expense.getDescription());
        existingExpense.setExpenseDate(expense.getExpenseDate());
        existingExpense.setReceiptUrl(expense.getReceiptUrl());
        
        return expenseRepository.save(existingExpense);
    }

    @Override
    @Transactional
    public void deleteExpense(Long id, Long userId) {
        Expense expense = getExpenseById(id, userId);
        expenseRepository.delete(expense);
    }

    @Override
    public Map<String, Object> getExpenseStatistics(Long planId, Long userId) {
        validatePlanOwner(planId, userId);
        
        List<Expense> expenses = expenseRepository.findByTravelPlanId(planId);
        Map<String, Object> statistics = new HashMap<>();
        
        // 计算总支出
        BigDecimal totalAmount = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        statistics.put("totalAmount", totalAmount);
        
        // 按类别统计
        Map<String, BigDecimal> categoryStats = expenses.stream()
                .collect(Collectors.groupingBy(
                        expense -> expense.getCategory().name(),
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));
        statistics.put("categoryStats", categoryStats);
        
        // 按日期统计
        Map<String, BigDecimal> dailyStats = expenses.stream()
                .collect(Collectors.groupingBy(
                        expense -> expense.getExpenseDate().toString(),
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));
        statistics.put("dailyStats", dailyStats);
        
        // 支出最多的类别
        if (!categoryStats.isEmpty()) {
            String maxCategory = categoryStats.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .get().getKey();
            statistics.put("maxCategory", maxCategory);
        }
        
        return statistics;
    }
}