export interface Option {
  id: string;
  text: string;
  weight: number;
  color: string;
}

export interface WeightedOption extends Option {
  normalizedProbability: number; // 0 to 1
}