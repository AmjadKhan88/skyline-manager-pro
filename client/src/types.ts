import { ReactNode, ComponentType } from 'react';

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorTimestamp?: number;
}

export interface ErrorBoundaryFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
  boundaryName?: string;
  isFullScreen?: boolean;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent?: ComponentType<ErrorBoundaryFallbackProps>;
  fallbackProps?: Partial<ErrorBoundaryFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
  reportUrl?: string;
  boundaryName?: string;
  resetKeys?: any[];
  context?: Record<string, any>;
  isFullScreen?: boolean;
}