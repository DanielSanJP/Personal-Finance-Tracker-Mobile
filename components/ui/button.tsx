import { cva, type VariantProps } from "class-variance-authority";
import { useColorScheme } from "nativewind";
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
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-light dark:bg-primary-dark shadow-sm",
        destructive: "bg-destructive-light dark:bg-destructive-dark shadow-sm",
        outline:
          "border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark shadow-sm",
        secondary: "bg-secondary-light dark:bg-secondary-dark shadow-sm",
        ghost: "",
        link: "underline-offset-4",
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
      default:
        "text-primary-foreground-light dark:text-primary-foreground-dark",
      destructive:
        "text-destructive-foreground-light dark:text-destructive-foreground-dark",
      outline: "text-foreground-light dark:text-foreground-dark",
      secondary:
        "text-secondary-foreground-light dark:text-secondary-foreground-dark",
      ghost: "text-foreground-light dark:text-foreground-dark",
      link: "text-primary-light dark:text-primary-dark",
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Create fallback styles for better mobile support with dark mode
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    };

    // Create completely separate style objects for web and native
    const getShadowStyles = () => {
      if (Platform.OS === "web") {
        return { boxShadow: "0 1px 1px rgba(0, 0, 0, 0.05)" } as ViewStyle;
      } else {
        return {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 1,
          elevation: 1,
        } as ViewStyle;
      }
    };

    const shadowStyles = getShadowStyles();

    switch (variant) {
      case "default":
        return {
          ...baseStyle,
          ...shadowStyles,
          backgroundColor: isDark ? "#ebebeb" : "#1a1a1a", // primary
        };
      case "outline":
        return {
          ...baseStyle,
          ...shadowStyles,
          backgroundColor: isDark ? "#0a0a0a" : "#ffffff", // background (slightly darker in dark mode)
          borderWidth: 1,
          borderColor: isDark ? "#444444" : "#ebebeb", // visible border in dark mode
        };
      case "secondary":
        return {
          ...baseStyle,
          ...shadowStyles,
          backgroundColor: isDark ? "#444444" : "#f7f7f7", // secondary
        };
      case "destructive":
        return {
          ...baseStyle,
          ...shadowStyles,
          backgroundColor: isDark ? "#cc5b49" : "#dc4439", // destructive
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
        return { ...baseStyle, color: isDark ? "#1a1a1a" : "#fcfcfc" }; // primary-foreground
      case "outline":
        return { ...baseStyle, color: isDark ? "#fcfcfc" : "#0a0a0a" }; // foreground
      case "secondary":
        return { ...baseStyle, color: isDark ? "#fcfcfc" : "#1a1a1a" }; // secondary-foreground
      case "destructive":
        return { ...baseStyle, color: "#fcfcfc" }; // destructive-foreground (same in both modes)
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
