package com.hrmanagement.controller;

import com.hrmanagement.dto.DtoEmployees;

public interface IEmployeesController {


        public DtoEmployees registerEmployees(DtoEmployees dtoEmployees);
        public DtoEmployees loginEmployees(DtoEmployees dtoEmployees);
        


}
