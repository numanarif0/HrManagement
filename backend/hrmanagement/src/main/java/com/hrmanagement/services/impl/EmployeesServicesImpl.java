package com.hrmanagement.services.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.hrmanagement.dto.DtoEmployees;
import com.hrmanagement.entities.Employees;
import com.hrmanagement.repository.EmployeesRepository;
import com.hrmanagement.services.IEmployeesServices;

import jakarta.transaction.Transactional;

@Service
public class EmployeesServicesImpl implements IEmployeesServices {

    private final PasswordEncoder passwordEncoder;
    private final EmployeesRepository employeesRepository;

    
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

    @Override
    public List<DtoEmployees> getAllEmployees() {
        List<Employees> employeesList = employeesRepository.findAll();
        List<DtoEmployees> dtoList = new ArrayList<>();
        
        for (Employees emp : employeesList) {
            DtoEmployees dto = new DtoEmployees();
            BeanUtils.copyProperties(emp, dto);
            dto.setPassword(null);
            dtoList.add(dto);
        }
        
        return dtoList;
    }

    @Override
    public DtoEmployees getEmployeeById(Long id) {
        Optional<Employees> optionalEmployee = employeesRepository.findById(id);
        if (optionalEmployee.isPresent()) {
            DtoEmployees dto = new DtoEmployees();
            BeanUtils.copyProperties(optionalEmployee.get(), dto);
            dto.setPassword(null);
            return dto;
        }
        return null;
    }

    @Override
    @Transactional
    public DtoEmployees updateEmployee(Long id, DtoEmployees dtoEmployees) {
        Optional<Employees> optionalEmployee = employeesRepository.findById(id);
        if (optionalEmployee.isPresent()) {
            Employees employee = optionalEmployee.get();
            
            employee.setFirstname(dtoEmployees.getFirstname());
            employee.setLastname(dtoEmployees.getLastname());
            employee.setPosition(dtoEmployees.getPosition());
            employee.setDepartment(dtoEmployees.getDepartment());
            employee.setEmail(dtoEmployees.getEmail());
            employee.setPhoneNumber(dtoEmployees.getPhoneNumber());
            employee.setTcNo(dtoEmployees.getTcNo());
            
            // Şifre değiştirilmek isteniyorsa güncelle
            if (dtoEmployees.getPassword() != null && !dtoEmployees.getPassword().isEmpty()) {
                employee.setPassword(passwordEncoder.encode(dtoEmployees.getPassword()));
            }
            
            Employees savedEmployee = employeesRepository.save(employee);
            DtoEmployees responseDto = new DtoEmployees();
            BeanUtils.copyProperties(savedEmployee, responseDto);
            responseDto.setPassword(null);
            return responseDto;
        }
        return null;
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        employeesRepository.deleteById(id);
    }
}
