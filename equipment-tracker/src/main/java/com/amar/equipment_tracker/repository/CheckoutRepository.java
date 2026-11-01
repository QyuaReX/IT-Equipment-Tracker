package com.amar.equipment_tracker.repository;

import com.amar.equipment_tracker.model.Checkout;
import com.amar.equipment_tracker.model.CheckoutStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CheckoutRepository extends JpaRepository<Checkout, Long> {

    List<Checkout> findByUserId(Long userId);

    List<Checkout> findByUserIdAndStatus(Long userId, CheckoutStatus status);

    List<Checkout> findByEquipmentId(Long equipmentId);

    Optional<Checkout> findByEquipmentIdAndStatus(Long equipmentId, CheckoutStatus status);

    boolean existsByEquipmentIdAndStatus(Long equipmentId, CheckoutStatus status);

    @Query("select c from Checkout c join fetch c.user join fetch c.equipment where c.status = :status")
    List<Checkout> findAllByStatusWithDetails(@Param("status") CheckoutStatus status);
}