package com.hrmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hrmanagement.entities.Employees;

@Repository
public interface EmployeesRepository extends JpaRepository<Employees, Long> {

}
