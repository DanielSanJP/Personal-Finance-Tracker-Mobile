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
    <View
      className={cn("bg-muted-light dark:bg-muted-dark rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
