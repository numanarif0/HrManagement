package com.hrmanagement.controller;

import java.util.List;

import com.hrmanagement.dto.DtoEmployees;

public interface IEmployeesController {

        public DtoEmployees registerEmployees(DtoEmployees dtoEmployees);
        public DtoEmployees loginEmployees(DtoEmployees dtoEmployees);
        public List<DtoEmployees> getAllEmployees();
        public DtoEmployees getEmployeeById(Long id);
        public DtoEmployees updateEmployee(Long id, DtoEmployees dtoEmployees);
        public void deleteEmployee(Long id);

}
