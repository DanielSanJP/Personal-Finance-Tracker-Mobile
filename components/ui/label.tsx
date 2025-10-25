import React from "react";
import { Text, TextProps } from "react-native";
import { cn } from "../../lib/utils";

export interface LabelProps extends TextProps {
  htmlFor?: string;
  className?: string;
}

const Label = React.forwardRef<Text, LabelProps>(
  ({ className, htmlFor, ...props }, ref) => {
    return (
      <Text
        ref={ref}
        className={cn(
          "text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1",
          className
        )}
        numberOfLines={1}
        ellipsizeMode="tail"
        {...props}
      />
    );
  }
);

Label.displayName = "Label";

export { Label };
