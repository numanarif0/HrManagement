package com.hrmanagement.services.impl;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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

        // Tarih kontrolü - DTO'dan tarih geliyorsa onu kullan, yoksa bugün
        LocalDate targetDate = dtoAttandance.getDate() != null ? dtoAttandance.getDate() : LocalDate.now();

        Optional<Attendance> existingRecord = attandanceRepository
                .findByEmployeeIdAndDate(dtoAttandance.getEmployeeId(), targetDate);

        if (existingRecord.isPresent()) {
            throw new RuntimeException("Bu tarih için zaten giriş yapılmış!");
        }

        // Giriş saati - DTO'dan geliyorsa onu kullan
        LocalTime checkInTime = dtoAttandance.getCheckInTime() != null ? dtoAttandance.getCheckInTime() : LocalTime.now();

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee); 
        attendance.setDate(targetDate);
        attendance.setCheckInTime(checkInTime);
        attendance.setStatus("PRESENT"); 
        attendance.setHoursWorked(0.0);  

        Attendance savedAttendance = attandanceRepository.save(attendance);
        
        return convertToDto(savedAttendance);
    }

    @Override
    public DtoAttandance checkOut(DtoAttandance dtoAttandance) {
        // Tarih kontrolü - DTO'dan tarih geliyorsa onu kullan, yoksa bugün
        LocalDate targetDate = dtoAttandance.getDate() != null ? dtoAttandance.getDate() : LocalDate.now();

        Attendance attendance = attandanceRepository
                .findByEmployeeIdAndDate(dtoAttandance.getEmployeeId(), targetDate)
                .orElseThrow(() -> new RuntimeException("Giriş kaydı bulunamadı!"));

        if (attendance.getCheckOutTime() != null) {
            throw new RuntimeException("Zaten çıkış yapılmış!");
        }

        // Çıkış saati - DTO'dan geliyorsa onu kullan
        LocalTime checkOutTime = dtoAttandance.getCheckOutTime() != null ? dtoAttandance.getCheckOutTime() : LocalTime.now();
        
        attendance.setCheckOutTime(checkOutTime);

        long seconds = Duration.between(attendance.getCheckInTime(), attendance.getCheckOutTime()).toSeconds();
        double hours = seconds / 3600.0; 
        
        attendance.setHoursWorked(hours);

        Attendance savedAttendance = attandanceRepository.save(attendance);

        return convertToDto(savedAttendance);
    }

    @Override
    public DtoAttandance saveRecord(DtoAttandance dtoAttandance) {
        Employees employee = employeesRepository.findById(dtoAttandance.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Çalışan bulunamadı!"));

        LocalDate targetDate = dtoAttandance.getDate() != null ? dtoAttandance.getDate() : LocalDate.now();

        // Aynı tarihte kayıt var mı kontrol et
        Optional<Attendance> existingRecord = attandanceRepository
                .findByEmployeeIdAndDate(dtoAttandance.getEmployeeId(), targetDate);

        Attendance attendance;
        if (existingRecord.isPresent()) {
            // Var olan kaydı güncelle
            attendance = existingRecord.get();
        } else {
            // Yeni kayıt oluştur
            attendance = new Attendance();
            attendance.setEmployee(employee);
            attendance.setDate(targetDate);
            attendance.setStatus("PRESENT");
        }

        // Giriş ve çıkış saatlerini set et
        if (dtoAttandance.getCheckInTime() != null) {
            attendance.setCheckInTime(dtoAttandance.getCheckInTime());
        }
        if (dtoAttandance.getCheckOutTime() != null) {
            attendance.setCheckOutTime(dtoAttandance.getCheckOutTime());
        }

        // Çalışma saatini hesapla
        if (attendance.getCheckInTime() != null && attendance.getCheckOutTime() != null) {
            long seconds = Duration.between(attendance.getCheckInTime(), attendance.getCheckOutTime()).toSeconds();
            double hours = seconds / 3600.0;
            attendance.setHoursWorked(hours);
        } else {
            attendance.setHoursWorked(0.0);
        }

        Attendance saved = attandanceRepository.save(attendance);
        return convertToDto(saved);
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

    @Override
    public DtoAttandance getTodayStatus(Long employeeId) {
        Optional<Attendance> todayRecord = attandanceRepository
                .findByEmployeeIdAndDate(employeeId, LocalDate.now());
        
        if (todayRecord.isPresent()) {
            return convertToDto(todayRecord.get());
        }
        return null;
    }

    @Override
    public List<DtoAttandance> getWeeklyRecords(Long employeeId) {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = today.with(DayOfWeek.SUNDAY);
        
        List<Attendance> records = attandanceRepository
                .findAllByEmployee_IdAndDateBetween(employeeId, startOfWeek, endOfWeek);
        
        List<DtoAttandance> result = new ArrayList<>();
        for (Attendance record : records) {
            result.add(convertToDto(record));
        }
        return result;
    }

    @Override
    public List<DtoAttandance> getMonthlyRecords(Long employeeId, int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        
        List<Attendance> records = attandanceRepository
                .findAllByEmployee_IdAndDateBetween(employeeId, start, end);
        
        List<DtoAttandance> result = new ArrayList<>();
        for (Attendance record : records) {
            result.add(convertToDto(record));
        }
        return result;
    }

    @Override
    public List<DtoAttandance> getRecentRecords(Long employeeId, int limit) {
        List<Attendance> records = attandanceRepository
                .findByEmployeeIdOrderByDateDesc(employeeId);
        
        List<DtoAttandance> result = new ArrayList<>();
        int count = 0;
        for (Attendance record : records) {
            if (count >= limit) break;
            result.add(convertToDto(record));
            count++;
        }
        return result;
    }

    @Override
    public List<DtoAttandance> getAllRecords() {
        List<Attendance> records = attandanceRepository.findAllByOrderByDateDesc();
        List<DtoAttandance> result = new ArrayList<>();
        for (Attendance record : records) {
            DtoAttandance dto = convertToDto(record);
            // Çalışan bilgisini de ekle
            if (record.getEmployee() != null) {
                dto.setEmployeeName(record.getEmployee().getFirstname() + " " + record.getEmployee().getLastname());
            }
            result.add(dto);
        }
        return result;
    }

    @Override
    public List<DtoAttandance> getAllRecordsByDate(String date) {
        LocalDate targetDate = LocalDate.parse(date);
        List<Attendance> records = attandanceRepository.findByDateOrderByCheckInTimeDesc(targetDate);
        List<DtoAttandance> result = new ArrayList<>();
        for (Attendance record : records) {
            DtoAttandance dto = convertToDto(record);
            if (record.getEmployee() != null) {
                dto.setEmployeeName(record.getEmployee().getFirstname() + " " + record.getEmployee().getLastname());
            }
            result.add(dto);
        }
        return result;
    }

    @Override
    public DtoAttandance checkInByQr(String qrCode) {
        Employees employee = employeesRepository.findFirstByQrCode(qrCode)
                .orElseThrow(() -> new RuntimeException("Geçersiz QR kod!"));
        
        LocalDate today = LocalDate.now();
        Optional<Attendance> existingRecord = attandanceRepository
                .findByEmployeeIdAndDate(employee.getId(), today);

        if (existingRecord.isPresent()) {
            throw new RuntimeException("Bugün için zaten giriş yapılmış!");
        }

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setDate(today);
        attendance.setCheckInTime(LocalTime.now());
        attendance.setStatus("PRESENT");
        attendance.setHoursWorked(0.0);

        Attendance savedAttendance = attandanceRepository.save(attendance);
        
        // Giriş sonrası QR kodunu yenile
        employee.setQrCode(generateNewQrCode());
        employeesRepository.save(employee);
        
        DtoAttandance dto = convertToDto(savedAttendance);
        dto.setEmployeeName(employee.getFirstname() + " " + employee.getLastname());
        dto.setNewQrCode(employee.getQrCode()); // Yeni QR kodunu döndür
        return dto;
    }

    @Override
    public DtoAttandance checkOutByQr(String qrCode) {
        Employees employee = employeesRepository.findFirstByQrCode(qrCode)
                .orElseThrow(() -> new RuntimeException("Geçersiz QR kod!"));
        
        LocalDate today = LocalDate.now();
        Attendance attendance = attandanceRepository
                .findByEmployeeIdAndDate(employee.getId(), today)
                .orElseThrow(() -> new RuntimeException("Bugün için giriş kaydı bulunamadı!"));

        if (attendance.getCheckOutTime() != null) {
            throw new RuntimeException("Bugün için zaten çıkış yapılmış!");
        }

        attendance.setCheckOutTime(LocalTime.now());
        
        long seconds = Duration.between(attendance.getCheckInTime(), attendance.getCheckOutTime()).toSeconds();
        double hours = seconds / 3600.0;
        attendance.setHoursWorked(hours);

        Attendance savedAttendance = attandanceRepository.save(attendance);
        
        // Çıkış sonrası QR kodunu yenile
        employee.setQrCode(generateNewQrCode());
        employeesRepository.save(employee);
        
        DtoAttandance dto = convertToDto(savedAttendance);
        dto.setEmployeeName(employee.getFirstname() + " " + employee.getLastname());
        dto.setNewQrCode(employee.getQrCode()); // Yeni QR kodunu döndür
        return dto;
    }
    
    private String generateNewQrCode() {
        return "QR-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    @Override
    public DtoAttandance updateRecord(Long id, DtoAttandance dtoAttandance, Long requesterId) {
        // GÜVENLİK: Yetki kontrolü - sadece HR/ADMIN güncelleyebilir
        if (requesterId == null) {
            throw new RuntimeException("Yetki hatası: requesterId gerekli");
        }

        Employees requester = employeesRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Yetki hatası: Kullanıcı bulunamadı"));

        boolean isHR = "İnsan Kaynakları".equals(requester.getDepartment()) ||
                       Employees.Role.HR.equals(requester.getRole()) ||
                       Employees.Role.ADMIN.equals(requester.getRole());

        if (!isHR) {
            throw new RuntimeException("Yetki hatası: Devam kaydı güncelleme yetkisi sadece İK/Admin'e aittir");
        }

        Attendance attendance = attandanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kayıt bulunamadı!"));

        if (dtoAttandance.getDate() != null) {
            attendance.setDate(dtoAttandance.getDate());
        }
        if (dtoAttandance.getCheckInTime() != null) {
            attendance.setCheckInTime(dtoAttandance.getCheckInTime());
        }
        if (dtoAttandance.getCheckOutTime() != null) {
            attendance.setCheckOutTime(dtoAttandance.getCheckOutTime());
        }

        // Çalışma saatini yeniden hesapla
        if (attendance.getCheckInTime() != null && attendance.getCheckOutTime() != null) {
            long seconds = Duration.between(attendance.getCheckInTime(), attendance.getCheckOutTime()).toSeconds();
            double hours = seconds / 3600.0;
            attendance.setHoursWorked(hours);
        }

        Attendance saved = attandanceRepository.save(attendance);
        return convertToDto(saved);
    }

    @Override
    public void deleteRecord(Long id, Long requesterId) {
        // GÜVENLİK: Yetki kontrolü - sadece HR/ADMIN silebilir
        if (requesterId == null) {
            throw new RuntimeException("Yetki hatası: requesterId gerekli");
        }

        Employees requester = employeesRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Yetki hatası: Kullanıcı bulunamadı"));

        boolean isHR = "İnsan Kaynakları".equals(requester.getDepartment()) ||
                       Employees.Role.HR.equals(requester.getRole()) ||
                       Employees.Role.ADMIN.equals(requester.getRole());

        if (!isHR) {
            throw new RuntimeException("Yetki hatası: Devam kaydı silme yetkisi sadece İK/Admin'e aittir");
        }

        attandanceRepository.deleteById(id);
    }

    @Override
    public List<DtoAttandance> searchRecords(Long employeeId, String employeeName, String startDate, String endDate) {
        List<Attendance> allRecords = attandanceRepository.findAllByOrderByDateDesc();
        List<DtoAttandance> result = new ArrayList<>();

        LocalDate start = (startDate != null && !startDate.isEmpty()) ? LocalDate.parse(startDate) : null;
        LocalDate end = (endDate != null && !endDate.isEmpty()) ? LocalDate.parse(endDate) : null;

        for (Attendance attendance : allRecords) {
            boolean matches = true;

            // Employee ID filtresi
            if (employeeId != null && !attendance.getEmployee().getId().equals(employeeId)) {
                matches = false;
            }

            // İsim filtresi (büyük/küçük harf duyarsız)
            if (matches && employeeName != null && !employeeName.isEmpty()) {
                String fullName = attendance.getEmployee().getFirstname() + " " + attendance.getEmployee().getLastname();
                if (!fullName.toLowerCase().contains(employeeName.toLowerCase())) {
                    matches = false;
                }
            }

            // Başlangıç tarihi filtresi
            if (matches && start != null && attendance.getDate().isBefore(start)) {
                matches = false;
            }

            // Bitiş tarihi filtresi
            if (matches && end != null && attendance.getDate().isAfter(end)) {
                matches = false;
            }

            if (matches) {
                DtoAttandance dto = convertToDto(attendance);
                dto.setEmployeeName(attendance.getEmployee().getFirstname() + " " + attendance.getEmployee().getLastname());
                result.add(dto);
            }
        }

        return result;
    }
}