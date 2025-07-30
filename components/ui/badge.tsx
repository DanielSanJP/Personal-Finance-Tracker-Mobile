import React from "react";
import { View, Text } from "react-native";
import { cn } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

const badgeVariants = {
  default: "bg-gray-900 text-gray-50 hover:bg-gray-900/80",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-100/80",
  destructive: "bg-red-500 text-gray-50 hover:bg-red-500/80",
  outline: "text-gray-950 border border-gray-200",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <View
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2",
        badgeVariants[variant],
        className
      )}
    >
      <Text
        className={cn(
          "text-xs font-semibold",
          variant === "default" && "text-gray-50",
          variant === "secondary" && "text-gray-900",
          variant === "destructive" && "text-gray-50",
          variant === "outline" && "text-gray-950"
        )}
      >
        {children}
      </Text>
    </View>
  );
}
