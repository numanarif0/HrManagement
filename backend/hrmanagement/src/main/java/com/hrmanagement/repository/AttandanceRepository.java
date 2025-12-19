package com.hrmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hrmanagement.entities.Attendance;

public interface AttandanceRepository extends JpaRepository<Attendance, Long> {

}
