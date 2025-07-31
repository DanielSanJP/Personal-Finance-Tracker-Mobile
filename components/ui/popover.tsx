import * as React from "react";
import { Modal, View, TouchableOpacity } from "react-native";
import { cn } from "../../lib/utils";

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Popover({ open, onOpenChange, children }: PopoverProps) {
  return (
    <>
      {open && (
        <Modal
          visible={open}
          transparent={true}
          animationType="fade"
          onRequestClose={() => onOpenChange?.(false)}
        >
          {children}
        </Modal>
      )}
      {!open && children}
    </>
  );
}

interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
}

function PopoverTrigger({ children, onPress }: PopoverTriggerProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
}

interface PopoverContentProps {
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  children: React.ReactNode;
  onClose?: () => void;
}

function PopoverContent({
  className,
  align = "center",
  side = "bottom",
  sideOffset = 4,
  children,
  onClose,
  ...props
}: PopoverContentProps) {
  return (
    <TouchableOpacity
      className="flex-1 justify-center items-center"
      activeOpacity={1}
      onPress={onClose}
    >
      <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
        <View
          className={cn(
            "bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md",
            className
          )}
          {...props}
        >
          {children}
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

interface PopoverAnchorProps {
  children: React.ReactNode;
}

function PopoverAnchor({ children }: PopoverAnchorProps) {
  return <>{children}</>;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
