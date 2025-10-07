import { Picker } from "@react-native-picker/picker";
import React, { useRef } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

interface PickerOption {
  label: string;
  value: string;
}

interface NativePickerProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: PickerOption[];
  placeholder?: string;
  className?: string;
}

export function NativePicker({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  className,
}: NativePickerProps) {
  const pickerRef = useRef<any>(null);

  // Find the display label for the current value
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || placeholder;

  // Get shadow styles based on platform (matching Button component)
  const getShadowStyles = () => {
    if (Platform.OS === "web") {
      return { boxShadow: "0 1px 1px rgba(0, 0, 0, 0.05)" };
    } else {
      return {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
      };
    }
  };

  return (
    <View className={className}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      )}

      <View style={{ position: "relative", zIndex: 1 }}>
        {/* Button-style visual */}
        <View
          pointerEvents="none"
          style={[
            {
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#ebebeb",
              paddingHorizontal: 16,
              height: 44,
            },
            getShadowStyles(),
          ]}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: !selectedOption ? "#9CA3AF" : "#000000",
            }}
          >
            {displayValue}
          </Text>
          <Text style={{ fontSize: 14, color: "#4B5563", marginLeft: 8 }}>
            ▼
          </Text>
        </View>

        {/* Actual Picker overlaid - receives all touches */}
        {/* Extended left and right to make dropdown wider */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: -40,
            right: -40,
            height: 44,
          }}
        >
          <Picker
            ref={pickerRef}
            selectedValue={value}
            onValueChange={(itemValue) => onValueChange(itemValue as string)}
            style={styles.pickerOverlay}
            mode={Platform.OS === "android" ? "dialog" : undefined}
            dropdownIconColor="#4B5563"
          >
            {options.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
                style={
                  Platform.OS === "android"
                    ? { fontSize: 16, paddingVertical: 14 }
                    : undefined
                }
              />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerOverlay: {
    height: 44,
    width: "100%",
    opacity: 0,
  },
});
