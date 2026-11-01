package com.amar.equipment_tracker.scheduler;

import com.amar.equipment_tracker.model.Equipment;
import com.amar.equipment_tracker.model.Reservation;
import com.amar.equipment_tracker.model.User;
import com.amar.equipment_tracker.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final ReservationRepository reservationRepository;
    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@equipment-tracker.local}")
    private String fromAddress;

    // Every day at 08:00 (server time zone)
    @Scheduled(cron = "0 0 8 * * *")
    public void sendReturnReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Reservation> endingTomorrow = reservationRepository.findByEndDateWithDetails(tomorrow);
        log.info("Found {} reservation(s) ending on {}", endingTomorrow.size(), tomorrow);

        for (Reservation reservation : endingTomorrow) {
            try {
                mailSender.send(buildReminder(reservation));
            } catch (MailException ex) {
                // One failed email must not stop the remaining reminders
                log.error("Could not send reminder for reservation {}", reservation.getId(), ex);
            }
        }
    }

    private SimpleMailMessage buildReminder(Reservation reservation) {
        User user = reservation.getUser();
        Equipment equipment = reservation.getEquipment();
        String tag = equipment.getAssetTag() != null ? " (" + equipment.getAssetTag() + ")" : "";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(user.getEmail());
        message.setSubject("Reminder: your reservation for " + equipment.getName() + " ends tomorrow");
        message.setText("""
                Hi %s,

                Your reservation for %s%s ends tomorrow (%s).
                Please return it on time, or contact IT if you need it for longer.

                IT Equipment Tracker
                """.formatted(user.getFirstName(), equipment.getName(), tag, reservation.getEndDate()));
        return message;
    }
}
