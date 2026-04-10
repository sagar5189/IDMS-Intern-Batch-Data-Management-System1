package com.internmgmt.service;

import com.internmgmt.model.Batch;
import com.internmgmt.model.Intern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.notification.admin-email:admin@company.com}")
    private String adminEmail;

    @Value("${app.notification.enabled:true}")
    private boolean notificationsEnabled;

    @Async
    public void sendInternRegistrationNotification(Intern intern) {
        if (!notificationsEnabled) return;
        try {
            // Email to intern
            sendEmail(
                intern.getEmail(),
                "Welcome to the Internship Program! 🎉",
                buildInternWelcomeMessage(intern)
            );
            // Email to admin
            sendEmail(
                adminEmail,
                "New Intern Registered: " + intern.getName(),
                "Intern " + intern.getName() + " (ID: " + intern.getInternId() +
                ") has been registered and assigned to batch: " + intern.getBatch().getBatchName()
            );
            log.info("Registration notification sent to: {}", intern.getEmail());
        } catch (Exception e) {
            log.error("Failed to send registration notification: {}", e.getMessage());
        }
    }

    @Async
    public void sendBatchCreationNotification(Batch batch) {
        if (!notificationsEnabled) return;
        try {
            sendEmail(
                adminEmail,
                "New Batch Created: " + batch.getBatchName(),
                "Batch '" + batch.getBatchName() + "' has been created.\n" +
                "Start Date: " + batch.getStartDate() + "\nEnd Date: " + batch.getEndDate()
            );
            log.info("Batch creation notification sent for: {}", batch.getBatchName());
        } catch (Exception e) {
            log.error("Failed to send batch notification: {}", e.getMessage());
        }
    }

    @Async
    public void sendBatchAssignmentNotification(Intern intern) {
        if (!notificationsEnabled) return;
        try {
            sendEmail(
                intern.getEmail(),
                "Batch Assignment Update",
                "You have been assigned to batch: " + intern.getBatch().getBatchName() +
                "\nStart Date: " + intern.getBatch().getStartDate() +
                "\nEnd Date: " + intern.getBatch().getEndDate()
            );
        } catch (Exception e) {
            log.error("Failed to send assignment notification: {}", e.getMessage());
        }
    }

    @Async
    public void sendPerformanceUpdateNotification(Intern intern) {
        if (!notificationsEnabled) return;
        try {
            sendEmail(
                intern.getEmail(),
                "Performance Evaluation Update",
                "Your performance has been evaluated.\nScore: " + intern.getPerformanceScore() +
                "/100\nRemarks: " + intern.getPerformanceRemarks()
            );
        } catch (Exception e) {
            log.error("Failed to send performance notification: {}", e.getMessage());
        }
    }

    private void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("[InternHub] " + subject);
        message.setText(body);
        mailSender.send(message);
    }

    private String buildInternWelcomeMessage(Intern intern) {
        return "Dear " + intern.getName() + ",\n\n" +
               "Welcome to the Internship Program!\n\n" +
               "Your Intern ID: " + intern.getInternId() + "\n" +
               "ID Card Type: " + intern.getIdCardType() + "\n" +
               "Batch: " + intern.getBatch().getBatchName() + "\n" +
               "Date of Joining: " + intern.getDateOfJoining() + "\n\n" +
               "Best of luck!\nTeam InternHub";
    }
}
