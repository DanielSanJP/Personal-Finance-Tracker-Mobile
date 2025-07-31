import * as React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { cn } from "../../lib/utils";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="fade"
      onRequestClose={() => onOpenChange?.(false)}
    >
      {children}
    </Modal>
  );
}

interface DialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
}

function DialogTrigger({ children, onPress }: DialogTriggerProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  onClose?: () => void;
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  onClose,
  ...props
}: DialogContentProps) {
  return (
    <TouchableOpacity
      className="flex-1 bg-black/50 justify-center items-center p-4"
      activeOpacity={1}
      onPress={onClose}
    >
      <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
        <View
          className={cn(
            "bg-background w-full max-w-lg rounded-lg border p-6 shadow-lg relative",
            className
          )}
          {...props}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          {showCloseButton && (
            <TouchableOpacity
              className="absolute top-4 right-4 w-6 h-6 rounded-sm opacity-70 items-center justify-center"
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text className="text-muted-foreground text-lg">×</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

interface DialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

function DialogHeader({ className, children, ...props }: DialogHeaderProps) {
  return (
    <View
      className={cn(
        "flex flex-col gap-2 text-center sm:text-left mb-4",
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}

interface DialogFooterProps {
  className?: string;
  children: React.ReactNode;
}

function DialogFooter({ className, children, ...props }: DialogFooterProps) {
  return (
    <View
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-4",
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}

interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

function DialogTitle({ className, children, ...props }: DialogTitleProps) {
  return (
    <Text
      className={cn(
        "text-lg leading-none font-semibold text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Text>
  );
}

interface DialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

function DialogDescription({
  className,
  children,
  ...props
}: DialogDescriptionProps) {
  return (
    <Text className={cn("text-muted-foreground text-sm", className)} {...props}>
      {children}
    </Text>
  );
}

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
