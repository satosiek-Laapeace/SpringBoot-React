package com.booot.farm_craftmarket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class ApiResponse<T> {
    boolean success;
    private String message;
    private T data;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    public static <T>ApiResponse<T> success( String message, T data) {
        return ApiResponse.<T>builder()
                .success(true).
                message(message)
                .data(data)
                .build();
    }

    public static <T>ApiResponse<T> error(String message){
        return ApiResponse.<T>builder().message(message)
                .success(false)
                .build();
    }
}
