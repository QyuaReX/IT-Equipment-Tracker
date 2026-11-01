package com.amar.equipment_tracker.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationDTO {
    private Long id;
    private Long userId;
    private String userFullName;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentAssetTag;
    private LocalDate startDate;
    private LocalDate endDate;
}
