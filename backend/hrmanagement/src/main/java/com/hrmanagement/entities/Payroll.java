package com.hrmanagement.entities;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.CascadeType;
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
@Table(name = "payroll")
public class Payroll {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "month", nullable = false)
    private Integer month;

    @Column(name = "payroll_date", nullable = false)
    private LocalDate payrollDate;

    @Column(name = "base_salary", nullable = false)
    private BigDecimal baseSalary;

    @Column(name = "bonus_amount", nullable = false)
    private BigDecimal bonusAmount;

    @Column(name = "gross_total", nullable = false)
    private BigDecimal grossTotal;

    @Column(name = "tax_amount", nullable = false)
    private BigDecimal taxAmount;

    @Column(name = "insurance_dedcution", nullable = false)
    private BigDecimal insuranceDedcution;

    @Column(name = "other_deductions", nullable = false)
    private BigDecimal otherDeductions;

    @Column(name = "net_salary", nullable = false)
    private BigDecimal netSalary;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Employees employee;

}
