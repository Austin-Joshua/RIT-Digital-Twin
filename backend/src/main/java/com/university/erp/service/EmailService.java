package com.university.erp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String token) {
        String verificationUrl = "http://localhost:5173/verify-email?token=" + token; // Ideally injected via property
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("RIT Digital Twin - Account Verification");
            message.setText("Welcome to RIT Digital Twin!\n\n"
                    + "Please click the link below to verify your email address:\n"
                    + verificationUrl + "\n\n"
                    + "This link will expire in 24 hours.");
            
            mailSender.send(message);
            log.info("Sent verification email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}", toEmail, e);
            // In a strict prod environment, we might throw an exception, 
            // but we will just log it here so registration doesn't completely fail 
            // if SMTP is temporarily down or misconfigured.
        }
    }
}
