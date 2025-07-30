import React from "react";
import { View } from "react-native";
import { cn } from "../../lib/utils";

interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

export function Progress({
  value = 0,
  max = 100,
  className,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <View
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-gray-100",
        className
      )}
      {...props}
    >
      <View
        className={cn("h-full bg-gray-900 transition-all", indicatorClassName)}
        style={{ width: `${percentage}%` }}
      />
    </View>
  );
}
