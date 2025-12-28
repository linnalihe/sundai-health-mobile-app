export interface TonePreference {
  id: string;
  name: string;
  description: string;
}

export const TONE_PREFERENCES: TonePreference[] = [
  {
    id: 'casual',
    name: 'Casual',
    description: 'Relaxed and conversational, like chatting with a friend',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clear, structured, and focused on results',
  },
  {
    id: 'playful',
    name: 'Playful',
    description: 'Fun, lighthearted with humor and creativity',
  },
  {
    id: 'direct',
    name: 'Direct',
    description: 'Straightforward and to the point',
  },
];

export const AI_MODELS = [
  { id: 'claude', name: 'Claude (Anthropic)', description: 'Thoughtful and nuanced responses' },
  { id: 'gemini', name: 'Gemini (Google)', description: 'Creative and conversational' },
] as const;

export const DEFAULT_TONE = TONE_PREFERENCES[0].id;
export const DEFAULT_AI_MODEL = AI_MODELS[0].id;
