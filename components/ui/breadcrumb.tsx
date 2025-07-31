import * as React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { cn } from "../../lib/utils";

interface BreadcrumbProps {
  className?: string;
  children: React.ReactNode;
}

function Breadcrumb({ className, children, ...props }: BreadcrumbProps) {
  return (
    <View className={cn("", className)} {...props}>
      {children}
    </View>
  );
}

interface BreadcrumbListProps {
  className?: string;
  children: React.ReactNode;
}

function BreadcrumbList({
  className,
  children,
  ...props
}: BreadcrumbListProps) {
  return (
    <View
      className={cn("flex flex-row flex-wrap items-center gap-1.5", className)}
      {...props}
    >
      {children}
    </View>
  );
}

interface BreadcrumbItemProps {
  className?: string;
  children: React.ReactNode;
}

function BreadcrumbItem({
  className,
  children,
  ...props
}: BreadcrumbItemProps) {
  return (
    <View
      className={cn("flex flex-row items-center gap-1.5", className)}
      {...props}
    >
      {children}
    </View>
  );
}

interface BreadcrumbLinkProps {
  className?: string;
  children: React.ReactNode;
  onPress?: () => void;
}

function BreadcrumbLink({
  className,
  children,
  onPress,
  ...props
}: BreadcrumbLinkProps) {
  return (
    <TouchableOpacity
      className={cn("", className)}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      <Text className="text-muted-foreground text-sm hover:text-foreground">
        {children}
      </Text>
    </TouchableOpacity>
  );
}

interface BreadcrumbPageProps {
  className?: string;
  children: React.ReactNode;
}

function BreadcrumbPage({
  className,
  children,
  ...props
}: BreadcrumbPageProps) {
  return (
    <Text
      className={cn("text-foreground font-normal text-sm", className)}
      {...props}
    >
      {children}
    </Text>
  );
}

interface BreadcrumbSeparatorProps {
  className?: string;
  children?: React.ReactNode;
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: BreadcrumbSeparatorProps) {
  return (
    <View className={cn("", className)} {...props}>
      {children || <Text className="text-muted-foreground text-sm">/</Text>}
    </View>
  );
}

interface BreadcrumbEllipsisProps {
  className?: string;
}

function BreadcrumbEllipsis({ className, ...props }: BreadcrumbEllipsisProps) {
  return (
    <View
      className={cn("flex items-center justify-center w-9 h-9", className)}
      {...props}
    >
      <Text className="text-muted-foreground text-sm">...</Text>
    </View>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
