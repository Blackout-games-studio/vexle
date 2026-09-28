package sk.beton.vexle.core.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import sk.beton.vexle.core.dto.AppUserLoginDto;
import sk.beton.vexle.core.dto.AppUserRegistrationDto;
import sk.beton.vexle.core.security.JwtService;
import sk.beton.vexle.core.service.AppUserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserService appUserService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(AppUserService appUserService, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.appUserService = appUserService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody AppUserRegistrationDto dto) {
        try {
            appUserService.registerUser(dto);
            UserDetails userDetails = appUserService.loadUserByUsername(dto.getUsername());
            String jwtToken = jwtService.generateToken(userDetails);
            return ResponseEntity.ok(jwtToken);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/check")
    public ResponseEntity<String> checkApi() {
        return ResponseEntity.status(HttpStatus.OK).body("API responded successfully");
    }


    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody AppUserLoginDto dto) {
        try {
            // Verify credentials
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwtToken = jwtService.generateToken(userDetails);

            return ResponseEntity.ok().body(jwtToken);

        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
    }

}