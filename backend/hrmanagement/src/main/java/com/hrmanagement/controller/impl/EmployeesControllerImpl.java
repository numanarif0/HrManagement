package com.hrmanagement.controller.impl;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hrmanagement.controller.IEmployeesController;
import com.hrmanagement.dto.DtoEmployees;
import com.hrmanagement.services.IEmployeesServices;

@RestController
@RequestMapping("api/employees")
public class EmployeesControllerImpl implements IEmployeesController{

    @Autowired
    private IEmployeesServices employeesServices;

        @Override
        @PostMapping(path = "/register")
        public DtoEmployees registerEmployees(@RequestBody DtoEmployees dtoEmployees){

            return  employeesServices.registerEmployees(dtoEmployees);
        }

        @Override
        @PostMapping(path = "/login")
        public DtoEmployees loginEmployees(@RequestBody DtoEmployees dtoEmployees){

            return  employeesServices.loginEmployees(dtoEmployees);
        }

}
