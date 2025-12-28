package com.hrmanagement.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DtoAttandance {

    private Long id;
    private LocalDate date;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private Double hoursWorked;
    private Long employeeId;
    private String employeeName;
    private String status;
    private String newQrCode; // Giriş/çıkış sonrası yeni QR kodu
}
