export type PipAspectRatio = {
  width: number;
  height: number;
};

export type PipAction = {
  id: string;
  icon: string;
  title: string;
  description?: string;
};

export type PipParams = {
  aspectRatio?: PipAspectRatio;
  actions?: PipAction[];
  autoEnter?: boolean;
  seamlessResize?: boolean;
  title?: string;
  subtitle?: string;
};

export type PipSubscription = {
  remove: () => void;
};

export type ReactNativePipEvents = {
  onPipModeChange: (event: { isInPip: boolean }) => void;
  onPipAction: (event: { id: string }) => void;
};
