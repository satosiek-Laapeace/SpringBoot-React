package com.booot.farm_craftmarket.service.implement;

import com.booot.farm_craftmarket.dto.request.auth.GoogleLoginRequestDto;
import com.booot.farm_craftmarket.dto.request.auth.GoogleRegisterRequestDto;
import com.booot.farm_craftmarket.dto.response.auth.LoginResponseDto;
import com.booot.farm_craftmarket.entity.RoleEntity;
import com.booot.farm_craftmarket.entity.UserEntity;
import com.booot.farm_craftmarket.enums.roles.AuthProvider;
import com.booot.farm_craftmarket.enums.roles.RolesUser;
import com.booot.farm_craftmarket.exception.BadRequestException;
import com.booot.farm_craftmarket.repository.RoleRepository;
import com.booot.farm_craftmarket.repository.UserRepository;
import com.booot.farm_craftmarket.security.CustomUserDetailService;
import com.booot.farm_craftmarket.security.GoogleTokenVerifier;
import com.booot.farm_craftmarket.security.GoogleTokenVerifier.GoogleUserInfo;
import com.booot.farm_craftmarket.security.JwtService;
import com.booot.farm_craftmarket.service.GoogleAuthService;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GoogleAuthServiceImplement implements GoogleAuthService {

    private final GoogleTokenVerifier googleTokenVerifier;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomUserDetailService customUserDetailService;
    private final JwtService jwtService;
    private final SecureRandom random = new SecureRandom();

    public GoogleAuthServiceImplement(
            GoogleTokenVerifier googleTokenVerifier,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            CustomUserDetailService customUserDetailService,
            JwtService jwtService
    ) {
        this.googleTokenVerifier = googleTokenVerifier;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.customUserDetailService = customUserDetailService;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional
    public LoginResponseDto loginWithGoogle(GoogleLoginRequestDto request) {
        GoogleUserInfo info = googleTokenVerifier.verify(request.getIdToken());
        String email = info.email().trim().toLowerCase();

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException(
                        "No account found for this Google email. Please register first."));
        if (user.getProviderId() != null && !user.getProviderId().equals(info.googleId())) {
            throw new BadRequestException("This email is linked to a different Google account");
        }
        if (user.getProviderId() == null) {
            user.setProviderId(info.googleId());
            userRepository.save(user);
        }

        return buildLoginResponse(user);
    }
    @Override
    @Transactional
    public LoginResponseDto registerWithGoogle(GoogleRegisterRequestDto request) {
        GoogleUserInfo info = googleTokenVerifier.verify(request.getIdToken());
        String email = info.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email already exists. Please log in instead.");
        }

        RolesUser roleName = request.getRole() == null ? RolesUser.BUYER : request.getRole();
        if (roleName == RolesUser.ADMIN) {
            throw new BadRequestException("Invalid role");
        }

        RoleEntity role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new RoleEntity(roleName)));

        UserEntity user = new UserEntity();
        user.setUsername(generateUniqueUsername(email));
        user.setEmail(email);
        user.setProvider(AuthProvider.GOOGLE);
        user.setProviderId(info.googleId());
        user.setPassword(passwordEncoder.encode(UUID.randomUUID() + "Aa1!" + UUID.randomUUID()));
        user.setRoles(new HashSet<>(Set.of(role)));

        userRepository.save(user);
        return buildLoginResponse(user);
    }


    private LoginResponseDto buildLoginResponse(UserEntity user) {
        UserDetails userDetails = customUserDetailService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

        Set<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        return new LoginResponseDto(userDetails.getUsername(), token, roles);
    }

    private String generateUniqueUsername(String email) {
        String base = email.substring(0, email.indexOf('@')).replaceAll("[^a-zA-Z0-9_]", "");
        if (base.isBlank()) {
            base = "user";
        }
        String username = base;
        while (userRepository.existsByUsername(username)) {
            username = base + (1000 + random.nextInt(9000));
        }
        return username;
    }
}