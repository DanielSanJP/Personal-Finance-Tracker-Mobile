import * as React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { cn } from "../../lib/utils";

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const value = controlledValue ?? internalValue;

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <View className={cn("flex flex-col gap-2", className)} {...props}>
        {children}
      </View>
    </TabsContext.Provider>
  );
}

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within Tabs");
  }
  return context;
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <View
      className={cn(
        "bg-muted inline-flex h-9 w-fit items-center justify-center rounded-lg p-1",
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}

interface TabsTriggerProps {
  className?: string;
  children: React.ReactNode;
  value: string;
}

function TabsTrigger({
  className,
  children,
  value: triggerValue,
  ...props
}: TabsTriggerProps) {
  const { value, onValueChange } = useTabsContext();
  const isActive = value === triggerValue;

  return (
    <TouchableOpacity
      className={cn(
        "inline-flex h-7 flex-1 items-center justify-center rounded-md px-2 py-1 text-sm font-medium",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      onPress={() => onValueChange(triggerValue)}
      activeOpacity={0.7}
      {...props}
    >
      <Text
        className={cn(
          "text-sm font-medium",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

interface TabsContentProps {
  className?: string;
  children: React.ReactNode;
  value: string;
}

function TabsContent({
  className,
  children,
  value: contentValue,
  ...props
}: TabsContentProps) {
  const { value } = useTabsContext();

  if (value !== contentValue) {
    return null;
  }

  return (
    <View className={cn("flex-1", className)} {...props}>
      {children}
    </View>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
