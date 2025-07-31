import * as React from "react";
import { View, Text } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        default: "bg-card border-border",
        destructive: "bg-card border-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface AlertProps extends VariantProps<typeof alertVariants> {
  className?: string;
  children: React.ReactNode;
}

function Alert({ className, variant, children, ...props }: AlertProps) {
  return (
    <View className={cn(alertVariants({ variant }), className)} {...props}>
      {children}
    </View>
  );
}

interface AlertTitleProps {
  className?: string;
  children: React.ReactNode;
}

function AlertTitle({ className, children, ...props }: AlertTitleProps) {
  return (
    <Text
      className={cn(
        "font-medium tracking-tight text-card-foreground mb-1",
        className
      )}
      {...props}
    >
      {children}
    </Text>
  );
}

interface AlertDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

function AlertDescription({
  className,
  children,
  ...props
}: AlertDescriptionProps) {
  return (
    <Text
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
      {...props}
    >
      {children}
    </Text>
  );
}

export { Alert, AlertTitle, AlertDescription };
