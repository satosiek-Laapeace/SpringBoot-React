package com.booot.farm_craftmarket.mapper;

import org.springframework.stereotype.Component;

import com.booot.farm_craftmarket.dto.request.auth.UserRequestDto;
import com.booot.farm_craftmarket.dto.response.auth.UserResponseDto;
import com.booot.farm_craftmarket.entity.UserEntity;

@Component
public class UserMapper {
    private UserMapper() {
    }

    public static UserEntity toEntity(UserRequestDto userRequest) {
        if (userRequest == null) return null;
        UserEntity user = new UserEntity();
        user.setName(userRequest.getName());
        user.setDisplayName(userRequest.getName());
        user.setEmail(userRequest.getEmail());
        user.setPassword(userRequest.getPassword());
        user.setRole(userRequest.getRole());

        return user;
    }
    public static UserResponseDto toResponseDto(UserEntity user) {
        if (user == null) {
            return null;
        }
        UserResponseDto responseDto = new UserResponseDto();
        responseDto.setId(user.getId());
        responseDto.setName(user.getName());
        responseDto.setFullName(user.getDisplayName() == null || user.getDisplayName().isBlank()
            ? user.getName()
            : user.getDisplayName());
        responseDto.setEmail(user.getEmail());
        responseDto.setProfilePictureUrl(user.getProfilePictureUrl());
        responseDto.setRole(user.getRole());
        responseDto.setEnabled(user.isEnabled());
        responseDto.setLockTime(user.getLockTime());
        responseDto.setCreateAt(user.getCreateAt());
        responseDto.setUpdateAt(user.getUpdateAt());
        return responseDto;
    }
}
