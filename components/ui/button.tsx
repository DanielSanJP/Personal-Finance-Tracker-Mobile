import * as React from "react";
import { TouchableOpacity, Text } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-neutral-900 shadow-xs hover:bg-neutral-800",
        destructive: "bg-red-600 shadow-xs hover:bg-red-700",
        outline:
          "border border-neutral-300 bg-white shadow-xs hover:bg-neutral-50",
        secondary: "bg-neutral-100 shadow-xs hover:bg-neutral-200",
        ghost: "hover:bg-neutral-100",
        link: "text-neutral-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 py-1.5",
        lg: "h-10 px-6 py-3",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva("text-sm font-medium", {
  variants: {
    variant: {
      default: "text-white",
      destructive: "text-white",
      outline: "text-neutral-900",
      secondary: "text-neutral-900",
      ghost: "text-neutral-900",
      link: "text-neutral-900",
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
  return (
    <TouchableOpacity
      className={cn(buttonVariants({ variant, size }), className)}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <Text className={cn(buttonTextVariants({ variant }))}>{children}</Text>
    </TouchableOpacity>
  );
}

export { Button, buttonVariants };
