package com.booot.farm_craftmarket.service.implement;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.booot.farm_craftmarket.configuration.CloudService;
import com.booot.farm_craftmarket.dto.request.auth.LoginRequestDto;
import com.booot.farm_craftmarket.dto.request.auth.RegisterRequestDto;
import com.booot.farm_craftmarket.dto.request.auth.UserRequestDto;
import com.booot.farm_craftmarket.dto.response.auth.LoginResponseDto;
import com.booot.farm_craftmarket.dto.response.auth.MessageResponseDto;
import com.booot.farm_craftmarket.dto.response.auth.UserResponseDto;
import com.booot.farm_craftmarket.entity.RoleEntity;
import com.booot.farm_craftmarket.entity.UserEntity;
import com.booot.farm_craftmarket.enums.roles.RolesUser;
import com.booot.farm_craftmarket.exception.BadRequestException;
import com.booot.farm_craftmarket.exception.ResourceNotFoundException;
import com.booot.farm_craftmarket.mapper.UserMapper;
import com.booot.farm_craftmarket.repository.RoleRepository;
import com.booot.farm_craftmarket.repository.UserRepository;
import com.booot.farm_craftmarket.security.CustomUserDetailService;
import com.booot.farm_craftmarket.security.JwtService;
import com.booot.farm_craftmarket.security.TokenBlacklistService;
import com.booot.farm_craftmarket.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImplement implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailService customUserDetailService;
    private final TokenBlacklistService tokenBlacklistService;
    private final CloudService cloudService;

    @Override
    @Transactional
    public MessageResponseDto registerUser(RegisterRequestDto registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Username is already in use");
        }
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        RoleEntity buyerRole = findOrCreateRole(RolesUser.BUYER);

        UserEntity user = new UserEntity();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.getRoles().add(buyerRole);

        userRepository.save(user);
        return new MessageResponseDto("User registered successfully");
    }

    @Override
    public LoginResponseDto login(LoginRequestDto loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()));
        } catch (AuthenticationException error) {
            throw new BadCredentialsException("Invalid username or password", error);
        }

        UserDetails userDetails = customUserDetailService.loadUserByUsername(loginRequest.getUsername());
        String token = jwtService.generateToken(userDetails);
        Set<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        return new LoginResponseDto(userDetails.getUsername(), token, roles);
    }

    @Override
    @Transactional
    public UserResponseDto createUser(UserRequestDto userRequestDto) {
        if (userRequestDto.getPassword() == null || userRequestDto.getPassword().isBlank()) {
            throw new BadRequestException("Password must not be blank");
        }
        if (userRepository.existsByEmail(userRequestDto.getEmail())) {
            throw new BadRequestException("User with email " + userRequestDto.getEmail() + " is already in use");
        }
        UserEntity user = UserMapper.toEntity(userRequestDto);
        user.setPassword(passwordEncoder.encode(userRequestDto.getPassword()));
        user.getRoles().add(findOrCreateRole(RolesUser.BUYER));   // role was created but never attached before

        return UserMapper.toResponseDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponseDto updateProfilePicture(Long id, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Choose an image to upload");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new BadRequestException("Profile picture must be an image");
        }
        if (file.getSize() > 5L * 1024 * 1024) {
            throw new BadRequestException("Profile picture must be 5 MB or smaller");
        }

        UserEntity user = findUser(id);
        Map<?, ?> upload = cloudService.upload(file, "farm_craftmarket/users");
        String imageUrl = uploadValue(upload, "secure_url");
        String publicId = uploadValue(upload, "public_id");
        if (imageUrl == null || imageUrl.isBlank() || publicId == null || publicId.isBlank()) {
            throw new BadRequestException("The image service did not return a usable profile picture");
        }

        String previousPublicId = user.getProfilePicturePublicId();
        user.setProfilePictureUrl(imageUrl);
        user.setProfilePicturePublicId(publicId);
        UserResponseDto response = UserMapper.toResponseDto(userRepository.save(user));

        if (previousPublicId != null && !previousPublicId.isBlank()) {
            try {
                cloudService.delete(previousPublicId);
            } catch (RuntimeException error) {
                log.warn("Could not delete previous profile picture {}", previousPublicId, error);
            }
        }
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDto getUserById(Long id) {
        return UserMapper.toResponseDto(findUser(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public UserResponseDto updateUser(Long id, UserRequestDto userRequestDto) {
        UserEntity user = findUser(id);

        if (!user.getEmail().equalsIgnoreCase(userRequestDto.getEmail())
                && userRepository.existsByEmail(userRequestDto.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        user.setName(userRequestDto.getName());
        user.setEmail(userRequestDto.getEmail());

        if (userRequestDto.getPassword() != null && !userRequestDto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(userRequestDto.getPassword()));
        }
        return UserMapper.toResponseDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponseDto updateUserRole(Long id, RolesUser role) {
        UserEntity user = findUser(id);
        user.getRoles().clear();
        user.getRoles().add(findOrCreateRole(role));
        return UserMapper.toResponseDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponseDto setUserEnabled(Long id, boolean enabled) {
        UserEntity user = findUser(id);
        user.setEnabled(enabled);
        return UserMapper.toResponseDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponseDto unlockUser(Long id) {
        UserEntity user = findUser(id);
        user.setLockTime(null);
        return UserMapper.toResponseDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponseDto updateProfile(Long id, UserRequestDto request) {
        UserEntity user = findUser(id);
        if (!user.getEmail().equalsIgnoreCase(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        user.setDisplayName(request.getName());
        user.setEmail(request.getEmail());
        return UserMapper.toResponseDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        userRepository.delete(findUser(id));
    }

    @Override
    public void logout(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new BadRequestException("Missing or invalid Authorization header");
        }
        String token = authorizationHeader.substring(7);
        tokenBlacklistService.blacklist(token, jwtService.extractExpiration(token));
        SecurityContextHolder.clearContext();
    }

    // ---------- helpers ----------

    private UserEntity findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User with id " + id + " not found"));
    }

    private RoleEntity findOrCreateRole(RolesUser name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(new RoleEntity(name)));
    }

    private String uploadValue(Map<?, ?> upload, String key) {
        Object value = upload.get(key);
        return value instanceof String text ? text : null;
    }
}