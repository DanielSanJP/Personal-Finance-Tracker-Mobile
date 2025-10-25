import * as React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { cn } from "../../lib/utils";

interface TableProps {
  className?: string;
  children: React.ReactNode;
}

function Table({ className, children, ...props }: TableProps) {
  return (
    <View className="relative w-full" {...props}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className={cn("min-w-[460px]", className)}>{children}</View>
      </ScrollView>
    </View>
  );
}

interface TableHeaderProps {
  className?: string;
  children: React.ReactNode;
}

function TableHeader({ className, children, ...props }: TableHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      className={cn("border-b", className)}
      style={{ borderBottomColor: isDark ? "#999999" : "#e5e7eb" }}
      {...props}
    >
      {children}
    </View>
  );
}

interface TableBodyProps {
  className?: string;
  children: React.ReactNode;
}

function TableBody({ className, children, ...props }: TableBodyProps) {
  return (
    <View className={cn("", className)} {...props}>
      {children}
    </View>
  );
}

interface TableFooterProps {
  className?: string;
  children: React.ReactNode;
}

function TableFooter({ className, children, ...props }: TableFooterProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      className={cn("bg-muted/50 border-t font-medium", className)}
      style={{ borderTopColor: isDark ? "#999999" : "#e5e7eb" }}
      {...props}
    >
      {children}
    </View>
  );
}

interface TableRowProps {
  className?: string;
  children: React.ReactNode;
  onPress?: () => void;
}

function TableRow({ className, children, onPress, ...props }: TableRowProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const borderColor = isDark ? "#999999" : "#e5e7eb";

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className={cn("border-b flex flex-row", className)}
        style={{ borderBottomColor: borderColor }}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      className={cn("border-b flex flex-row", className)}
      style={{ borderBottomColor: borderColor }}
      {...props}
    >
      {children}
    </View>
  );
}

interface TableHeadProps {
  className?: string;
  children: React.ReactNode;
  style?: any;
}

function TableHead({ className, children, style, ...props }: TableHeadProps) {
  return (
    <View
      className={cn("h-10 px-2 justify-center min-w-24", className)}
      style={style}
      {...props}
    >
      <Text className="text-foreground-light dark:text-foreground-dark font-medium text-sm text-left">
        {children}
      </Text>
    </View>
  );
}

interface TableCellProps {
  className?: string;
  children: React.ReactNode;
  style?: any;
}

function TableCell({ className, children, style, ...props }: TableCellProps) {
  return (
    <View
      className={cn("px-2 py-2 justify-center min-w-24", className)}
      style={style}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className="text-foreground-light dark:text-foreground-dark text-sm text-left">
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

interface TableCaptionProps {
  className?: string;
  children: React.ReactNode;
}

function TableCaption({ className, children, ...props }: TableCaptionProps) {
  return (
    <View className={cn("mt-4", className)} {...props}>
      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm text-center">
        {children}
      </Text>
    </View>
  );
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
