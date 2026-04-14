package com.pokopia.tracker.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${spring.mail.username:noreply@pokopia.com}")
    private String fromEmail;

    public void sendPasswordResetEmail(String toEmail, String token) {
        try {
            String resetUrl = frontendUrl + "/reset-password?token=" + token;
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Pokopia Tracker - Password Reset");
            message.setText("Hello,\n\nYou requested a password reset for your Pokopia Tracker account.\n\n"
                + "Click the link below to reset your password:\n" + resetUrl
                + "\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.\n\n"
                + "Best regards,\nPokopia Tracker Team");
            mailSender.send(message);
            log.info("Password reset email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}", toEmail, e);
        }
    }
}
