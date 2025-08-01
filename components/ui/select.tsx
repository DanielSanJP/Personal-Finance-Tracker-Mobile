import * as React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { cn } from "../../lib/utils";

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      {children}
    </SelectContext.Provider>
  );
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

function useSelect() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within Select");
  }
  return context;
}

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
  size?: "sm" | "default";
}

function SelectTrigger({
  className,
  children,
  size = "default",
  ...props
}: SelectTriggerProps) {
  const { open, setOpen } = useSelect();

  return (
    <TouchableOpacity
      className={cn(
        "border-gray-300 flex w-full items-center justify-start gap-2 rounded-lg border bg-white px-4 py-2 text-sm shadow-xs",
        size === "default" ? "h-14" : "h-12",
        className
      )}
      onPress={() => setOpen(!open)}
      activeOpacity={0.7}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

function SelectValue({ placeholder, className }: SelectValueProps) {
  const { value } = useSelect();

  return (
    <Text
      className={cn(
        "text-base",
        value ? "text-gray-900" : "text-gray-500",
        className
      )}
    >
      {value || placeholder}
    </Text>
  );
}

interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
}

function SelectContent({ className, children, ...props }: SelectContentProps) {
  const { open, setOpen } = useSelect();

  if (!open) return null;

  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="slide"
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
      onRequestClose={() => setOpen(false)}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-end"
        activeOpacity={1}
        onPress={() => setOpen(false)}
        style={{ paddingTop: 0 }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            className={cn(
              "bg-white rounded-t-2xl border-t border-gray-200 shadow-lg max-h-96",
              className
            )}
            {...props}
          >
            {/* Drag indicator */}
            <View className="flex items-center py-3">
              <View className="w-10 h-1 bg-gray-300 rounded-full" />
            </View>

            <ScrollView className="px-4 pb-6">{children}</ScrollView>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

interface SelectItemProps {
  className?: string;
  children: React.ReactNode;
  value: string;
}

function SelectItem({ className, children, value, ...props }: SelectItemProps) {
  const { value: selectedValue, onValueChange, setOpen } = useSelect();
  const isSelected = selectedValue === value;

  const handlePress = () => {
    onValueChange?.(value);
    setOpen(false);
  };

  return (
    <TouchableOpacity
      className={cn(
        "relative flex w-full items-center gap-3 rounded-lg py-4 px-3 min-h-[48px]",
        isSelected ? "bg-gray-100" : "bg-white active:bg-gray-50",
        className
      )}
      onPress={handlePress}
      activeOpacity={0.7}
      {...props}
    >
      <Text
        className={cn(
          "text-base flex-1",
          isSelected ? "text-gray-900 font-medium" : "text-gray-700"
        )}
      >
        {children}
      </Text>
      {isSelected && (
        <View className="flex items-center justify-center">
          <Text className="text-blue-600 text-lg font-bold">✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface SelectLabelProps {
  className?: string;
  children: React.ReactNode;
}

function SelectLabel({ className, children, ...props }: SelectLabelProps) {
  return (
    <Text
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    >
      {children}
    </Text>
  );
}

interface SelectSeparatorProps {
  className?: string;
}

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <View className={cn("bg-gray-200 mx-3 my-2 h-px", className)} {...props} />
  );
}

interface SelectGroupProps {
  children: React.ReactNode;
}

function SelectGroup({ children }: SelectGroupProps) {
  return <>{children}</>;
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
