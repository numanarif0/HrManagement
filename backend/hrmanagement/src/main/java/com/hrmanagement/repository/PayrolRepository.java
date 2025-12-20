
package com.hrmanagement.repository;

import com.hrmanagement.entities.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PayrolRepository extends JpaRepository<Payroll, Long> {

    Optional<Payroll> findByEmployee_IdAndYearAndMonth(Long employeeId, int year, int month);

    List<Payroll> findAllByEmployee_IdAndYear(Long employeeId, int year);

    List<Payroll> findAllByYearAndMonth(int year, int month);
}
