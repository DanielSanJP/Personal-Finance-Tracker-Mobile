import * as React from "react";
import { TouchableOpacity, Text, Modal, View } from "react-native";
import { cn } from "../../lib/utils";
import { Calendar } from "./calendar";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "dd/mm/yyyy",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleDateSelect = (selectedDate: Date) => {
    onDateChange?.(selectedDate);
    setOpen(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB");
  };

  return (
    <>
      <TouchableOpacity
        className={cn(
          "w-full justify-between font-normal h-10 px-4 py-3 border border-input rounded-lg bg-background",
          !date && "text-muted-foreground",
          className
        )}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <View className="flex flex-row items-center justify-between w-full">
          <Text
            className={cn(
              "text-sm",
              date ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {date ? formatDate(date) : placeholder}
          </Text>
          <Text className="text-muted-foreground">📅</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center p-4"
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="bg-background rounded-lg p-4 shadow-lg max-w-sm w-full">
              <Calendar
                selected={date}
                onSelect={handleDateSelect}
                mode="single"
              />
              <TouchableOpacity
                className="mt-4 bg-secondary rounded-md p-2"
                onPress={() => setOpen(false)}
                activeOpacity={0.7}
              >
                <Text className="text-secondary-foreground text-center text-sm">
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
