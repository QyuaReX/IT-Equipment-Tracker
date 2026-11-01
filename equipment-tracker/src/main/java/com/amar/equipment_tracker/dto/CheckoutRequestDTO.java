package com.amar.equipment_tracker.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequestDTO {
    private Long userId;
    private Long equipmentId;
}
