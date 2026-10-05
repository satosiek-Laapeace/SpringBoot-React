package com.booot.farm_craftmarket.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.booot.farm_craftmarket.dto.request.auth.LoginRequestDto;
import com.booot.farm_craftmarket.dto.request.auth.RegisterRequestDto;
import com.booot.farm_craftmarket.dto.request.auth.UserRequestDto;
import com.booot.farm_craftmarket.dto.response.auth.LoginResponseDto;
import com.booot.farm_craftmarket.dto.response.auth.MessageResponseDto;
import com.booot.farm_craftmarket.dto.response.auth.UserResponseDto;
import com.booot.farm_craftmarket.enums.roles.RolesUser;

public interface UserService {

    MessageResponseDto registerUser(RegisterRequestDto registerRequest);

    LoginResponseDto login(LoginRequestDto loginRequest);

    UserResponseDto createUser(UserRequestDto userRequestDto);

    UserResponseDto getUserById(Long id);

    List<UserResponseDto> getAllUsers();

    UserResponseDto updateUser(Long id, UserRequestDto userRequestDto);

    UserResponseDto updateUserRole(Long id, RolesUser role);

    UserResponseDto setUserEnabled(Long id, boolean enabled);

    UserResponseDto unlockUser(Long id);

    UserResponseDto updateProfile(Long id, UserRequestDto request);

    UserResponseDto updateProfilePicture(Long id, MultipartFile file);

    void deleteUser(Long id);

    void logout(String authorizationHeader);
}
