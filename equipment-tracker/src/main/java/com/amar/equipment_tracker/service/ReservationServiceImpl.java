package com.amar.equipment_tracker.service;

import com.amar.equipment_tracker.dto.ReservationDTO;
import com.amar.equipment_tracker.dto.ReservationRequestDTO;
import com.amar.equipment_tracker.exception.BusinessRuleException;
import com.amar.equipment_tracker.exception.ResourceNotFoundException;
import com.amar.equipment_tracker.model.Equipment;
import com.amar.equipment_tracker.model.Reservation;
import com.amar.equipment_tracker.model.User;
import com.amar.equipment_tracker.repository.EquipmentRepository;
import com.amar.equipment_tracker.repository.ReservationRepository;
import com.amar.equipment_tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;

    @Override
    @Transactional
    public ReservationDTO createReservation(Long userId, ReservationRequestDTO request) {
        LocalDate start = request.getStartDate();
        LocalDate end = request.getEndDate();
        validateDates(start, end);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));

        // Row lock: two concurrent requests for the same item can't both pass the overlap check
        Equipment equipment = equipmentRepository.findByIdForUpdate(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Equipment not found with id " + request.getEquipmentId()));

        List<Reservation> overlapping = reservationRepository.findOverlapping(equipment.getId(), start, end);
        if (!overlapping.isEmpty()) {
            Reservation conflict = overlapping.get(0);
            throw new BusinessRuleException(
                    "'" + equipment.getName() + "' is already reserved from "
                            + conflict.getStartDate() + " to " + conflict.getEndDate());
        }

        Reservation reservation = Reservation.builder()
                .user(user)
                .equipment(equipment)
                .startDate(start)
                .endDate(end)
                .build();

        return toDTO(reservationRepository.save(reservation));
    }

    private void validateDates(LocalDate start, LocalDate end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }
        if (!start.isBefore(end)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }
        if (start.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Start date cannot be in the past");
        }
    }

    private ReservationDTO toDTO(Reservation reservation) {
        User user = reservation.getUser();
        Equipment equipment = reservation.getEquipment();

        return ReservationDTO.builder()
                .id(reservation.getId())
                .userId(user.getId())
                .userFullName(user.getFirstName() + " " + user.getLastName())
                .equipmentId(equipment.getId())
                .equipmentName(equipment.getName())
                .equipmentAssetTag(equipment.getAssetTag())
                .startDate(reservation.getStartDate())
                .endDate(reservation.getEndDate())
                .build();
    }
}
