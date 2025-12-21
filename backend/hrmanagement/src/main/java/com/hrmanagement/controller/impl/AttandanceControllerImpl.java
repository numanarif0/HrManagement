package com.hrmanagement.controller.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hrmanagement.controller.IAttandanceController;
import com.hrmanagement.dto.DtoAttandance;
import com.hrmanagement.services.IAttandanceServices;

import java.util.List;

@RestController
@RequestMapping("api/attandance")
public class AttandanceControllerImpl implements IAttandanceController{


    @Autowired
    private IAttandanceServices iAttandanceServices;

    @Override
    @PostMapping(path = "/checkin")
    public DtoAttandance checkIn(@RequestBody DtoAttandance dtoAttandance) {
        
        return iAttandanceServices.checkIn(dtoAttandance);
    }

     @Override
    @PostMapping(path = "/checkout")
    public DtoAttandance checkOut(@RequestBody DtoAttandance dtoAttandance) {
        
        return iAttandanceServices.checkOut(dtoAttandance);
    }

    @Override
    @PostMapping(path = "/save")
    public DtoAttandance saveRecord(@RequestBody DtoAttandance dtoAttandance) {
        return iAttandanceServices.saveRecord(dtoAttandance);
    }

    @Override
    @GetMapping(path = "/totalhours")
    public DtoAttandance getTotalHoursAttandance(@RequestBody DtoAttandance dtoAttandance) {
        
        return iAttandanceServices.getTotalHoursAttandance(dtoAttandance);
    }

    @Override
    @GetMapping(path = "/today/{employeeId}")
    public DtoAttandance getTodayStatus(@PathVariable Long employeeId) {
        return iAttandanceServices.getTodayStatus(employeeId);
    }

    @Override
    @GetMapping(path = "/weekly/{employeeId}")
    public List<DtoAttandance> getWeeklyRecords(@PathVariable Long employeeId) {
        return iAttandanceServices.getWeeklyRecords(employeeId);
    }

    @Override
    @GetMapping(path = "/monthly/{employeeId}")
    public List<DtoAttandance> getMonthlyRecords(
            @PathVariable Long employeeId,
            @RequestParam int year,
            @RequestParam int month) {
        return iAttandanceServices.getMonthlyRecords(employeeId, year, month);
    }

    @Override
    @GetMapping(path = "/recent/{employeeId}")
    public List<DtoAttandance> getRecentRecords(
            @PathVariable Long employeeId,
            @RequestParam(defaultValue = "10") int limit) {
        return iAttandanceServices.getRecentRecords(employeeId, limit);
    }

    @Override
    @PutMapping(path = "/{id}")
    public DtoAttandance updateRecord(@PathVariable Long id, @RequestBody DtoAttandance dtoAttandance) {
        return iAttandanceServices.updateRecord(id, dtoAttandance);
    }

    @Override
    @DeleteMapping(path = "/{id}")
    public void deleteRecord(@PathVariable Long id) {
        iAttandanceServices.deleteRecord(id);
    }
}
