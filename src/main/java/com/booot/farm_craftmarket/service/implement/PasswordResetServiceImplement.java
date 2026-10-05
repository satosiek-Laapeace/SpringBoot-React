package com.booot.farm_craftmarket.service.implement;

import com.booot.farm_craftmarket.dto.request.auth.ForgotPasswordRequestDto;
import com.booot.farm_craftmarket.dto.request.auth.ResetPasswordRequestDto;
import com.booot.farm_craftmarket.dto.response.auth.MessageResponseDto;
import com.booot.farm_craftmarket.entity.PasswordResetEntity;
import com.booot.farm_craftmarket.entity.UserEntity;
import com.booot.farm_craftmarket.exception.BadRequestException;
import com.booot.farm_craftmarket.repository.PasswordResetRepository;
import com.booot.farm_craftmarket.repository.UserRepository;
import com.booot.farm_craftmarket.service.EmailService;
import com.booot.farm_craftmarket.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PasswordResetServiceImplement implements PasswordResetService {

    private static final String GENERIC_MESSAGE =
            "If an account with that email exists, a verification code has been sent.";
    private static final String INVALID_OTP_MESSAGE = "Invalid or expired verification code";

    private final SecureRandom secureRandom = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private final long expiryMinutes;
    private final int maxAttempts;
    private final long resendCooldownSeconds;

    public PasswordResetServiceImplement(
            UserRepository userRepository,
            PasswordResetRepository otpRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            @Value("${app.otp.expiry-minutes}") long expiryMinutes,
            @Value("${app.otp.max-attempts}") int maxAttempts,
            @Value("${app.otp.resend-cooldown-seconds}") long resendCooldownSeconds
    ) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.expiryMinutes = expiryMinutes;
        this.maxAttempts = maxAttempts;
        this.resendCooldownSeconds = resendCooldownSeconds;
    }


    @Override
    @Transactional
    public MessageResponseDto forgotPassword(ForgotPasswordRequestDto request) {
        String email = request.getEmail().trim().toLowerCase();

        Optional<UserEntity> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return new MessageResponseDto(GENERIC_MESSAGE);
        }

        Optional<PasswordResetEntity> last = otpRepository.findTopByEmailOrderByCreatedAtDesc(email);
        if (last.isPresent()
                && last.get().getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(resendCooldownSeconds))) {
            return new MessageResponseDto(GENERIC_MESSAGE);
        }

        otpRepository.deleteAllByEmail(email);

        String otp = generateOtp();
        PasswordResetEntity entity = new PasswordResetEntity(
                email,
                passwordEncoder.encode(otp),
                LocalDateTime.now().plusMinutes(expiryMinutes)
        );
        otpRepository.save(entity);

        emailService.sendOtpEmail(email, otp, expiryMinutes);
        return new MessageResponseDto(GENERIC_MESSAGE);
    }

    @Override
    @Transactional(noRollbackFor = BadRequestException.class)
    public MessageResponseDto resetPassword(ResetPasswordRequestDto request) {
        String email = request.getEmail().trim().toLowerCase();

        PasswordResetEntity otpEntity = otpRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new BadRequestException(INVALID_OTP_MESSAGE));

        if (otpEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            otpRepository.delete(otpEntity);
            throw new BadRequestException(INVALID_OTP_MESSAGE);
        }

        if (otpEntity.getAttempts() >= maxAttempts) {
            otpRepository.delete(otpEntity);
            throw new BadRequestException("Too many attempts. Please request a new code.");
        }

        if (!passwordEncoder.matches(request.getOtp(), otpEntity.getOtpHash())) {
            otpEntity.setAttempts(otpEntity.getAttempts() + 1);
            otpRepository.save(otpEntity);
            throw new BadRequestException(INVALID_OTP_MESSAGE);
        }

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException(INVALID_OTP_MESSAGE));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otpRepository.deleteAllByEmail(email);

        return new MessageResponseDto("Password has been reset successfully");
    }

    @Scheduled(fixedRate = 3_600_000)
    @Transactional
    public void cleanupExpiredOtps() {
        otpRepository.deleteExpired(LocalDateTime.now());
    }

    private String generateOtp() {
        return String.format("%06d", secureRandom.nextInt(1_000_000));
    }
}