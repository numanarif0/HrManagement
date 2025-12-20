package com.hrmanagement.services;

import com.hrmanagement.entities.Payroll;
import com.hrmanagement.dto.DtoPayrollGenerateRequest;

import java.util.List;

public interface IPayrollServices {
    Payroll generatePayroll(DtoPayrollGenerateRequest req);
    Payroll getById(Long id);
    Payroll getByEmployeeAndPeriod(Long employeeId, int year, int month);
    List<Payroll> listByEmployeeYear(Long employeeId, int year);
}