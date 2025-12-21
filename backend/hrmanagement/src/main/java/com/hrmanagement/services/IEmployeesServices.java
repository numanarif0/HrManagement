package com.hrmanagement.services;

import java.util.List;

import com.hrmanagement.dto.DtoEmployees;

public interface IEmployeesServices {

        public DtoEmployees registerEmployees(DtoEmployees dtoEmployees);
        public DtoEmployees loginEmployees(DtoEmployees dtoEmployees);
        public List<DtoEmployees> getAllEmployees();
        public DtoEmployees getEmployeeById(Long id);
        public DtoEmployees updateEmployee(Long id, DtoEmployees dtoEmployees);
        public void deleteEmployee(Long id);

}
