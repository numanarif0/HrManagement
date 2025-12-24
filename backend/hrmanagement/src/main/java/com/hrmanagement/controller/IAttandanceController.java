package com.hrmanagement.controller;

import com.hrmanagement.dto.DtoAttandance;

import java.util.List;

public interface IAttandanceController {

    public DtoAttandance checkIn(DtoAttandance dtoAttandance);
    public DtoAttandance checkOut(DtoAttandance dtoAttandance);
    public DtoAttandance checkInByQr(String qrCode);
    public DtoAttandance checkOutByQr(String qrCode);
    public DtoAttandance saveRecord(DtoAttandance dtoAttandance);
    public DtoAttandance getTotalHoursAttandance(DtoAttandance dtoAttandance);
    public DtoAttandance getTodayStatus(Long employeeId);
    public List<DtoAttandance> getWeeklyRecords(Long employeeId);
    public List<DtoAttandance> getMonthlyRecords(Long employeeId, int year, int month);
    public List<DtoAttandance> getRecentRecords(Long employeeId, int limit);
    public List<DtoAttandance> getAllRecords();
    public List<DtoAttandance> getAllRecordsByDate(String date);
    public List<DtoAttandance> searchRecords(Long employeeId, String employeeName, String startDate, String endDate);
    public DtoAttandance updateRecord(Long id, DtoAttandance dtoAttandance);
    public void deleteRecord(Long id);
}
