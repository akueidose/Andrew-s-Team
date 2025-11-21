export interface VideoState {
  url: string;
  name: string;
  type: string;
}

export interface PlayerState {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
}

export enum GeminiStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface AnalysisResult {
  text: string;
  timestamp: number;
}