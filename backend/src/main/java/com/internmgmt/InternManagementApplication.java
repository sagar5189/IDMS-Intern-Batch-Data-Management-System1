package com.internmgmt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling   // required by BatchService scheduled status updates
@EnableAsync        // required by NotificationService @Async email methods
public class InternManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(InternManagementApplication.class, args);
    }
}
