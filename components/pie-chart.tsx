import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import { useTransactions } from "../hooks/queries/useTransactions";
import { formatCurrency } from "../lib/utils";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select-mobile";

export const description = "A pie chart showing actual spending by category";

interface PieChartProps {
  spendingData?: { category: string; spentAmount: number }[];
}

// Chart configuration with blue colors
const chartConfig = {
  "Food & Dining": "#3b82f6", // blue-500
  Transportation: "#60a5fa", // blue-400
  Shopping: "#1d4ed8", // blue-700
  Entertainment: "#93c5fd", // blue-300
  "Bills & Utilities": "#1e40af", // blue-800
  "Health & Fitness": "#dbeafe", // blue-100
  Travel: "#2563eb", // blue-600
  Education: "#bfdbfe", // blue-200
  "Personal Care": "#1e3a8a", // blue-900
  Housing: "#6366f1", // indigo-500
  Other: "#6b7280", // gray-500
};

const getColorForCategory = (category: string): string => {
  return chartConfig[category as keyof typeof chartConfig] || chartConfig.Other;
};

// Simple SVG Pie Chart Component
const SimplePieChart = ({
  data,
  onSlicePress,
}: {
  data: {
    category: string;
    amount: number;
    color: string;
    percentage: number;
  }[];
  onSlicePress?: (item: {
    category: string;
    amount: number;
    color: string;
    percentage: number;
  }) => void;
}) => {
  const size = 200;
  const radius = 80;
  const center = size / 2;

  // Helper function to create SVG path for pie slice
  const createPieSlice = (
    startAngle: number,
    endAngle: number,
    color: string,
    item: {
      category: string;
      amount: number;
      color: string;
      percentage: number;
    }
  ) => {
    const sliceAngle = endAngle - startAngle;

    // Handle full circle (100% - single category)
    if (sliceAngle >= 359.99) {
      // Draw as a circle for better rendering and click handling
      // Use onPressIn for immediate response on touch
      return (
        <G
          key={`${startAngle}-${endAngle}`}
          onPressIn={() => onSlicePress?.(item)}
        >
          <Circle cx={center} cy={center} r={radius} fill={color} />
        </G>
      );
    }

    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const largeArcFlag = sliceAngle <= 180 ? "0" : "1";

    const d = [
      "M",
      center,
      center,
      "L",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "Z",
    ].join(" ");

    return (
      <Path
        key={`${startAngle}-${endAngle}`}
        d={d}
        fill={color}
        onPressIn={() => onSlicePress?.(item)}
      />
    );
  };

  // Helper function to convert polar coordinates to cartesian
  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  let currentAngle = 0;

  return (
    <View className="items-center">
      <Svg width={size} height={size}>
        {data.map((item, index) => {
          const sliceAngle = (item.percentage / 100) * 360;
          const slice = createPieSlice(
            currentAngle,
            currentAngle + sliceAngle,
            item.color,
            item
          );
          currentAngle += sliceAngle;
          return slice;
        })}
      </Svg>

      {/* Legend */}
      <View className="mt-4 w-full">
        {data.map((item, index) => (
          <View
            key={index}
            className="flex-row items-center justify-between py-2"
          >
            <View className="flex-row items-center flex-1">
              <View
                className="w-3 h-3 rounded mr-2"
                style={{ backgroundColor: item.color }}
              />
              <Text
                className="text-sm text-foreground-light dark:text-foreground-dark flex-1"
                numberOfLines={1}
              >
                {item.category}
              </Text>
            </View>
            <Text className="text-sm font-medium text-foreground-light dark:text-foreground-dark ml-2">
              {formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export function PieChart({ spendingData: propSpendingData }: PieChartProps) {
  const { data: transactions = [], isLoading } = useTransactions();
  const [selectedDate, setSelectedDate] = useState<{
    year: number;
    month: number;
  }>(() => {
    // Use actual current date
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [isCurrentMonth, setIsCurrentMonth] = useState(true);
  const [selectedSlice, setSelectedSlice] = useState<{
    category: string;
    amount: number;
    color: string;
    percentage: number;
  } | null>(null);

  // Handle slice press for tooltip
  const handleSlicePress = (item: {
    category: string;
    amount: number;
    color: string;
    percentage: number;
  }) => {
    setSelectedSlice(item);
    // Auto-hide tooltip after 3 seconds
    setTimeout(() => setSelectedSlice(null), 3000);
  };

  // Helper function to get current month/year display text
  const getCurrentMonthDisplay = () => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Generate months for selection (last 12 months)
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        value: `${date.getFullYear()}-${date.getMonth() + 1}`,
        label: date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  const handleMonthChange = (value: string) => {
    if (value === "current") {
      const now = new Date();
      setSelectedDate({ year: now.getFullYear(), month: now.getMonth() + 1 });
      setIsCurrentMonth(true);
    } else {
      const [year, month] = value.split("-").map(Number);
      setSelectedDate({ year, month });
      setIsCurrentMonth(false);
    }
  };

  // Process transactions to get spending by category
  // Direct calculation - React Query handles caching, no need for useMemo with unstable deps
  const spendingData = (() => {
    if (propSpendingData) return propSpendingData;

    // Filter transactions for selected month
    const filteredTransactions = transactions.filter((t) => {
      if (t.type !== "expense") return false;
      // Skip transactions without a category
      if (!t.category) return false;
      const date = new Date(t.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      return year === selectedDate.year && month === selectedDate.month;
    });

    console.log("Pie Chart - Selected date:", selectedDate);
    console.log("Pie Chart - Total transactions:", transactions.length);
    console.log(
      "Pie Chart - Filtered transactions:",
      filteredTransactions.length
    );
    console.log(
      "Pie Chart - Sample transactions:",
      filteredTransactions.slice(0, 3)
    );

    // Group by category and sum amounts
    const categoryMap = new Map<string, number>();
    filteredTransactions.forEach((t) => {
      const category = t.category || "Other";
      const current = categoryMap.get(category) || 0;
      categoryMap.set(category, current + Math.abs(t.amount));
    });

    console.log("Pie Chart - Category map:", Array.from(categoryMap.entries()));

    return Array.from(categoryMap.entries()).map(([category, spentAmount]) => ({
      category,
      spentAmount,
    }));
  })();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="items-center pb-0">
          <View className="h-6 w-48 bg-muted-light dark:bg-muted-dark rounded" />
          <View className="h-4 w-32 bg-muted-light dark:bg-muted-dark rounded mt-2" />
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <View className="mx-auto w-48 h-48 rounded-full bg-muted-light dark:bg-muted-dark" />
        </CardContent>
      </Card>
    );
  }

  // Process spending data for pie chart
  const chartData = spendingData.filter((item) => item.spentAmount > 0);
  const totalSpent = chartData.reduce((sum, item) => sum + item.spentAmount, 0);

  const processedData = chartData.map((item) => ({
    category: item.category,
    amount: item.spentAmount,
    color: getColorForCategory(item.category),
    percentage: (item.spentAmount / totalSpent) * 100,
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="items-center pb-0">
          <View className="flex-row items-center gap-2">
            <Feather name="pie-chart" size={24} color="#374151" />
            <CardTitle className="text-xl font-bold text-foreground-light dark:text-foreground-dark">
              Category Spending Breakdown
            </CardTitle>
          </View>

          {/* Month Selector */}
          <View className="flex items-center gap-2 mt-4">
            <Text className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
              Viewing:
            </Text>
            <Select
              value={
                isCurrentMonth
                  ? "current"
                  : `${selectedDate.year}-${selectedDate.month}`
              }
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="min-w-72 w-auto">
                <View className="flex-row items-center gap-2 flex-1">
                  <SelectValue
                    displayValue={
                      isCurrentMonth
                        ? getCurrentMonthDisplay()
                        : new Date(
                            selectedDate.year,
                            selectedDate.month - 1
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })
                    }
                  />
                  {isCurrentMonth && (
                    <Badge className="text-xs ml-2">Current</Badge>
                  )}
                </View>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-foreground-light dark:text-foreground-dark">
                      {getCurrentMonthDisplay()}
                    </Text>
                    <Badge className="text-xs">Current</Badge>
                  </View>
                </SelectItem>
                {monthOptions.slice(1).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <Text className="text-foreground-light dark:text-foreground-dark">
                      {option.label}
                    </Text>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </View>

          {!isCurrentMonth && (
            <Badge variant="secondary" className="text-xs mt-2">
              Historical Analysis
            </Badge>
          )}
        </CardHeader>
        <CardContent className="pb-4">
          <View className="items-center justify-center py-8 px-4">
            <Feather name="pie-chart" size={48} color="#9CA3AF" />
            <Text className="text-lg font-medium text-foreground-light dark:text-foreground-dark mt-4 text-center">
              No spending data available
            </Text>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-center mt-2 max-w-xs">
              {isCurrentMonth
                ? "Start tracking your expenses to see spending analysis and category breakdown"
                : `No spending data found for ${new Date(
                    selectedDate.year,
                    selectedDate.month - 1
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}`}
            </Text>
          </View>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm pt-0 border-t-0">
          <View className="flex-row items-center justify-center gap-2">
            <Text className="font-medium text-foreground-light dark:text-foreground-dark">
              Total spending: {formatCurrency(0)}
            </Text>
          </View>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-center">
            {isCurrentMonth
              ? "No spending data available for the current month"
              : `No spending data found for ${new Date(
                  selectedDate.year,
                  selectedDate.month - 1
                ).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}`}
          </Text>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center pb-0">
        <View className="flex-row items-center gap-2 mb-2">
          <Feather name="pie-chart" size={24} color="#374151" />
          <CardTitle className="text-xl font-bold text-foreground-light dark:text-foreground-dark">
            Category Spending Breakdown
          </CardTitle>
        </View>

        {/* Month Selector */}
        <View className="flex items-center gap-2">
          <Text className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
            Viewing:
          </Text>
          <Select
            value={
              isCurrentMonth
                ? "current"
                : `${selectedDate.year}-${selectedDate.month}`
            }
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="min-w-72 w-auto">
              <View className="flex-row items-center gap-2 flex-1">
                <SelectValue
                  displayValue={
                    isCurrentMonth
                      ? getCurrentMonthDisplay()
                      : new Date(
                          selectedDate.year,
                          selectedDate.month - 1
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                  }
                />
                {isCurrentMonth && (
                  <Badge className="text-xs ml-2">Current</Badge>
                )}
              </View>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">
                <View className="flex-row items-center gap-2">
                  <Text className="text-foreground-light dark:text-foreground-dark">
                    {getCurrentMonthDisplay()}
                  </Text>
                  <Badge className="text-xs">Current</Badge>
                </View>
              </SelectItem>
              {monthOptions.slice(1).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <Text className="text-foreground-light dark:text-foreground-dark">
                    {option.label}
                  </Text>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </View>

        {!isCurrentMonth && (
          <Badge variant="secondary" className="text-xs mt-2">
            Historical Analysis
          </Badge>
        )}
      </CardHeader>
      <CardContent className="pb-4">
        <View className="relative">
          <SimplePieChart
            data={processedData}
            onSlicePress={handleSlicePress}
          />

          {/* Tooltip */}
          {selectedSlice && (
            <View className="absolute top-4 left-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg p-3 shadow-lg min-w-48">
              <View className="flex-row items-center gap-2 mb-1">
                <View
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: selectedSlice.color }}
                />
                <Text className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
                  {selectedSlice.category}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                  {formatCurrency(selectedSlice.amount)}
                </Text>
                <Text className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark ml-2">
                  {selectedSlice.percentage.toFixed(1)}%
                </Text>
              </View>
            </View>
          )}
        </View>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-0 border-t-0">
        <View className="flex-row items-center justify-center gap-2">
          <Text className="font-medium text-foreground-light dark:text-foreground-dark">
            Total spending: {formatCurrency(totalSpent)}
          </Text>
          {totalSpent > 0 && (
            <Feather name="trending-up" size={16} color="#374151" />
          )}
        </View>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-center">
          {isCurrentMonth
            ? "Current month spending by category"
            : `Spending for ${new Date(
                selectedDate.year,
                selectedDate.month - 1
              ).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}`}
        </Text>
      </CardFooter>
    </Card>
  );
}
