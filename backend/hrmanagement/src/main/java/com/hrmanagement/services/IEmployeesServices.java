package com.hrmanagement.services;

import com.hrmanagement.dto.DtoEmployees;

public interface IEmployeesServices {
    


        public DtoEmployees registerEmployees(DtoEmployees dtoEmployees);
        public DtoEmployees loginEmployees(DtoEmployees dtoEmployees);


}
