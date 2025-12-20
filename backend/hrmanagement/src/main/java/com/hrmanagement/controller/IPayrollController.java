package com.hrmanagement.controller;

import com.hrmanagement.dto.DtoPayrollGenerateRequest;
import com.hrmanagement.entities.Payroll;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface IPayrollController {
    ResponseEntity<Payroll> generate(DtoPayrollGenerateRequest req);
    ResponseEntity<Payroll> getById(Long id);
    ResponseEntity<Payroll> getByEmployeeAndPeriod(Long employeeId, int year, int month);
    ResponseEntity<List<Payroll>> listByEmployeeYear(Long employeeId, int year);
}
