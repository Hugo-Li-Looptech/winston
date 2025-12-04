export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  slideId?: string;
  assessmentId?: string;
  resolved: boolean;
  replies?: Comment[];
}

export const proxyComments: Comment[] = [
  {
    id: '1',
    userId: 'user-1',
    userName: 'Sarah Chen',
    userAvatar: '',
    content: 'The talk points for slide 3 could use more detail about the history. Can we add some context about the origins?',
    timestamp: new Date('2024-12-01T10:30:00'),
    slideId: '3',
    resolved: false,
  },
  {
    id: '2',
    userId: 'user-2',
    userName: 'Mike Johnson',
    userAvatar: '',
    content: 'Great job on the assessment questions! The rubric criteria look comprehensive.',
    timestamp: new Date('2024-12-02T14:15:00'),
    resolved: true,
  },
  {
    id: '3',
    userId: 'user-3',
    userName: 'Emily Davis',
    userAvatar: '',
    content: 'Should we add more examples in the assembly technique section?',
    timestamp: new Date('2024-12-03T09:45:00'),
    slideId: '7',
    resolved: false,
  },
];
