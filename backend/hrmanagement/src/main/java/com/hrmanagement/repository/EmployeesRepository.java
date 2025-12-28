package com.hrmanagement.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hrmanagement.entities.Employees;
import com.hrmanagement.entities.Employees.Status;

import java.util.List;
import java.util.Optional;


@Repository
public interface EmployeesRepository extends JpaRepository<Employees, Long> {

    Optional<Employees> findByEmail(String email);
    
    Optional<Employees> findFirstByQrCode(String qrCode);
    
    List<Employees> findByStatus(Status status);
    
    List<Employees> findByStatusOrderByCreatedAtDesc(Status status);

}
