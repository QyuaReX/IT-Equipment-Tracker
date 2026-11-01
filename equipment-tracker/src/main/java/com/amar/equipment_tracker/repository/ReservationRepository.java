package com.amar.equipment_tracker.repository;

import com.amar.equipment_tracker.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // Two inclusive date ranges overlap when each starts on or before the other ends
    @Query("""
            select r from Reservation r
            where r.equipment.id = :equipmentId
              and r.startDate <= :endDate
              and r.endDate >= :startDate
            order by r.startDate
            """)
    List<Reservation> findOverlapping(@Param("equipmentId") Long equipmentId,
                                      @Param("startDate") LocalDate startDate,
                                      @Param("endDate") LocalDate endDate);

    // Fetch joins because the scheduler runs outside a transaction (no lazy loading)
    @Query("""
            select r from Reservation r
            join fetch r.user
            join fetch r.equipment
            where r.endDate = :date
            """)
    List<Reservation> findByEndDateWithDetails(@Param("date") LocalDate date);
}
