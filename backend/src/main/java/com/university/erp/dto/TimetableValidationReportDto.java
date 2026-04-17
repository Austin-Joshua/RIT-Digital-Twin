package com.university.erp.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class TimetableValidationReportDto {
    private boolean facultyClashFree;
    private boolean classClashFree;
    private boolean noSubjectOverlap;
    private boolean crossClassConflictFree;
    private boolean allSubjectsScheduled;
    private boolean allRequiredHoursSatisfied;
    private boolean fullyFilled;
    private boolean allSlotsValid;
    private int totalDemandPeriods;
    private int scheduledPeriods;
    private int unscheduledPeriods;
    private int facultyClashCount;
    private int classClashCount;
    private Map<String, Integer> dailyLoadBySection;
    private List<TimetableUnscheduledItemDto> unscheduledItems;
}
