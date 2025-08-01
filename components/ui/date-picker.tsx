import DateTimePicker from "@react-native-community/datetimepicker";
import * as React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Select target date",
  className,
}: DatePickerProps) {
  const [showDialog, setShowDialog] = React.useState(false);
  const [showNativePicker, setShowNativePicker] = React.useState(false);
  const [tempDate, setTempDate] = React.useState(date || new Date());

  // Update tempDate when date prop changes
  React.useEffect(() => {
    if (date) {
      setTempDate(date);
    }
  }, [date]);

  const handleNativeDateChange = (event: any, selectedDate?: Date) => {
    setShowNativePicker(false);
    if (selectedDate && event.type === "set") {
      onDateChange?.(selectedDate);
    }
  };

  const handleCalendarSelect = (selectedDate: Date) => {
    setTempDate(selectedDate);
  };

  const handleConfirm = () => {
    onDateChange?.(tempDate);
    setShowDialog(false);
  };

  const openDatePicker = () => {
    if (Platform.OS === "android") {
      setShowNativePicker(true);
    } else {
      // Ensure tempDate is current when opening dialog
      setTempDate(date || new Date());
      setShowDialog(true);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      <TouchableOpacity
        className={cn(
          "w-full justify-between font-normal h-12 px-4 py-3 border border-gray-300 rounded-lg bg-white",
          !date && "text-muted-foreground",
          className
        )}
        onPress={openDatePicker}
        activeOpacity={0.7}
      >
        <View className="flex flex-row items-center justify-between w-full">
          <Text
            className={cn(
              "text-base",
              date ? "text-gray-900" : "text-gray-500"
            )}
          >
            {date ? formatDate(date) : placeholder}
          </Text>
          <Text className="text-gray-500 text-lg">📅</Text>
        </View>
      </TouchableOpacity>

      {/* Android Native DatePicker */}
      {showNativePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={handleNativeDateChange}
        />
      )}

      {/* iOS/Custom Calendar Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent onClose={() => setShowDialog(false)}>
          <DialogHeader>
            <DialogTitle>Select Date</DialogTitle>
          </DialogHeader>

          <View className="py-4">
            <Calendar
              selected={tempDate}
              onSelect={handleCalendarSelect}
              mode="single"
            />
          </View>

          <DialogFooter>
            <Button
              variant="outline"
              onPress={() => setShowDialog(false)}
              className="w-full"
            >
              Cancel
            </Button>
            <Button onPress={handleConfirm} className="w-full mt-2">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
