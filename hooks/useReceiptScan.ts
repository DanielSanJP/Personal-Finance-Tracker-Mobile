import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';

interface ReceiptData {
  merchant?: string;
  amount?: string;
  date?: Date;
  items?: string[];
  category?: string;
}

interface UseReceiptScanOptions {
  onReceiptData: (data: ReceiptData) => void;
  onError?: (error: string) => void;
}

export const useReceiptScan = ({ onReceiptData, onError }: UseReceiptScanOptions) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ReceiptData>({});
  const [confidence, setConfidence] = useState(0);

  const processImage = useCallback(async (imageUri: string) => {
    try {
      setIsProcessing(true);

      // Create form data
      const formData = new FormData();
      
      // Get the file from URI
      const filename = imageUri.split('/').pop() || 'receipt.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // Important: For React Native, append the image with proper format
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      // Use the Expo API route (local to the app)
      // Send to API - React Native automatically handles multipart/form-data
      const response = await fetch('/api/receipt-scan', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to process receipt');
      }

      // The API returns data in parsedData field (matching Next.js format)
      if (data.parsedData) {
        setParsedData(data.parsedData);
        setConfidence((data.confidence || 0.85) * 100); // Convert 0-1 to 0-100
        onReceiptData(data.parsedData);
      } else {
        throw new Error('No data returned from receipt scan');
      }

    } catch (error) {
      console.error('Error processing receipt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [onReceiptData, onError]);

  const scanFromCamera = useCallback(async () => {
    try {
      // Check current permission status
      const { status: currentStatus } = await ImagePicker.getCameraPermissionsAsync();
      
      let hasPermission = currentStatus === 'granted';
      
      // If not granted, request permission
      if (!hasPermission) {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        
        if (permissionResult.status !== 'granted') {
          // Check if we can ask again
          if (permissionResult.canAskAgain === false) {
            onError?.('Camera permission denied. Please enable it in your device settings.');
          } else {
            onError?.('Camera permission is required to scan receipts');
          }
          return;
        }
        hasPermission = true;
      }

      // Launch camera (only if we have permission)
      if (hasPermission) {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
          aspect: [3, 4],
        });

        if (!result.canceled && result.assets[0]) {
          const uri = result.assets[0].uri;
          setPreviewUrl(uri);
          await processImage(uri);
        }
      }
    } catch (error) {
      console.error('Error scanning from camera:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to scan from camera');
    }
  }, [processImage, onError]);

  const scanFromFile = useCallback(async () => {
    try {
      // No permissions request is necessary for launching the image library (per Expo docs)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [3, 4],
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setPreviewUrl(uri);
        await processImage(uri);
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to select file');
    }
  }, [processImage, onError]);

  const clearPreview = useCallback(() => {
    setPreviewUrl(null);
    setParsedData({});
    setConfidence(0);
  }, []);

  const isSupported = true; // Always supported on mobile

  return {
    isProcessing,
    isSupported,
    previewUrl,
    parsedData,
    confidence,
    scanFromCamera,
    scanFromFile,
    clearPreview,
  };
};
