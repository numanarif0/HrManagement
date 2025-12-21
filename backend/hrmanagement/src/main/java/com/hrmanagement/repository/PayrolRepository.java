
package com.hrmanagement.repository;

import com.hrmanagement.entities.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface PayrolRepository extends JpaRepository<Payroll, Long> {

    Optional<Payroll> findByEmployee_IdAndYearAndMonth(Long employeeId, int year, int month);

    List<Payroll> findAllByEmployee_IdAndYear(Long employeeId, int year);

    List<Payroll> findAllByYearAndMonth(int year, int month);

    List<Payroll> findAllByEmployee_IdOrderByYearDescMonthDesc(Long employeeId);

    @Transactional
    @Modifying
    @Query("delete from Payroll p where p.id = :id")
    int hardDeleteById(Long id);
}
