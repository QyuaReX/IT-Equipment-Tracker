package com.amar.equipment_tracker.service;

import com.amar.equipment_tracker.dto.CheckoutRequestDTO;
import com.amar.equipment_tracker.dto.CheckoutResponseDTO;
import com.amar.equipment_tracker.exception.BusinessRuleException;
import com.amar.equipment_tracker.exception.ResourceNotFoundException;
import com.amar.equipment_tracker.model.Checkout;
import com.amar.equipment_tracker.model.CheckoutStatus;
import com.amar.equipment_tracker.model.Equipment;
import com.amar.equipment_tracker.model.EquipmentStatus;
import com.amar.equipment_tracker.model.User;
import com.amar.equipment_tracker.repository.CheckoutRepository;
import com.amar.equipment_tracker.repository.EquipmentRepository;
import com.amar.equipment_tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CheckoutServiceImpl implements CheckoutService {

    private final CheckoutRepository checkoutRepository;
    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;

    @Override
    @Transactional
    public CheckoutResponseDTO checkoutEquipment(CheckoutRequestDTO request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id " + request.getUserId()));

        // Row-level lock so two concurrent requests can't check out the same item
        Equipment equipment = equipmentRepository.findByIdForUpdate(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Equipment not found with id " + request.getEquipmentId()));

        if (equipment.getStatus() != EquipmentStatus.AVAILABLE) {
            throw new BusinessRuleException(
                    "Equipment " + equipment.getId() + " is not available (current status: "
                            + equipment.getStatus() + ")");
        }

        equipment.setStatus(EquipmentStatus.CHECKED_OUT);
        equipmentRepository.save(equipment);

        Checkout checkout = Checkout.builder()
                .user(user)
                .equipment(equipment)
                .checkoutDate(LocalDateTime.now())
                .status(CheckoutStatus.ACTIVE)
                .build();

        return toDTO(checkoutRepository.save(checkout));
    }

    @Override
    @Transactional
    public CheckoutResponseDTO returnEquipment(Long checkoutId) {
        Checkout checkout = checkoutRepository.findById(checkoutId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Checkout not found with id " + checkoutId));

        if (checkout.getStatus() == CheckoutStatus.RETURNED) {
            throw new BusinessRuleException("Checkout " + checkoutId + " has already been returned");
        }

        Equipment equipment = equipmentRepository.findByIdForUpdate(checkout.getEquipment().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Equipment not found with id " + checkout.getEquipment().getId()));

        checkout.setReturnDate(LocalDateTime.now());
        checkout.setStatus(CheckoutStatus.RETURNED);

        equipment.setStatus(EquipmentStatus.AVAILABLE);
        equipmentRepository.save(equipment);

        return toDTO(checkoutRepository.save(checkout));
    }

    @Override
    @Transactional(readOnly = true)
    public CheckoutResponseDTO getActiveCheckoutByEquipment(Long equipmentId) {
        return checkoutRepository.findByEquipmentIdAndStatus(equipmentId, CheckoutStatus.ACTIVE)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No active checkout for equipment " + equipmentId));
    }

    private CheckoutResponseDTO toDTO(Checkout checkout) {
        User user = checkout.getUser();
        Equipment equipment = checkout.getEquipment();

        return CheckoutResponseDTO.builder()
                .id(checkout.getId())
                .userId(user.getId())
                .userFullName(user.getFirstName() + " " + user.getLastName())
                .equipmentId(equipment.getId())
                .equipmentName(equipment.getName())
                .equipmentSerialNumber(equipment.getSerialNumber())
                .checkoutDate(checkout.getCheckoutDate())
                .returnDate(checkout.getReturnDate())
                .status(checkout.getStatus())
                .build();
    }
}
