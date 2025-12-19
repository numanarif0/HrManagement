package com.hrmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hrmanagement.entities.Payroll;

public interface PayrolRepository extends JpaRepository<Payroll, Long> {

}
