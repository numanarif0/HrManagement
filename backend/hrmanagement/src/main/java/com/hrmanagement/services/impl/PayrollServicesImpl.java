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

        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("month 1..12 olmalı");
        }
        if (employeeId == null) {
            throw new IllegalArgumentException("employeeId boş olamaz");
        }

        Employees emp = employeesRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee bulunamadı: " + employeeId));

        // Dönem aralığı (şimdilik hesap için dursun; filtrelemeyi sonra ekleriz)
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        // Attendance saatlerini topla
        // Şu an findAll() ile gidiyorsun; derleme için OK.
        // İyileştirme: repository'ye employeeId + tarih aralığı query ekle.
        List<Attendance> records = attandanceRepository.findAll();

        BigDecimal totalHours = records.stream()
                .filter(a -> a.getEmployee() != null && a.getEmployee().getId().equals(employeeId))
                .map(a -> toBigDecimal(a.getHoursWorked()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Maaş kaynağı:
        // 1) Employees içinde salary varsa: emp.getSalary()
        // 2) Yoksa request'ten al: req.getBaseSalary()
        BigDecimal baseSalary = req.getBaseSalary();
        if (baseSalary == null) {
            // Eğer Employees'a salary eklediysen burayı aç:
            // baseSalary = emp.getSalary();

            throw new IllegalArgumentException("baseSalary boş. Employees'ta salary yoksa request ile gönder.");
        }

        int standardHours = req.getStandardMonthlyHours();
        if (standardHours <= 0) standardHours = 160;

        BigDecimal overtimeMultiplier = nullSafe(req.getOvertimeMultiplier(), new BigDecimal("1.5"));
        BigDecimal incomeTaxRate = nullSafe(req.getIncomeTaxRate(), new BigDecimal("0.15"));

        BigDecimal standardHoursBD = BigDecimal.valueOf(standardHours);

        BigDecimal hourlyRate = baseSalary.divide(standardHoursBD, 6, RoundingMode.HALF_UP);

        BigDecimal overtimeHours = totalHours.subtract(standardHoursBD);
        if (overtimeHours.compareTo(BigDecimal.ZERO) < 0) overtimeHours = BigDecimal.ZERO;

        BigDecimal overtimePay = overtimeHours.multiply(hourlyRate).multiply(overtimeMultiplier);

        BigDecimal gross = baseSalary
                .add(overtimePay)
                .add(nullSafe(req.getBonus(), BigDecimal.ZERO));

        BigDecimal incomeTax = gross.multiply(incomeTaxRate);
        BigDecimal deductions = incomeTax.add(nullSafe(req.getExtraDeduction(), BigDecimal.ZERO));

        BigDecimal net = gross.subtract(deductions);

        Payroll payroll = payrolRepository
                .findByEmployee_IdAndYearAndMonth(employeeId, year, month)
                .orElseGet(Payroll::new);

        payroll.setEmployee(emp);
        payroll.setYear(year);
        payroll.setMonth(month);

        payroll.setBaseSalary(scale2(baseSalary));
        payroll.setTotalWorkHours(scale2(totalHours));
        payroll.setOvertimeHours(scale2(overtimeHours));
        payroll.setOvertimePay(scale2(overtimePay));
        payroll.setBonus(scale2(nullSafe(req.getBonus(), BigDecimal.ZERO)));
        payroll.setGrossSalary(scale2(gross));
        payroll.setDeductions(scale2(deductions));
        payroll.setNetSalary(scale2(net));

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

    private static BigDecimal nullSafe(BigDecimal v, BigDecimal def) {
        return v == null ? def : v;
    }

    private static BigDecimal scale2(BigDecimal v) {
        return v.setScale(2, RoundingMode.HALF_UP);
    }

    // Attendance.getHoursWorked() BigDecimal değilse (Double/Integer vs.) burası çözer
    private static BigDecimal toBigDecimal(Object v) {
        if (v == null) return BigDecimal.ZERO;
        if (v instanceof BigDecimal bd) return bd;
        if (v instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        // String gelirse de çalışsın
        return new BigDecimal(v.toString());
    }
}
