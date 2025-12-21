package com.hrmanagement.services;

import com.hrmanagement.dto.DtoAttandance;

import java.util.List;

public interface IAttandanceServices {

    public DtoAttandance checkIn(DtoAttandance dtoAttandance);
    public DtoAttandance checkOut(DtoAttandance dtoAttandance);
    public DtoAttandance saveRecord(DtoAttandance dtoAttandance);
    public DtoAttandance getTotalHoursAttandance(DtoAttandance dtoAttandance);
    public DtoAttandance getTodayStatus(Long employeeId);
    public List<DtoAttandance> getWeeklyRecords(Long employeeId);
    public List<DtoAttandance> getMonthlyRecords(Long employeeId, int year, int month);
    public List<DtoAttandance> getRecentRecords(Long employeeId, int limit);
    public DtoAttandance updateRecord(Long id, DtoAttandance dtoAttandance);
    public void deleteRecord(Long id);
}
