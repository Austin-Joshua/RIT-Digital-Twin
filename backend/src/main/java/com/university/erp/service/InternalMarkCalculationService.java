package com.university.erp.service;

import com.university.erp.model.Marks;
import org.springframework.stereotype.Service;

@Service
public class InternalMarkCalculationService {

    public void calculateAll(Marks marks) {
        calculateInternal(marks);
        calculateFinalConverted(marks);
        calculateTotal(marks);
        calculateGrade(marks);
    }

    public void calculateInternal(Marks marks) {
        double cat1 = (marks.getCat1Score() != null) ? marks.getCat1Score() : 0;
        double cat2 = (marks.getCat2Score() != null) ? marks.getCat2Score() : 0;
        double cat3 = (marks.getCat3Score() != null) ? marks.getCat3Score() : 0;
        double assignment = (marks.getAssignmentScore() != null) ? marks.getAssignmentScore() : 0;
        double attendance = (marks.getAttendancePercentage() != null) ? marks.getAttendancePercentage() : 0;

        // Step 1-3: CAT Exams (8 + 8 + 8 = 24 marks)
        double cat1Weight = (cat1 / 50.0) * 8.0;
        double cat2Weight = (cat2 / 25.0) * 8.0;
        double cat3Weight = (cat3 / 50.0) * 8.0;

        // Step 4: Assignment (8 marks)
        double assignmentWeight = (assignment / 50.0) * 8.0;

        // Step 5: Attendance (8 marks)
        double attendanceWeight = calculateAttendanceWeight(attendance);

        double totalInternal = cat1Weight + cat2Weight + cat3Weight + assignmentWeight + attendanceWeight;
        marks.setCalculatedInternal(Math.min(40.0, totalInternal));
    }

    private double calculateAttendanceWeight(double percentage) {
        if (percentage >= 90)
            return 8.0;
        if (percentage >= 80)
            return 6.0;
        if (percentage >= 70)
            return 4.0;
        return 0.0;
    }

    public void calculateFinalConverted(Marks marks) {
        double examScore = (marks.getFinalExamScore() != null) ? marks.getFinalExamScore() : 0;
        double converted = (examScore / 100.0) * 60.0;
        marks.setFinalConvertedScore(Math.min(60.0, converted));
    }

    public void calculateTotal(Marks marks) {
        double internal = (marks.getCalculatedInternal() != null) ? marks.getCalculatedInternal() : 0;
        double external = (marks.getFinalConvertedScore() != null) ? marks.getFinalConvertedScore() : 0;
        marks.setTotalScore(internal + external);
    }

    public void calculateGrade(Marks marks) {
        double total = (marks.getTotalScore() != null) ? marks.getTotalScore() : 0;
        if (total >= 90)
            marks.setGrade("O");
        else if (total >= 80)
            marks.setGrade("A+");
        else if (total >= 70)
            marks.setGrade("A");
        else if (total >= 60)
            marks.setGrade("B+");
        else if (total >= 50)
            marks.setGrade("B");
        else if (total >= 40)
            marks.setGrade("C");
        else
            marks.setGrade("RA"); // Re-appearance
    }
}
