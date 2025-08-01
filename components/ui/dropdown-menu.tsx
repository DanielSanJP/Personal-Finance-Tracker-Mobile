import React, { useRef, useState } from "react";
import { Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";
import { cn } from "../../lib/utils";

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  asChild?: boolean;
}

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const triggerRef = useRef<View>(null);

  const measureTrigger = () => {
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        setTriggerLayout({ x, y, width, height });
        setIsOpen(true);
      });
    }
  };

  return (
    <View ref={triggerRef}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            ...(child.props || {}),
            isOpen,
            setIsOpen,
            triggerLayout,
            measureTrigger,
          });
        }
        return child;
      })}
    </View>
  );
}

export function DropdownMenuTrigger({
  children,
  asChild,
  ...props
}: DropdownMenuTriggerProps & any) {
  const { measureTrigger } = props;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...(children.props || {}),
      onPress: () => measureTrigger(),
    });
  }

  return (
    <TouchableOpacity onPress={() => measureTrigger()}>
      {children}
    </TouchableOpacity>
  );
}

export function DropdownMenuContent({
  children,
  align = "end",
  className,
  ...props
}: DropdownMenuContentProps & any) {
  const { isOpen, setIsOpen, triggerLayout } = props;

  if (!isOpen) return null;

  // Calculate dropdown position based on trigger position
  const dropdownTop = triggerLayout.y + triggerLayout.height + 4; // 4px gap below trigger
  let dropdownLeft = triggerLayout.x;

  // Get screen dimensions for boundary checking
  const screenWidth = Dimensions.get("window").width;
  const dropdownWidth = 200; // Default dropdown width

  // Adjust horizontal alignment
  if (align === "end") {
    dropdownLeft = triggerLayout.x + triggerLayout.width - dropdownWidth;
  } else if (align === "center") {
    dropdownLeft =
      triggerLayout.x + triggerLayout.width / 2 - dropdownWidth / 2;
  }

  // Ensure dropdown doesn't go off screen - check both edges
  const margin = 16; // Minimum margin from screen edges
  if (dropdownLeft < margin) {
    dropdownLeft = margin;
  } else if (dropdownLeft + dropdownWidth > screenWidth - margin) {
    dropdownLeft = screenWidth - dropdownWidth - margin;
  }

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
            top: dropdownTop,
            left: dropdownLeft,
            zIndex: 1000,
          }}
        >
          <View
            className={cn(
              "bg-white rounded-lg border border-gray-200 shadow-lg p-1 min-w-[200px] max-w-[280px]",
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

export function DropdownMenuItem({
  children,
  onPress,
  className,
  asChild,
  ...props
}: DropdownMenuItemProps & any) {
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
      className={cn("px-3 py-2 rounded-md", className)}
    >
      {typeof children === "string" ? (
        <Text className="text-sm text-gray-900">{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

export function DropdownMenuLabel({
  children,
  className,
}: DropdownMenuLabelProps) {
  return (
    <View className={cn("px-3 py-2", className)}>
      <Text className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {children}
      </Text>
    </View>
  );
}

export function DropdownMenuSeparator({
  className,
}: DropdownMenuSeparatorProps) {
  return <View className={cn("h-px bg-gray-200 my-1", className)} />;
}
