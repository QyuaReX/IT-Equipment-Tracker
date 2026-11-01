package com.amar.equipment_tracker.controller;

import com.amar.equipment_tracker.dto.CheckoutRequestDTO;
import com.amar.equipment_tracker.dto.CheckoutResponseDTO;
import com.amar.equipment_tracker.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkouts")
@RequiredArgsConstructor
public class CheckoutController {

    private final CheckoutService checkoutService;

    @PostMapping
    public ResponseEntity<CheckoutResponseDTO> checkoutEquipment(@RequestBody CheckoutRequestDTO request) {
        CheckoutResponseDTO response = checkoutService.checkoutEquipment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<CheckoutResponseDTO> returnEquipment(@PathVariable Long id) {
        return ResponseEntity.ok(checkoutService.returnEquipment(id));
    }

    @GetMapping("/active")
    public ResponseEntity<CheckoutResponseDTO> getActiveCheckout(@RequestParam Long equipmentId) {
        return ResponseEntity.ok(checkoutService.getActiveCheckoutByEquipment(equipmentId));
    }
}