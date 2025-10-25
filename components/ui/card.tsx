import * as React from "react";
import { Text, View } from "react-native";
import { cn } from "../../lib/utils";

interface ViewProps {
  className?: string;
  children?: React.ReactNode;
}

function Card({ className, children }: ViewProps) {
  return (
    <View
      className={cn(
        "bg-card-light dark:bg-card-dark flex flex-col rounded-xl border border-border-light dark:border-border-dark shadow-sm",
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
    <Text
      className={cn(
        "text-lg font-semibold text-card-foreground-light dark:text-card-foreground-dark",
        className
      )}
    >
      {children}
    </Text>
  );
}

function CardDescription({ className, children }: ViewProps) {
  return (
    <Text
      className={cn(
        "text-sm text-muted-foreground-light dark:text-muted-foreground-dark mt-1",
        className
      )}
    >
      {children}
    </Text>
  );
}

function CardContent({ className, children }: ViewProps) {
  return <View className={cn("px-6 pb-6", className)}>{children}</View>;
}

function CardFooter({ className, children }: ViewProps) {
  return (
    <View
      className={cn(
        "px-6 pb-6 pt-4 border-t border-border-light dark:border-border-dark",
        className
      )}
    >
      {children}
    </View>
  );
}

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
