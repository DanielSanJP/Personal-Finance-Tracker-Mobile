import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { cn } from "../../lib/utils";

interface MobileDropdownProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options: { label: string; value: string }[];
  className?: string;
  title?: string;
}

export function MobileDropdown({
  value,
  onValueChange,
  placeholder = "Select an option",
  options,
  className,
  title = "Select Option",
}: MobileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);
  const displayValue = selectedOption?.label || placeholder;

  const handleSelect = (optionValue: string) => {
    onValueChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        className={cn(
          "w-full h-12 px-4 py-3 border border-gray-300 rounded-lg bg-white flex-row items-center justify-between",
          className
        )}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text
          className={cn("text-base", value ? "text-gray-900" : "text-gray-500")}
        >
          {displayValue}
        </Text>
        <Text className="text-gray-500 text-lg">▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="slide"
        presentationStyle="overFullScreen"
        statusBarTranslucent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
          style={{ paddingTop: 0 }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="bg-white rounded-t-2xl max-h-96">
              {/* Drag indicator */}
              <View className="flex items-center py-4">
                <View className="w-12 h-1 bg-gray-300 rounded-full" />
              </View>

              {/* Title */}
              <View className="px-6 pb-4">
                <Text className="text-lg font-semibold text-gray-900">
                  {title}
                </Text>
              </View>

              {/* Options */}
              <ScrollView className="px-6 pb-6">
                {options.map((option, index) => {
                  const isSelected = option.value === value;
                  return (
                    <View key={option.value}>
                      <TouchableOpacity
                        className={cn(
                          "flex-row items-center justify-between py-4 px-3 rounded-lg min-h-[56px]",
                          isSelected
                            ? "bg-blue-50"
                            : "bg-white active:bg-gray-50"
                        )}
                        onPress={() => handleSelect(option.value)}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={cn(
                            "text-base flex-1",
                            isSelected
                              ? "text-blue-600 font-medium"
                              : "text-gray-900"
                          )}
                        >
                          {option.label}
                        </Text>
                        {isSelected && (
                          <Text className="text-blue-600 text-lg font-bold">
                            ✓
                          </Text>
                        )}
                      </TouchableOpacity>
                      {index < options.length - 1 && (
                        <View className="h-px bg-gray-100 mx-3" />
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
