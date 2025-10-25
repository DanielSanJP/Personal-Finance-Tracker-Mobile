import React from "react";
import { Text, View } from "react-native";
import { cn } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

const badgeVariants = {
  default: "bg-primary-light dark:bg-primary-dark",
  secondary: "bg-secondary-light dark:bg-secondary-dark",
  destructive: "bg-destructive-light dark:bg-destructive-dark",
  outline: "bg-transparent border border-border-light dark:border-border-dark",
};

const badgeTextVariants = {
  default: "text-primary-foreground-light dark:text-primary-foreground-dark",
  secondary:
    "text-secondary-foreground-light dark:text-secondary-foreground-dark",
  destructive:
    "text-destructive-foreground-light dark:text-destructive-foreground-dark",
  outline: "text-foreground-light dark:text-foreground-dark",
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
