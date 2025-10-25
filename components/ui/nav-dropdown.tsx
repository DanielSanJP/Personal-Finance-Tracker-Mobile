import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { cn } from "../../lib/utils";

interface NavDropdownProps {
  children: React.ReactNode;
}

interface NavDropdownTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface NavDropdownContentProps {
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
}

interface NavDropdownItemProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  asChild?: boolean;
}

interface NavDropdownLabelProps {
  children: React.ReactNode;
  className?: string;
}

interface NavDropdownSeparatorProps {
  className?: string;
}

export function NavDropdown({ children }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const openDropdown = () => {
    setIsOpen(true);
  };

  return (
    <View>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            ...(child.props || {}),
            isOpen,
            setIsOpen,
            toggleDropdown,
            openDropdown,
          });
        }
        return child;
      })}
    </View>
  );
}

export function NavDropdownTrigger({
  children,
  asChild,
  ...props
}: NavDropdownTriggerProps & any) {
  const { openDropdown } = props;

  if (asChild && React.isValidElement(children)) {
    const childProps: any = children.props || {};
    const originalOnPress = childProps.onPress;

    return React.cloneElement(children as React.ReactElement<any>, {
      ...childProps,
      onPress: () => {
        // Call original onPress first if it exists
        if (originalOnPress) {
          originalOnPress();
        }
        // Then open the dropdown
        openDropdown();
      },
    });
  }

  return (
    <TouchableOpacity onPress={() => openDropdown()}>
      {children}
    </TouchableOpacity>
  );
}

export function NavDropdownContent({
  children,
  align = "end",
  className,
  ...props
}: NavDropdownContentProps & any) {
  const { isOpen, setIsOpen } = props;

  if (!isOpen) return null;

  return (
    <Modal
      transparent={true}
      visible={isOpen}
      onRequestClose={() => setIsOpen(false)}
    >
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => setIsOpen(false)}
        activeOpacity={1}
      >
        <View
          style={{
            position: "absolute",
            top: 90,
            right: 10,
            zIndex: 1000,
          }}
        >
          <View
            className={cn(
              "bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark shadow-lg p-1 min-w-[200px] max-w-[280px]",
              className
            )}
          >
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child as React.ReactElement<any>, {
                  ...(child.props || {}),
                  setIsOpen,
                });
              }
              return child;
            })}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export function NavDropdownItem({
  children,
  onPress,
  className,
  asChild,
  ...props
}: NavDropdownItemProps & any) {
  const { setIsOpen } = props;

  const handlePress = () => {
    if (onPress) onPress();
    if (setIsOpen) setIsOpen(false);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...(children.props || {}),
      onPress: handlePress,
    });
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={cn(
        "px-3 py-2 rounded-md hover:bg-secondary-light dark:hover:bg-secondary-dark",
        className
      )}
    >
      {typeof children === "string" ? (
        <Text className="text-sm text-foreground-light dark:text-foreground-dark">
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

export function NavDropdownLabel({
  children,
  className,
}: NavDropdownLabelProps) {
  return (
    <View className={cn("px-3 py-2", className)}>
      <Text className="text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
        {children}
      </Text>
    </View>
  );
}

export function NavDropdownSeparator({ className }: NavDropdownSeparatorProps) {
  return (
    <View
      className={cn("h-px bg-border-light dark:bg-muted-dark my-1", className)}
    />
  );
}
