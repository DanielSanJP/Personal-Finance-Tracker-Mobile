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

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      // Get the API URL from environment or use localhost for development
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      
      // Send to API
      const response = await fetch(`${apiUrl}/api/receipt-scan`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process receipt');
      }

      if (data.parsedData) {
        setParsedData(data.parsedData);
        setConfidence(data.confidence || 0);
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
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        onError?.('Camera permission is required to scan receipts');
        return;
      }

      // Launch camera
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
    } catch (error) {
      console.error('Error scanning from camera:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to scan from camera');
    }
  }, [processImage, onError]);

  const scanFromFile = useCallback(async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        onError?.('Photo library permission is required to select receipts');
        return;
      }

      // Launch image picker
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
