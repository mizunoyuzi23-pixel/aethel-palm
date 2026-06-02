export type Language = 'ja' | 'en';

export type TarotCard = {
  id: string;
  name: string;
  arcana: 'major' | 'minor' | 'cosmic';
  meaningUpright: string;
  meaningReversed: string;
  description?: string;
  imageUrl?: string;
  imagePlaceholder?: string;
};

export type ReadingResult = {
  cards: {
    card: TarotCard;
    isUpright: boolean;
    position: string;
  }[];
  interpretation: string;
  roadmap: string;
  timestamp: number;
};

export type Interaction = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type?: 'chat' | 'reading';
};

export type PalmAnalysis = {
  lines: Record<string, [number, number][]>;
  handType?: 'left' | 'right';
  confidence?: number;
};

export type UserProfile = {
  name?: string;
  lastVisit?: number;
  history: Interaction[];
  summary?: string; // AI generated summary/memory of the user
};
