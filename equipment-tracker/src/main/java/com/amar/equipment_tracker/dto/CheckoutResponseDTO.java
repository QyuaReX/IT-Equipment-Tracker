package com.amar.equipment_tracker.dto;

import com.amar.equipment_tracker.model.CheckoutStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutResponseDTO {
    private Long id;
    private Long userId;
    private String userFullName;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentSerialNumber;
    private LocalDateTime checkoutDate;
    private LocalDateTime returnDate;
    private CheckoutStatus status;
}
