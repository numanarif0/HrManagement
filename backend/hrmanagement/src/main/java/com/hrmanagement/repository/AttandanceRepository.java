package com.hrmanagement.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hrmanagement.entities.Attendance;

@Repository
public interface AttandanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByEmployeeId(Long id);

    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);

}
