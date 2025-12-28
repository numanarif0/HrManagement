package com.hrmanagement.services;

import java.util.List;
import java.util.UUID;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.hrmanagement.entities.Employees;
import com.hrmanagement.entities.Employees.Status;
import com.hrmanagement.repository.EmployeesRepository;

import jakarta.transaction.Transactional;

@Service
public class QrRefreshScheduler {

    private final EmployeesRepository employeesRepository;

    public QrRefreshScheduler(EmployeesRepository employeesRepository) {
        this.employeesRepository = employeesRepository;
    }

    // Her 3 dakikada bir çalışır (180000 ms = 3 dakika)
    @Scheduled(fixedRate = 180000)
    @Transactional
    public void refreshAllQrCodes() {
        List<Employees> approvedEmployees = employeesRepository.findByStatus(Status.APPROVED);
        
        for (Employees employee : approvedEmployees) {
            if (employee.getQrCode() != null) {
                employee.setQrCode(generateNewQrCode());
            }
        }
        
        // Tek seferde toplu kaydet
        employeesRepository.saveAll(approvedEmployees);
        
        System.out.println("[QR Scheduler] " + approvedEmployees.size() + " çalışanın QR kodu yenilendi.");
    }

    private String generateNewQrCode() {
        return "QR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
