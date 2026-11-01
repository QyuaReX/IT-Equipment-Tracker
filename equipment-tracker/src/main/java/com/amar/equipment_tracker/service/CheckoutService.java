package com.amar.equipment_tracker.service;

import com.amar.equipment_tracker.dto.CheckoutRequestDTO;
import com.amar.equipment_tracker.dto.CheckoutResponseDTO;

public interface CheckoutService {
    CheckoutResponseDTO checkoutEquipment(CheckoutRequestDTO request);
    CheckoutResponseDTO returnEquipment(Long checkoutId);
    CheckoutResponseDTO getActiveCheckoutByEquipment(Long equipmentId);
}