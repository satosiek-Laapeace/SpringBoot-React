package com.booot.farm_craftmarket.security;

import com.booot.farm_craftmarket.entity.SecurityLogEntity;
import com.booot.farm_craftmarket.service.SecurityLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
@Slf4j
public class SecurityLogInterceptor implements HandlerInterceptor {

    private static final String LOGIN_PATH = "/api/auth/login";
    private static final String LOGOUT_PATH = "/api/auth/logout";
    private static final String FORGOT_PASSWORD_PATH = "/api/auth/forgot-password";
    private static final String RESET_PASSWORD_PATH = "/api/auth/reset-password";
    private static final String AUDIT_LOG_PATH = "/api/admin/security-logs";

    private final SecurityLogService securityLogService;

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception exception) {
        String path = request.getRequestURI();
        if (!path.startsWith("/api/") || "OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean authenticated = authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof UserDetails;
        boolean admin = authenticated && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);

        String eventType = eventType(path, request.getMethod(), response.getStatus(), admin, authenticated);
        if (eventType == null) {
            return;
        }

        SecurityLogEntity event = new SecurityLogEntity();
        event.setEventType(eventType);
        event.setHttpMethod(limit(request.getMethod(), 10));
        event.setRequestPath(limit(path, 300));
        event.setResponseStatus(response.getStatus());
        event.setClientIp(limit(request.getRemoteAddr(), 64));
        event.setAuthenticationType(authenticated ? "JWT_VALIDATED" : "ANONYMOUS");

        if (authenticated) {
            Object principal = authentication.getPrincipal();
            UserDetails user = (UserDetails) principal;
            event.setActorUsername(limit(user.getUsername(), 120));
            event.setActorRole(authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(authority -> authority.startsWith("ROLE_"))
                    .map(authority -> authority.substring("ROLE_".length()))
                    .sorted()
                    .reduce((first, second) -> first + "," + second)
                    .orElse(null));
            if (principal instanceof CustomUserDetailService.AppUser appUser) {
                event.setActorId(appUser.getId());
            }
        } else if (LOGIN_PATH.equals(path)) {
            event.setActorUsername(limit((String) request.getAttribute("auditActorUsername"), 120));
        }

        try {
            securityLogService.record(event);
        } catch (RuntimeException auditFailure) {
            log.error("Could not persist security log event {} for {}", eventType, path, auditFailure);
        }
    }

    private String eventType(
            String path,
            String method,
            int status,
            boolean admin,
            boolean authenticated) {
        if (LOGIN_PATH.equals(path)) {
            return status >= 200 && status < 300 ? "LOGIN_SUCCESS" : "LOGIN_FAILURE";
        }
        if (LOGOUT_PATH.equals(path)) return "LOGOUT";
        if (FORGOT_PASSWORD_PATH.equals(path)) return "PASSWORD_RESET_REQUEST";
        if (RESET_PASSWORD_PATH.equals(path)) {
            return status >= 200 && status < 300 ? "PASSWORD_RESET_COMPLETED" : "PASSWORD_RESET_FAILURE";
        }
        if (path.equals(AUDIT_LOG_PATH) || path.startsWith(AUDIT_LOG_PATH + "/")) {
            return authenticated ? "SECURITY_LOG_ACCESS" : null;
        }
        if (!authenticated) return null;
        if (admin) return "GET".equalsIgnoreCase(method) ? "ADMIN_DATA_ACCESS" : "ADMIN_ACTION";
        if ("GET".equalsIgnoreCase(method) && isSensitivePath(path)) return "SENSITIVE_DATA_ACCESS";
        return "TOKEN_AUTHENTICATED_API_ACCESS";
    }

    private boolean isSensitivePath(String path) {
        return matchesPath(path, "/api/users")
                || matchesPath(path, "/api/user")
                || matchesPath(path, "/api/addresses")
                || matchesPath(path, "/api/orders")
                || matchesPath(path, "/api/payments")
                || matchesPath(path, "/api/notifications");
    }

    private boolean matchesPath(String path, String prefix) {
        return path.equals(prefix) || path.startsWith(prefix + "/");
    }

    private String limit(String value, int maxLength) {
        if (value == null) return null;
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
