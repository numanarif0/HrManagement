package com.hrmanagement.services;

import com.hrmanagement.dto.DtoAttandance;

public interface IAttandanceServices {



    public DtoAttandance checkIn(DtoAttandance dtoAttandance);
    public DtoAttandance checkOut(DtoAttandance dtoAttandance);
    public DtoAttandance getTotalHoursAttandance(DtoAttandance dtoAttandance);

}
