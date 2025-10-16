import * as React from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { cn } from "../../lib/utils";

const { height: screenHeight } = Dimensions.get("window");

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
      supportedOrientations={["portrait", "landscape"]}
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View
        className="flex-1 bg-black/50 justify-center px-4"
        style={{ paddingTop: 0 }}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          className="absolute inset-0"
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          className={cn(
            "bg-white rounded-2xl shadow-2xl border border-gray-200",
            className
          )}
          style={{
            maxHeight: screenHeight * 0.7,
            minHeight: screenHeight * 0.2,
          }}
          pointerEvents="auto"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 16,
            }}
            keyboardShouldPersistTaps="handled"
            {...props}
          >
            {/* Drag indicator */}
            <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />

            {children}

            {showCloseButton && (
              <TouchableOpacity
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 items-center justify-center z-10"
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text className="text-gray-600 text-lg font-medium">×</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

interface DialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

function DialogHeader({ className, children, ...props }: DialogHeaderProps) {
  return (
    <View
      className={cn("flex flex-col gap-1 text-left mb-4", className)}
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
        "flex flex-col gap-3 mt-6 pt-4 border-t border-gray-100",
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
        "text-xl font-bold text-foreground leading-tight",
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
