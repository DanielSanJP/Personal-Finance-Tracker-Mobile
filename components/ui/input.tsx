import React from "react";
import { TextInput, TextInputProps } from "react-native";
import { cn } from "../../lib/utils";

export interface InputProps extends TextInputProps {
  id?: string;
  className?: string;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, id, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder:text-gray-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        placeholderTextColor="#6b7280"
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
