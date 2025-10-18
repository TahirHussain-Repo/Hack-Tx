import { Component, ErrorInfo, ReactNode } from "react";
import { GlassCard } from "./GlassCard";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <GlassCard className="max-w-md text-center">
            <div className="p-4 rounded-full bg-destructive/20 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="gradient-primary text-primary-foreground focus-ring"
            >
              Reload Application
            </Button>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

