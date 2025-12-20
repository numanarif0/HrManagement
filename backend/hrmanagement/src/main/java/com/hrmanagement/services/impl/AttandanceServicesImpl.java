package com.hrmanagement.services.impl;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;

import org.hibernate.sql.ast.tree.expression.Over;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import com.hrmanagement.dto.DtoAttandance;
import com.hrmanagement.entities.Attendance;
import com.hrmanagement.entities.Employees;
import com.hrmanagement.repository.AttandanceRepository;
import com.hrmanagement.repository.EmployeesRepository;
import com.hrmanagement.services.IAttandanceServices;

@Service
public class AttandanceServicesImpl implements IAttandanceServices{


    private final AttandanceRepository attandanceRepository;
    private final EmployeesRepository employeesRepository;

    public AttandanceServicesImpl(AttandanceRepository attandanceRepository,EmployeesRepository employeesRepository) {
        this.attandanceRepository = attandanceRepository;
        this.employeesRepository = employeesRepository;

    }

    @Override
    public DtoAttandance checkIn(DtoAttandance dtoAttandance) {
        Employees employee = employeesRepository.findById(dtoAttandance.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Çalışan bulunamadı!"));

        Optional<Attendance> existingRecord = attandanceRepository
                .findByEmployeeIdAndDate(dtoAttandance.getEmployeeId(), LocalDate.now());

        if (existingRecord.isPresent()) {
            throw new RuntimeException("Bugün için zaten giriş yapılmış!");
        }

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee); 
        attendance.setDate(LocalDate.now());
        attendance.setCheckInTime(LocalTime.now());
        attendance.setStatus("PRESENT"); 
        attendance.setHoursWorked(0.0);  

        Attendance savedAttendance = attandanceRepository.save(attendance);
        
        return convertToDto(savedAttendance);
    }

    @Override
    public DtoAttandance checkOut(DtoAttandance dtoAttandance) {
        Attendance attendance = attandanceRepository
                .findByEmployeeIdAndDate(dtoAttandance.getEmployeeId(), LocalDate.now())
                .orElseThrow(() -> new RuntimeException("Giriş kaydı bulunamadı!"));

        if (attendance.getCheckOutTime() != null) {
            throw new RuntimeException("Zaten çıkış yapılmış!");
        }

        attendance.setCheckOutTime(LocalTime.now());

        long seconds = Duration.between(attendance.getCheckInTime(), attendance.getCheckOutTime()).toSeconds();
        double hours = seconds / 3600.0; 
        
        attendance.setHoursWorked(hours);

        Attendance savedAttendance = attandanceRepository.save(attendance);

        return convertToDto(savedAttendance);
    }

    @Override
    public DtoAttandance getTotalHoursAttandance(DtoAttandance dtoAttandance) {
        
        List<Attendance> list = attandanceRepository.findByEmployeeId(dtoAttandance.getEmployeeId());
        
        if(list == null || list.isEmpty()){
             return null; 
        }
        
        double totalHours = list.stream()
                .filter(a -> a.getHoursWorked() != null)
                .mapToDouble(Attendance::getHoursWorked)
                .sum();
        
        Attendance lastRecord = list.get(list.size() - 1);

        DtoAttandance response = new DtoAttandance();
        response.setEmployeeId(dtoAttandance.getEmployeeId());
        response.setHoursWorked(totalHours);
        
        response.setCheckInTime(lastRecord.getCheckInTime());
        response.setCheckOutTime(lastRecord.getCheckOutTime());
        
        return response;
    }

    private DtoAttandance convertToDto(Attendance attendance) {
        DtoAttandance dto = new DtoAttandance();
        BeanUtils.copyProperties(attendance, dto);
        if (attendance.getEmployee() != null) {
            dto.setEmployeeId(attendance.getEmployee().getId());
        }
        return dto;
    }




}
