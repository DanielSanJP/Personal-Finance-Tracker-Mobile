import { useColorScheme } from "nativewind";
import React from "react";
import { TextInput, TextInputProps } from "react-native";

export interface InputProps extends TextInputProps {
  id?: string;
  className?: string;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, id, style, ...props }, ref) => {
    const { colorScheme: theme } = useColorScheme();
    const isDark = theme === "dark";

    return (
      <TextInput
        ref={ref}
        style={[
          {
            flex: 1,
            height: 48,
            borderWidth: 1,
            borderColor: isDark ? "#1a1a1a" : "#ebebeb", // border-light/dark
            borderRadius: 6,
            backgroundColor: isDark ? "#0a0a0a" : "#ffffff", // background-light/dark
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontSize: 14,
            color: isDark ? "#fcfcfc" : "#0a0a0a", // foreground-light/dark
          },
          style,
        ]}
        className={className}
        placeholderTextColor={isDark ? "#b5b5b5" : "#8e8e8e"} // muted-foreground-light/dark
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
