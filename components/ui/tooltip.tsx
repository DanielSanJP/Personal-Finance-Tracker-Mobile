import * as React from "react";
import { Text, TouchableOpacity, Modal, Animated } from "react-native";
import { cn } from "../../lib/utils";

interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
}

function TooltipProvider({
  children,
  delayDuration = 0,
}: TooltipProviderProps) {
  return <>{children}</>;
}

interface TooltipProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const TooltipContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

function Tooltip({
  open: controlledOpen,
  onOpenChange,
  children,
}: TooltipProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;

  const setOpen = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      {children}
    </TooltipContext.Provider>
  );
}

function useTooltipContext() {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be used within Tooltip");
  }
  return context;
}

interface TooltipTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

function TooltipTrigger({ children }: TooltipTriggerProps) {
  const { setOpen } = useTooltipContext();
  const [pressTimer, setPressTimer] = React.useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const handlePressIn = () => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 500); // Show tooltip after 500ms press
    setPressTimer(timer);
  };

  const handlePressOut = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    setOpen(false);
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
}

interface TooltipContentProps {
  className?: string;
  children: React.ReactNode;
  sideOffset?: number;
  side?: "top" | "right" | "bottom" | "left";
}

function TooltipContent({
  className,
  children,
  sideOffset = 4,
  side = "top",
  ...props
}: TooltipContentProps) {
  const { open, setOpen } = useTooltipContext();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (open) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [open, fadeAnim]);

  if (!open) return null;

  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="none"
      onRequestClose={() => setOpen(false)}
    >
      <TouchableOpacity
        className="flex-1 justify-center items-center"
        activeOpacity={1}
        onPress={() => setOpen(false)}
      >
        <Animated.View
          style={{ opacity: fadeAnim }}
          className={cn(
            "bg-primary rounded-md px-3 py-1.5 max-w-xs",
            className
          )}
          {...props}
        >
          <Text className="text-primary-foreground text-xs text-center">
            {children}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
