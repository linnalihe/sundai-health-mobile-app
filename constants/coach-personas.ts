export interface CoachPersona {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const COACH_PERSONAS: CoachPersona[] = [
  {
    id: 'supportive',
    name: 'Supportive Friend',
    description: 'Warm, encouraging, and always there to cheer you on',
    icon: '🤗',
  },
  {
    id: 'drill_sergeant',
    name: 'Drill Sergeant',
    description: 'Tough love, no-nonsense accountability partner',
    icon: '💪',
  },
  {
    id: 'wise_mentor',
    name: 'Wise Mentor',
    description: 'Thoughtful guidance with deep insights and patience',
    icon: '🧘',
  },
  {
    id: 'enthusiastic_buddy',
    name: 'Enthusiastic Buddy',
    description: 'Energetic and fun, makes every day exciting',
    icon: '🎉',
  },
  {
    id: 'calm_guide',
    name: 'Calm Guide',
    description: 'Peaceful, mindful approach to building habits',
    icon: '🕊️',
  },
];

export const DEFAULT_COACH_PERSONA = COACH_PERSONAS[0].id;
