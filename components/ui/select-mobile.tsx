import * as React from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <TouchableOpacity
      className={cn(
        "flex flex-row w-full items-center justify-between rounded-lg px-4 py-2 text-sm shadow-xs",
        size === "default" ? "h-14" : "h-12",
        className
      )}
      style={{
        borderWidth: 1,
        borderColor: isDark ? "#1a1a1a" : "#ebebeb",
        backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
      }}
      onPress={() => setOpen(!open)}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
  displayValue?: string;
}

function SelectValue({
  placeholder,
  className,
  displayValue,
}: SelectValueProps) {
  const { value } = useSelect();

  // Use displayValue if provided, otherwise use the actual value
  const displayText = displayValue || value;

  return (
    <Text
      className={cn(
        "flex-1 text-sm",
        displayText
          ? "text-foreground-light dark:text-foreground-dark"
          : "text-muted-foreground-light dark:text-muted-foreground-dark",
        className
      )}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {displayText || placeholder}
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
              "bg-card-light dark:bg-card-dark rounded-t-2xl border-t border-border-light dark:border-border-dark shadow-lg max-h-96",
              className
            )}
            {...props}
          >
            {/* Drag indicator */}
            <View className="flex items-center py-3">
              <View className="w-10 h-1 bg-border-light dark:bg-border-dark rounded-full" />
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
        isSelected
          ? "bg-primary-light/10 dark:bg-primary-dark/20"
          : "bg-transparent active:bg-muted-light active:dark:bg-muted-dark",
        className
      )}
      onPress={handlePress}
      activeOpacity={0.7}
      {...props}
    >
      <View className="flex-1">
        {typeof children === "string" ? (
          <Text
            className={cn(
              "text-base",
              isSelected
                ? "text-foreground-light dark:text-foreground-dark font-medium"
                : "text-foreground-light dark:text-foreground-dark"
            )}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
      {isSelected && (
        <View className="flex items-center justify-center">
          <Text className="text-primary-light dark:text-primary-dark text-lg font-bold">
            ✓
          </Text>
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
      className={cn(
        "text-muted-foreground-light dark:text-muted-foreground-dark px-2 py-1.5 text-xs",
        className
      )}
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
    <View
      className={cn(
        "bg-border-light dark:bg-border-dark mx-3 my-2 h-px",
        className
      )}
      {...props}
    />
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
