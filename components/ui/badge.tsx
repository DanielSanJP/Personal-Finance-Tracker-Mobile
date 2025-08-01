import React from "react";
import { Text, View } from "react-native";
import { cn } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

const badgeVariants = {
  default: "bg-gray-900",
  secondary: "bg-gray-100",
  destructive: "bg-red-500",
  outline: "bg-transparent border border-gray-200",
};

const badgeTextVariants = {
  default: "text-white",
  secondary: "text-gray-900",
  destructive: "text-white",
  outline: "text-gray-950",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <View
      className={cn(
        "inline-flex items-center justify-center rounded-md w-fit px-3 py-1 border-0",
        badgeVariants[variant],
        className
      )}
    >
      <Text className={cn("font-bold text-base", badgeTextVariants[variant])}>
        {children}
      </Text>
    </View>
  );
}
