import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { cn } from "../../lib/utils";

const calendarVariants = cva("bg-white p-4 w-full rounded-lg", {
  variants: {
    variant: {
      default: "bg-white",
      ghost: "bg-transparent",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface CalendarProps extends VariantProps<typeof calendarVariants> {
  className?: string;
  selected?: Date;
  onSelect?: (date: Date) => void;
  mode?: "single" | "multiple" | "range";
  minimumDate?: Date;
}

function Calendar({
  className,
  variant,
  selected,
  onSelect,
  mode = "single",
  minimumDate,
  ...props
}: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(selected || new Date());

  // Update currentDate when selected prop changes
  React.useEffect(() => {
    if (selected) {
      setCurrentDate(selected);
    }
  }, [selected]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const renderDays = () => {
    const days = [];
    const totalCells = 42; // 6 rows × 7 days = 42 cells

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<View key={`empty-start-${i}`} className="w-10 h-10 m-1" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected =
        selected && selected.toDateString() === date.toDateString();
      const isDisabled = minimumDate && date < minimumDate;

      days.push(
        <TouchableOpacity
          key={day}
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center m-1",
            isSelected
              ? "bg-blue-600"
              : isDisabled
              ? "bg-transparent"
              : "bg-transparent active:bg-gray-100"
          )}
          onPress={() => !isDisabled && onSelect?.(date)}
          activeOpacity={isDisabled ? 1 : 0.7}
          disabled={isDisabled}
        >
          <Text
            className={cn(
              "text-base font-medium",
              isSelected
                ? "text-white"
                : isDisabled
                ? "text-gray-300"
                : "text-gray-900"
            )}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    // Fill remaining cells to ensure complete rows
    const remainingCells = totalCells - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push(<View key={`empty-end-${i}`} className="w-10 h-10 m-1" />);
    }

    return days;
  };

  return (
    <View className={cn(calendarVariants({ variant }), className)} {...props}>
      {/* Header */}
      <View className="flex flex-row items-center justify-between mb-6">
        <TouchableOpacity
          onPress={goToPreviousMonth}
          className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100"
          activeOpacity={0.7}
        >
          <Text className="text-gray-900 text-lg font-bold">‹</Text>
        </TouchableOpacity>

        <Text className="text-lg font-semibold text-gray-900">
          {monthNames[month]} {year}
        </Text>

        <TouchableOpacity
          onPress={goToNextMonth}
          className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100"
          activeOpacity={0.7}
        >
          <Text className="text-gray-900 text-lg font-bold">›</Text>
        </TouchableOpacity>
      </View>

      {/* Week day headers */}
      <View className="flex flex-row mb-4">
        {weekDays.map((day) => (
          <View
            key={day}
            className="w-10 h-8 flex items-center justify-center mx-1"
          >
            <Text className="text-sm text-gray-600 font-semibold">{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View className="flex flex-col">
        {/* Render days in rows of 7 */}
        {Array.from({ length: 6 }, (_, rowIndex) => (
          <View key={rowIndex} className="flex flex-row">
            {renderDays().slice(rowIndex * 7, (rowIndex + 1) * 7)}
          </View>
        ))}
      </View>
    </View>
  );
}

export { Calendar };
