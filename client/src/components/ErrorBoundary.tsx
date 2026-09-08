import React, { Component, ComponentType, ErrorInfo, ReactNode } from 'react';
import { ErrorBoundaryFallbackProps, ErrorBoundaryProps, ErrorBoundaryState } from '../types';

// Default fallback component with better UX
const DefaultFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  isFullScreen = true
}) => (
  <div className={`${isFullScreen ? 'min-h-screen flex items-center justify-center' : ''} bg-gradient-to-br from-gray-50 to-gray-100 p-4`}>
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full text-center animate-fade-in">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-red-100 to-pink-100 mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
        Oops! Something went wrong
      </h1>
      
      <p className="text-gray-600 mb-4">
        We've encountered an unexpected error. Don't worry, it's been logged and our team has been notified.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <p className="text-sm font-mono text-gray-700 truncate">{error?.toString()}</p>
        {errorInfo?.componentStack && (
          <details className="mt-2">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              Technical Details
            </summary>
            <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto p-2 bg-gray-100 rounded">
              {errorInfo.componentStack}
            </pre>
          </details>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={resetError}
          className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-medium hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 rounded-xl font-medium hover:from-gray-300 hover:to-gray-400 transition-all duration-200"
        >
          Reload Page
        </button>
      </div>
      
      <p className="text-xs text-gray-400 mt-6">
        Error ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
      </p>
    </div>
  </div>
);

// Main Error Boundary Class
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ 
      errorInfo,
      errorTimestamp: Date.now()
    });

    // Enhanced error logging
    this.logError(error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Report to error monitoring service
    this.reportError(error, errorInfo);
  }

  private logError(error: Error, errorInfo: ErrorInfo): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      state: this.props.context ? JSON.stringify(this.props.context) : undefined
    };

    console.group('🚨 Error Boundary Caught');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.table(errorLog);
    console.groupEnd();
  }

  private reportError(error: Error, errorInfo: ErrorInfo): void {
    // Sentry integration example
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        extra: {
          componentStack: errorInfo.componentStack,
          boundaryName: this.props.boundaryName
        }
      });
    }

    // LogRocket integration
    if (typeof window !== 'undefined' && (window as any).LogRocket) {
      (window as any).LogRocket.captureException(error);
    }

    // Custom error reporting endpoint
    if (this.props.reportUrl) {
      fetch(this.props.reportUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.toString(),
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          timestamp: Date.now()
        })
      }).catch(console.error);
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // Call reset callback if provided
    this.props.onReset?.();
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { 
      children, 
      FallbackComponent = DefaultFallback,
      fallbackProps = {},
      boundaryName = 'ErrorBoundary',
      resetKeys = [],
      isFullScreen = true
    } = this.props;

    if (hasError) {
      return (
        <FallbackComponent
          error={error}
          errorInfo={errorInfo}
          resetError={this.resetErrorBoundary}
          boundaryName={boundaryName}
          isFullScreen={isFullScreen}
          {...fallbackProps}
        />
      );
    }

    return children;
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys } = this.props;
    
    // Reset error boundary when resetKeys change
    if (JSON.stringify(resetKeys) !== JSON.stringify(prevProps.resetKeys)) {
      this.resetErrorBoundary();
    }
  }
}

// Higher-Order Component for functional components
export const withErrorBoundary = <P extends object>(
  Component: ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for manually triggering errors within components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const throwError = React.useCallback((err: Error | string) => {
    const errorObj = err instanceof Error ? err : new Error(err);
    setError(errorObj);
    throw errorObj;
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, throwError, clearError };
};

export default ErrorBoundary;