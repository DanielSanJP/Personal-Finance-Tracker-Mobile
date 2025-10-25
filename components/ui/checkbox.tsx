import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { cn } from "../../lib/utils";

interface CheckboxProps {
  className?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

function Checkbox({
  className,
  checked = false,
  onCheckedChange,
  disabled = false,
  ...props
}: CheckboxProps) {
  const handlePress = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <TouchableOpacity
      className={cn(
        "w-4 h-4 shrink-0 rounded border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark shadow-xs",
        checked &&
          "bg-primary-light dark:bg-primary-dark border-primary-light dark:border-primary-dark",
        disabled && "opacity-50",
        className
      )}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      {checked && (
        <View className="flex items-center justify-center w-full h-full">
          <Text className="text-primary-foreground-light dark:text-primary-foreground-dark text-xs font-bold">
            ✓
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export { Checkbox };
