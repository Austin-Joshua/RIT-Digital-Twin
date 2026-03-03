package com.university.erp.service;

import com.university.erp.entity.Marks;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class InternalMarkCalculationService {

    private static final BigDecimal HUNDRED = new BigDecimal("100.0");
    private static final BigDecimal SIXTY = new BigDecimal("60.0");
    private static final BigDecimal FORTY = new BigDecimal("40.0");
    private static final BigDecimal EIGHT = new BigDecimal("8.0");
    private static final BigDecimal FIFTY = new BigDecimal("50.0");
    private static final BigDecimal TWENTY_FIVE = new BigDecimal("25.0");

    public void calculateAll(Marks marks) {
        calculateInternal(marks);
        calculateFinalConverted(marks);
        calculateTotal(marks);
        calculateGrade(marks);
    }

    public void calculateInternal(Marks marks) {
        BigDecimal cat1 = (marks.getCat1Score() != null) ? marks.getCat1Score() : BigDecimal.ZERO;
        BigDecimal cat2 = (marks.getCat2Score() != null) ? marks.getCat2Score() : BigDecimal.ZERO;
        BigDecimal cat3 = (marks.getCat3Score() != null) ? marks.getCat3Score() : BigDecimal.ZERO;
        BigDecimal assignment = (marks.getAssignmentScore() != null) ? marks.getAssignmentScore() : BigDecimal.ZERO;
        BigDecimal attendance = (marks.getAttendancePercentage() != null) ? marks.getAttendancePercentage()
                : BigDecimal.ZERO;

        // Step 1-3: CAT Exams
        BigDecimal cat1Weight = cat1.divide(FIFTY, 4, RoundingMode.HALF_UP).multiply(EIGHT);
        BigDecimal cat2Weight = cat2.divide(TWENTY_FIVE, 4, RoundingMode.HALF_UP).multiply(EIGHT);
        BigDecimal cat3Weight = cat3.divide(FIFTY, 4, RoundingMode.HALF_UP).multiply(EIGHT);

        // Step 4: Assignment
        BigDecimal assignmentWeight = assignment.divide(FIFTY, 4, RoundingMode.HALF_UP).multiply(EIGHT);

        // Step 5: Attendance
        BigDecimal attendanceWeight = calculateAttendanceWeight(attendance);

        BigDecimal totalInternal = cat1Weight.add(cat2Weight).add(cat3Weight).add(assignmentWeight)
                .add(attendanceWeight);
        marks.setCalculatedInternal(totalInternal.min(FORTY).setScale(2, RoundingMode.HALF_UP));
    }

    private BigDecimal calculateAttendanceWeight(BigDecimal percentage) {
        if (percentage.compareTo(new BigDecimal("90")) >= 0)
            return EIGHT;
        if (percentage.compareTo(new BigDecimal("80")) >= 0)
            return new BigDecimal("6.0");
        if (percentage.compareTo(new BigDecimal("70")) >= 0)
            return new BigDecimal("4.0");
        return BigDecimal.ZERO;
    }

    public void calculateFinalConverted(Marks marks) {
        BigDecimal examScore = (marks.getFinalExamScore() != null) ? marks.getFinalExamScore() : BigDecimal.ZERO;
        BigDecimal converted = examScore.divide(HUNDRED, 4, RoundingMode.HALF_UP).multiply(SIXTY);
        marks.setFinalConvertedScore(converted.min(SIXTY).setScale(2, RoundingMode.HALF_UP));
    }

    public void calculateTotal(Marks marks) {
        BigDecimal internal = (marks.getCalculatedInternal() != null) ? marks.getCalculatedInternal() : BigDecimal.ZERO;
        BigDecimal external = (marks.getFinalConvertedScore() != null) ? marks.getFinalConvertedScore()
                : BigDecimal.ZERO;
        marks.setTotalScore(internal.add(external).setScale(2, RoundingMode.HALF_UP));
    }

    public void calculateGrade(Marks marks) {
        BigDecimal total = (marks.getTotalScore() != null) ? marks.getTotalScore() : BigDecimal.ZERO;
        if (total.compareTo(new BigDecimal("90")) >= 0)
            marks.setGrade("O");
        else if (total.compareTo(new BigDecimal("80")) >= 0)
            marks.setGrade("A+");
        else if (total.compareTo(new BigDecimal("70")) >= 0)
            marks.setGrade("A");
        else if (total.compareTo(new BigDecimal("60")) >= 0)
            marks.setGrade("B+");
        else if (total.compareTo(new BigDecimal("50")) >= 0)
            marks.setGrade("B");
        else if (total.compareTo(new BigDecimal("40")) >= 0)
            marks.setGrade("C");
        else
            marks.setGrade("RA");
    }
}
