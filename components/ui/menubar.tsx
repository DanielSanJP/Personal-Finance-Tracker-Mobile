import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { cn } from "../../lib/utils";

interface MenubarProps {
  children: React.ReactNode;
  className?: string;
}

interface MenubarMenuProps {
  children: React.ReactNode;
}

interface MenubarTriggerProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
}

interface MenubarContentProps {
  children: React.ReactNode;
  className?: string;
}

interface MenubarItemProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  inset?: boolean;
}

interface MenubarSeparatorProps {
  className?: string;
}

interface MenubarLabelProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}

interface MenubarCheckboxItemProps {
  children: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

interface MenubarRadioGroupProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

interface MenubarRadioItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

interface MenubarSubProps {
  children: React.ReactNode;
}

interface MenubarSubTriggerProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}

interface MenubarSubContentProps {
  children: React.ReactNode;
  className?: string;
}

interface MenubarShortcutProps {
  children: React.ReactNode;
  className?: string;
}

export function Menubar({ children, className }: MenubarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={cn(
        "flex-row border border-gray-200 bg-white rounded-md p-1",
        className
      )}
    >
      {children}
    </ScrollView>
  );
}

export function MenubarMenu({ children }: MenubarMenuProps) {
  return <View>{children}</View>;
}

export function MenubarTrigger({
  children,
  className,
  onPress,
}: MenubarTriggerProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        "flex-row items-center rounded-sm px-3 py-1.5 text-sm font-medium",
        "hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900",
        "data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900",
        className
      )}
    >
      {typeof children === "string" ? (
        <Text className="text-sm font-medium text-gray-900">{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

export function MenubarContent({ children, className }: MenubarContentProps) {
  return (
    <View
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-md",
        className
      )}
    >
      {children}
    </View>
  );
}

export function MenubarItem({
  children,
  onPress,
  className,
  inset,
}: MenubarItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "focus:bg-gray-100 focus:text-gray-900",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className
      )}
    >
      {typeof children === "string" ? (
        <Text className="text-sm text-gray-900">{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

export function MenubarSeparator({ className }: MenubarSeparatorProps) {
  return <View className={cn("-mx-1 my-1 h-px bg-gray-200", className)} />;
}

export function MenubarLabel({
  children,
  className,
  inset,
}: MenubarLabelProps) {
  return (
    <View
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className
      )}
    >
      <Text className="text-sm font-semibold text-gray-900">{children}</Text>
    </View>
  );
}

export function MenubarCheckboxItem({
  children,
  checked,
  onCheckedChange,
  className,
}: MenubarCheckboxItemProps) {
  return (
    <TouchableOpacity
      onPress={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "focus:bg-gray-100 focus:text-gray-900",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
    >
      <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Text className="text-xs">✓</Text>}
      </View>
      {typeof children === "string" ? (
        <Text className="text-sm text-gray-900">{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

export function MenubarRadioGroup({
  children,
  value,
  onValueChange,
}: MenubarRadioGroupProps) {
  return (
    <View>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            ...(child.props || {}),
            checked: value === (child.props as any)?.value,
            onPress: () => onValueChange?.((child.props as any)?.value),
          });
        }
        return child;
      })}
    </View>
  );
}

export function MenubarRadioItem({
  children,
  value,
  className,
  ...props
}: MenubarRadioItemProps & any) {
  const { checked, onPress } = props;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "focus:bg-gray-100 focus:text-gray-900",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
    >
      <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <View className="h-2 w-2 rounded-full bg-current" />}
      </View>
      {typeof children === "string" ? (
        <Text className="text-sm text-gray-900">{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

export function MenubarSub({ children }: MenubarSubProps) {
  return <View>{children}</View>;
}

export function MenubarSubTrigger({
  children,
  className,
  inset,
}: MenubarSubTriggerProps) {
  return (
    <TouchableOpacity
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "focus:bg-gray-100 focus:text-gray-900",
        "data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900",
        inset && "pl-8",
        className
      )}
    >
      {typeof children === "string" ? (
        <Text className="text-sm text-gray-900">{children}</Text>
      ) : (
        children
      )}
      <Text className="ml-auto text-xs">▶</Text>
    </TouchableOpacity>
  );
}

export function MenubarSubContent({
  children,
  className,
}: MenubarSubContentProps) {
  return (
    <View
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-lg",
        className
      )}
    >
      {children}
    </View>
  );
}

export function MenubarShortcut({ children, className }: MenubarShortcutProps) {
  return (
    <Text
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
    >
      {children}
    </Text>
  );
}
