package com.hrmanagement.repository;

import java.lang.foreign.Linker.Option;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hrmanagement.entities.Employees;
import java.util.List;
import java.util.Optional;


@Repository
public interface EmployeesRepository extends JpaRepository<Employees, Long> {

    Optional<Employees> findByEmail(String email);

}
