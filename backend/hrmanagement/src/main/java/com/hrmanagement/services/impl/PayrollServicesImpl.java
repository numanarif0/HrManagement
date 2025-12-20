package com.hrmanagement.services.impl;

import com.hrmanagement.dto.DtoPayrollGenerateRequest;
import com.hrmanagement.entities.Attendance;
import com.hrmanagement.entities.Employees;
import com.hrmanagement.entities.Payroll;
import com.hrmanagement.repository.AttandanceRepository;
import com.hrmanagement.repository.EmployeesRepository;
import com.hrmanagement.repository.PayrolRepository;
import com.hrmanagement.services.IPayrollServices;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class PayrollServicesImpl implements IPayrollServices {

    private final PayrolRepository payrolRepository;
    private final EmployeesRepository employeesRepository;
    private final AttandanceRepository attandanceRepository;

    public PayrollServicesImpl(PayrolRepository payrolRepository,
                              EmployeesRepository employeesRepository,
                              AttandanceRepository attandanceRepository) {
        this.payrolRepository = payrolRepository;
        this.employeesRepository = employeesRepository;
        this.attandanceRepository = attandanceRepository;
    }

    @Override
    @Transactional
    public Payroll generatePayroll(DtoPayrollGenerateRequest req) {
        int month = req.getMonth();
        int year = req.getYear();
        Long employeeId = req.getEmployeeId();

        if (month < 1 || month > 12) throw new IllegalArgumentException("month 1..12 olmalı");
        if (year < 2000) throw new IllegalArgumentException("year geçersiz: " + year);
        if (employeeId == null) throw new IllegalArgumentException("employeeId zorunlu");

        Employees emp = employeesRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee bulunamadı: " + employeeId));

        // Dönem aralığı
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        // Attendance: employee + tarih aralığı
        List<Attendance> records =
                attandanceRepository.findAllByEmployee_IdAndWorkDateBetween(employeeId, start, end);

        BigDecimal totalHours = records.stream()
                .map(a -> toBigDecimal(a.getHoursWorked()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Maaş: Employees'ta salary yoksa request'ten baseSalary kullan
        BigDecimal baseSalary = nullSafe(req.getBaseSalary());
        if (baseSalary.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("baseSalary zorunlu (Employees'ta salary yoksa request'ten gönderilmeli)");
        }

        int standardHoursInt = req.getStandardMonthlyHours();
        if (standardHoursInt <= 0) throw new IllegalArgumentException("standardMonthlyHours > 0 olmalı");

        BigDecimal standardHours = BigDecimal.valueOf(standardHoursInt);

        BigDecimal hourlyRate = baseSalary.divide(standardHours, 6, RoundingMode.HALF_UP);

        BigDecimal overtimeHours = totalHours.subtract(standardHours);
        if (overtimeHours.compareTo(BigDecimal.ZERO) < 0) overtimeHours = BigDecimal.ZERO;

        BigDecimal overtimeMultiplier = nullSafe(req.getOvertimeMultiplier());
        if (overtimeMultiplier.compareTo(BigDecimal.ZERO) < 0) overtimeMultiplier = BigDecimal.ZERO;

        BigDecimal overtimePay = overtimeHours.multiply(hourlyRate).multiply(overtimeMultiplier);

        BigDecimal gross = baseSalary
                .add(overtimePay)
                .add(nullSafe(req.getBonus()));

        BigDecimal incomeTaxRate = nullSafe(req.getIncomeTaxRate());
        if (incomeTaxRate.compareTo(BigDecimal.ZERO) < 0) incomeTaxRate = BigDecimal.ZERO;

        BigDecimal incomeTax = gross.multiply(incomeTaxRate);
        BigDecimal deductions = incomeTax.add(nullSafe(req.getExtraDeduction()));

        BigDecimal net = gross.subtract(deductions);

        // Para alanlarını 2 haneye yuvarla
        baseSalary = money(baseSalary);
        totalHours = totalHours.setScale(2, RoundingMode.HALF_UP);
        overtimeHours = overtimeHours.setScale(2, RoundingMode.HALF_UP);
        overtimePay = money(overtimePay);
        gross = money(gross);
        deductions = money(deductions);
        net = money(net);

        Payroll payroll = payrolRepository
                .findByEmployee_IdAndYearAndMonth(employeeId, year, month)
                .orElseGet(Payroll::new);

        payroll.setEmployee(emp);
        payroll.setYear(year);
        payroll.setMonth(month);
        payroll.setBaseSalary(baseSalary);
        payroll.setTotalWorkHours(totalHours);
        payroll.setOvertimeHours(overtimeHours);
        payroll.setOvertimePay(overtimePay);
        payroll.setBonus(money(nullSafe(req.getBonus())));
        payroll.setGrossSalary(gross);
        payroll.setDeductions(deductions);
        payroll.setNetSalary(net);

        return payrolRepository.save(payroll);
    }

    @Override
    public Payroll getById(Long id) {
        return payrolRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payroll bulunamadı: " + id));
    }

    @Override
    public Payroll getByEmployeeAndPeriod(Long employeeId, int year, int month) {
        return payrolRepository.findByEmployee_IdAndYearAndMonth(employeeId, year, month)
                .orElseThrow(() -> new IllegalArgumentException("Payroll bulunamadı (employee/period)"));
    }

    @Override
    public List<Payroll> listByEmployeeYear(Long employeeId, int year) {
        return payrolRepository.findAllByEmployee_IdAndYear(employeeId, year);
    }

    private static BigDecimal nullSafe(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private static BigDecimal money(BigDecimal v) {
        return (v == null ? BigDecimal.ZERO : v).setScale(2, RoundingMode.HALF_UP);
    }

    /** Attendance.hoursWorked Integer/Double/String vs olabilir → BigDecimal’e çevir. */
    private static BigDecimal toBigDecimal(Object hoursWorked) {
        if (hoursWorked == null) return BigDecimal.ZERO;
        if (hoursWorked instanceof BigDecimal bd) return bd;
        if (hoursWorked instanceof Integer i) return BigDecimal.valueOf(i);
        if (hoursWorked instanceof Long l) return BigDecimal.valueOf(l);
        if (hoursWorked instanceof Double d) return BigDecimal.valueOf(d);
        if (hoursWorked instanceof Float f) return BigDecimal.valueOf(f.doubleValue());
        if (hoursWorked instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return new BigDecimal(hoursWorked.toString());
    }
}
