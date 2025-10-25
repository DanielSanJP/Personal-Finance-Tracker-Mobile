import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Text, useColorScheme, View } from "react-native";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface ParsedTransaction {
  amount?: string;
  description?: string;
  merchant?: string;
  category?: string;
  account?: string;
  date?: Date;
}

interface VoiceInputModalProps {
  visible: boolean;
  onClose: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onRetry?: () => void;
  isRecording: boolean;
  isProcessing: boolean;
  parsedData?: ParsedTransaction;
  confidence?: number;
  isSupported?: boolean;
  type?: "expense" | "income";
}

export function VoiceInputModal({
  visible,
  onClose,
  onStartListening,
  onStopListening,
  onRetry,
  isRecording,
  isProcessing,
  parsedData,
  confidence = 0,
  isSupported = true,
  type = "expense",
}: VoiceInputModalProps) {
  const hasData = parsedData && Object.keys(parsedData).length > 0;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (__DEV__) {
    console.log("🎤 VoiceInputModal render:", {
      visible,
      isRecording,
      isProcessing,
      hasData,
      parsedDataKeys: parsedData ? Object.keys(parsedData) : [],
    });
  }

  return (
    <Dialog
      open={visible}
      onOpenChange={(open) => {
        console.log("🎤 VoiceInputModal onOpenChange called:", {
          open,
          wasVisible: visible,
        });
        console.trace("Stack trace for VoiceInputModal onOpenChange");
        // When Dialog requests to close (Android back button), call onClose
        if (!open) {
          console.log("🎤 Calling onClose because open=false");
          onClose();
        }
      }}
    >
      <DialogContent onClose={onClose} showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>Voice Input Entry</DialogTitle>
        </DialogHeader>

        <View className="space-y-4 pb-4">
          {/* Recording Status Card */}
          <Card
            className={isRecording ? "mb-4 border-red-300 bg-red-50" : "mb-4"}
          >
            <CardHeader className="pb-3">
              <View className="flex-row items-center justify-between">
                <CardTitle className="text-sm flex-row items-center">
                  {isRecording ? (
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                      <Text className="text-sm font-semibold">
                        Listening...
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center">
                      <Feather
                        name="mic-off"
                        size={16}
                        color={isDark ? "#fcfcfc" : "#0a0a0a"}
                      />
                      <Text className="ml-2 text-sm font-semibold">
                        Ready to listen
                      </Text>
                    </View>
                  )}
                </CardTitle>
                {confidence >= 70 && (
                  <Feather name="check-circle" size={16} color="#22c55e" />
                )}
              </View>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Processing Indicator */}
              {isProcessing && (
                <View className="items-center py-2">
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark mt-2">
                    Processing...
                  </Text>
                </View>
              )}

              {/* Parsed Data Preview */}
              {hasData && !isProcessing && (
                <View className="space-y-2">
                  <Text className="text-xs font-medium text-foreground-light dark:text-foreground-dark">
                    Detected:
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {parsedData.amount && (
                      <View className="bg-muted-light dark:bg-muted-dark px-3 py-1 rounded-full">
                        <Text className="text-xs font-medium">
                          ${parsedData.amount}
                        </Text>
                      </View>
                    )}
                    {parsedData.description && (
                      <View className="bg-muted-light dark:bg-muted-dark px-3 py-1 rounded-full">
                        <Text className="text-xs font-medium">
                          {parsedData.description}
                        </Text>
                      </View>
                    )}
                    {parsedData.merchant && (
                      <View className="bg-muted-light dark:bg-muted-dark px-3 py-1 rounded-full">
                        <Text className="text-xs font-medium">
                          @{parsedData.merchant}
                        </Text>
                      </View>
                    )}
                    {parsedData.category && (
                      <View className="bg-muted-light dark:bg-muted-dark px-3 py-1 rounded-full">
                        <Text className="text-xs font-medium">
                          {parsedData.category}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Main Action Button - Always visible except when processing */}
              {!isProcessing && (
                <Button
                  onPress={() => {
                    if (isRecording) {
                      onStopListening();
                    } else {
                      if (hasData && onRetry) {
                        // Clear existing data before starting new recording
                        onRetry();
                      }
                      onStartListening();
                    }
                  }}
                  variant={isRecording ? "destructive" : "default"}
                  className="w-full mt-4"
                >
                  <View className="flex-row items-center justify-center gap-2">
                    {isRecording ? (
                      <>
                        <Feather
                          name="mic-off"
                          size={18}
                          color={isDark ? "#fcfcfc" : "#fcfcfc"}
                        />
                        <Text className="text-destructive-foreground-light dark:text-destructive-foreground-dark font-semibold">
                          Stop Recording
                        </Text>
                      </>
                    ) : (
                      <>
                        <Feather
                          name="mic"
                          size={18}
                          color={isDark ? "#1a1a1a" : "#fcfcfc"}
                        />
                        <Text className="text-primary-foreground-light dark:text-primary-foreground-dark font-semibold">
                          Start Speaking
                        </Text>
                      </>
                    )}
                  </View>
                </Button>
              )}

              {/* Done Button - Always visible */}
              <Button
                onPress={onClose}
                variant="outline"
                className="w-full mt-2"
              >
                Done
              </Button>
            </CardContent>
          </Card>

          {/* Examples */}
          <View className="bg-background-light dark:bg-background-dark rounded-lg p-4 space-y-2 border border-border-light dark:border-border-dark">
            <Text className="text-xs font-semibold text-foreground-light dark:text-foreground-dark">
              Examples:
            </Text>
            {type === "income" ? (
              <>
                <Text className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                  • &quot;50 dollars for salary&quot;
                </Text>
                <Text className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                  • &quot;1500 freelance payment&quot;
                </Text>
                <Text className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                  • &quot;200 gift from family&quot;
                </Text>
              </>
            ) : (
              <>
                <Text className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                  • &quot;25 dollars for lunch at Chipotle&quot;
                </Text>
                <Text className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                  • &quot;50 dollars petrol at BP&quot;
                </Text>
                <Text className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                  • &quot;15 coffee&quot;
                </Text>
              </>
            )}
          </View>
        </View>
      </DialogContent>
    </Dialog>
  );
}
