package com.hrmanagement.services.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.hrmanagement.dto.DtoEmployees;
import com.hrmanagement.entities.Employees;
import com.hrmanagement.entities.Employees.Role;
import com.hrmanagement.entities.Employees.Status;
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
    public DtoEmployees registerEmployees(DtoEmployees dtoEmployees) {
        Employees employees = new Employees();
        BeanUtils.copyProperties(dtoEmployees, employees);

        if (dtoEmployees.getPassword() != null) {
            employees.setPassword(passwordEncoder.encode(dtoEmployees.getPassword()));
        }

        // Yeni başvurular PENDING durumunda başlar
        employees.setStatus(Status.PENDING);
        employees.setRole(Role.EMPLOYEE);
        employees.setCreatedAt(LocalDateTime.now());
        
        // QR kodu henüz oluşturulmaz, onaylandığında oluşturulacak
        employees.setQrCode(null);

        Employees savedEmployees = employeesRepository.save(employees);
        return convertToDto(savedEmployees);
    }

    @Override
    public DtoEmployees loginEmployees(DtoEmployees dtoEmployees) {
        Optional<Employees> optionalEmployee = employeesRepository.findByEmail(dtoEmployees.getEmail());

        if (optionalEmployee.isPresent()) {
            Employees employee = optionalEmployee.get();

            // Sadece onaylanmış kullanıcılar giriş yapabilir
            if (employee.getStatus() != Status.APPROVED) {
                return null;
            }

            if (passwordEncoder.matches(dtoEmployees.getPassword(), employee.getPassword())) {
                return convertToDto(employee);
            }
        }

        return null;
    }

    @Override
    public List<DtoEmployees> getAllEmployees() {
        List<Employees> employeesList = employeesRepository.findAll();
        List<DtoEmployees> dtoList = new ArrayList<>();

        for (Employees emp : employeesList) {
            dtoList.add(convertToDto(emp));
        }

        return dtoList;
    }

    @Override
    public List<DtoEmployees> getApprovedEmployees() {
        List<Employees> employeesList = employeesRepository.findByStatus(Status.APPROVED);
        List<DtoEmployees> dtoList = new ArrayList<>();

        for (Employees emp : employeesList) {
            dtoList.add(convertToDto(emp));
        }

        return dtoList;
    }

    @Override
    public List<DtoEmployees> getPendingEmployees() {
        List<Employees> employeesList = employeesRepository.findByStatusOrderByCreatedAtDesc(Status.PENDING);
        List<DtoEmployees> dtoList = new ArrayList<>();

        for (Employees emp : employeesList) {
            dtoList.add(convertToDto(emp));
        }

        return dtoList;
    }

    @Override
    public DtoEmployees getEmployeeById(Long id) {
        Optional<Employees> optionalEmployee = employeesRepository.findById(id);
        if (optionalEmployee.isPresent()) {
            return convertToDto(optionalEmployee.get());
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

            // GÜVENLİK: Role değiştirme devre dışı - sadece veritabanından değiştirilebilir
            // Kullanıcıların kendi rollerini değiştirmesi engellendi

            // Şifre değiştirilmek isteniyorsa güncelle
            if (dtoEmployees.getPassword() != null && !dtoEmployees.getPassword().isEmpty()) {
                employee.setPassword(passwordEncoder.encode(dtoEmployees.getPassword()));
            }

            Employees savedEmployee = employeesRepository.save(employee);
            return convertToDto(savedEmployee);
        }
        return null;
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        employeesRepository.deleteById(id);
    }

    @Override
    @Transactional
    public DtoEmployees approveEmployee(Long id, Long approverId) {
        Optional<Employees> optionalEmployee = employeesRepository.findById(id);
        if (optionalEmployee.isPresent()) {
            Employees employee = optionalEmployee.get();

            employee.setStatus(Status.APPROVED);
            employee.setApprovedAt(LocalDateTime.now());
            employee.setApprovedBy(approverId);

            // QR kod oluştur
            employee.setQrCode(generateQrCode());

            Employees savedEmployee = employeesRepository.save(employee);
            return convertToDto(savedEmployee);
        }
        return null;
    }

    @Override
    @Transactional
    public DtoEmployees rejectEmployee(Long id) {
        Optional<Employees> optionalEmployee = employeesRepository.findById(id);
        if (optionalEmployee.isPresent()) {
            Employees employee = optionalEmployee.get();

            employee.setStatus(Status.REJECTED);

            Employees savedEmployee = employeesRepository.save(employee);
            return convertToDto(savedEmployee);
        }
        return null;
    }

    @Override
    public DtoEmployees getByQrCode(String qrCode) {
        Optional<Employees> optionalEmployee = employeesRepository.findFirstByQrCode(qrCode);
        if (optionalEmployee.isPresent()) {
            return convertToDto(optionalEmployee.get());
        }
        return null;
    }

    @Override
    @Transactional
    public DtoEmployees regenerateQrCode(Long id) {
        Optional<Employees> optionalEmployee = employeesRepository.findById(id);
        if (optionalEmployee.isPresent()) {
            Employees employee = optionalEmployee.get();

            employee.setQrCode(generateQrCode());

            Employees savedEmployee = employeesRepository.save(employee);
            return convertToDto(savedEmployee);
        }
        return null;
    }

    private String generateQrCode() {
        return "QR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private DtoEmployees convertToDto(Employees employee) {
        DtoEmployees dto = new DtoEmployees();
        BeanUtils.copyProperties(employee, dto);
        dto.setPassword(null);
        
        if (employee.getRole() != null) {
            dto.setRole(employee.getRole().name());
        }
        if (employee.getStatus() != null) {
            dto.setStatus(employee.getStatus().name());
        }
        
        return dto;
    }
}
