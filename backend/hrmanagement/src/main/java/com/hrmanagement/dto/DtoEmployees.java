package com.hrmanagement.dto;

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
    

}
