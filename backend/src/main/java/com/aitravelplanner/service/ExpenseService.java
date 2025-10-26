package com.aitravelplanner.service;

import com.aitravelplanner.model.Expense;

import java.util.List;
import java.util.Map;

public interface ExpenseService {

    Expense addExpense(Expense expense, Long userId);
    Expense getExpenseById(Long id, Long userId);
    List<Expense> getExpensesByPlanId(Long planId, Long userId);
    List<Expense> getExpensesByCategory(Long planId, Expense.ExpenseCategory category, Long userId);
    Expense updateExpense(Long id, Expense expense, Long userId);
    void deleteExpense(Long id, Long userId);
    Map<String, Object> getExpenseStatistics(Long planId, Long userId);
}