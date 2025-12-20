package com.hrmanagement.entities;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "reviews")
public class Reviews {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    @Column(name = "review_date", nullable = false) 
    private LocalDate reviewDate;

    @Column(name = "reviewerName", nullable = false) 
    private String reviewerName;

    @Column(name = "comments", nullable = false) 
    private String comments;

    @Column(name = "rating") 
    private Integer rating;

    @ManyToOne(fetch = FetchType.LAZY)
    private Employees employee;


}
