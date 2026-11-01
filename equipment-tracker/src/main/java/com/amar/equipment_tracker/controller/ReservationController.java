package com.amar.equipment_tracker.controller;

import com.amar.equipment_tracker.dto.ReservationDTO;
import com.amar.equipment_tracker.dto.ReservationRequestDTO;
import com.amar.equipment_tracker.model.User;
import com.amar.equipment_tracker.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    // The principal is the authenticated User entity placed there by JwtAuthenticationFilter
    @PostMapping
    public ResponseEntity<ReservationDTO> createReservation(
            @AuthenticationPrincipal User currentUser,
            @RequestBody ReservationRequestDTO request) {

        ReservationDTO created = reservationService.createReservation(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}