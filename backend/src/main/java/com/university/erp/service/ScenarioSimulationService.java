package com.university.erp.service;

import com.university.erp.intelligence.CampusStateNotice;
import com.university.erp.intelligence.EnergyFormula;
import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.Building;
import com.university.erp.model.Classroom;
import com.university.erp.model.DigitalTwinMetrics;
import com.university.erp.model.TimetableSlot;
import com.university.erp.model.TransportRoute;
import com.university.erp.repository.BuildingRepository;
import com.university.erp.repository.CampusRecordQuery;
import com.university.erp.repository.ClassroomRepository;
import com.university.erp.repository.DigitalTwinMetricsRepository;
import com.university.erp.repository.TimetableSlotRepository;
import com.university.erp.repository.TransportRouteRepository;
import com.university.erp.util.ErpException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ScenarioSimulationService {

    private static final ZoneId CAMPUS = ZoneId.of("Asia/Kolkata");
    private static final int WEEKLY_SLOTS = 40;

    private final ClassroomRepository classroomRepository;
    private final BuildingRepository buildingRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final CampusRecordQuery campusRecordQuery;
    private final TransportRouteRepository transportRouteRepository;
    private final DigitalTwinMetricsRepository metricsRepository;
    private final ApplicationEventPublisher events;

    public Map<String, Object> catalog() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("source", SourceClass.SIMULATED.name());
        body.put("replacesCampusState", false);
        body.put("because", "Presets fill the same timetable, room, energy-formula, and route-seat levers. They do not start a second model.");
        body.put("presets", List.of(
                preset("intake-up", "Student intake +20%", "More students in sections that already have a timetable slot.",
                        Map.of("intakePercent", 20)),
                preset("new-block", "Open new classroom block", "Adds assumed rooms and seats. They are not placed on the campus map and do not move any class.",
                        Map.of("extraClassrooms", 5, "seatsPerNewClassroom", 60)),
                preset("bus-down", "Reduce bus capacity", "Lowers stored route seat totals. Rider counts are used only when a route already stores them.",
                        Map.of("busCapacityPercent", -20)),
                preset("bus-up", "Increase bus capacity", "Raises stored route seat totals. This is not a live vehicle position.",
                        Map.of("busCapacityPercent", 20)),
                preset("hvac", "Increase HVAC efficiency", "Reduces only the class portion of the stored energy formula. Not a meter saving.",
                        Map.of("hvacEfficiencyPercent", 15)),
                preset("density", "Change timetable density", "Assumes more or fewer classes on the stored weekly grid. It does not rewrite the timetable.",
                        Map.of("timetableLoadPercent", 10)),
                preset("utilization", "Increase classroom utilization", "Uses the same weekly-grid lever as timetable density, so the two are not applied twice.",
                        Map.of("timetableLoadPercent", 15))
        ));
        body.put("unsupported", List.of(Map.of(
                "id", "parking",
                "label", "Add parking capacity",
                "because", "No parking inventory is stored, so this lab does not invent spaces or occupancy."
        )));
        return body;
    }

    @Transactional
    public Map<String, Object> simulate(Map<String, Object> request) {
        return run(request, true);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> preview(Map<String, Object> request) {
        return run(request, false);
    }

    private Map<String, Object> run(Map<String, Object> request, boolean persist) {
        List<Map<String, Object>> inputs = readScenarios(request);
        if (inputs.size() > 3) {
            throw new ErpException.InvalidOperationException("Compare at most three scenarios.");
        }
        Context context = context();
        Picture current = picture(context, Adjustments.none());
        List<Map<String, Object>> scenarios = new ArrayList<>();
        List<Picture> pictures = new ArrayList<>();
        List<Double> peopleFactors = new ArrayList<>();
        for (int i = 0; i < inputs.size(); i++) {
            Adjustments adjustments = Adjustments.from(inputs.get(i), context.enrolled);
            Object rawName = inputs.get(i).get("name") != null ? inputs.get(i).get("name") : inputs.get(i).get("scenarioName");
            String name = name(rawName, i);
            Picture simulated = picture(context, adjustments);
            pictures.add(simulated);
            peopleFactors.add(1 + adjustments.intakePercent / 100.0);
            scenarios.add(scenarioBody(name, adjustments, current, simulated));
            if (persist) {
                store(name);
            }
        }
        if (!scenarios.isEmpty() && persist) {
            events.publishEvent(new CampusStateNotice("scenario", SourceClass.SIMULATED.name(),
                    "A simulation was stored as a scenario. It does not replace the timetable or campus state."));
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("source", SourceClass.SIMULATED.name());
        body.put("label", "SIMULATED");
        body.put("replacesCampusState", false);
        body.put("because", "Current figures are the timetable, stored rooms, the energy formula, and route seats. Simulated figures apply only the levers you set. This is not the live campus.");
        body.put("window", context.window);
        body.put("current", current.toMap());
        body.put("scenarios", scenarios);
        body.put("buildings", buildings(context, peopleFactors, scenarioNames(scenarios)));
        body.put("hours", hours(context, peopleFactors, scenarioNames(scenarios)));
        body.put("recommendation", recommend(scenarios, pictures, current));
        body.put("unsupported", catalog().get("unsupported"));
        return body;
    }

    /** Older callers passed an extra headcount. It is converted to a percent of enrolled students. */
    @Transactional
    public Map<String, Object> runWhatIfScenario(String scenarioName, int additionalStudentIntake) {
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("name", scenarioName);
        request.put("intakeAdjustment", additionalStudentIntake);
        return simulate(request);
    }

    private void store(String name) {
        metricsRepository.save(DigitalTwinMetrics.builder()
                .metricType("SCENARIO_RUN")
                .locationCode("CAMPUS")
                .value(1d)
                .unit("run")
                .timestamp(LocalDateTime.now(CAMPUS))
                    .isSimulated(true)
                .sourceClass(SourceClass.SIMULATED)
                .scenarioName(name)
                .build());
    }

    private Context context() {
        LocalDateTime now = LocalDateTime.now(CAMPUS);
        Map<String, Long> sections = new LinkedHashMap<>();
        long enrolled = 0;
        for (Object[] row : campusRecordQuery.countStudentsBySection()) {
            if (row[0] != null && row[1] instanceof Number number) {
                sections.put(String.valueOf(row[0]), number.longValue());
                enrolled += number.longValue();
            }
        }
        List<Classroom> rooms = classroomRepository.findAll();
        List<Building> buildings = buildingRepository.findAll();
        List<TimetableSlot> today = timetableSlotRepository.findByDayOfWeekIgnoreCase(now.getDayOfWeek().name());
        List<TimetableSlot> week = timetableSlotRepository.findAllWithClassroom();
        List<TransportRoute> routes = transportRouteRepository.findAll();
        Window window = window(today, sections, now.toLocalTime());
        return new Context(sections, enrolled, rooms, buildings, today, week, routes, window.slots, window.body);
    }

    private Window window(List<TimetableSlot> today, Map<String, Long> sections, LocalTime clock) {
        List<TimetableSlot> active = today.stream().filter(slot -> contains(slot, clock)).toList();
        if (!active.isEmpty()) {
            return new Window(active, Map.of(
                    "label", "In progress",
                    "because", "Classes whose stored start and end contain the campus clock. Not a door count."
            ));
        }
        Map<String, List<TimetableSlot>> byHour = new LinkedHashMap<>();
        for (TimetableSlot slot : today) {
            if (slot.getClassroom() == null || CampusCommandService.parseTime(slot.getStartTime()) == null) {
                continue;
            }
            byHour.computeIfAbsent(hour(slot), key -> new ArrayList<>()).add(slot);
        }
        List<TimetableSlot> busiest = byHour.values().stream()
                .max(Comparator.comparingLong((List<TimetableSlot> slots) -> students(slots, sections, 1))
                        .thenComparingInt(slots -> slots.size()))
                .orElse(List.of());
        String label = busiest.isEmpty() ? "No timetable today" : "Busiest stored hour " + hour(busiest.get(0));
        String because = busiest.isEmpty()
                ? "No class slots are stored for today, so crowd and occupancy stay empty."
                : "No class is in progress. The comparison uses the busiest stored hour today, not a live count.";
        return new Window(busiest, Map.of("label", label, "because", because));
    }

    private Picture picture(Context context, Adjustments adjustments) {
        double people = 1 + adjustments.intakePercent / 100.0;
        double load = 1 + adjustments.timetableLoadPercent / 100.0;
        double hvac = 1 - adjustments.hvacEfficiencyPercent / 100.0;
        List<SlotLoad> window = loads(context.windowSlots, context.sections, people);
        long windowStudents = window.stream().mapToLong(slot -> slot.students).sum();
        long windowSeats = window.stream().mapToLong(slot -> slot.seats).sum();
        long overflow = window.stream().filter(slot -> slot.density != null && slot.density > 1).count();
        double crowd = window.stream().filter(slot -> slot.density != null).mapToDouble(slot -> slot.density).average().orElse(Double.NaN);

        long storedSeats = context.rooms.stream().mapToLong(room -> room.getCapacity() == null ? 0 : room.getCapacity()).sum();
        long extraSeats = (long) adjustments.extraClassrooms * adjustments.seatsPerNewClassroom;
        long campusSeats = storedSeats + extraSeats;
        long shortfall = Math.max(0, windowStudents - campusSeats);

        long allocated = context.week.stream().filter(slot -> slot.getClassroom() != null).count();
        double simulatedAllocated = Math.max(0, allocated * load);
        int roomCount = context.rooms.size() + adjustments.extraClassrooms;
        Double utilization = roomCount == 0 ? null : round(simulatedAllocated * 100.0 / (roomCount * WEEKLY_SLOTS));

        Double energy = energy(context.buildings, context.windowSlots.size() * load, hvac);
        TransportPicture transport = transport(context.routes, adjustments, people);

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("occupancy", metric("Occupancy", windowSeats == 0 ? null : round(windowStudents * 100.0 / windowSeats), "%",
                "Scheduled students in this hour divided by the seats of the rooms those classes already use. New rooms are not assigned into the hour.",
                SourceClass.ESTIMATED));
        metrics.put("crowd", metric("Crowd", Double.isNaN(crowd) ? null : round(crowd * 100), "%",
                "Average section size against room capacity for this hour. Intake changes the section size. New rooms do not move a class.",
                SourceClass.ESTIMATED));
        metrics.put("overflowRooms", metric("Rooms over capacity", overflow, "rooms",
                "Scheduled rooms whose section size exceeds stored capacity after the intake change.",
                SourceClass.ESTIMATED));
        metrics.put("classrooms", metric("Classrooms", roomCount, "rooms",
                adjustments.extraClassrooms == 0
                        ? "Stored classrooms only."
                        : "Stored classrooms plus assumed rooms. Assumed rooms are not on the campus map.",
                SourceClass.ESTIMATED));
        metrics.put("seats", metric("Seats", campusSeats, "seats",
                "Stored room capacity plus seats you assumed for new rooms.",
                SourceClass.ESTIMATED));
        metrics.put("utilization", metric("Utilization", utilization, "%",
                "Weekly booked slots, adjusted by timetable load, divided by rooms times the existing 40-slot grid. Not an occupancy sensor.",
                SourceClass.ESTIMATED));
        metrics.put("energy", metric("Energy", energy, "kW",
                energy == null
                        ? EnergyFormula.UNAVAILABLE
                        : "Stored base load plus 5.5 kW per class in this hour. HVAC efficiency reduces only the class term. Not a meter.",
                SourceClass.SIMULATED));
        if (transport.included) {
            metrics.put("transportSeats", metric("Transport seats", transport.seats, "seats", transport.because, SourceClass.ESTIMATED));
            metrics.put("transportFill", metric("Transport fill", transport.fill, "%", transport.fillBecause, SourceClass.ESTIMATED));
        }
        metrics.put("resourceDemand", metric("Resource demand", shortfall, "seats short",
                "Students in this hour minus campus seats, including assumed new rooms. Zero means the hour fits the seat total. It does not place students in a room.",
                SourceClass.ESTIMATED));

        Picture picture = new Picture();
        picture.metrics = metrics;
        picture.overflow = overflow;
        picture.crowd = Double.isNaN(crowd) ? null : crowd;
        picture.shortfall = shortfall;
        picture.includedTransport = transport.included;
        return picture;
    }

    private Double energy(List<Building> buildings, double classLoad, double hvacFactor) {
        return EnergyFormula.simulated(
                buildings.stream().map(b -> b.getBaseEnergyLoad()).toList(),
                classLoad,
                hvacFactor);
    }

    private TransportPicture transport(List<TransportRoute> routes, Adjustments adjustments, double people) {
        TransportPicture picture = new TransportPicture();
        if (routes.isEmpty()) {
            return picture;
        }
        picture.included = true;
        long seats = 0;
        long riders = 0;
        boolean ridersStored = false;
        double factor = 1 + adjustments.busCapacityPercent / 100.0;
        for (TransportRoute route : routes) {
            int capacity = route.getCapacity() == null ? 0 : route.getCapacity();
            seats += Math.max(0, Math.round(capacity * factor));
            if (route.getCurrentOccupancy() != null && route.getCurrentOccupancy() > 0) {
                ridersStored = true;
                riders += route.getCurrentOccupancy();
            }
        }
        picture.seats = seats;
        if (!ridersStored) {
            picture.fillBecause = "No route stores a rider count above zero, so fill is omitted. Only seat capacity changes.";
            picture.because = "Sum of stored route capacities after the capacity change. Not a live bus location.";
            return picture;
        }
        long scaledRiders = Math.round(riders * people);
        picture.fill = seats == 0 ? null : round(scaledRiders * 100.0 / seats);
        picture.fillBecause = "Stored riders scaled by the intake change, against adjusted route seats. Not a ticket scan.";
        picture.because = "Sum of stored route capacities after the capacity change.";
        return picture;
    }

    private List<Map<String, Object>> buildings(Context context, List<Double> peopleFactors, List<String> names) {
        Map<String, List<TimetableSlot>> byBuilding = new LinkedHashMap<>();
        for (TimetableSlot slot : context.windowSlots) {
            if (slot.getClassroom() == null) {
                continue;
            }
            String building = slot.getClassroom().getBuilding() == null
                    ? "Unassigned building"
                    : slot.getClassroom().getBuilding().getName();
            byBuilding.computeIfAbsent(building, key -> new ArrayList<>()).add(slot);
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Map.Entry<String, List<TimetableSlot>> entry : byBuilding.entrySet()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("name", entry.getKey());
            row.put("current", crowdPercent(entry.getValue(), context.sections, 1));
            row.put("scenarios", namedNumbers(names, peopleFactors.stream()
                    .map(factor -> crowdPercent(entry.getValue(), context.sections, factor))
                    .toList()));
            row.put("because", "Timetable density for this hour. Simulated rooms are not drawn on a building.");
            rows.add(row);
        }
        rows.sort(Comparator.comparing(row -> String.valueOf(row.get("name"))));
        return rows;
    }

    private List<Map<String, Object>> hours(Context context, List<Double> peopleFactors, List<String> names) {
        Map<String, List<TimetableSlot>> byHour = new LinkedHashMap<>();
        for (TimetableSlot slot : context.today) {
            if (slot.getClassroom() == null || CampusCommandService.parseTime(slot.getStartTime()) == null) {
                continue;
            }
            byHour.computeIfAbsent(hour(slot), key -> new ArrayList<>()).add(slot);
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Map.Entry<String, List<TimetableSlot>> entry : byHour.entrySet()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("hour", entry.getKey());
            row.put("current", crowdPercent(entry.getValue(), context.sections, 1));
            row.put("scenarios", namedNumbers(names, peopleFactors.stream()
                    .map(factor -> crowdPercent(entry.getValue(), context.sections, factor))
                    .toList()));
            rows.add(row);
        }
        return rows;
    }

    private Map<String, Object> scenarioBody(String name, Adjustments adjustments, Picture current, Picture simulated) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("name", name);
        body.put("source", SourceClass.SIMULATED.name());
        body.put("adjustments", adjustments.toMap());
        body.put("summary", adjustments.summary());
        body.put("simulated", simulated.toMap());
        body.put("deltas", deltas(current, simulated));
        return body;
    }

    private Map<String, Object> recommend(List<Map<String, Object>> scenarios, List<Picture> pictures, Picture current) {
        Map<String, Object> body = new LinkedHashMap<>();
        if (pictures.isEmpty()) {
            body.put("best", null);
            body.put("why", "No scenario was run.");
            body.put("tradeoffs", List.of());
            return body;
        }
        int best = 0;
        for (int i = 1; i < pictures.size(); i++) {
            if (pressure(pictures.get(i)) < pressure(pictures.get(best))) {
                best = i;
            }
        }
        String name = String.valueOf(scenarios.get(best).get("name"));
        boolean same = pictures.stream().allMatch(picture -> pressure(picture) == pressure(current));
        body.put("best", same ? null : name);
        body.put("why", same
                ? "None of these levers reduce rooms over capacity or the seat shortfall against the timetable hour. Side effects are listed as trade-offs, not as a better campus."
                : name + " leaves the fewest rooms over capacity, then the smallest seat shortfall, then the lowest average timetable density. Energy and bus seats are not used to crown a winner.");
        List<String> tradeoffs = tradeoffLines(scenarios, pictures, current);
        body.put("tradeoffs", tradeoffs);
        body.put("comparedOn", "Rooms over capacity, then seats short for this hour, then average crowd. Energy stays a formula. Transport is included only when routes exist.");
        return body;
    }

    private List<String> tradeoffLines(List<Map<String, Object>> scenarios, List<Picture> pictures, Picture current) {
        List<String> lines = new ArrayList<>();
        for (int i = 0; i < pictures.size(); i++) {
            Adjustments adjustments = adjustmentsFrom(scenarios.get(i));
            Picture picture = pictures.get(i);
            String name = String.valueOf(scenarios.get(i).get("name"));
            List<String> parts = new ArrayList<>();
            if (adjustments.extraClassrooms > 0) {
                parts.add("adds " + adjustments.extraClassrooms + " rooms that are not on the map and do not move today's classes");
            }
            if (adjustments.intakePercent != 0) {
                parts.add("changes section size by " + adjustments.intakePercent + "%, so crowd moves with intake");
            }
            if (adjustments.timetableLoadPercent != 0) {
                parts.add("changes assumed classes on the weekly grid, which moves utilization and the energy formula, not a published timetable");
            }
            if (adjustments.hvacEfficiencyPercent > 0) {
                parts.add("lowers only the class term of the energy formula by " + adjustments.hvacEfficiencyPercent + "%");
            }
            if (adjustments.busCapacityPercent != 0) {
                parts.add(picture.includedTransport
                        ? "changes stored route seats by " + adjustments.busCapacityPercent + "%"
                        : "does not change transport because no routes are stored");
            }
            long overflowDelta = picture.overflow - current.overflow;
            if (overflowDelta != 0) {
                parts.add((overflowDelta > 0 ? "adds " : "removes ") + Math.abs(overflowDelta) + " room(s) over capacity");
            }
            if (parts.isEmpty()) {
                parts.add("uses the current timetable with no lever changed");
            }
            lines.add(name + ": " + String.join("; ", parts) + ".");
        }
        return lines;
    }

    private static Adjustments adjustmentsFrom(Map<String, Object> scenario) {
        Object raw = scenario.get("adjustments");
        if (raw instanceof Map<?, ?> map) {
            return Adjustments.from(copy(map), 0);
        }
        return Adjustments.none();
    }

    private static long pressure(Picture picture) {
        long crowd = picture.crowd == null ? 0 : Math.round(picture.crowd * 100);
        return picture.overflow * 1_000_000 + picture.shortfall * 100 + crowd;
    }

    private static boolean contains(TimetableSlot slot, LocalTime clock) {
        LocalTime start = CampusCommandService.parseTime(slot.getStartTime());
        LocalTime end = CampusCommandService.parseTime(slot.getEndTime());
        return start != null && end != null && !clock.isBefore(start) && clock.isBefore(end);
    }

    private static Map<String, Object> deltas(Picture current, Picture simulated) {
        Map<String, Object> deltas = new LinkedHashMap<>();
        for (String key : current.metrics.keySet()) {
            Object before = valueOf(current.metrics.get(key));
            Object after = valueOf(simulated.metrics.get(key));
            if (before instanceof Number left && after instanceof Number right) {
                deltas.put(key, round(right.doubleValue() - left.doubleValue()));
            }
        }
        return deltas;
    }

    private List<SlotLoad> loads(List<TimetableSlot> slots, Map<String, Long> sections, double people) {
        List<SlotLoad> loads = new ArrayList<>();
        for (TimetableSlot slot : slots) {
            if (slot.getClassroom() == null) {
                continue;
            }
            long students = Math.max(0, Math.round(sections.getOrDefault(slot.getSection(), 0L) * people));
            Integer capacity = slot.getClassroom().getCapacity();
            Long seats = capacity == null || capacity <= 0 ? 0L : capacity.longValue();
            Double density = seats == 0 ? null : students / seats.doubleValue();
            String building = slot.getClassroom().getBuilding() == null ? "Unassigned building" : slot.getClassroom().getBuilding().getName();
            loads.add(new SlotLoad(building, students, seats, density));
        }
        return loads;
    }

    private Double crowdPercent(List<TimetableSlot> slots, Map<String, Long> sections, double people) {
        double average = loads(slots, sections, people).stream()
                .filter(slot -> slot.density != null)
                .mapToDouble(slot -> slot.density)
                .average()
                .orElse(Double.NaN);
        return Double.isNaN(average) ? null : round(average * 100);
    }

    private long students(List<TimetableSlot> slots, Map<String, Long> sections, double people) {
        return loads(slots, sections, people).stream().mapToLong(slot -> slot.students).sum();
    }

    private static Map<String, Double> namedNumbers(List<String> names, List<Double> values) {
        Map<String, Double> named = new LinkedHashMap<>();
        for (int i = 0; i < names.size() && i < values.size(); i++) {
            named.put(names.get(i), values.get(i));
        }
        return named;
    }

    private static List<String> scenarioNames(List<Map<String, Object>> scenarios) {
        return scenarios.stream().map(row -> String.valueOf(row.get("name"))).toList();
    }

    private List<Map<String, Object>> readScenarios(Map<String, Object> request) {
        if (request == null) {
            return List.of();
        }
        Object raw = request.get("scenarios");
        if (raw instanceof List<?> rows) {
            List<Map<String, Object>> scenarios = new ArrayList<>();
            for (Object row : rows) {
                if (row instanceof Map<?, ?> map) {
                    scenarios.add(copy(map));
                }
            }
            return scenarios;
        }
        return List.of(new LinkedHashMap<>(request));
    }

    private static Map<String, Object> copy(Map<?, ?> map) {
        Map<String, Object> copy = new LinkedHashMap<>();
        map.forEach((key, value) -> copy.put(String.valueOf(key), value));
        return copy;
    }

    private static Map<String, Object> preset(String id, String label, String because, Map<String, Object> values) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", id);
        row.put("label", label);
        row.put("because", because);
        row.put("values", values);
        return row;
    }

    private static Map<String, Object> metric(String label, Object value, String unit, String because, SourceClass source) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("label", label);
        row.put("value", value);
        row.put("unit", unit);
        row.put("source", source.name());
        row.put("because", because);
        return row;
    }

    private static Object valueOf(Object metric) {
        return metric instanceof Map<?, ?> map ? map.get("value") : null;
    }

    private static String name(Object raw, int index) {
        String value = raw == null ? "" : String.valueOf(raw).trim();
        if (value.isBlank()) {
            return "Scenario " + (char) ('A' + index);
        }
        return value.length() > 80 ? value.substring(0, 80) : value;
    }

    private static String hour(TimetableSlot slot) {
        LocalTime start = CampusCommandService.parseTime(slot.getStartTime());
        return start == null ? "Unknown" : String.format("%02d:%02d", start.getHour(), start.getMinute());
    }

    private static double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private record Context(Map<String, Long> sections, long enrolled, List<Classroom> rooms, List<Building> buildings,
                           List<TimetableSlot> today, List<TimetableSlot> week, List<TransportRoute> routes,
                           List<TimetableSlot> windowSlots, Map<String, Object> window) {
    }

    private record Window(List<TimetableSlot> slots, Map<String, Object> body) {
    }

    private record SlotLoad(String building, long students, long seats, Double density) {
    }

    private static final class TransportPicture {
        private boolean included;
        private long seats;
        private Double fill;
        private String because;
        private String fillBecause;
    }

    private static final class Picture {
        private Map<String, Object> metrics = Map.of();
        private long overflow;
        private Double crowd;
        private long shortfall;
        private boolean includedTransport;

        private Map<String, Object> toMap() {
            return metrics;
        }
    }

    private record Adjustments(int intakePercent, int extraClassrooms, int seatsPerNewClassroom,
                               int busCapacityPercent, int hvacEfficiencyPercent, int timetableLoadPercent,
                               String intakeNote) {
        private static Adjustments none() {
            return new Adjustments(0, 0, 60, 0, 0, 0, null);
        }

        private static Adjustments from(Map<String, Object> raw, long enrolled) {
            Integer intake = percent(raw.get("intakePercent"), -50, 100);
            String note = null;
            if (intake == null && raw.get("intakeAdjustment") instanceof Number number) {
                int extra = number.intValue();
                if (enrolled <= 0) {
                    intake = 0;
                    note = "Extra students were ignored because no section enrolment is stored.";
                } else {
                    intake = clamp((int) Math.round(extra * 100.0 / enrolled), -50, 100);
                    note = "Extra headcount was converted to a percent of enrolled students in stored sections.";
                }
            }
            int rooms = clamp(number(raw.get("extraClassrooms"), 0), 0, 40);
            int seats = clamp(number(raw.get("seatsPerNewClassroom"), 60), 20, 200);
            return new Adjustments(
                    intake == null ? 0 : intake,
                    rooms,
                    seats,
                    clamp(number(raw.get("busCapacityPercent"), 0), -80, 100),
                    clamp(number(raw.get("hvacEfficiencyPercent"), 0), 0, 40),
                    clamp(number(raw.get("timetableLoadPercent"), 0), -40, 50),
                    note
            );
        }

        private Map<String, Object> toMap() {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("intakePercent", intakePercent);
            body.put("extraClassrooms", extraClassrooms);
            body.put("seatsPerNewClassroom", seatsPerNewClassroom);
            body.put("busCapacityPercent", busCapacityPercent);
            body.put("hvacEfficiencyPercent", hvacEfficiencyPercent);
            body.put("timetableLoadPercent", timetableLoadPercent);
            if (intakeNote != null) {
                body.put("intakeNote", intakeNote);
            }
            return body;
        }

        private String summary() {
            List<String> parts = new ArrayList<>();
            if (intakePercent != 0) {
                parts.add((intakePercent > 0 ? "+" : "") + intakePercent + "% intake");
            }
            if (extraClassrooms > 0) {
                parts.add("+" + extraClassrooms + " classrooms (" + seatsPerNewClassroom + " seats)");
            }
            if (busCapacityPercent != 0) {
                parts.add((busCapacityPercent > 0 ? "+" : "") + busCapacityPercent + "% bus seats");
            }
            if (hvacEfficiencyPercent > 0) {
                parts.add(hvacEfficiencyPercent + "% HVAC on the class energy term");
            }
            if (timetableLoadPercent != 0) {
                parts.add((timetableLoadPercent > 0 ? "+" : "") + timetableLoadPercent + "% timetable load");
            }
            return parts.isEmpty() ? "No lever changed" : String.join(" · ", parts);
        }
    }

    private static Integer percent(Object raw, int min, int max) {
        if (!(raw instanceof Number number)) {
            return null;
        }
        return clamp(number.intValue(), min, max);
    }

    private static int number(Object raw, int fallback) {
        return raw instanceof Number number ? number.intValue() : fallback;
    }

    private static int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}
