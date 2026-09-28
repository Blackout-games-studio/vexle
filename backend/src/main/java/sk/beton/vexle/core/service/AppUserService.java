package sk.beton.vexle.core.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import sk.beton.vexle.core.dto.AppUserRegistrationDto;
import sk.beton.vexle.core.entity.AppUser;
import sk.beton.vexle.core.repository.AppUserRepository;

@Service
public class AppUserService implements UserDetailsService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AppUserService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AppUser registerUser(AppUserRegistrationDto dto) {
        if (appUserRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use.");
        }

        if (appUserRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken.");
        }

        AppUser newAppUser = new AppUser();
        newAppUser.setUsername(dto.getUsername());
        newAppUser.setEmail(dto.getEmail());
        newAppUser.setPhone("1124125");
        newAppUser.setPassword(passwordEncoder.encode(dto.getPassword()));
        newAppUser.setRole("ROLE_USER");

        return appUserRepository.save(newAppUser);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return appUserRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

}