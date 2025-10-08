import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
  const [showModal, setShowModal] = useState(false);
  const [tempValue, setTempValue] = useState(value);

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

  const handleConfirm = () => {
    onValueChange(tempValue);
    setShowModal(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setShowModal(false);
  };

  // iOS uses Modal, Android uses native dialog
  if (Platform.OS === "ios") {
    return (
      <View className={className}>
        {label && (
          <Text className="text-sm font-medium text-gray-700 mb-1">
            {label}
          </Text>
        )}

        <Pressable
          onPress={() => setShowModal(true)}
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
              flex: 1,
            }}
          >
            {displayValue}
          </Text>
          <Text style={{ fontSize: 14, color: "#4B5563" }}>▼</Text>
        </Pressable>

        <Modal
          visible={showModal}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable onPress={handleCancel} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </Pressable>
                <Text style={styles.modalTitle}>{label || "Select"}</Text>
                <Pressable onPress={handleConfirm} style={styles.modalButton}>
                  <Text style={[styles.modalButtonText, styles.confirmText]}>
                    Done
                  </Text>
                </Pressable>
              </View>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                bounces={true}
                showsVerticalScrollIndicator={true}
              >
                {options.map((option) => {
                  const isSelected = tempValue === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setTempValue(option.value)}
                      style={[
                        styles.listItem,
                        isSelected && styles.listItemSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.listItemText,
                          isSelected && styles.listItemTextSelected,
                        ]}
                        numberOfLines={2}
                      >
                        {option.label}
                      </Text>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Android native dialog
  return (
    <View className={className}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      )}

      <View style={{ position: "relative", zIndex: 1 }}>
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

        <View
          style={{
            position: "absolute",
            top: 0,
            left: -40,
            right: -40,
            height: 44,
          }}
          pointerEvents="box-only"
        >
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => onValueChange(itemValue as string)}
            style={styles.pickerOverlay}
            mode="dialog"
            dropdownIconColor="#4B5563"
          >
            {options.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
                style={{ fontSize: 16, paddingVertical: 14 }}
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 10,
    paddingVertical: 40,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: "100%",
    height: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 80,
  },
  modalButtonText: {
    fontSize: 20,
    color: "#007AFF",
    fontWeight: "400",
  },
  confirmText: {
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingVertical: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    minHeight: 60,
  },
  listItemSelected: {
    backgroundColor: "#eff6ff",
  },
  listItemText: {
    fontSize: 18,
    color: "#111827",
    flex: 1,
    marginRight: 12,
  },
  listItemTextSelected: {
    color: "#007AFF",
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 24,
    color: "#007AFF",
    fontWeight: "bold",
  },
});
