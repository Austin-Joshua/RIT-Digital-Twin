package com.university.erp.intelligence.tool;

import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.Classroom;
import com.university.erp.model.TimetableSlot;
import com.university.erp.repository.ClassroomRepository;
import com.university.erp.repository.TimetableSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
public class RoomUtilizationTool implements CampusTool {

    private static final int TOTAL_WEEKLY_SLOTS = 40; // 5 days * 8 periods

    private final ClassroomRepository classroomRepository;
    private final TimetableSlotRepository timetableSlotRepository;

    @Override
    public String name() {
        return "get_room_utilization";
    }

    @Override
    public String description() {
        return "Calculates weekly classroom allocation rates against the 40-slot standard to identify underutilized (<35%) and overutilized (>80%) rooms, and suggests schedule rebalancing.";
    }

    @Override
    public List<String> requiredRoles() {
        return List.of("ADMIN", "HOD", "FACULTY");
    }

    @Override
    public ToolResult execute(Map<String, Object> params, String userRole) {
        List<Classroom> classrooms = classroomRepository.findAllWithBuilding();
        List<TimetableSlot> allSlots = timetableSlotRepository.findAllWithClassroom();

        Map<Long, Long> allocatedCounts = new HashMap<>();
        for (TimetableSlot slot : allSlots) {
            if (slot.getClassroom() != null && slot.getClassroom().getId() != null) {
                Long roomId = slot.getClassroom().getId();
                allocatedCounts.put(roomId, allocatedCounts.getOrDefault(roomId, 0L) + 1L);
            }
        }

        record RoomStat(Classroom room, long slots, double utilPct, String status) {}
        List<RoomStat> stats = new ArrayList<>();

        for (Classroom c : classrooms) {
            long count = allocatedCounts.getOrDefault(c.getId(), 0L);
            double pct = Math.round(((double) count / TOTAL_WEEKLY_SLOTS) * 1000.0) / 10.0;
            String status = pct < 35.0 ? "UNDERUTILIZED" : pct > 80.0 ? "HEAVY LOAD" : "OPTIMAL";
            stats.add(new RoomStat(c, count, pct, status));
        }

        // Sort ascending by utilization to highlight lowest utilized rooms
        stats.sort((a, b) -> Double.compare(a.utilPct(), b.utilPct()));

        List<RoomStat> underutilized = stats.stream().filter(s -> s.utilPct() < 35.0).toList();
        List<RoomStat> overutilized = stats.stream().filter(s -> s.utilPct() > 80.0).toList();

        List<List<Object>> tableRows = new ArrayList<>();
        for (RoomStat s : stats) {
            String bName = s.room().getBuilding() != null ? s.room().getBuilding().getName() : "Unassigned";
            tableRows.add(List.of(
                    s.room().getName(),
                    bName,
                    s.room().getCapacity() != null ? s.room().getCapacity() : 0,
                    s.slots() + " / " + TOTAL_WEEKLY_SLOTS,
                    s.utilPct() + "%",
                    s.status()
            ));
        }

        StringBuilder rebalanceAdvice = new StringBuilder();
        if (!underutilized.isEmpty() && !overutilized.isEmpty()) {
            RoomStat low = underutilized.get(0);
            RoomStat high = overutilized.get(overutilized.size() - 1);
            rebalanceAdvice.append(String.format(
                    " Rebalance Opportunity: Move 2-3 weekly elective sessions from high-load %s (%s, %.1f%%) to underutilized %s (%s, %.1f%%) to balance air-conditioning load and corridor foot-traffic.",
                    high.room().getName(), high.room().getBuilding() != null ? high.room().getBuilding().getCode() : "", high.utilPct(),
                    low.room().getName(), low.room().getBuilding() != null ? low.room().getBuilding().getCode() : "", low.utilPct()
            ));
        }

        String answer = String.format(
                "Weekly Classroom Utilization Audit (Baseline: 40 weekly slots): %d of %d classrooms are UNDERUTILIZED (<35%% allocation), and %d are under HEAVY LOAD (>80%% allocation). Lowest utilization: %s (%s slots, %.1f%%).%s (Derived from weekly timetable grid).",
                underutilized.size(), classrooms.size(), overutilized.size(),
                stats.isEmpty() ? "None" : stats.get(0).room().getName(),
                stats.isEmpty() ? "0" : stats.get(0).slots(),
                stats.isEmpty() ? 0.0 : stats.get(0).utilPct(),
                rebalanceAdvice
        );

        return ToolResult.builder(name())
                .answer(answer)
                .sourceClass(SourceClass.ESTIMATED)
                .because("Derived from total active timetable allocations per room against the standard 40-slot academic week.")
                .addCard("Underutilized Rooms", underutilized.size(), "<35% load", "OPPORTUNITY", "arrow-down")
                .addCard("Optimal Load Rooms", classrooms.size() - underutilized.size() - overutilized.size(), "35-80% load", "OPTIMAL", "check-circle")
                .addCard("Heavy Load Rooms", overutilized.size(), ">80% load", "ALERT", "alert-triangle")
                .addCard("Lowest Utilization", stats.isEmpty() ? "0%" : stats.get(0).utilPct() + "%", stats.isEmpty() ? "" : stats.get(0).room().getName(), "MIN", "trending-down")
                .table(List.of("Classroom", "Building", "Capacity", "Slots Booked", "Utilization %", "Status"), tableRows)
                .addAction("VIEW", "Classroom Allocation", "/classrooms/allocation")
                .addAction("SIMULATE", "Run Utilization Scenario", "/simulations")
                .addCitation("Campus Space Optimization Manual, §3.2", "§3.2", "Target utilization 65-80%. Below 35% is underutilized.")
                .build();
    }
}
