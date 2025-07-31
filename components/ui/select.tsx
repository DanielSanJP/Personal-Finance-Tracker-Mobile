import * as React from "react";
import { TouchableOpacity, View, Text, Modal, ScrollView } from "react-native";
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
        "border-input flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs",
        size === "default" ? "h-9" : "h-8",
        className
      )}
      onPress={() => setOpen(!open)}
      activeOpacity={0.7}
      {...props}
    >
      {children}
      <Text className="text-muted-foreground">▼</Text>
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
        "text-sm",
        value ? "text-foreground" : "text-muted-foreground",
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

  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-center items-center p-4"
        activeOpacity={1}
        onPress={() => setOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            className={cn(
              "bg-popover text-popover-foreground min-w-32 max-h-80 rounded-md border shadow-md",
              className
            )}
            {...props}
          >
            <ScrollView className="p-1">{children}</ScrollView>
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
        "relative flex w-full items-center gap-2 rounded-sm py-1.5 pr-8 pl-2",
        isSelected ? "bg-accent" : "hover:bg-accent",
        className
      )}
      onPress={handlePress}
      activeOpacity={0.7}
      {...props}
    >
      <Text
        className={cn(
          "text-sm",
          isSelected ? "text-accent-foreground" : "text-foreground"
        )}
      >
        {children}
      </Text>
      {isSelected && (
        <View className="absolute right-2 flex items-center justify-center">
          <Text className="text-xs">✓</Text>
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
    <View className={cn("bg-border -mx-1 my-1 h-px", className)} {...props} />
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
