package com.aitravelplanner.repository;

import com.aitravelplanner.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByTravelPlanId(Long travelPlanId);
    List<Expense> findByTravelPlanIdAndCategory(Long travelPlanId, Expense.ExpenseCategory category);
}