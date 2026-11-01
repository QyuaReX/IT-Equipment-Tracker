package com.amar.equipment_tracker.service;

import com.amar.equipment_tracker.dto.EquipmentDTO;
import com.amar.equipment_tracker.exception.BusinessRuleException;
import com.amar.equipment_tracker.exception.ResourceNotFoundException;
import com.amar.equipment_tracker.model.Checkout;
import com.amar.equipment_tracker.model.CheckoutStatus;
import com.amar.equipment_tracker.model.Equipment;
import com.amar.equipment_tracker.model.EquipmentStatus;
import com.amar.equipment_tracker.model.User;
import com.amar.equipment_tracker.repository.CheckoutRepository;
import com.amar.equipment_tracker.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EquipmentServiceImpl implements EquipmentService {

    private static final String ASSET_TAG_PREFIX = "EQ-";
    // No 0/O or 1/I, so tags stay readable on printed labels
    private static final String ASSET_TAG_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int ASSET_TAG_LENGTH = 6;
    private static final int MAX_TAG_ATTEMPTS = 10;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final EquipmentRepository equipmentRepository;
    private final CheckoutRepository checkoutRepository;

    @Override
    @Transactional
    public EquipmentDTO createEquipment(EquipmentDTO dto) {
        // Blank means "no serial number"; storing "" would collide on the unique constraint
        String serialNumber = normalize(dto.getSerialNumber());

        if (serialNumber != null && equipmentRepository.existsBySerialNumber(serialNumber)) {
            throw new BusinessRuleException(
                    "Equipment with serial number '" + serialNumber + "' already exists");
        }

        Equipment equipment = Equipment.builder()
                .name(dto.getName())
                .category(dto.getCategory())
                .assetTag(generateUniqueAssetTag())
                .serialNumber(serialNumber)
                .status(dto.getStatus() != null ? dto.getStatus() : EquipmentStatus.AVAILABLE)
                .build();

        return toDTO(equipmentRepository.save(equipment), null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentDTO> getAllEquipment() {
        // One query for all active checkouts, instead of one per checked-out item
        Map<Long, Checkout> activeByEquipmentId = checkoutRepository
                .findAllByStatusWithDetails(CheckoutStatus.ACTIVE).stream()
                .collect(Collectors.toMap(
                        checkout -> checkout.getEquipment().getId(),
                        Function.identity(),
                        (first, second) -> first));

        return equipmentRepository.findAll().stream()
                .map(equipment -> toDTO(
                        equipment,
                        equipment.getStatus() == EquipmentStatus.CHECKED_OUT
                                ? activeByEquipmentId.get(equipment.getId())
                                : null))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EquipmentDTO getEquipmentById(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id " + id));

        Checkout activeCheckout = equipment.getStatus() == EquipmentStatus.CHECKED_OUT
                ? checkoutRepository.findByEquipmentIdAndStatus(id, CheckoutStatus.ACTIVE).orElse(null)
                : null;

        return toDTO(equipment, activeCheckout);
    }

    private String generateUniqueAssetTag() {
        for (int attempt = 0; attempt < MAX_TAG_ATTEMPTS; attempt++) {
            String tag = ASSET_TAG_PREFIX + randomSuffix();
            if (!equipmentRepository.existsByAssetTag(tag)) {
                return tag;
            }
        }
        throw new IllegalStateException("Could not generate a unique asset tag");
    }

    private String randomSuffix() {
        StringBuilder suffix = new StringBuilder(ASSET_TAG_LENGTH);
        for (int i = 0; i < ASSET_TAG_LENGTH; i++) {
            suffix.append(ASSET_TAG_ALPHABET.charAt(RANDOM.nextInt(ASSET_TAG_ALPHABET.length())));
        }
        return suffix.toString();
    }

    private String normalize(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    private EquipmentDTO toDTO(Equipment equipment, Checkout activeCheckout) {
        EquipmentDTO dto = EquipmentDTO.builder()
                .id(equipment.getId())
                .name(equipment.getName())
                .category(equipment.getCategory())
                .assetTag(equipment.getAssetTag())
                .serialNumber(equipment.getSerialNumber())
                .status(equipment.getStatus())
                .build();

        if (activeCheckout != null) {
            User user = activeCheckout.getUser();
            dto.setActiveCheckoutUserName(user.getFirstName() + " " + user.getLastName());
            dto.setActiveCheckoutDate(activeCheckout.getCheckoutDate());
        }

        return dto;
    }
}