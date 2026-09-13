package com.university.erp.service;

import com.university.erp.intelligence.EnergyFormula;
import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.Building;
import com.university.erp.model.BusStop;
import com.university.erp.model.Classroom;
import com.university.erp.model.TimetableSlot;
import com.university.erp.model.TransportRoute;
import com.university.erp.repository.BusStopRepository;
import com.university.erp.repository.CampusRecordQuery;
import com.university.erp.repository.TimetableSlotRepository;
import com.university.erp.repository.TransportRouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Simulated infrastructure for the twin when no sensors are connected.
 * Values are a function of the campus clock and stored timetable, so the same minute returns the same reading.
 */
@Service
@RequiredArgsConstructor
public class SimulatedSourceService {

    private static final ZoneId CAMPUS = ZoneId.of("Asia/Kolkata");
    private static final int ARRIVE_MINUTES = 10;
    private static final int SETTLE_MINUTES = 8;
    private final TimetableSlotRepository timetableSlotRepository;
    private final CampusRecordQuery campusRecordQuery;
    private final TransportRouteRepository transportRouteRepository;
    private final BusStopRepository busStopRepository;

    private volatile String cachedMinute = "";
    private volatile Map<String, Object> cached;

    @Transactional(readOnly = true)
    public Map<String, Object> snapshot() {
        LocalDateTime minute = LocalDateTime.now(CAMPUS).withSecond(0).withNano(0);
        if (minute.toString().equals(cachedMinute) && cached != null) {
            return cached;
        }
        Map<String, Object> built = build(minute, true);
        cachedMinute = minute.toString();
        cached = built;
        return built;
    }

    @Transactional(readOnly = true)
    public String phaseKey() {
        Object key = snapshot().get("phaseKey");
        return key == null ? "quiet" : String.valueOf(key);
    }

    private Map<String, Object> build(LocalDateTime minute, boolean withOutlook) {
        LocalTime clock = minute.toLocalTime();
        List<TimetableSlot> today = timetableSlotRepository.findByDayOfWeekIgnoreCase(minute.getDayOfWeek().name());
        Map<String, Long> sections = sectionCounts();
        List<RoomCurve> rooms = rooms(today, sections, clock);
        List<Map<String, Object>> buses = buses(minute.toLocalTime());
        Map<String, Object> outlook = withOutlook ? outlook(minute, campusDensity(rooms)) : Map.of();

        List<Map<String, Object>> points = new ArrayList<>();
        points.add(campusCrowd(rooms));
        points.add(campusMovement(rooms));
        points.add(campusTemperature(minute, rooms));
        points.addAll(buildingEnergy(rooms));
        rooms.stream()
                .filter(room -> room.fraction > 0)
                .sorted(Comparator.comparingDouble((RoomCurve room) -> room.fraction).reversed())
                .limit(8)
                .forEach(room -> points.add(roomPoint(room, minute.toLocalTime())));
        for (Map<String, Object> bus : buses) {
            if (points.size() >= 16) {
                break;
            }
            points.add(bus);
        }

        String phaseKey = phaseKey(minute, rooms);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("liveSensors", false);
        body.put("source", SourceClass.SIMULATED.name());
        body.put("clock", minute.toString());
        body.put("timezone", CAMPUS.getId());
        body.put("phaseKey", phaseKey);
        body.put("because", "Simulated infrastructure. Readings follow the timetable clock on a fixed curve. They are not door counts, thermostats, meters, cameras, or GPS.");
        body.put("deterministic", true);
        body.put("writtenAsHistory", false);
        body.put("feedsPrediction", false);
        body.put("feedsPredictionBecause", "These points are not stored as crowd history. The congestion model still uses only stored samples, so a formula is not treated as a measurement.");
        body.put("pipeline", pipeline());
        body.put("outlook", outlook);
        body.put("points", points);
        body.put("buses", buses);
        body.put("roomsInCurve", rooms.stream().filter(room -> room.fraction > 0).count());
        return body;
    }

    private Map<String, Object> outlook(LocalDateTime minute, Double nowDensity) {
        Map<String, Object> later = build(minute.plusMinutes(5), false);
        Double next = later.get("points") instanceof List<?> rows
                ? rows.stream()
                .filter(Map.class::isInstance)
                .map(row -> (Map<?, ?>) row)
                .filter(row -> "CROWD_DENSITY".equals(row.get("metric")) && "CAMPUS".equals(row.get("scope")))
                .map(row -> row.get("value"))
                .filter(Number.class::isInstance)
                .map(value -> ((Number) value).doubleValue())
                .findFirst()
                .orElse(null)
                : null;
        String movement = "holds";
        if (nowDensity != null && next != null) {
            if (next > nowDensity + 0.03) {
                movement = "rises";
            } else if (next + 0.03 < nowDensity) {
                movement = "falls";
            }
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("minutesAhead", 5);
        body.put("crowdDensity", next);
        body.put("movement", movement);
        body.put("source", SourceClass.SIMULATED.name());
        body.put("because", "The same occupancy curve five minutes ahead. Not the congestion model.");
        return body;
    }

    private List<RoomCurve> rooms(List<TimetableSlot> today, Map<String, Long> sections, LocalTime clock) {
        Map<Long, RoomCurve> byRoom = new LinkedHashMap<>();
        for (TimetableSlot slot : today) {
            if (slot.getClassroom() == null || slot.getClassroom().getId() == null) {
                continue;
            }
            LocalTime start = CampusCommandService.parseTime(slot.getStartTime());
            LocalTime end = CampusCommandService.parseTime(slot.getEndTime());
            if (start == null || end == null || !end.isAfter(start)) {
                continue;
            }
            Curve curve = curve(clock, start, end);
            if (curve.fraction <= 0) {
                continue;
            }
            long scheduled = sections.getOrDefault(slot.getSection(), 0L);
            Classroom room = slot.getClassroom();
            RoomCurve row = byRoom.computeIfAbsent(room.getId(), id -> new RoomCurve(room));
            if (curve.fraction >= row.fraction) {
                row.fraction = curve.fraction;
                row.phase = curve.phase;
                row.scheduled = scheduled;
                row.section = slot.getSection();
                row.subject = slot.getSubject() == null || slot.getSubject().getSubjectName() == null
                        ? "Class"
                        : slot.getSubject().getSubjectName();
            }
        }
        return new ArrayList<>(byRoom.values());
    }

    static Curve curve(LocalTime clock, LocalTime start, LocalTime end) {
        int now = minuteOfDay(clock);
        int begin = minuteOfDay(start);
        int finish = minuteOfDay(end);
        if (finish <= begin || now >= finish || now < begin - ARRIVE_MINUTES) {
            return new Curve("QUIET", 0);
        }
        int length = finish - begin;
        if (length < SETTLE_MINUTES * 2) {
            if (now < begin) {
                return new Curve("ARRIVING", clamp((now - (begin - ARRIVE_MINUTES)) / (double) ARRIVE_MINUTES * 0.5));
            }
            double through = (now - begin) / (double) length;
            double fraction = through <= 0.5 ? through * 2 : (1 - through) * 2;
            return new Curve(through <= 0.5 ? "ARRIVING" : "DEPARTING", clamp(fraction));
        }
        if (now < begin + SETTLE_MINUTES) {
            double minutes = now - (begin - ARRIVE_MINUTES);
            return new Curve("ARRIVING", clamp(minutes / (ARRIVE_MINUTES + SETTLE_MINUTES)));
        }
        if (now < finish - SETTLE_MINUTES) {
            return new Curve("SETTLED", 1);
        }
        double remaining = finish - now;
        return new Curve("DEPARTING", clamp(0.15 + 0.85 * (remaining / SETTLE_MINUTES)));
    }

    private Map<String, Object> roomPoint(RoomCurve room, LocalTime clock) {
        long people = Math.round(room.scheduled * room.fraction);
        Integer capacity = room.room.getCapacity();
        Double density = capacity == null || capacity <= 0 ? null : people / (double) capacity;
        String location = place(room.room);
        Map<String, Object> body = point("ROOM", location, "OCCUPANCY", people, "people",
                room.phase + ". Scheduled section size times the occupancy curve. Not a door count.");
        body.put("phase", room.phase);
        body.put("section", room.section);
        body.put("utilization", density == null ? null : round(density * 100));
        body.put("utilizationUnit", "%");
        body.put("crowdDensity", density == null ? null : round(density));
        body.put("temperatureC", round(diurnal(clock) + 1.2 * room.fraction));
        body.put("subject", room.subject);
        return body;
    }

    private Map<String, Object> campusCrowd(List<RoomCurve> rooms) {
        Double density = campusDensity(rooms);
        return point("CAMPUS", "Campus", "CROWD_DENSITY", density, "ratio",
                density == null
                        ? "No class is on the occupancy curve this minute."
                        : "Mean scheduled density of rooms on the curve. Not a campus counter.");
    }

    private Map<String, Object> campusMovement(List<RoomCurve> rooms) {
        long moving = 0;
        for (RoomCurve room : rooms) {
            if ("ARRIVING".equals(room.phase) || "DEPARTING".equals(room.phase)) {
                moving += Math.round(room.scheduled * (1 - room.fraction));
            }
        }
        return point("CAMPUS", "Corridors", "MOVEMENT", moving, "people",
                "People still outside the room during the fixed arrival and departure minutes. Not a camera.");
    }

    private Map<String, Object> campusTemperature(LocalDateTime minute, List<RoomCurve> rooms) {
        double occupied = rooms.stream().mapToDouble(room -> room.fraction).average().orElse(0);
        return point("CAMPUS", "Campus", "TEMPERATURE", round(diurnal(minute.toLocalTime()) + occupied), "°C",
                "Fixed daily curve plus a small occupancy bump. Not a thermostat or weather feed.");
    }

    private List<Map<String, Object>> buildingEnergy(List<RoomCurve> rooms) {
        Map<Long, double[]> loads = new LinkedHashMap<>();
        Map<Long, String> names = new LinkedHashMap<>();
        for (RoomCurve room : rooms) {
            Building building = room.room.getBuilding();
            if (building == null || building.getId() == null || room.fraction <= 0) {
                continue;
            }
            loads.computeIfAbsent(building.getId(), id -> new double[] {
                    building.getBaseEnergyLoad() == null ? Double.NaN : building.getBaseEnergyLoad().doubleValue(),
                    0
            });
            loads.get(building.getId())[1] += room.fraction;
            names.put(building.getId(), building.getName());
        }
        List<Map<String, Object>> points = new ArrayList<>();
        for (Map.Entry<Long, double[]> entry : loads.entrySet()) {
            double base = entry.getValue()[0];
            double classes = entry.getValue()[1];
            Double kw = Double.isNaN(base) ? null : EnergyFormula.kw(java.math.BigDecimal.valueOf(base), classes);
            if (kw == null) {
                continue;
            }
            points.add(point("BUILDING", names.get(entry.getKey()), "ENERGY", kw, "kW",
                    EnergyFormula.BECAUSE));
        }
        return points;
    }

    private List<Map<String, Object>> buses(LocalTime clock) {
        Map<Long, List<BusStop>> stopsByRoute = new LinkedHashMap<>();
        Map<Long, TransportRoute> routes = new LinkedHashMap<>();
        for (BusStop stop : busStopRepository.findAllWithRoute()) {
            if (stop.getRoute() == null || stop.getRoute().getId() == null) {
                continue;
            }
            routes.putIfAbsent(stop.getRoute().getId(), stop.getRoute());
            stopsByRoute.computeIfAbsent(stop.getRoute().getId(), id -> new ArrayList<>()).add(stop);
        }
        for (TransportRoute route : transportRouteRepository.findAll()) {
            routes.putIfAbsent(route.getId(), route);
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (TransportRoute route : routes.values()) {
            List<BusStop> stops = stopsByRoute.getOrDefault(route.getId(), List.of()).stream()
                    .filter(stop -> stop.getPickupTime() != null)
                    .toList();
            Map<String, Object> row = point("ASSET", route.getRouteName() == null ? route.getRouteNumber() : route.getRouteName(),
                    "BUS_POSITION", null, "stop", "");
            row.put("routeNumber", route.getRouteNumber());
            if (stops.isEmpty()) {
                row.put("detail", "Not placed");
                row.put("because", "Stored stops have no pickup time, so a position is not invented.");
            } else {
                placeBus(row, stops, clock);
            }
            rows.add(row);
            if (rows.size() >= 6) {
                break;
            }
        }
        return rows;
    }

    private static void placeBus(Map<String, Object> row, List<BusStop> stops, LocalTime clock) {
        BusStop previous = null;
        BusStop next = null;
        for (BusStop stop : stops) {
            if (!stop.getPickupTime().isAfter(clock)) {
                previous = stop;
            } else if (next == null) {
                next = stop;
            }
        }
        if (previous == null) {
            row.put("value", stops.get(0).getStopName());
            row.put("detail", "Before first stored stop");
            row.put("progress", 0);
            row.put("because", "Clock is before the first stored pickup time. Not a GPS position.");
            return;
        }
        if (next == null) {
            row.put("value", previous.getStopName());
            row.put("detail", "After last stored stop");
            row.put("progress", 1);
            row.put("because", "No later stop time is stored, so a return trip is not invented. Not GPS.");
            return;
        }
        long span = ChronoUnit.MINUTES.between(previous.getPickupTime(), next.getPickupTime());
        long elapsed = ChronoUnit.MINUTES.between(previous.getPickupTime(), clock);
        double progress = span <= 0 ? 1 : clamp(elapsed / (double) span);
        row.put("value", previous.getStopName());
        row.put("detail", "Toward " + next.getStopName());
        row.put("progress", round(progress));
        row.put("because", "Clock progress between stored pickup times. Not a GPS tracker.");
    }

    private Map<String, Long> sectionCounts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (Object[] row : campusRecordQuery.countStudentsBySection()) {
            if (row[0] != null && row[1] instanceof Number number) {
                counts.put(String.valueOf(row[0]), number.longValue());
            }
        }
        return counts;
    }

    private static Double campusDensity(List<RoomCurve> rooms) {
        List<Double> densities = new ArrayList<>();
        for (RoomCurve room : rooms) {
            if (room.fraction <= 0 || room.room.getCapacity() == null || room.room.getCapacity() <= 0) {
                continue;
            }
            densities.add((room.scheduled * room.fraction) / room.room.getCapacity());
        }
        if (densities.isEmpty()) {
            return null;
        }
        return round(densities.stream().mapToDouble(value -> value).average().orElse(0));
    }

    private static String phaseKey(LocalDateTime minute, List<RoomCurve> rooms) {
        StringBuilder key = new StringBuilder(minute.toLocalDate().toString());
        rooms.stream()
                .filter(room -> room.fraction > 0)
                .sorted(Comparator.comparing(room -> room.room.getId()))
                .forEach(room -> key.append(':').append(room.room.getId()).append('@').append(step(room.fraction)).append(room.phase.charAt(0)));
        long moving = rooms.stream()
                .filter(room -> "ARRIVING".equals(room.phase) || "DEPARTING".equals(room.phase))
                .mapToLong(room -> Math.round(room.scheduled * (1 - room.fraction)))
                .sum();
        key.append(":m").append(moving / 5);
        return key.toString();
    }

    private static List<Map<String, Object>> pipeline() {
        return List.of(
                stage("Simulated IoT", SourceClass.SIMULATED, "This curve. No physical sensor is connected."),
                stage("ERP", SourceClass.HISTORICAL, "Timetable slots, rooms, section sizes, and route stops."),
                stage("Existing APIs", SourceClass.ESTIMATED, "The command snapshot stays the operating estimate. This layer does not replace it."),
                stage("Historical data", SourceClass.HISTORICAL, "Stored samples remain separate. This curve is not written into them."),
                stage("Normalization", SourceClass.SIMULATED, "One envelope. Every point carries a source class."),
                stage("Digital twin state", SourceClass.SIMULATED, "Nested on the existing campus-state socket. Not a second twin."),
                stage("Analytics", SourceClass.ESTIMATED, "Command health still uses stored records, not this curve."),
                stage("Prediction", SourceClass.PREDICTED, "Unchanged. Simulated points are not prediction history."),
                stage("Simulation", SourceClass.SIMULATED, "The scenario lab remains the what-if tool. This curve is the clock, not a scenario."),
                stage("Decision engine", SourceClass.ESTIMATED, "Decisions still start from stored alerts. This layer does not authorize an action.")
        );
    }

    private static Map<String, Object> stage(String name, SourceClass source, String because) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("name", name);
        row.put("source", source.name());
        row.put("because", because);
        return row;
    }

    private static Map<String, Object> point(String scope, String location, String metric, Object value, String unit, String because) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("scope", scope);
        row.put("location", location);
        row.put("metric", metric);
        row.put("value", value);
        row.put("unit", unit);
        row.put("source", SourceClass.SIMULATED.name());
        row.put("because", because);
        return row;
    }

    private static String place(Classroom room) {
        String building = room.getBuilding() == null ? "Unassigned building" : room.getBuilding().getName();
        return building + " · " + room.getName();
    }

    static double diurnal(LocalTime clock) {
        double hour = clock.getHour() + clock.getMinute() / 60.0;
        return 27 + 3.5 * Math.sin((hour - 9) / 24.0 * Math.PI * 2);
    }

    private static int step(double fraction) {
        return (int) Math.round(clamp(fraction) * 20);
    }

    private static int minuteOfDay(LocalTime time) {
        return time.getHour() * 60 + time.getMinute();
    }

    private static double clamp(double value) {
        return Math.max(0, Math.min(1, value));
    }

    private static double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private static final class RoomCurve {
        private final Classroom room;
        private double fraction;
        private String phase = "QUIET";
        private long scheduled;
        private String section;
        private String subject;

        private RoomCurve(Classroom room) {
            this.room = room;
        }
    }

    record Curve(String phase, double fraction) {
    }
}
