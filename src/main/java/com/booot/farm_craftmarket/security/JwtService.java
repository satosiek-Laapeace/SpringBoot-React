package com.booot.farm_craftmarket.security;

import com.booot.farm_craftmarket.entity.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", userDetails.getAuthorities()
                .stream().map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet()));

        return Jwts.builder()
                .claims(claims).subject(userDetails.getUsername())
                .issuedAt(new Date())
                .signWith(signingKey())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .compact();
    }

    public String generateToken(UserEntity user) {
        Map<String, Object> claims = new HashMap<>();

        claims.put("roles", user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet()));

        return Jwts.builder()
                .claims(claims).subject(user.getName())
                .issuedAt(new Date()).signWith(signingKey())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaims(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaims(token, Claims::getExpiration);
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    public boolean isValidToken(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public <T> T extractClaims(String token, Function<Claims, T>  claimsResolver) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey())
                .build().parseSignedClaims(token)
                .getPayload();
        return claimsResolver.apply(claims);
    }
}
