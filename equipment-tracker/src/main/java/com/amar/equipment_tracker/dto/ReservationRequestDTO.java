package com.amar.equipment_tracker.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationRequestDTO {
    private Long equipmentId;
    private LocalDate startDate;
    private LocalDate endDate;
}