export type GameMode = 'regular' | 'hard' | 'random' | 'scrambled';

export interface CustomGameConfig {
    mode: GameMode;
    selectedTags: string[];
    minColors: number;
    maxColors: number;
    isTimed: boolean;
    timeLimitSeconds: number;
}