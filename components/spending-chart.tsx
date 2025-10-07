"use client";

import React, { useState } from "react";
import { Text, View } from "react-native";
import Svg, { Rect, Line, Text as SvgText } from "react-native-svg";
import { formatCurrency } from "../lib/utils";
import { useTransactions } from "../hooks/queries/useTransactions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./ui/card";

// Generate dynamic date range description
const getDateRangeDescription = () => {
  const now = new Date();
  const currentMonth = now.toLocaleDateString("en-US", { month: "long" });
  const year = now.getFullYear();

  return `January - ${currentMonth} ${year}`;
};

const getCurrentMonthName = () => {
  const months = [
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
  return months[new Date().getMonth()];
};

interface ChartDataPoint {
  month: string;
  spending: number;
}

interface SpendingChartProps {
  transactions?: any[];
}

// Group expenses by month from January to current month - matches Next.js version
const processChartData = (transactions: any[]): ChartDataPoint[] => {
  const months = [
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

  // Get current year and month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based (0 = January, 7 = August)
  const chartData: ChartDataPoint[] = [];

  // Loop from January (0) to current month (inclusive)
  for (let monthIndex = 0; monthIndex <= currentMonth; monthIndex++) {
    const monthName = months[monthIndex];

    // Calculate total expenses for this month
    const monthlyExpenses = transactions
      .filter((t: any) => {
        const transactionDate = new Date(t.date);
        return (
          transactionDate.getFullYear() === currentYear &&
          transactionDate.getMonth() === monthIndex &&
          t.type === "expense"
        );
      })
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

    chartData.push({
      month: monthName,
      spending: monthlyExpenses,
    });
  }

  return chartData;
};

// SVG Bar Chart Component - Mobile version of Next.js bar chart
const BarChart = ({
  data,
  width = 300,
  height = 200,
  onBarPress,
}: {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  onBarPress?: (item: ChartDataPoint, index: number) => void;
}) => {
  if (data.length === 0) return null;

  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const barWidth = (chartWidth / data.length) * 0.8;
  const barSpacing = (chartWidth / data.length) * 0.2;

  const maxSpending = Math.max(...data.map((d) => d.spending)) || 100;

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <Line
            key={index}
            x1={padding}
            y1={padding + chartHeight * (1 - ratio)}
            x2={width - padding}
            y2={padding + chartHeight * (1 - ratio)}
            stroke="#f3f4f6"
            strokeWidth="1"
          />
        ))}

        {/* Bars with touch interaction */}
        {data.map((item, index) => {
          const x =
            padding + index * (chartWidth / data.length) + barSpacing / 2;
          const barHeight = (item.spending / maxSpending) * chartHeight;
          const y = padding + chartHeight - barHeight;

          return (
            <Rect
              key={index}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="#3b82f6"
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
          const y = height - 10;

          return (
            <SvgText
              key={index}
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
      </Svg>
    </View>
  );
};

export function SpendingChart({
  transactions: propTransactions,
}: SpendingChartProps = {}) {
  const {
    data: fetchedTransactions = [],
    isLoading,
    isError,
  } = useTransactions();
  const transactions = propTransactions || fetchedTransactions;

  // Process chart data directly - no useMemo needed since processChartData is pure
  // and React Query already handles caching
  const chartData =
    transactions.length > 0 ? processChartData(transactions) : [];

  const [selectedBar, setSelectedBar] = useState<{
    item: ChartDataPoint;
    index: number;
  } | null>(null);

  // Handle bar press for tooltip
  const handleBarPress = (item: ChartDataPoint, index: number) => {
    setSelectedBar({ item, index });
    // Auto-hide tooltip after 3 seconds
    setTimeout(() => setSelectedBar(null), 3000);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Monthly Spending</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
        <CardContent>
          <View className="flex items-center justify-center h-64">
            <Text>Loading...</Text>
          </View>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Monthly Spending</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <View className="flex items-center justify-center h-64">
            <Text className="text-red-500">Failed to load chart data</Text>
          </View>
        </CardContent>
      </Card>
    );
  }

  // Calculate trend
  const currentMonth = chartData[chartData.length - 1]?.spending || 0;
  const currentMonthName = getCurrentMonthName();
  const previousMonth = chartData[chartData.length - 2]?.spending || 0;

  let trendPercentage = "0";
  let isIncreasing = false;

  if (previousMonth === 0 && currentMonth > 0) {
    // If previous month was $0 and current month has spending, it's a 100% increase
    trendPercentage = "100";
    isIncreasing = true;
  } else if (currentMonth === 0 && previousMonth > 0) {
    // If current month is $0 and previous month had spending, it's a 100% decrease
    trendPercentage = "100";
    isIncreasing = false;
  } else if (previousMonth > 0) {
    // Normal calculation when previous month has value
    const percentageChange =
      ((currentMonth - previousMonth) / previousMonth) * 100;
    trendPercentage = Math.abs(percentageChange).toFixed(1);
    isIncreasing = percentageChange > 0;
  } else if (currentMonth === 0 && previousMonth === 0) {
    // Both months are $0, no change
    trendPercentage = "0";
    isIncreasing = false;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <View className="flex-row justify-between items-center">
          <CardTitle className="text-base">Monthly Spending</CardTitle>
          <Text className="text-xs">
            {formatCurrency(currentMonth)} ({currentMonthName})
          </Text>
        </View>
        <CardDescription className="text-xs">
          {getDateRangeDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <View className="relative">
          <BarChart
            data={chartData}
            width={300}
            height={200}
            onBarPress={handleBarPress}
          />

          {/* Tooltip */}
          {selectedBar && (
            <View className="absolute top-4 left-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
              <Text className="text-sm font-semibold text-gray-900">
                {selectedBar.item.month} 2025
              </Text>
              <Text className="text-sm text-gray-600">
                Spending: {formatCurrency(selectedBar.item.spending)}
              </Text>
            </View>
          )}
        </View>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 pt-2">
        <View className="flex-row gap-2 items-center">
          <Text className="text-xs font-medium">
            {isIncreasing ? "Trending up" : "Trending down"} by{" "}
            {trendPercentage}% this month
          </Text>
          <Text
            className={`text-xs ${
              isIncreasing ? "text-red-500" : "text-green-500"
            }`}
          >
            {isIncreasing ? "↗" : "↘"}
          </Text>
        </View>
        <Text className="text-xs text-gray-500">
          Showing monthly spending from January to current month
        </Text>
      </CardFooter>
    </Card>
  );
}
