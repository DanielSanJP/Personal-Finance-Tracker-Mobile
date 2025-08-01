import React, { useState } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { formatCurrency, getCurrentUserTransactions } from "../lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

// Process chart data for mobile
const processChartData = () => {
  const transactions = getCurrentUserTransactions();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Get months from start of year to now
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const chartData = [];

  for (let i = 0; i <= currentMonth; i++) {
    const date = new Date(currentYear, i, 1);
    const monthName = months[date.getMonth()];

    // Calculate total expenses for this month
    const monthlyExpenses = transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          transactionDate.getFullYear() === currentYear &&
          transactionDate.getMonth() === i &&
          t.type === "expense"
        );
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    chartData.push({
      month: monthName,
      spending: Math.round(monthlyExpenses),
      index: i,
    });
  }

  return chartData;
};

// Create smooth curve path using cubic bezier curves
const createSmoothPath = (points: any[]) => {
  if (points.length < 2) return "";

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const current = points[i];
    const previous = points[i - 1];

    if (i === 1) {
      // First curve
      const next = points[i + 1] || current;
      const cp1x = previous.x + (current.x - previous.x) * 0.5;
      const cp1y = previous.y;
      const cp2x = current.x - (next.x - previous.x) * 0.1;
      const cp2y = current.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`;
    } else if (i === points.length - 1) {
      // Last curve
      const cp1x = previous.x + (current.x - previous.x) * 0.5;
      const cp1y = previous.y;
      const cp2x = current.x - (current.x - previous.x) * 0.5;
      const cp2y = current.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`;
    } else {
      // Middle curves
      const next = points[i + 1];
      const prev = points[i - 1];
      const cp1x = previous.x + (current.x - prev.x) * 0.15;
      const cp1y = previous.y;
      const cp2x = current.x - (next.x - previous.x) * 0.15;
      const cp2y = current.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`;
    }
  }

  return path;
};

const SpendingLineChart = ({
  data,
  width = 300,
  height = 150,
  onPointPress,
}: {
  data: any[];
  width?: number;
  height?: number;
  onPointPress?: (point: any) => void;
}) => {
  if (data.length === 0) return null;

  const maxSpending = Math.max(...data.map((d) => d.spending)) || 100;
  const minSpending = Math.min(...data.map((d) => d.spending)) || 0;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Calculate points for the line
  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y =
      padding +
      chartHeight -
      ((item.spending - minSpending) / (maxSpending - minSpending || 1)) *
        chartHeight;
    return { x, y, ...item };
  });

  // Create smooth path string for the line
  const smoothPathData = createSmoothPath(points);

  // Generate Y-axis labels
  const yAxisLabels = [];
  const labelCount = 4;
  for (let i = 0; i <= labelCount; i++) {
    const value = minSpending + (maxSpending - minSpending) * (i / labelCount);
    const y = padding + chartHeight - (i / labelCount) * chartHeight;
    yAxisLabels.push({ value: Math.round(value), y });
  }

  return (
    <View>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {yAxisLabels.map((label, index) => (
          <Line
            key={index}
            x1={padding}
            y1={label.y}
            x2={width - padding}
            y2={label.y}
            stroke="#f3f4f6"
            strokeWidth="1"
          />
        ))}

        {/* Smooth curved line */}
        <Path
          d={smoothPathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive data points */}
        {points.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth="2"
            onPress={() => onPointPress?.(point)}
          />
        ))}
      </Svg>

      {/* X-axis labels */}
      <View className="flex-row justify-between px-10 mt-2">
        {data.map((item, index) => (
          <Text key={index} className="text-xs text-gray-600">
            {item.month}
          </Text>
        ))}
      </View>

      {/* Y-axis labels */}
      <View className="absolute left-0 top-0 h-full justify-between py-10">
        {yAxisLabels.reverse().map((label, index) => (
          <Text key={index} className="text-xs text-gray-600">
            ${label.value}
          </Text>
        ))}
      </View>
    </View>
  );
};

export function SpendingChart() {
  const chartData = processChartData();
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  // Handle point press
  const handlePointPress = (point: any) => {
    setSelectedPoint(point);
    // Auto-hide tooltip after 3 seconds
    setTimeout(() => setSelectedPoint(null), 3000);
  };

  // Calculate trend
  const currentMonth = chartData[chartData.length - 1]?.spending || 0;
  const previousMonth = chartData[chartData.length - 2]?.spending || 0;

  let trendPercentage = "0";
  let isIncreasing = false;

  if (previousMonth !== 0) {
    const change = ((currentMonth - previousMonth) / previousMonth) * 100;
    trendPercentage = Math.abs(change).toFixed(1);
    isIncreasing = change > 0;
  } else if (currentMonth > 0) {
    trendPercentage = "100.0";
    isIncreasing = true;
  }

  const monthCount = chartData.length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Monthly Spending
        </CardTitle>
        <Text className="text-sm text-gray-600">
          January - {chartData[chartData.length - 1]?.month || "December"} 2025
        </Text>
      </CardHeader>
      <CardContent className="px-4">
        <View className="relative">
          <SpendingLineChart
            data={chartData}
            width={300}
            height={180}
            onPointPress={handlePointPress}
          />

          {/* Interactive Tooltip */}
          {selectedPoint && (
            <View className="absolute top-4 left-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
              <Text className="text-sm font-semibold text-gray-900">
                {selectedPoint.month} 2025
              </Text>
              <Text className="text-sm text-gray-600">
                Spending: {formatCurrency(selectedPoint.spending)}
              </Text>
            </View>
          )}
        </View>

        {/* Trend information */}
        <View className="mt-6 space-y-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-medium">
              {isIncreasing ? "Trending up" : "Trending down"} by{" "}
              {trendPercentage}% this month
            </Text>
            <Text
              className={`text-lg ${
                isIncreasing ? "text-red-500" : "text-green-500"
              }`}
            >
              {isIncreasing ? "↗" : "↘"}
            </Text>
          </View>
          <Text className="text-xs text-gray-500">
            Showing monthly spending for the last {monthCount} months
          </Text>
        </View>
      </CardContent>
    </Card>
  );
}
