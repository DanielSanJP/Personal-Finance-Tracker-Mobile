import { useColorScheme } from "nativewind";
import * as React from "react";
import { Switch as RNSwitch, SwitchProps } from "react-native";

interface CustomSwitchProps
  extends Omit<SwitchProps, "value" | "onValueChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

function Switch({
  checked = false,
  onCheckedChange,
  className,
  disabled = false,
  ...props
}: CustomSwitchProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <RNSwitch
      value={checked}
      onValueChange={onCheckedChange}
      disabled={disabled}
      trackColor={{
        false: isDark ? "#444444" : "#e5e5e5", // Inactive: dark gray / light gray
        true: "#3b82f6", // Active: blue-500 for both light and dark mode
      }}
      thumbColor="#ffffff"
      ios_backgroundColor={isDark ? "#444444" : "#e5e5e5"}
      style={{
        opacity: disabled ? 0.5 : 1,
      }}
      {...props}
    />
  );
}

export { Switch };
