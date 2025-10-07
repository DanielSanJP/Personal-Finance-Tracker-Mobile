import React from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface ReceiptData {
  merchant?: string;
  amount?: string;
  date?: Date;
  category?: string;
}

interface ReceiptScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  previewUrl?: string | null;
  isProcessing: boolean;
  parsedData?: ReceiptData;
  confidence?: number;
}

export function ReceiptScannerModal({
  visible,
  onClose,
  onCamera,
  onGallery,
  previewUrl,
  isProcessing,
  parsedData,
  confidence = 0,
}: ReceiptScannerModalProps) {
  const hasData = parsedData && Object.keys(parsedData).length > 0;

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onClose={onClose} showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>Receipt Scanner</DialogTitle>
        </DialogHeader>

        <View className="space-y-4 pb-4">
          {/* Preview Image Card */}
          {previewUrl && (
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <View className="flex-row items-center justify-between">
                  <CardTitle className="text-sm flex-row items-center">
                    <Text className="text-sm font-semibold">
                      📷 Receipt Image
                    </Text>
                  </CardTitle>
                  {confidence >= 70 && (
                    <Text className="text-green-500 text-lg">✓</Text>
                  )}
                </View>
              </CardHeader>
              <CardContent>
                <View className="bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    source={{ uri: previewUrl }}
                    className="w-full h-64"
                    resizeMode="contain"
                  />
                </View>
              </CardContent>
            </Card>
          )}

          {/* Status Card */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                {isProcessing ? (
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    <Text className="text-sm font-semibold">
                      Processing receipt...
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Feather
                      className="mr-2"
                      name="camera"
                      size={18}
                      color="black"
                    />
                    <Text className="text-sm font-semibold">Ready to scan</Text>
                  </View>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Processing Indicator */}
              {isProcessing && (
                <View className="items-center py-2">
                  <ActivityIndicator size="large" color="#3b82f6" />
                </View>
              )}

              {/* Parsed Data Preview */}
              {hasData && (
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
                    {parsedData.merchant && (
                      <View className="bg-gray-100 px-3 py-1 rounded-full">
                        <Text className="text-xs font-medium">
                          {parsedData.merchant}
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
                    {parsedData.date && (
                      <View className="bg-gray-100 px-3 py-1 rounded-full">
                        <Text className="text-xs font-medium">
                          {new Date(parsedData.date).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Action Buttons - Only show when not processing and no preview */}
              {!isProcessing && !previewUrl && (
                <View className="flex-row gap-2 mt-3">
                  <View className="flex-1">
                    <Button
                      onPress={onCamera}
                      variant="default"
                      className="w-full"
                    >
                      <View className="flex-row items-center justify-center gap-2">
                        <Feather name="camera" size={18} color="white" />
                        <Text className="text-white font-semibold">Camera</Text>
                      </View>
                    </Button>
                  </View>
                  <View className="flex-1">
                    <Button
                      onPress={onGallery}
                      variant="outline"
                      className="w-full"
                    >
                      <View className="flex-row items-center justify-center gap-2">
                        <Feather name="upload" size={18} color="#374151" />
                        <Text className="font-semibold">Upload</Text>
                      </View>
                    </Button>
                  </View>
                </View>
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

          {/* Tips Section */}
          <View className="bg-gray-50 rounded-lg p-4 space-y-2">
            <Text className="text-xs font-semibold text-gray-700">Tips:</Text>
            <Text className="text-xs text-gray-600">
              • Ensure receipt is well-lit and flat
            </Text>
            <Text className="text-xs text-gray-600">
              • Include the total amount in the image
            </Text>
            <Text className="text-xs text-gray-600">
              • Works best with printed receipts
            </Text>
          </View>
        </View>
      </DialogContent>
    </Dialog>
  );
}
