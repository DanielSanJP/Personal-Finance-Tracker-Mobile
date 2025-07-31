import * as React from "react";
import { View, Text } from "react-native";
import { cn } from "../../lib/utils";

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

interface ChartContainerProps {
  className?: string;
  children: React.ReactNode;
  config: ChartConfig;
}

function ChartContainer({
  className,
  children,
  config,
  ...props
}: ChartContainerProps) {
  return (
    <ChartContext.Provider value={{ config }}>
      <View
        className={cn("flex justify-center text-xs w-full h-64", className)}
        {...props}
      >
        {children}
      </View>
    </ChartContext.Provider>
  );
}

interface ChartTooltipProps {
  className?: string;
  children?: React.ReactNode;
}

function ChartTooltip({ className, children, ...props }: ChartTooltipProps) {
  return (
    <View
      className={cn("rounded-lg border bg-background p-2 shadow-md", className)}
      {...props}
    >
      {children}
    </View>
  );
}

interface ChartTooltipContentProps {
  className?: string;
  children?: React.ReactNode;
  active?: boolean;
  payload?: any[];
  label?: string;
}

function ChartTooltipContent({
  className,
  children,
  active,
  payload,
  label,
  ...props
}: ChartTooltipContentProps) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <View
      className={cn(
        "rounded-lg border bg-background p-2 shadow-md min-w-32",
        className
      )}
      {...props}
    >
      {label && (
        <Text className="text-muted-foreground text-sm font-medium mb-1">
          {label}
        </Text>
      )}
      <View>
        {payload.map((item, index) => (
          <View key={index} className="flex flex-row items-center gap-2">
            <View
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: item.color || config[item.dataKey]?.color,
              }}
            />
            <Text className="text-foreground text-sm">
              {config[item.dataKey]?.label || item.dataKey}: {item.value}
            </Text>
          </View>
        ))}
      </View>
      {children}
    </View>
  );
}

interface ChartLegendProps {
  className?: string;
  children?: React.ReactNode;
}

function ChartLegend({ className, children, ...props }: ChartLegendProps) {
  return (
    <View
      className={cn("flex flex-row flex-wrap gap-4 text-sm", className)}
      {...props}
    >
      {children}
    </View>
  );
}

interface ChartLegendContentProps {
  className?: string;
  payload?: any[];
}

function ChartLegendContent({
  className,
  payload,
  ...props
}: ChartLegendContentProps) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <View className={cn("flex flex-row flex-wrap gap-4", className)} {...props}>
      {payload.map((item, index) => (
        <View key={index} className="flex flex-row items-center gap-2">
          <View
            className="w-3 h-3 rounded-sm"
            style={{
              backgroundColor: item.color || config[item.dataKey]?.color,
            }}
          />
          <Text className="text-muted-foreground text-sm">
            {config[item.dataKey]?.label || item.dataKey}
          </Text>
        </View>
      ))}
    </View>
  );
}

// Basic chart component for simple data visualization
interface SimpleBarChartProps {
  data: { name: string; value: number; [key: string]: any }[];
  className?: string;
  dataKey?: string;
  height?: number;
}

function SimpleBarChart({
  data,
  className,
  dataKey = "value",
  height = 200,
  ...props
}: SimpleBarChartProps) {
  const { config } = useChart();
  const maxValue = Math.max(...data.map((item) => item[dataKey]));

  return (
    <View className={cn("w-full", className)} style={{ height }} {...props}>
      <View className="flex flex-row items-end justify-between h-full px-2">
        {data.map((item, index) => {
          const barHeight = (item[dataKey] / maxValue) * (height - 40);
          return (
            <View key={index} className="flex flex-col items-center gap-2">
              <View
                className="bg-primary rounded-t-sm min-w-8"
                style={{
                  height: barHeight,
                  backgroundColor: config[dataKey]?.color || "#3b82f6",
                }}
              />
              <Text className="text-xs text-muted-foreground text-center">
                {item.name}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  SimpleBarChart,
  useChart,
};
