import * as React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
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
  return (
    <View className={cn("border-b border-border", className)} {...props}>
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
  return (
    <View
      className={cn(
        "bg-muted/50 border-t border-border font-medium",
        className
      )}
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
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className={cn("border-b border-border flex flex-row", className)}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      className={cn("border-b border-border flex flex-row", className)}
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
      <Text className="text-foreground font-medium text-sm text-left">
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
        <Text className="text-foreground text-sm text-left">{children}</Text>
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
      <Text className="text-muted-foreground text-sm text-center">
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
