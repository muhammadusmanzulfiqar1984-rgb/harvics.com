import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-6 text-[#6B1F2B]">
          <div className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-[0_40px_80px_rgba(107,31,43,0.1)] border border-[#C3A35E]/10 text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="text-red-500" size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight uppercase">Something went wrong</h2>
              <p className="text-sm text-[#C3A35E] font-medium leading-relaxed">
                An unexpected error occurred. Our team has been notified.
              </p>
            </div>
            
            {this.state.error && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">Error Details</p>
                <p className="text-xs font-mono text-red-700 break-all">{this.state.error.message}</p>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#6B1F2B] text-white py-4 rounded-2xl font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-[#6B1F2B]/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <RefreshCw size={18} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
