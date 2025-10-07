import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
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
  isRecording,
  isProcessing,
  parsedData,
  confidence = 0,
  isSupported = true,
  type = "expense",
}: VoiceInputModalProps) {
  const hasData = parsedData && Object.keys(parsedData).length > 0;

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
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
                      <Feather name="mic-off" size={16} color="#374151" />
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
                  <Text className="text-xs text-gray-600 mt-2">
                    Processing...
                  </Text>
                </View>
              )}

              {/* Parsed Data Preview */}
              {hasData && !isProcessing && (
                <View className="space-y-2">
                  <Text className="text-xs font-medium text-gray-700">
                    Detected:
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {parsedData.amount && (
                      <View className="bg-gray-100 px-3 py-1 rounded-full">
                        <Text className="text-xs font-medium">
                          ${parsedData.amount}
                        </Text>
                      </View>
                    )}
                    {parsedData.description && (
                      <View className="bg-gray-100 px-3 py-1 rounded-full">
                        <Text className="text-xs font-medium">
                          {parsedData.description}
                        </Text>
                      </View>
                    )}
                    {parsedData.merchant && (
                      <View className="bg-gray-100 px-3 py-1 rounded-full">
                        <Text className="text-xs font-medium">
                          @{parsedData.merchant}
                        </Text>
                      </View>
                    )}
                    {parsedData.category && (
                      <View className="bg-gray-100 px-3 py-1 rounded-full">
                        <Text className="text-xs font-medium">
                          {parsedData.category}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Control Button */}
              {!isProcessing && (
                <Button
                  onPress={isRecording ? onStopListening : onStartListening}
                  variant={isRecording ? "destructive" : "default"}
                  className="w-full"
                >
                  <View className="flex-row items-center justify-center gap-2">
                    {isRecording ? (
                      <>
                        <Feather name="mic-off" size={18} color="white" />
                        <Text className="text-white font-semibold">
                          Stop Recording
                        </Text>
                      </>
                    ) : (
                      <>
                        <Feather name="mic" size={18} color="white" />
                        <Text className="text-white font-semibold">
                          Start Speaking
                        </Text>
                      </>
                    )}
                  </View>
                </Button>
              )}

              {/* Done Button - Show when we have parsed data */}
              {hasData && (
                <Button
                  onPress={onClose}
                  variant="outline"
                  className="w-full mt-2"
                >
                  <Text className="font-semibold">Done</Text>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Examples */}
          <View className="bg-gray-50 rounded-lg p-4 space-y-2">
            <Text className="text-xs font-semibold text-gray-700">
              Examples:
            </Text>
            {type === "income" ? (
              <>
                <Text className="text-xs text-gray-600">
                  • &quot;50 dollars for salary&quot;
                </Text>
                <Text className="text-xs text-gray-600">
                  • &quot;1500 freelance payment&quot;
                </Text>
                <Text className="text-xs text-gray-600">
                  • &quot;200 gift from family&quot;
                </Text>
              </>
            ) : (
              <>
                <Text className="text-xs text-gray-600">
                  • &quot;25 dollars for lunch at Chipotle&quot;
                </Text>
                <Text className="text-xs text-gray-600">
                  • &quot;50 dollars petrol at BP&quot;
                </Text>
                <Text className="text-xs text-gray-600">
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
