import React from "react";
import { TextInput, TextInputProps } from "react-native";

export interface InputProps extends TextInputProps {
  id?: string;
  className?: string;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, id, style, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        style={[
          {
            flex: 1,
            height: 48,
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 6,
            backgroundColor: "white",
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontSize: 14,
            color: "#111827",
          },
          style,
        ]}
        className={className}
        placeholderTextColor="#6b7280"
        numberOfLines={1}
        textContentType="none"
        autoCorrect={false}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
