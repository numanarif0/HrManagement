package com.hrmanagement.services.impl;

import java.util.Optional;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.hrmanagement.dto.DtoEmployees;
import com.hrmanagement.entities.Employees;
import com.hrmanagement.repository.EmployeesRepository;
import com.hrmanagement.services.IEmployeesServices;

import ch.qos.logback.core.joran.util.beans.BeanUtil;
import jakarta.transaction.Transactional;

@Service
public class EmployeesServicesImpl implements IEmployeesServices {

    private final PasswordEncoder passwordEncoder;
    private final EmployeesRepository employeesRepository;

    @Autowired
    public EmployeesServicesImpl(PasswordEncoder passwordEncoder, EmployeesRepository employeesRepository) {
        this.passwordEncoder = passwordEncoder;
        this.employeesRepository = employeesRepository;
    }


    @Override
    @Transactional
    public DtoEmployees registerEmployees(DtoEmployees dtoEmployees){


        Employees employees = new Employees();
        BeanUtils.copyProperties(dtoEmployees, employees);

        if (dtoEmployees.getPassword() != null) {
            employees.setPassword(passwordEncoder.encode(dtoEmployees.getPassword()));
        }

        Employees savedEmployees = employeesRepository.save(employees);
        DtoEmployees responseDto = new DtoEmployees();
        BeanUtils.copyProperties(savedEmployees, responseDto);
        responseDto.setPassword(null);
        return responseDto;
    }


   @Override
    public DtoEmployees loginEmployees(DtoEmployees dtoEmployees) {

        Optional<Employees> optionalEmployee = employeesRepository.findByEmail(dtoEmployees.getEmail());

        if (optionalEmployee.isPresent()) {
            
            Employees employee = optionalEmployee.get();

            if (passwordEncoder.matches(dtoEmployees.getPassword(), employee.getPassword())) {
                DtoEmployees responseDto = new DtoEmployees();
                
                BeanUtils.copyProperties(employee, responseDto);
                
                responseDto.setPassword(null); 
                return responseDto;
            }
        }

        return null; 
    }
    

}
