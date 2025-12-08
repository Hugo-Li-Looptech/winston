export interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
}

export interface CourseGroup {
  id: string;
  title: string;
  description: string;
  courseIds: string[];
  color: string;
  learningGoals: string[];
  projectedHours: number;
  milestones: LearningMilestone[];
  createdAt: string;
}

export const GROUP_COLORS = [
  { name: 'Purple', value: 'hsl(var(--primary))' },
  { name: 'Blue', value: 'hsl(217, 91%, 60%)' },
  { name: 'Green', value: 'hsl(142, 71%, 45%)' },
  { name: 'Orange', value: 'hsl(24, 95%, 53%)' },
  { name: 'Pink', value: 'hsl(330, 81%, 60%)' },
];
