import React, { Component, ErrorInfo, ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
  fallbackComponent?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console (can be sent to error tracking service)
    console.error("ErrorBoundary caught an error:", error);
    console.error("Error info:", errorInfo);
    console.error("Component stack:", errorInfo.componentStack);

    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send to error tracking service (Sentry, Bugsnag, etc.)
    // logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent(this.state.error, this.resetError);
      }

      // Default fallback UI
      return (
        <View className="flex-1 bg-gray-50 p-6 justify-center">
          <View className="bg-white rounded-lg p-6 shadow-sm border border-red-200">
            <Text className="text-xl font-bold text-red-600 mb-4">
              ⚠️ Something went wrong
            </Text>

            <Text className="text-sm text-gray-700 mb-4">
              The app encountered an error and could not continue. This has been
              logged for debugging.
            </Text>

            {/* Error Details (Collapsible) */}
            <View className="bg-red-50 p-4 rounded-lg mb-4">
              <Text className="text-xs font-bold text-red-800 mb-2">
                Error Details:
              </Text>
              <ScrollView
                className="max-h-40"
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                <Text className="text-xs text-red-700 font-mono">
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text className="text-xs text-red-600 mt-2 font-mono">
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3">
              <Button onPress={this.resetError} className="w-full">
                <Text className="text-white font-semibold">Try Again</Text>
              </Button>

              <Button
                variant="outline"
                onPress={() => {
                  // Copy error to clipboard for debugging
                  if (this.state.error) {
                    const errorText = `${this.state.error.toString()}\n\n${
                      this.state.errorInfo?.componentStack || ""
                    }`;
                    console.log("Error copied:", errorText);
                  }
                }}
                className="w-full"
              >
                <Text>Copy Error Details</Text>
              </Button>
            </View>

            {/* Debug Info */}
            <View className="mt-6 pt-4 border-t border-gray-200">
              <Text className="text-xs text-gray-500 text-center">
                If this keeps happening, please report this error.
              </Text>
              <Text className="text-xs text-gray-400 text-center mt-1">
                Error: {this.state.error.name}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// Convenience hook for functional components to trigger error boundary
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
};
