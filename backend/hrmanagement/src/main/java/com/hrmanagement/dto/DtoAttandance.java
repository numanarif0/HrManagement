package com.hrmanagement.dto;

import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DtoAttandance {


    private Long id;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private Double hoursWorked;
    private Long employeeId;



}
