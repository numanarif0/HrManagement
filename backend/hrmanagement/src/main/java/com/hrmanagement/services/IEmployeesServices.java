package com.hrmanagement.services;

import java.util.List;

import com.hrmanagement.dto.DtoEmployees;

public interface IEmployeesServices {

        public DtoEmployees registerEmployees(DtoEmployees dtoEmployees);
        public DtoEmployees loginEmployees(DtoEmployees dtoEmployees);
        public List<DtoEmployees> getAllEmployees();
        public List<DtoEmployees> getApprovedEmployees();
        public List<DtoEmployees> getPendingEmployees();
        public DtoEmployees getEmployeeById(Long id);
        public DtoEmployees updateEmployee(Long id, DtoEmployees dtoEmployees);
        public void deleteEmployee(Long id);
        
        // İK onay işlemleri
        public DtoEmployees approveEmployee(Long id, Long approverId);
        public DtoEmployees rejectEmployee(Long id);
        
        // QR kod işlemleri
        public DtoEmployees getByQrCode(String qrCode);
        public DtoEmployees regenerateQrCode(Long id);

}
