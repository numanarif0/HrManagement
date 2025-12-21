
package com.hrmanagement.controller.impl;

import com.hrmanagement.controller.IPayrollController;
import com.hrmanagement.dto.DtoPayrollGenerateRequest;
import com.hrmanagement.entities.Payroll;
import com.hrmanagement.services.IPayrollServices;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
public class PayrollControllerImpl implements IPayrollController {

    private final IPayrollServices payrollServices;

    public PayrollControllerImpl(IPayrollServices payrollServices) {
        this.payrollServices = payrollServices;
    }

    @Override
    @PostMapping("/generate")
    public ResponseEntity<Payroll> generate(@RequestBody DtoPayrollGenerateRequest req) {
        return ResponseEntity.ok(payrollServices.generatePayroll(req));
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<Payroll> getById(@PathVariable Long id) {
        return ResponseEntity.ok(payrollServices.getById(id));
    }

    @Override
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<Payroll> getByEmployeeAndPeriod(
        @PathVariable Long employeeId,
        @RequestParam int year,
        @RequestParam int month
    ) {
        Payroll payroll = payrollServices.getByEmployeeAndPeriod(employeeId, year, month);
        if (payroll == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(payroll);
    }

    @Override
    @GetMapping("/employee/{employeeId}/year/{year}")
    public ResponseEntity<List<Payroll>> listByEmployeeYear(@PathVariable Long employeeId, @PathVariable int year) {
        return ResponseEntity.ok(payrollServices.listByEmployeeYear(employeeId, year));
    }

    @Override
    @GetMapping("/employee/{employeeId}/all")
    public ResponseEntity<List<Payroll>> getAllByEmployee(@PathVariable Long employeeId) {
        System.out.println("getAllByEmployee called with employeeId=" + employeeId);
        return ResponseEntity.ok(payrollServices.getAllByEmployee(employeeId));
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayroll(@PathVariable Long id) {
        System.out.println("deletePayroll controller id=" + id);
        payrollServices.deletePayroll(id);
        return ResponseEntity.noContent().build();
    }
}
