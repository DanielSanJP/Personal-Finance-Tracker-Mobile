import React from "react";
import { View } from "react-native";
import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
}

function Skeleton({
  className,
  ...props
}: SkeletonProps & React.ComponentProps<typeof View>) {
  return (
    <View className={cn("bg-gray-200 rounded-md", className)} {...props} />
  );
}

export { Skeleton };
