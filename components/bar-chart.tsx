"use client";

import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, View } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";
import { useYearlyBudgetAnalysis } from "../hooks/queries/useBudgets";
import { formatCurrency } from "../lib/utils";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
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

interface MonthlyBudgetData {
  month: string;
  spending: number;
  budgetLimit: number;
  status: "under" | "over" | "close";
}

interface BarChartProps {
  data?: MonthlyBudgetData[];
}

// SVG Bar Chart Component optimized for React Native
const YearlyBarChart = ({
  data,
  width = 320,
  height = 240,
  onBarPress,
}: {
  data: MonthlyBudgetData[];
  width?: number;
  height?: number;
  onBarPress?: (item: MonthlyBudgetData, index: number) => void;
}) => {
  if (data.length === 0) return null;

  const padding = 60; // Increased left padding for labels
  const rightPadding = 50; // Separate right padding for max budget label
  const chartWidth = width - padding - rightPadding;
  const chartHeight = height - padding * 2;
  const barWidth = (chartWidth / data.length) * 0.6;
  const barSpacing = (chartWidth / data.length) * 0.4;

  // Scale Y-axis based on actual spending data, not including budget limits
  const maxSpending = Math.max(...data.map((d) => d.spending));
  const maxValue = Math.max(maxSpending, 100); // Minimum scale of $100
  const maxBudget = Math.max(...data.map((d) => d.budgetLimit));

  // Function to get bar color based on status
  const getBarColor = (status: string) => {
    switch (status) {
      case "over":
        return "#ef4444"; // red-500
      case "close":
        return "#f97316"; // orange-500
      case "under":
        return "#10b981"; // emerald-500
      default:
        return "#374151"; // gray-700
    }
  };

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <Line
            key={`grid-${index}`}
            x1={padding}
            y1={padding + chartHeight * (1 - ratio)}
            x2={width - rightPadding}
            y2={padding + chartHeight * (1 - ratio)}
            stroke="#f3f4f6"
            strokeWidth="1"
          />
        ))}

        {/* Max Budget Reference Line - only show if budget is within reasonable range of spending */}
        {maxBudget > 0 && maxBudget <= maxValue * 2 && (
          <Line
            x1={padding}
            y1={padding + chartHeight * (1 - maxBudget / maxValue)}
            x2={width - rightPadding}
            y2={padding + chartHeight * (1 - maxBudget / maxValue)}
            stroke="#9ca3af"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        )}

        {/* Bars with touch interaction */}
        {data.map((item, index) => {
          const x =
            padding + index * (chartWidth / data.length) + barSpacing / 2;
          const barHeight = (item.spending / maxValue) * chartHeight;
          const y = padding + chartHeight - barHeight;

          return (
            <Rect
              key={`bar-${index}`}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={getBarColor(item.status)}
              rx={4}
              onPress={() => onBarPress?.(item, index)}
            />
          );
        })}

        {/* X-axis labels */}
        {data.map((item, index) => {
          const x =
            padding +
            index * (chartWidth / data.length) +
            chartWidth / data.length / 2;
          const y = height - 15;

          return (
            <SvgText
              key={`label-${index}`}
              x={x}
              y={y}
              fontSize="10"
              fill="#666"
              textAnchor="middle"
            >
              {item.month.slice(0, 3)}
            </SvgText>
          );
        })}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = padding + chartHeight * (1 - ratio);
          const value = Math.round(maxValue * ratio);
          const formattedValue = `$${value.toLocaleString()}`;

          return (
            <SvgText
              key={`y-label-${index}`}
              x={padding - 12}
              y={y + 4}
              fontSize="10"
              fill="#666"
              textAnchor="end"
              alignmentBaseline="middle"
            >
              {formattedValue}
            </SvgText>
          );
        })}

        {/* Max Budget Label - only show if reference line is visible */}
        {maxBudget > 0 && maxBudget <= maxValue * 2 && (
          <SvgText
            x={width - rightPadding + 5}
            y={padding + chartHeight * (1 - maxBudget / maxValue) + 4}
            fontSize="9"
            fill="#9ca3af"
            textAnchor="start"
          >
            Max
          </SvgText>
        )}
      </Svg>
    </View>
  );
};

export function BarChart({ data: propData }: BarChartProps = {}) {
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return new Date().getFullYear();
  });
  const { data: fetchedData = [], isLoading } =
    useYearlyBudgetAnalysis(selectedYear);
  const data = propData || fetchedData;
  const [selectedBar, setSelectedBar] = useState<{
    item: MonthlyBudgetData;
    index: number;
  } | null>(null);

  // Generate year options (current year and previous 4 years)
  const generateYearOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      options.push({
        value: year.toString(),
        label: year.toString(),
        year: year,
        isCurrent: i === 0,
      });
    }
    return options;
  };

  const yearOptions = generateYearOptions();

  const handleYearChange = (value: string) => {
    setSelectedYear(parseInt(value));
  };

  // Handle bar press for tooltip
  const handleBarPress = (item: MonthlyBudgetData, index: number) => {
    setSelectedBar({ item, index });
    // Auto-hide tooltip after 3 seconds
    setTimeout(() => setSelectedBar(null), 3000);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <View className="h-6 w-48 bg-muted-light dark:bg-muted-dark rounded" />
          <View className="h-4 w-32 bg-muted-light dark:bg-muted-dark rounded mt-2" />
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <View className="mx-auto w-80 h-60 bg-muted-light dark:bg-muted-dark rounded" />
        </CardContent>
      </Card>
    );
  }

  // Handle empty data state
  if (
    data.length === 0 ||
    data.every((item: MonthlyBudgetData) => item.spending === 0)
  ) {
    const now = new Date();
    const isCurrentYear = selectedYear === now.getFullYear();

    return (
      <Card>
        <CardHeader className="pb-0">
          <View className="flex-row items-center gap-2">
            <Feather name="bar-chart-2" size={24} color="#374151" />
            <CardTitle className="text-xl font-bold text-foreground-light dark:text-foreground-dark">
              Yearly Spending Chart
            </CardTitle>
          </View>
          <CardDescription className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
            Monthly spending analysis - {selectedYear}
          </CardDescription>

          {/* Year Selector */}
          <View className="flex items-center gap-2 mt-4">
            <Text className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
              Year:
            </Text>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => handleYearChange(value)}
            >
              <SelectTrigger className="min-w-48 w-auto">
                <View className="flex-row items-center gap-2 flex-1">
                  <SelectValue displayValue={selectedYear.toString()} />
                  {selectedYear === new Date().getFullYear() && (
                    <Badge className="text-xs">Current</Badge>
                  )}
                </View>
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-foreground-light dark:text-foreground-dark">
                        {option.label}
                      </Text>
                      {option.isCurrent && (
                        <Badge className="text-xs">Current</Badge>
                      )}
                    </View>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </View>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <View className="mx-auto flex items-center justify-center py-8">
            <View className="items-center">
              <Feather name="bar-chart-2" size={48} color="#9CA3AF" />
              <Text className="text-lg font-medium text-foreground-light dark:text-foreground-dark mt-4 text-center">
                No spending data available
              </Text>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-center mt-2 px-4">
                {isCurrentYear
                  ? "Start tracking your expenses to see yearly spending analysis and trends"
                  : `No budget data found for ${selectedYear}. This year has no recorded transactions.`}
              </Text>
            </View>
          </View>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm border-t-0">
          <View className="flex-row items-center justify-center gap-2">
            <Text className="font-medium text-foreground-light dark:text-foreground-dark">
              Budget utilization: 0%
            </Text>
          </View>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-center">
            No spending data available for the selected period
          </Text>
        </CardFooter>
      </Card>
    );
  }

  // Calculate totals and statistics
  const totalSpending = data.reduce(
    (sum: number, item: MonthlyBudgetData) => sum + item.spending,
    0
  );
  const totalBudget = data.reduce(
    (sum: number, item: MonthlyBudgetData) => sum + item.budgetLimit,
    0
  );
  const maxBudget = Math.max(
    ...data.map((item: MonthlyBudgetData) => item.budgetLimit)
  );

  // Calculate budget utilization
  const budgetUtilization =
    totalBudget > 0 ? (totalSpending / totalBudget) * 100 : 0;
  const isOverBudget = totalSpending > totalBudget;

  // Count months by status
  const monthsUnderBudget = data.filter(
    (item: MonthlyBudgetData) => item.status === "under"
  ).length;
  const monthsOverBudget = data.filter(
    (item: MonthlyBudgetData) => item.status === "over"
  ).length;

  return (
    <Card>
      <CardHeader className="pb-0">
        <View className="flex-row items-center gap-2">
          <Feather name="bar-chart-2" size={24} color="#374151" />
          <CardTitle className="text-xl font-bold text-foreground-light dark:text-foreground-dark">
            Yearly Spending Chart
          </CardTitle>
        </View>
        <CardDescription className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
          Monthly spending analysis - {selectedYear}
        </CardDescription>

        {/* Year Selector */}
        <View className="flex items-center gap-2 mt-4">
          <Text className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
            Year:
          </Text>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => handleYearChange(value)}
          >
            <SelectTrigger className="min-w-48 w-auto">
              <View className="flex-row items-center gap-2 flex-1">
                <SelectValue displayValue={selectedYear.toString()} />
                {selectedYear === new Date().getFullYear() && (
                  <Badge className="text-xs">Current</Badge>
                )}
              </View>
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-foreground-light dark:text-foreground-dark">
                      {option.label}
                    </Text>
                    {option.isCurrent && (
                      <Badge className="text-xs">Current</Badge>
                    )}
                  </View>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </View>

        {/* Max Budget Display */}
        <View className="flex items-end mt-2">
          <View className="items-end">
            <Text className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
              Max Budget
            </Text>
            <Text className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
              {formatCurrency(maxBudget)}
            </Text>
          </View>
        </View>
      </CardHeader>
      <CardContent className="pb-4">
        <View className="relative">
          <YearlyBarChart
            data={data}
            width={320}
            height={240}
            onBarPress={handleBarPress}
          />

          {/* Tooltip */}
          {selectedBar && (
            <View className="absolute top-4 left-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg p-3 shadow-lg min-w-48">
              <Text className="text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                {selectedBar.item.month}
              </Text>
              <Text className="text-sm text-foreground-light dark:text-foreground-dark">
                Spending {formatCurrency(selectedBar.item.spending)}
              </Text>
            </View>
          )}
        </View>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-0 border-t-0">
        <View className="flex-row items-center justify-between w-full">
          <View className="flex-row items-center gap-2">
            <Text className="font-medium text-foreground-light dark:text-foreground-dark">
              {isOverBudget ? "Over" : "Under"} budget by{" "}
              {Math.abs(budgetUtilization - 100).toFixed(1)}%
            </Text>
            <Feather
              name={isOverBudget ? "trending-up" : "trending-down"}
              size={16}
              color={isOverBudget ? "#ef4444" : "#10b981"}
            />
          </View>
          <View className="items-end">
            <Text className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
              Total Spending
            </Text>
            <Text className="font-semibold text-foreground-light dark:text-foreground-dark">
              {formatCurrency(totalSpending)}
            </Text>
          </View>
        </View>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-center">
          {monthsUnderBudget} months under budget, {monthsOverBudget} months
          over budget
        </Text>
      </CardFooter>
    </Card>
  );
}
