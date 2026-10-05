package com.booot.farm_craftmarket.service.implement;

import com.booot.farm_craftmarket.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImplement implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImplement.class);

    private final JavaMailSender mailSender;
    private final String from;

    public EmailServiceImplement(JavaMailSender mailSender,
                                 @Value("${spring.mail.username}") String from) {
        this.mailSender = mailSender;
        this.from = from;
    }

    @Async
    @Override
    public void sendOtpEmail(String to, String otp, Long expiryMinutes) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject("Farm CraftMarket - Password Reset Code");
            message.setText(
                    "Your password reset code is: " + otp + "\n\n"
                            + "This code expires in " + expiryMinutes + " minutes.\n"
                            + "If you did not request this, you can ignore this email."
            );
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", to, e);
        }
    }
}