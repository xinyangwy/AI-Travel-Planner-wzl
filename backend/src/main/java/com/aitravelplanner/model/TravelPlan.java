package com.aitravelplanner.model;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "travel_plans")
@Data
public class TravelPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 100)
    private String destination;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    private BigDecimal budget;

    @Column(columnDefinition = "INT DEFAULT 1")
    private Integer travelerCount = 1;

    @Column(columnDefinition = "JSON")
    private Map<String, Object> preferences;

    @Column(columnDefinition = "JSON")
    private Map<String, Object> itinerary;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('draft', 'confirmed', 'completed') DEFAULT 'draft'")
    private PlanStatus status = PlanStatus.DRAFT;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum PlanStatus {
        DRAFT, CONFIRMED, COMPLETED
    }
}