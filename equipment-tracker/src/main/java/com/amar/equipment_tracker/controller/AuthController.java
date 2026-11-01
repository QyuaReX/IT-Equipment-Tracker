package com.amar.equipment_tracker.controller;

import com.amar.equipment_tracker.dto.AuthRequestDTO;
import com.amar.equipment_tracker.dto.AuthResponseDTO;
import com.amar.equipment_tracker.dto.UserDTO;
import com.amar.equipment_tracker.model.Role;
import com.amar.equipment_tracker.security.JwtService;
import com.amar.equipment_tracker.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@RequestBody UserDTO userDTO) {
        // Public endpoint: never trust a client-supplied role, or anyone could self-register as ADMIN
        userDTO.setRole(Role.EMPLOYEE);
        userService.createUser(userDTO);

        AuthResponseDTO response = authenticate(userDTO.getEmail(), userDTO.getPassword());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthRequestDTO request) {
        return ResponseEntity.ok(authenticate(request.getEmail(), request.getPassword()));
    }

    private AuthResponseDTO authenticate(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        UserDetails principal = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(principal);

        return new AuthResponseDTO(token, userService.getUserByEmail(principal.getUsername()));
    }
}
