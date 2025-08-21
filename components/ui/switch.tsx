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
  return (
    <RNSwitch
      value={checked}
      onValueChange={onCheckedChange}
      disabled={disabled}
      trackColor={{
        false: "#e5e7eb", // gray-200 equivalent
        true: "#3b82f6", // blue-500 equivalent (primary color)
      }}
      thumbColor={checked ? "#ffffff" : "#ffffff"}
      ios_backgroundColor="#e5e7eb"
      style={{
        opacity: disabled ? 0.5 : 1,
      }}
      {...props}
    />
  );
}

export { Switch };
