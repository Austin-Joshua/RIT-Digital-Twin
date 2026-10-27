package com.university.erp.repository;

import com.university.erp.model.FacultySubstitution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface FacultySubstitutionRepository extends JpaRepository<FacultySubstitution, Long> {

    List<FacultySubstitution> findByTimetableSlot_IdAndSubstitutionDateAndStatusIn(
            Long timetableSlotId, LocalDate date, Collection<String> statuses);

    List<FacultySubstitution> findByTimetableSlot_IdAndStatusIn(
            Long timetableSlotId, Collection<String> statuses);

    List<FacultySubstitution> findBySubstituteFaculty_UserIdAndSubstitutionDateAndStatus(
            Long substituteFacultyId, LocalDate date, String status);

    List<FacultySubstitution> findBySubstituteFaculty_UserIdAndStatus(
            Long substituteFacultyId, String status);

    List<FacultySubstitution> findByOriginalFaculty_UserIdAndSubstitutionDateAndStatus(
            Long originalFacultyId, LocalDate date, String status);

    @Query("SELECT fs FROM FacultySubstitution fs WHERE fs.status = 'PENDING_APPROVAL' AND " +
           "(fs.timetableSlot.department.id = :deptId OR fs.originalFaculty.department.id = :deptId) " +
           "ORDER BY fs.substitutionDate ASC, fs.requestedAt ASC")
    List<FacultySubstitution> findPendingByDepartment(@Param("deptId") Long deptId);

    List<FacultySubstitution> findByStatusOrderBySubstitutionDateAscRequestedAtAsc(String status);

    @Query("SELECT fs FROM FacultySubstitution fs WHERE " +
           "(fs.originalFaculty.userId = :userId OR fs.substituteFaculty.userId = :userId OR fs.requestedBy.userId = :userId) " +
           "ORDER BY fs.substitutionDate DESC, fs.requestedAt DESC")
    List<FacultySubstitution> findAllRelevantForUser(@Param("userId") Long userId);

    @Query("SELECT fs FROM FacultySubstitution fs WHERE fs.status = 'APPROVED' AND fs.substitutionDate = :date AND " +
           "(fs.originalFaculty.userId = :facultyId OR fs.substituteFaculty.userId = :facultyId)")
    List<FacultySubstitution> findApprovedForFacultyOnDate(@Param("facultyId") Long facultyId, @Param("date") LocalDate date);
}
