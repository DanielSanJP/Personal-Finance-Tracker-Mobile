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
          "w-full h-12 px-4 py-3 border border-input-light dark:border-input-dark rounded-lg bg-background-light dark:bg-background-dark flex-row items-center justify-between",
          className
        )}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text
          className={cn(
            "text-base",
            value
              ? "text-foreground-light dark:text-foreground-dark"
              : "text-muted-foreground-light dark:text-muted-foreground-dark"
          )}
        >
          {displayValue}
        </Text>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-lg">
          ▼
        </Text>
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
            <View className="bg-card-light dark:bg-card-dark rounded-t-2xl max-h-96">
              {/* Drag indicator */}
              <View className="flex items-center py-4">
                <View className="w-12 h-1 bg-border-light dark:bg-border-dark rounded-full" />
              </View>

              {/* Title */}
              <View className="px-6 pb-4">
                <Text className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
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
                            ? "bg-secondary-light dark:bg-secondary-dark"
                            : "bg-transparent active:bg-muted-light active:dark:bg-muted-dark"
                        )}
                        onPress={() => handleSelect(option.value)}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={cn(
                            "text-base flex-1",
                            isSelected
                              ? "text-foreground-light dark:text-foreground-dark font-medium"
                              : "text-foreground-light dark:text-foreground-dark"
                          )}
                        >
                          {option.label}
                        </Text>
                        {isSelected && (
                          <Text className="text-primary-light dark:text-primary-dark text-lg font-bold">
                            ✓
                          </Text>
                        )}
                      </TouchableOpacity>
                      {index < options.length - 1 && (
                        <View className="h-px bg-border-light dark:bg-border-dark mx-3" />
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
