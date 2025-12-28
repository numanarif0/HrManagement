package com.hrmanagement.entities;

import java.time.LocalDate;
import java.time.LocalTime;

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
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "check_in_time", nullable = true)
    private LocalTime checkInTime;

    @Column(name = "check_out_time", nullable = true)
    private LocalTime checkOutTime;

    @Column(name = "status", nullable = true)
    private String status;

    @Column(name = "hours_worked", nullable = true)
    private Double hoursWorked;

    @ManyToOne( fetch = FetchType.LAZY)
    private Employees employee;



}
