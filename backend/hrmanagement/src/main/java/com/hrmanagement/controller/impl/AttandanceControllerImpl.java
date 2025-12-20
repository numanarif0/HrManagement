package com.hrmanagement.controller.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hrmanagement.controller.IAttandanceController;
import com.hrmanagement.dto.DtoAttandance;
import com.hrmanagement.services.IAttandanceServices;



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
    @GetMapping(path = "/totalhours")
    public DtoAttandance getTotalHoursAttandance(@RequestBody DtoAttandance dtoAttandance) {
        
        return iAttandanceServices.getTotalHoursAttandance(dtoAttandance);
    }





}
