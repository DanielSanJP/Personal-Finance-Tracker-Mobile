import * as React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const calendarVariants = cva("bg-background p-3 w-full", {
  variants: {
    variant: {
      default: "bg-card",
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
}

function Calendar({
  className,
  variant,
  selected,
  onSelect,
  mode = "single",
  ...props
}: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

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

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<View key={`empty-${i}`} className="w-10 h-10" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected =
        selected && selected.toDateString() === date.toDateString();

      days.push(
        <TouchableOpacity
          key={day}
          className={cn(
            "w-10 h-10 rounded-md flex items-center justify-center",
            isSelected ? "bg-primary" : "hover:bg-accent"
          )}
          onPress={() => onSelect?.(date)}
          activeOpacity={0.7}
        >
          <Text
            className={cn(
              "text-sm",
              isSelected
                ? "text-primary-foreground font-medium"
                : "text-card-foreground"
            )}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <View className={cn(calendarVariants({ variant }), className)} {...props}>
      {/* Header */}
      <View className="flex flex-row items-center justify-between mb-4">
        <TouchableOpacity
          onPress={goToPreviousMonth}
          className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-accent"
          activeOpacity={0.7}
        >
          <Text className="text-card-foreground">‹</Text>
        </TouchableOpacity>

        <Text className="text-sm font-medium text-card-foreground">
          {monthNames[month]} {year}
        </Text>

        <TouchableOpacity
          onPress={goToNextMonth}
          className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-accent"
          activeOpacity={0.7}
        >
          <Text className="text-card-foreground">›</Text>
        </TouchableOpacity>
      </View>

      {/* Week day headers */}
      <View className="flex flex-row mb-2">
        {weekDays.map((day) => (
          <View key={day} className="w-10 h-8 flex items-center justify-center">
            <Text className="text-xs text-muted-foreground font-normal">
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View className="flex flex-row flex-wrap">{renderDays()}</View>
    </View>
  );
}

export { Calendar };
