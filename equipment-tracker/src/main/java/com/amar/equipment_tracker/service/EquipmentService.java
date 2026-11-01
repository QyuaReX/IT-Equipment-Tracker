package com.amar.equipment_tracker.service;

import com.amar.equipment_tracker.dto.EquipmentDTO;

import java.util.List;

public interface EquipmentService {
    EquipmentDTO createEquipment(EquipmentDTO equipmentDTO);
    List<EquipmentDTO> getAllEquipment();
    EquipmentDTO getEquipmentById(Long id);
}
