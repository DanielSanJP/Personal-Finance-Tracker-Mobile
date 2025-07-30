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
        className={cn("text-sm font-medium text-gray-900 mb-1", className)}
        {...props}
      />
    );
  }
);

Label.displayName = "Label";

export { Label };
