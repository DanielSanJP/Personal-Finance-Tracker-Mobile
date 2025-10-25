import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

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

// Category options
const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Bills & Utilities',
  'Personal Care',
  'Travel',
  'Education',
  'Other'
];

export const useReceiptScan = ({ onReceiptData, onError }: UseReceiptScanOptions) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ReceiptData>({});
  const [confidence, setConfidence] = useState(0);

  const processImage = useCallback(async (imageUri: string) => {
    try {
      if (__DEV__) console.log('🖼️ Processing image:', imageUri);
      setIsProcessing(true);

      // Get API key
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not configured. Please check your environment variables.');
      }
      if (__DEV__) console.log('✅ API key found');

      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      if (__DEV__) console.log('✅ Gemini model initialized');

      // Read image as base64
      if (__DEV__) console.log('📖 Reading image file...');
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });
      if (__DEV__) console.log('✅ Image read successfully, length:', base64Image.length);

      // Get file type - normalize jpg to jpeg for Gemini API compatibility
      const filename = imageUri.split('/').pop() || 'receipt.jpg';
      const match = /\.(\w+)$/.exec(filename);
      let fileExtension = match ? match[1].toLowerCase() : 'jpeg';
      
      // Gemini API requires 'jpeg' not 'jpg'
      if (fileExtension === 'jpg') {
        fileExtension = 'jpeg';
      }
      
      const fileType = `image/${fileExtension}`;
      if (__DEV__) console.log('📝 Image MIME type:', fileType);

      // Create the prompt for Gemini
      const categoryOptions = EXPENSE_CATEGORIES.join(', ');
      const prompt = `
      Analyze this receipt image and extract the following information in JSON format. Be very accurate and look for the most likely total amount (not individual items, taxes, or discounts):

      {
        "merchant": "business name (clean, no extra numbers or text)",
        "amount": "final total amount as decimal number (e.g., 25.50)",
        "date": "date in YYYY-MM-DD format if found",
        "time": "time in HH:MM format if found on receipt (24-hour format)",
        "items": ["list of main purchased items if clearly visible"],
        "category": "best matching category from: ${categoryOptions}"
      }

      Important rules:
      - For amount: Look for "Total", "Amount Due", "Balance", or final payment amount
      - Ignore individual item prices, taxes, discounts, change amounts, or "why pay" comparison prices
      - If multiple amounts, choose the one most likely to be the final total the customer paid
      - For merchant: Use the main business name, clean up any store numbers or extra text
      - For date: Use the transaction date, not printed date
      - For time: Extract the transaction time if visible on receipt (look for time stamps near date/total)
      - For category: Choose the most appropriate category based on the merchant and items. Use ONLY the exact category names from the list above.

      IMPORTANT SYSTEM CONTEXT:
      - Our app uses a universal party system: transactions have "from_party" (source) and "to_party" (destination)
      - For expenses: from_party = account name, to_party = merchant name
      - Date field stores full timestamp including time (YYYY-MM-DDTHH:MM:SS format)
      - If time is found, it will be combined with the date; if not, current time will be used

      Return only valid JSON, no additional text.
      `;

      // Prepare the image data for Gemini
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: fileType
        }
      };

      // Call Gemini to analyze the receipt
      if (__DEV__) console.log('🤖 Calling Gemini API...');
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      if (__DEV__) console.log('✅ Gemini response received');

      // Parse the JSON response
      let parsedResult;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          parsedResult = JSON.parse(text);
        }
        if (__DEV__) console.log('✅ JSON parsed successfully:', parsedResult);
      } catch {
        console.error('❌ Failed to parse JSON from:', text);
        throw new Error('Failed to parse AI response. Please try again.');
      }

      // Combine date and time if both are available
      let dateValue = null;
      if (parsedResult.date) {
        if (parsedResult.time) {
          dateValue = `${parsedResult.date}T${parsedResult.time}:00`;
        } else {
          dateValue = `${parsedResult.date}T${new Date().toTimeString().split(' ')[0]}`;
        }
      }

      const receiptData: ReceiptData = {
        merchant: parsedResult.merchant || '',
        amount: parsedResult.amount ? String(parsedResult.amount) : '',
        date: dateValue ? new Date(dateValue) : undefined,
        items: Array.isArray(parsedResult.items) ? parsedResult.items : [],
        category: parsedResult.category || 'Other'
      };

      setParsedData(receiptData);
      setConfidence(90); // High confidence for successful parse
      
      if (__DEV__) console.log('📸 useReceiptScan - calling onReceiptData with:', receiptData);
      
      onReceiptData(receiptData);
      
      if (__DEV__) console.log('📸 useReceiptScan - onReceiptData completed');
      if (__DEV__) console.log('✅ Receipt processing completed successfully');

    } catch (error) {
      console.error('❌ Error processing receipt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error message:', errorMessage);
      onError?.(errorMessage);
    } finally {
      if (__DEV__) console.log('🏁 Processing finished, setting isProcessing to false');
      setIsProcessing(false);
    }
  }, [onReceiptData, onError]);

  const scanFromCamera = useCallback(async () => {
    try {
      if (__DEV__) console.log('📷 scanFromCamera called');
      
      // Check current permission status
      const { status: currentStatus } = await ImagePicker.getCameraPermissionsAsync();
      if (__DEV__) console.log('📷 Current camera permission status:', currentStatus);
      
      let hasPermission = currentStatus === 'granted';
      
      // If not granted, request permission
      if (!hasPermission) {
        if (__DEV__) console.log('📷 Requesting camera permission...');
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (__DEV__) console.log('📷 Permission result:', permissionResult);
        
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
        if (__DEV__) console.log('📷 Launching camera...');
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
          aspect: [3, 4],
        });

        if (__DEV__) console.log('📷 Camera result:', { canceled: result.canceled, assetsLength: result.assets?.length });

        if (!result.canceled && result.assets[0]) {
          const uri = result.assets[0].uri;
          if (__DEV__) console.log('📷 Image captured, URI:', uri);
          setPreviewUrl(uri);
          await processImage(uri);
        } else {
          if (__DEV__) console.log('📷 User canceled camera');
        }
      }
    } catch (error) {
      console.error('❌ Error scanning from camera:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to scan from camera');
    }
  }, [processImage, onError]);

  const scanFromFile = useCallback(async () => {
    try {
      if (__DEV__) console.log('🖼️ scanFromFile called');
      
      // No permissions request is necessary for launching the image library (per Expo docs)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        aspect: [3, 4],
      });

      if (__DEV__) console.log('🖼️ Gallery result:', { canceled: result.canceled, assetsLength: result.assets?.length });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        if (__DEV__) console.log('🖼️ Image selected, URI:', uri);
        setPreviewUrl(uri);
        await processImage(uri);
      } else {
        if (__DEV__) console.log('🖼️ User canceled gallery selection');
      }
    } catch (error) {
      console.error('❌ Error selecting file:', error);
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
