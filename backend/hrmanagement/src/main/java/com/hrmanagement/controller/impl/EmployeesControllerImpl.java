package com.hrmanagement.controller.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hrmanagement.controller.IEmployeesController;
import com.hrmanagement.dto.DtoEmployees;
import com.hrmanagement.services.IEmployeesServices;

@RestController
@RequestMapping("/api/employees")
public class EmployeesControllerImpl implements IEmployeesController {

    @Autowired
    private IEmployeesServices employeesServices;

    @Override
    @PostMapping(path = "/register")
    public DtoEmployees registerEmployees(@RequestBody DtoEmployees dtoEmployees) {
        return employeesServices.registerEmployees(dtoEmployees);
    }

    @Override
    @PostMapping(path = "/login")
    public DtoEmployees loginEmployees(@RequestBody DtoEmployees dtoEmployees) {
        return employeesServices.loginEmployees(dtoEmployees);
    }

    @Override
    @GetMapping(path = "/all")
    public List<DtoEmployees> getAllEmployees() {
        return employeesServices.getAllEmployees();
    }

    @Override
    @GetMapping(path = "/approved")
    public List<DtoEmployees> getApprovedEmployees() {
        return employeesServices.getApprovedEmployees();
    }

    @Override
    @GetMapping(path = "/pending")
    public List<DtoEmployees> getPendingEmployees() {
        return employeesServices.getPendingEmployees();
    }

    @Override
    @GetMapping(path = "/{id}")
    public DtoEmployees getEmployeeById(@PathVariable Long id) {
        return employeesServices.getEmployeeById(id);
    }

    @Override
    @PutMapping(path = "/{id}")
    public DtoEmployees updateEmployee(@PathVariable Long id, @RequestBody DtoEmployees dtoEmployees) {
        return employeesServices.updateEmployee(id, dtoEmployees);
    }

    @Override
    @DeleteMapping(path = "/{id}")
    public void deleteEmployee(@PathVariable Long id) {
        employeesServices.deleteEmployee(id);
    }

    @Override
    @PostMapping(path = "/{id}/approve")
    public DtoEmployees approveEmployee(@PathVariable Long id, @RequestParam Long approverId) {
        return employeesServices.approveEmployee(id, approverId);
    }

    @Override
    @PostMapping(path = "/{id}/reject")
    public DtoEmployees rejectEmployee(@PathVariable Long id) {
        return employeesServices.rejectEmployee(id);
    }

    @Override
    @GetMapping(path = "/qr/{qrCode}")
    public DtoEmployees getByQrCode(@PathVariable String qrCode) {
        return employeesServices.getByQrCode(qrCode);
    }

    @Override
    @PostMapping(path = "/{id}/regenerate-qr")
    public DtoEmployees regenerateQrCode(@PathVariable Long id) {
        return employeesServices.regenerateQrCode(id);
    }
}
