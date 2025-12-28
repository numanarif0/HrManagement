package com.hrmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HrmanagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(HrmanagementApplication.class, args);
	}

}
