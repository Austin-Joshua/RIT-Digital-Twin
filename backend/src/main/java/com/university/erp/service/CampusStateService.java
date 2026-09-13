package com.university.erp.service;

import com.university.erp.intelligence.CampusStateNotice;
import com.university.erp.intelligence.EnergyFormula;
import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.TimetableSlot;
import com.university.erp.repository.TimetableSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class CampusStateService {

    public static final String TOPIC = "/topic/campus/state";
    private static final ZoneId CAMPUS = ZoneId.of("Asia/Kolkata");

    private final CampusCommandService campusCommandService;
    private final TimetableSlotRepository timetableSlotRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final CampusAlertService campusAlertService;
    private final SimulatedSourceService simulatedSourceService;

    private final AtomicLong revision = new AtomicLong();
    private final Deque<Map<String, Object>> events = new ArrayDeque<>();
    private volatile String windowKey = "";
    private volatile Map<String, Object> current;

    public Map<String, Object> current() {
        Map<String, Object> snapshot = current;
        if (snapshot == null) {
            return rebuild("record", SourceClass.ESTIMATED.name(), "Initial campus record. Not a live sensor feed.", false);
        }
        return snapshot;
    }

    @Scheduled(fixedDelay = 20000, initialDelay = 20000)
    public void publishIfWindowChanged() {
        String key = windowKey();
        if (key.equals(windowKey) && current != null) {
            return;
        }
        rebuild("timetable-window", SourceClass.ESTIMATED.name(),
                "A class slot started or ended on the timetable. This is not a people counter.", true);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onCommitted(CampusStateNotice notice) {
        apply(notice, true);
    }

    public void apply(CampusStateNotice notice, boolean publish) {
        String source = notice.source() == null ? SourceClass.ESTIMATED.name() : notice.source();
        rebuild(notice.kind(), source, notice.because(), publish);
    }

    private synchronized Map<String, Object> rebuild(String kind, String source, String because, boolean publish) {
        Map<String, Object> command = campusCommandService.snapshot();
        Map<String, Object> envelope = envelope(command, kind, source, because);
        windowKey = windowKey();
        current = envelope;
        if (publish) {
            messagingTemplate.convertAndSend(TOPIC, envelope);
        }
        return envelope;
    }

    private Map<String, Object> envelope(Map<String, Object> command, String kind, String source, String because) {
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("kind", kind);
        event.put("source", source);
        event.put("because", because);
        event.put("at", LocalDateTime.now(CAMPUS).toString());
        synchronized (events) {
            events.addFirst(event);
            while (events.size() > 8) {
                events.removeLast();
            }
        }

        Object transport = command.get("indicators") instanceof Map<?, ?> indicators ? indicators.get("transportRoutes") : null;
        Map<String, Object> energy = energy(command);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("revision", revision.incrementAndGet());
        body.put("source", source);
        body.put("because", because);
        body.put("reason", kind);
        body.put("stream", SourceClass.ESTIMATED.name());
        body.put("streamBecause", "Socket updates follow timetable windows and the simulated occupancy curve. No sensor is connected.");
        body.put("transport", transportStatus(transport));
        body.put("energy", energy);
        body.put("events", List.copyOf(events));
        body.put("command", command);
        body.put("simulatedSources", simulatedSourceService.snapshot());
        body.put("alertCenter", campusAlertService.center(command, false));
        return body;
    }

    private static Map<String, Object> energy(Map<String, Object> command) {
        double sum = 0;
        boolean any = false;
        Object buildings = command.get("buildings");
        if (buildings instanceof List<?> rows) {
            for (Object row : rows) {
                if (row instanceof Map<?, ?> building && building.get("energyKw") instanceof Number number) {
                    sum += number.doubleValue();
                    any = true;
                }
            }
        }
        Map<String, Object> energy = new LinkedHashMap<>();
        energy.put("demandKw", any ? Math.round(sum * 10.0) / 10.0 : null);
        energy.put("source", any ? SourceClass.SIMULATED.name() : null);
        energy.put("because", any
                ? EnergyFormula.BECAUSE + " Campus total is the sum of buildings that have a stored base load."
                : EnergyFormula.UNAVAILABLE);
        return energy;
    }

    private static Map<String, Object> transportStatus(Object indicator) {
        Map<String, Object> transport = new LinkedHashMap<>();
        transport.put("live", false);
        transport.put("routes", indicator instanceof Map<?, ?> row ? row.get("value") : null);
        transport.put("source", SourceClass.ESTIMATED.name());
        transport.put("because", "Route directory size. Clock progress along stored stop times is under simulated sources and is not GPS.");
        return transport;
    }

    private String windowKey() {
        LocalDateTime now = LocalDateTime.now(CAMPUS);
        List<Long> active = new ArrayList<>();
        for (TimetableSlot slot : timetableSlotRepository.findByDayOfWeekIgnoreCase(now.getDayOfWeek().name())) {
            if (contains(slot, now.toLocalTime()) && slot.getId() != null) {
                active.add(slot.getId());
            }
        }
        active.sort((left, right) -> Long.compare(left, right));
        return now.toLocalDate() + ":" + active + ":" + simulatedSourceService.phaseKey();
    }

    private static boolean contains(TimetableSlot slot, LocalTime clock) {
        LocalTime start = CampusCommandService.parseTime(slot.getStartTime());
        LocalTime end = CampusCommandService.parseTime(slot.getEndTime());
        return start != null && end != null && !clock.isBefore(start) && clock.isBefore(end);
    }
}
