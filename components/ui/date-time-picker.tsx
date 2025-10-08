import RNDateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
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
import { Label } from "./label";

interface DateTimePickerProps {
  date?: Date;
  onDateTimeChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  showLabel?: boolean;
  required?: boolean;
}

export function DateTimePicker({
  date,
  onDateTimeChange,
  placeholder = "Select date",
  className,
  id = "date-time-picker",
  disabled = false,
  minimumDate,
  maximumDate,
  showLabel = true,
  required = false,
}: DateTimePickerProps) {
  const [showDateDialog, setShowDateDialog] = React.useState(false);
  const [showNativeDatePicker, setShowNativeDatePicker] = React.useState(false);
  const [showNativeTimePicker, setShowNativeTimePicker] = React.useState(false);
  const [tempDate, setTempDate] = React.useState(date || new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date
  );

  // Sync with external date prop changes
  React.useEffect(() => {
    if (date) {
      setSelectedDate(date);
      setTempDate(date);
    }
  }, [date]);

  // ============= DATE HANDLERS =============
  const handleNativeDateChange = (event: any, newDate?: Date) => {
    setShowNativeDatePicker(false);
    if (newDate && event.type === "set") {
      // Preserve the time when date changes
      const updatedDate = new Date(newDate);
      if (selectedDate) {
        updatedDate.setHours(
          selectedDate.getHours(),
          selectedDate.getMinutes(),
          0,
          0
        );
      }
      setSelectedDate(updatedDate);
      onDateTimeChange?.(updatedDate);
    }
  };

  const handleCalendarSelect = (newDate: Date) => {
    setTempDate(newDate);
  };

  const handleDateConfirm = () => {
    // Preserve the time when confirming date
    const updatedDate = new Date(tempDate);
    if (selectedDate) {
      updatedDate.setHours(
        selectedDate.getHours(),
        selectedDate.getMinutes(),
        0,
        0
      );
    }
    setSelectedDate(updatedDate);
    onDateTimeChange?.(updatedDate);
    setShowDateDialog(false);
  };

  const openDatePicker = () => {
    if (disabled) return;

    if (Platform.OS === "android") {
      setShowNativeDatePicker(true);
    } else {
      setTempDate(selectedDate || new Date());
      setShowDateDialog(true);
    }
  };

  // ============= TIME HANDLERS =============
  const handleNativeTimeChange = (event: any, newTime?: Date) => {
    setShowNativeTimePicker(false);
    if (newTime && event.type === "set") {
      const updatedDate = selectedDate ? new Date(selectedDate) : new Date();
      updatedDate.setHours(newTime.getHours(), newTime.getMinutes(), 0, 0);
      setSelectedDate(updatedDate);
      onDateTimeChange?.(updatedDate);
    }
  };

  const openTimePicker = () => {
    if (disabled) return;
    setShowNativeTimePicker(true);
  };

  // ============= FORMATTERS =============
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12; // Convert to 12-hour format, 0 becomes 12
    return `${displayHours}:${minutes} ${period}`;
  };

  return (
    <View className={className}>
      {/* Side-by-side Date and Time */}
      <View className="flex flex-row gap-4">
        {/* DATE PICKER */}
        <View className="flex-1">
          {showLabel && (
            <Label className="mb-2 px-1">
              Date {required && <Text className="text-red-500">*</Text>}
            </Label>
          )}
          <TouchableOpacity
            className={cn(
              "w-full justify-between font-normal h-12 px-3 py-3 border border-gray-300 rounded-lg bg-white",
              !selectedDate && "text-muted-foreground",
              disabled && "bg-gray-50 opacity-60"
            )}
            onPress={openDatePicker}
            activeOpacity={0.7}
            disabled={disabled}
          >
            <View className="flex flex-row items-center justify-between w-full">
              <Text
                style={{
                  flex: 1,
                  fontSize: 12,
                  marginRight: 6,
                  color: selectedDate ? "#111827" : "#6b7280",
                }}
                numberOfLines={1}
              >
                {selectedDate ? formatDate(selectedDate) : placeholder}
              </Text>
              <Feather name="calendar" size={14} color="#6b7280" />
            </View>
          </TouchableOpacity>
        </View>

        {/* TIME PICKER */}
        <View className="flex-1">
          {showLabel && (
            <Label className="mb-2 px-1">
              Time {required && <Text className="text-red-500">*</Text>}
            </Label>
          )}
          <TouchableOpacity
            className={cn(
              "w-full justify-between font-normal h-12 px-3 py-3 border border-gray-300 rounded-lg bg-white",
              disabled && "bg-gray-50 opacity-60"
            )}
            onPress={openTimePicker}
            activeOpacity={0.7}
            disabled={disabled}
          >
            <View className="flex flex-row items-center justify-between w-full">
              <Text
                style={{
                  flex: 1,
                  fontSize: 12,
                  marginRight: 6,
                  color: "#111827",
                }}
                numberOfLines={1}
              >
                {selectedDate ? formatTime(selectedDate) : "12:00"}
              </Text>
              <Feather name="clock" size={14} color="#6b7280" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ============= NATIVE PICKERS ============= */}
      {/* Android Native DatePicker */}
      {showNativeDatePicker && Platform.OS === "android" && (
        <RNDateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={handleNativeDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {/* Android Native TimePicker */}
      {showNativeTimePicker && Platform.OS === "android" && (
        <RNDateTimePicker
          value={selectedDate || new Date()}
          mode="time"
          display="default"
          onChange={handleNativeTimeChange}
        />
      )}

      {/* ============= iOS CALENDAR DIALOG ============= */}
      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent onClose={() => setShowDateDialog(false)}>
          <DialogHeader>
            <DialogTitle>Select Date</DialogTitle>
          </DialogHeader>

          <View className="py-4">
            <Calendar
              selected={tempDate}
              onSelect={handleCalendarSelect}
              mode="single"
              minimumDate={minimumDate}
            />
          </View>

          <DialogFooter>
            <Button
              variant="outline"
              onPress={() => setShowDateDialog(false)}
              className="w-full"
            >
              Cancel
            </Button>
            <Button onPress={handleDateConfirm} className="w-full mt-2">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============= iOS TIME PICKER DIALOG ============= */}
      {Platform.OS === "ios" && (
        <Dialog
          open={showNativeTimePicker}
          onOpenChange={setShowNativeTimePicker}
        >
          <DialogContent onClose={() => setShowNativeTimePicker(false)}>
            <DialogHeader>
              <DialogTitle>Select Time</DialogTitle>
            </DialogHeader>

            <View className="py-4 items-center">
              <RNDateTimePicker
                value={selectedDate || new Date()}
                mode="time"
                display="spinner"
                textColor="#000000"
                is24Hour={false}
                onChange={(event, newTime) => {
                  if (newTime) {
                    const updatedDate = selectedDate
                      ? new Date(selectedDate)
                      : new Date();
                    updatedDate.setHours(
                      newTime.getHours(),
                      newTime.getMinutes(),
                      0,
                      0
                    );
                    setSelectedDate(updatedDate);
                  }
                }}
                style={{ height: 200, width: "100%" }}
              />
            </View>

            <DialogFooter>
              <Button
                variant="outline"
                onPress={() => setShowNativeTimePicker(false)}
                className="w-full"
              >
                Cancel
              </Button>
              <Button
                onPress={() => {
                  onDateTimeChange?.(selectedDate);
                  setShowNativeTimePicker(false);
                }}
                className="w-full mt-2"
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </View>
  );
}
