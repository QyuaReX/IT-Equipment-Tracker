package com.amar.equipment_tracker.service;

import com.amar.equipment_tracker.dto.ReservationDTO;
import com.amar.equipment_tracker.dto.ReservationRequestDTO;

public interface ReservationService {
    ReservationDTO createReservation(Long userId, ReservationRequestDTO request);
}
