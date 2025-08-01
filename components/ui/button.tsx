import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import {
  Platform,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm",
        destructive: "bg-destructive text-destructive-foreground shadow-sm",
        outline: "border border-input bg-background text-foreground shadow-sm",
        secondary: "bg-secondary text-secondary-foreground shadow-sm",
        ghost: "text-foreground",
        link: "text-primary underline-offset-4",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3 py-1.5",
        lg: "h-12 px-6 py-3",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva("text-sm font-medium text-center", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground",
      secondary: "text-secondary-foreground",
      ghost: "text-foreground",
      link: "text-primary",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

function Button({
  className,
  variant,
  size,
  onPress,
  disabled,
  children,
  ...props
}: ButtonProps) {
  // Create fallback styles for better mobile support
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    };

    switch (variant) {
      case "default":
        return {
          ...baseStyle,
          backgroundColor: "#1a1a1a", // var(--primary) from CSS
          ...(Platform.OS === "web"
            ? { boxShadow: "0 1px 1px rgba(0, 0, 0, 0.05)" }
            : {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 1,
                elevation: 1,
              }),
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "#ffffff", // var(--background) from CSS
          borderWidth: 1,
          borderColor: "#ebebeb", // var(--input) from CSS
          ...(Platform.OS === "web"
            ? { boxShadow: "0 1px 1px rgba(0, 0, 0, 0.05)" }
            : {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 1,
                elevation: 1,
              }),
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: "#f7f7f7", // var(--secondary) from CSS
          ...(Platform.OS === "web"
            ? { boxShadow: "0 1px 1px rgba(0, 0, 0, 0.05)" }
            : {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 1,
                elevation: 1,
              }),
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 14,
      fontWeight: "500",
      textAlign: "center",
    };

    switch (variant) {
      case "default":
        return { ...baseStyle, color: "#fcfcfc" }; // var(--primary-foreground) from CSS
      case "outline":
        return { ...baseStyle, color: "#0a0a0a" }; // var(--foreground) from CSS
      case "secondary":
        return { ...baseStyle, color: "#1a1a1a" }; // var(--secondary-foreground) from CSS
      default:
        return baseStyle;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case "sm":
        return { height: 36, paddingHorizontal: 12, paddingVertical: 6 };
      case "lg":
        return { height: 48, paddingHorizontal: 24, paddingVertical: 12 };
      case "icon":
        return { height: 44, width: 44, paddingHorizontal: 0 };
      default:
        return { height: 44, paddingHorizontal: 16, paddingVertical: 8 };
    }
  };

  return (
    <TouchableOpacity
      className={cn(buttonVariants({ variant, size }), className)}
      style={[getButtonStyle(), getSizeStyle()]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      {typeof children === "string" ? (
        <Text
          className={cn(buttonTextVariants({ variant }))}
          style={getTextStyle()}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

export { Button, buttonVariants };
