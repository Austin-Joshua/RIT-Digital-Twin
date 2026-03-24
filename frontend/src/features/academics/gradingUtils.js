export const estimateGradeFromInputs = ({ cat1Marks = 0, cat2Marks = 0, cat3Marks = 0, assignmentMarks = 0, examMarks = 0 }) => {
  const c1 = Number(cat1Marks) || 0;
  const c2 = Number(cat2Marks) || 0;
  const c3 = Number(cat3Marks) || 0;
  const asg = Number(assignmentMarks) || 0;
  const ext = Number(examMarks) || 0;

  const internalComposite = ((c1 + c2 + c3) / 3) * 0.2 + (asg * 0.2);
  const total = internalComposite + ext;

  if (total >= 90) return 'O';
  if (total >= 80) return 'A+';
  if (total >= 70) return 'A';
  if (total >= 60) return 'B+';
  return 'B';
};

