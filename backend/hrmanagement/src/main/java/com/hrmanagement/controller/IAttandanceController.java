package com.hrmanagement.controller;

import com.hrmanagement.dto.DtoAttandance;



public interface IAttandanceController {



    public DtoAttandance checkIn(DtoAttandance dtoAttandance);
    public DtoAttandance checkOut(DtoAttandance dtoAttandance);
    public DtoAttandance getTotalHoursAttandance(DtoAttandance dtoAttandance);



}
