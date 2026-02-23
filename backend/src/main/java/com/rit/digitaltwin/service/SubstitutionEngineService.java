package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.Faculty;
import com.rit.digitaltwin.model.SubstitutionLog;
import com.rit.digitaltwin.model.Timetable;
import com.rit.digitaltwin.repository.FacultyRepository;
import com.rit.digitaltwin.repository.SubstitutionLogRepository;
import com.rit.digitaltwin.repository.TimetableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubstitutionEngineService {

        private final TimetableRepository timetableRepository;
        private final FacultyRepository facultyRepository;
        private final SubstitutionLogRepository substitutionLogRepository;
        private final SimpMessagingTemplate messagingTemplate;

        @Transactional
        public SubstitutionLog substituteClass(Long timetableIdToSubstitute) {
                Timetable originalClass = timetableRepository.findById(timetableIdToSubstitute).orElseThrow();

                // Find gap: Find all faculties NOT busy on originalClass.getDayOfWeek() at
                // originalClass.getStartTime()
                // Here we simulate gap detection finding all faculties and removing ones
                // actively booked
                List<Timetable> allConcurrentClasses = timetableRepository.findAll().stream()
                                .filter(t -> t.getDayOfWeek() == originalClass.getDayOfWeek() &&
                                                t.getStartTime().equals(originalClass.getStartTime()))
                                .toList();

                List<Long> busyFacultyIds = allConcurrentClasses.stream()
                                .map(t -> t.getFaculty().getId())
                                .toList();

                Optional<Faculty> availableFaculty = facultyRepository.findAll().stream()
                                .filter(f -> !busyFacultyIds.contains(f.getId()))
                                .findFirst();

                if (availableFaculty.isEmpty()) {
                        throw new RuntimeException("No available faculty matched to avoid clash.");
                }

                Faculty substitute = availableFaculty.get();

                SubstitutionLog logEntry = SubstitutionLog.builder()
                                .originalTimetable(originalClass)
                                .substituteFaculty(substitute)
                                .reason("Automated AI Substitution due to faculty unavailability")
                                .status(SubstitutionLog.SubstitutionStatus.AUTO_ASSIGNED)
                                .build();

                substitutionLogRepository.save(logEntry);

                // Broadcast substitution to affected class
                log.info("Firing WebSocket alert for Class Substitution of Timetable ID: {}", timetableIdToSubstitute);
                messagingTemplate.convertAndSend("/topic/global",
                                "Class substitution alert: " + originalClass.getSubject().getSubjectName() +
                                                " will now be handled by " + substitute.getUser().getFirstName());

                return logEntry;
        }
}
