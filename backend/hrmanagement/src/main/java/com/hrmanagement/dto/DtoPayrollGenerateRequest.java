package com.hrmanagement.dto;

import java.math.BigDecimal;

public class DtoPayrollGenerateRequest {

    private Long employeeId;
    private int year;
    private int month;

    // Parametreler
    private int standardMonthlyHours = 160;

    private BigDecimal overtimeMultiplier = new BigDecimal("1.5");
    private BigDecimal incomeTaxRate = new BigDecimal("0.15");

    private BigDecimal bonus = BigDecimal.ZERO;
    private BigDecimal extraDeduction = BigDecimal.ZERO;

    // Eğer Employees'ta salary yoksa bunu kullanacağız
    private BigDecimal baseSalary;

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }

    public int getStandardMonthlyHours() { return standardMonthlyHours; }
    public void setStandardMonthlyHours(int standardMonthlyHours) { this.standardMonthlyHours = standardMonthlyHours; }

    public BigDecimal getOvertimeMultiplier() { return overtimeMultiplier; }
    public void setOvertimeMultiplier(BigDecimal overtimeMultiplier) { this.overtimeMultiplier = overtimeMultiplier; }

    public BigDecimal getIncomeTaxRate() { return incomeTaxRate; }
    public void setIncomeTaxRate(BigDecimal incomeTaxRate) { this.incomeTaxRate = incomeTaxRate; }

    public BigDecimal getBonus() { return bonus; }
    public void setBonus(BigDecimal bonus) { this.bonus = bonus; }

    public BigDecimal getExtraDeduction() { return extraDeduction; }
    public void setExtraDeduction(BigDecimal extraDeduction) { this.extraDeduction = extraDeduction; }

    public BigDecimal getBaseSalary() { return baseSalary; }
    public void setBaseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary; }
}
