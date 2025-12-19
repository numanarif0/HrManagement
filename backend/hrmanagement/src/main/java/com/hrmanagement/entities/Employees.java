package com.hrmanagement.entities;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "employees")
public class Employees {


    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "first_name", nullable = false)
    private String firstname;

    @Column(name = "last_name", nullable = false)
    private String lastname;

    @Column(name = "position", nullable = false)
    private String position;

    @Column(name = "department", nullable = false)
    private String department;

    @Column(name = "email", nullable = false)
    private String email;
    
    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @OneToOne(mappedBy = "employee", cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    private Payroll payroll;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    private List<Attendance> attendance;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    private List<Reviews> reviews;
    
}
