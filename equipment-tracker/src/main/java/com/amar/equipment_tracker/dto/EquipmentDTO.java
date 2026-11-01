package com.amar.equipment_tracker.dto;

import com.amar.equipment_tracker.model.EquipmentStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentDTO {
    private Long id;
    private String name;
    private String category;
    private String assetTag;
    private String serialNumber;
    private EquipmentStatus status;

    // Populated only while the item is CHECKED_OUT
    private String activeCheckoutUserName;
    private LocalDateTime activeCheckoutDate;
}