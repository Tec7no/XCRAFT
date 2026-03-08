import * as React from 'react';
import { clearAppData } from '@/utils/normalize';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  info?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Application error boundary caught an error', error, info.componentStack);
    this.setState({ info });
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleClearData = () => {
    clearAppData();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { error, info } = this.state;
      const isDev = import.meta.env.DEV;

      // Get first 15 lines of stack trace
      const stackLines = error?.stack?.split('\n').slice(0, 15).join('\n') || '';

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted px-6 text-center">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-3xl font-black text-primary uppercase tracking-widest">Something went wrong</h1>
            <p className="text-muted-foreground">An unexpected error occurred. Please reload the page to continue shopping.</p>

            {/* Dev-only error details */}
            {isDev && error && (
              <div className="text-left bg-red-50 border border-red-200 rounded-lg p-4 space-y-3 max-h-96 overflow-auto">
                <div>
                  <strong className="text-red-700 text-sm">Error Message:</strong>
                  <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap break-words">
                    {error.message}
                  </pre>
                </div>

                {stackLines && (
                  <div>
                    <strong className="text-red-700 text-sm">Stack Trace (first 15 lines):</strong>
                    <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap break-words font-mono">
                      {stackLines}
                    </pre>
                  </div>
                )}

                {info?.componentStack && (
                  <div>
                    <strong className="text-red-700 text-sm">Component Stack:</strong>
                    <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap break-words font-mono">
                      {info.componentStack.split('\n').slice(0, 10).join('\n')}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-bold uppercase text-xs tracking-widest hover:bg-secondary transition-colors"
              >
                Reload
              </button>

              <button
                onClick={() => { window.location.href = '/'; }}
                className="inline-flex items-center justify-center px-6 py-3 bg-muted text-foreground border border-border font-bold uppercase text-xs tracking-widest hover:bg-muted/80 transition-colors"
              >
                Back to Home
              </button>

              {/* Dev-only clear data button */}
              {isDev && (
                <button
                  onClick={this.handleClearData}
                  className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-bold uppercase text-xs tracking-widest hover:bg-red-700 transition-colors"
                >
                  Clear Draft / Reset Local Data
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

