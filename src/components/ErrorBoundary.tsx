import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-bg-primary p-5">
          <div className="max-w-[500px] rounded-lg bg-bg-secondary p-8 text-center">
            <h1 className="mb-4 font-mono text-2xl text-red-500">
              Something went wrong
            </h1>
            <p className="mb-6 break-words font-mono text-base text-gray-400">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={this.handleReset}
              className="cursor-pointer rounded border-none bg-gray-700 px-6 py-3 font-mono text-base text-white hover:bg-gray-600 focus:ring-2 focus:ring-primary"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
