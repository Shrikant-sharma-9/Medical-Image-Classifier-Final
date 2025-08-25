
export interface Diagnosis {
  condition: string;
  probability: number; // A value between 0 and 1
}

export interface AttentionArea {
  x: number; // percentage from left
  y: number; // percentage from top
  width: number; // percentage width
  height: number; // percentage height
  description: string;
}

export interface AnalysisResult {
  diagnoses: Diagnosis[];
  explanation: string;
  attentionArea: AttentionArea;
}
