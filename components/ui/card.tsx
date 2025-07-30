import * as React from "react";
import { View, Text } from "react-native";
import { cn } from "../../lib/utils";

interface ViewProps {
  className?: string;
  children?: React.ReactNode;
}

function Card({ className, children }: ViewProps) {
  return (
    <View
      className={cn(
        "bg-white flex flex-col rounded-xl border border-gray-200 shadow-sm",
        className
      )}
    >
      {children}
    </View>
  );
}

function CardHeader({ className, children }: ViewProps) {
  return <View className={cn("px-6 pt-6 pb-4", className)}>{children}</View>;
}

function CardTitle({ className, children }: ViewProps) {
  return (
    <Text className={cn("text-lg font-semibold text-gray-900", className)}>
      {children}
    </Text>
  );
}

function CardDescription({ className, children }: ViewProps) {
  return (
    <Text className={cn("text-sm text-gray-600 mt-1", className)}>
      {children}
    </Text>
  );
}

function CardContent({ className, children }: ViewProps) {
  return <View className={cn("px-6 pb-6", className)}>{children}</View>;
}

function CardFooter({ className, children }: ViewProps) {
  return (
    <View className={cn("px-6 pb-6 pt-4 border-t border-gray-200", className)}>
      {children}
    </View>
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
