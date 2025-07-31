import * as React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { cn } from "../../lib/utils";

interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 4000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const context = React.useContext(ToastContext);
  if (!context) return null;

  const { toasts, removeToast } = context;

  return (
    <View className="absolute top-16 left-4 right-4 z-50">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </View>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const getTypeStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-background border-border";
    }
  };

  const getTypeIcon = () => {
    switch (toast.type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      default:
        return "ℹ";
    }
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }],
      }}
      className="mb-2"
    >
      <View
        className={cn(
          "rounded-lg border p-4 shadow-lg flex flex-row items-center justify-between",
          getTypeStyles()
        )}
      >
        <View className="flex flex-row items-center gap-3 flex-1">
          <Text className="text-base">{getTypeIcon()}</Text>
          <Text className="text-foreground text-sm flex-1">
            {toast.message}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          className="ml-2 w-6 h-6 items-center justify-center"
          activeOpacity={0.7}
        >
          <Text className="text-muted-foreground text-sm">×</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return {
    toast: (toast: Omit<Toast, "id">) => context.addToast(toast),
    success: (message: string, duration?: number) =>
      context.addToast({ message, type: "success", duration }),
    error: (message: string, duration?: number) =>
      context.addToast({ message, type: "error", duration }),
    info: (message: string, duration?: number) =>
      context.addToast({ message, type: "info", duration }),
    warning: (message: string, duration?: number) =>
      context.addToast({ message, type: "warning", duration }),
  };
}

// For compatibility with the original Toaster component
export function Toaster() {
  return null; // The ToastContainer is rendered by ToastProvider
}
