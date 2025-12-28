package com.hrmanagement.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DtoEmployees {

    private Long id;
    private String firstname;
    private String lastname;
    private String position;
    private String department;
    private String email;
    private String phoneNumber;
    private String password;
    private String tcNo;
    private String role;
    private String status;
    private String qrCode;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private Long approvedBy;

}
