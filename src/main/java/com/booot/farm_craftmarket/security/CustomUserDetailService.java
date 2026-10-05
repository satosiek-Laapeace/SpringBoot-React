package com.booot.farm_craftmarket.security;

import com.booot.farm_craftmarket.entity.UserEntity;
import com.booot.farm_craftmarket.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with username: " + username));

        Collection<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> role.getName().name())
                .map(name -> name.startsWith("ROLE_") ? name : "ROLE_" + name)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());

        return new AppUser(user.getId(), user.getUsername(), user.getPassword(),
                user.isEnabled(), authorities);
    }

    public static class AppUser extends User {
        private final Long id;

        public AppUser(Long id, String username, String password,
                       boolean enabled, Collection<? extends GrantedAuthority> authorities) {
            super(username, password, enabled, true, true, true, authorities);
            this.id = id;
        }

        public Long getId() {
            return id;
        }
    }
}