export const getScoreColor = (score: number) => {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "error";
};

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "success";
    case "Intermediate":
      return "processing";
    case "Advanced":
      return "error";
    default:
      return "default";
  }
};
