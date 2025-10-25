import { GoogleGenerativeAI } from '@google/generative-ai';
import { useCallback, useState } from 'react';
import { useAudioRecorder } from './useAudioRecorder';

export interface VoiceInputResult {
  amount: string;
  description: string;
  category: string;
  merchant: string;
  account: string;
  date: string;
  originalTranscript: string;
  confidence: number;
}

interface UseVoiceInputProps {
  onResult: (result: VoiceInputResult) => void;
  accounts?: { name: string; type: string; id: string }[];
  transactionType?: 'expense' | 'income';
}

export const useVoiceInput = ({
  onResult,
  accounts = [],
  transactionType = 'expense'
}: UseVoiceInputProps) => {
  const [error, setError] = useState<string | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const [parsedData, setParsedData] = useState<Partial<VoiceInputResult> | null>(null);
  const [confidence, setConfidence] = useState(0);

  const { isRecording, isProcessing: isRecorderProcessing, startRecording, stopRecording, isSupported, resetState } = useAudioRecorder({
    onTranscription: (newTranscript: string) => {
      if (newTranscript && typeof newTranscript === 'string' && newTranscript.trim()) {
        handleVoiceProcessing(newTranscript);
      } else {
        if (__DEV__) console.warn('⚠️  Received invalid transcript:', newTranscript);
        setError('No speech detected. Please try again.');
        resetState(); // Reset to idle on error
      }
    },
    onError: (err) => {
      setError(err);
      resetState(); // Reset to idle on error
    }
  });

  const handleVoiceProcessing = useCallback(async (rawTranscript: string) => {
    if (!rawTranscript.trim()) return;

    setError(null);
    setLastTranscript(rawTranscript);

    try {
      // Get API key
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not configured. Please check your environment variables.');
      }

      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      // Prepare prompt
      const accountsList = accounts.length > 0
        ? `Available accounts: ${accounts.map((a: any) => `${a.name} (${a.type})`).join(', ')}`
        : '';

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

      const prompt = `You are an AI assistant helping to parse voice input for a ${transactionType} transaction.

User said: "${rawTranscript}"

Current date: ${today}
Current time: ${currentTime}

${accountsList}

IMPORTANT SYSTEM CONTEXT:
- Our app uses a universal party system for transactions
- For EXPENSES: from_party = account name, to_party = merchant/business name
- For INCOME: from_party = income source/payer, to_party = account name
- Date field stores full timestamp including time (YYYY-MM-DDTHH:MM:SS format)
- If user mentions a specific time, extract it; otherwise use current time (${currentTime})

Extract the following information and return it as a JSON object:
{
  "amount": "the numeric amount without currency symbol",
  "description": "a clear description of what the transaction was for",
  "merchant": "the business or person name if mentioned",
  "category": "appropriate category (e.g., Food, Transport, Shopping, Entertainment, Bills, Healthcare, etc.)",
  "account": "the account name if mentioned, otherwise empty string",
  "date": "YYYY-MM-DD format (use ${today} unless user mentions specific date)",
  "time": "HH:MM in 24-hour format (extract if mentioned, else use ${currentTime})",
  "confidence": "your confidence level (0.0-1.0) in the parsed data"
}

Rules:
- Extract the amount as a plain number (e.g., "50" not "$50")
- If no merchant is explicitly mentioned, leave it empty
- Choose the most appropriate category based on the description
- If an account is mentioned and matches one from the available accounts, use that account name
- For income transactions, use categories like "Salary", "Freelance", "Gift", "Investment", etc.
- Be intelligent about context (e.g., "lunch at Chipotle" → merchant: "Chipotle", category: "Food")
- ALWAYS use today's date (${today}) unless user specifically mentions a different date
- Extract time if mentioned (e.g., "at 2pm", "this morning"), otherwise use current time (${currentTime})

Return ONLY the JSON object, no additional text.`;

      // Call Gemini
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse JSON from response
      let parsedDetails;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedDetails = JSON.parse(jsonMatch[0]);
        } else {
          parsedDetails = JSON.parse(text);
        }
      } catch {
        throw new Error('Failed to parse AI response. Please try again.');
      }

      // Combine date and time into ISO timestamp
      const dateStr = parsedDetails.date || today;
      const timeStr = parsedDetails.time || currentTime;
      const fullDateTime = `${dateStr}T${timeStr}:00`;

      const voiceResult: VoiceInputResult = {
        amount: parsedDetails.amount || '',
        description: parsedDetails.description || '',
        merchant: parsedDetails.merchant || '',
        category: parsedDetails.category || '',
        account: parsedDetails.account || '',
        date: fullDateTime,
        originalTranscript: rawTranscript,
        confidence: parsedDetails.confidence || 0.85
      };

      // Update local state for the modal
      setParsedData(voiceResult);
      setConfidence(voiceResult.confidence);
      
      if (__DEV__) {
        console.log('🎤 useVoiceInput - calling onResult with:', voiceResult);
      }
      
      onResult(voiceResult);
      
      if (__DEV__) {
        console.log('🎤 useVoiceInput - onResult completed, calling resetState');
      }
      
      // Now that we have parsed data, reset the recording state to idle
      resetState();

      if (__DEV__) {
        console.log('🎤 useVoiceInput - resetState completed, processing finished');
      }

    } catch (err) {
      console.error('Voice processing error:', err);
      setError(err instanceof Error ? err.message : 'Voice processing failed');
      resetState(); // Reset to idle on error
    }
  }, [onResult, accounts, transactionType, resetState]);

  const startVoiceInput = useCallback(() => {
    if (__DEV__) console.log('🎙️ startVoiceInput called');
    setError(null);
    startRecording();
  }, [startRecording]);

  const stopVoiceInput = useCallback(() => {
    if (__DEV__) console.log('🛑 stopVoiceInput called');
    stopRecording();
  }, [stopRecording]);

  const resetVoiceInput = useCallback(() => {
    console.log('🔄 resetVoiceInput called');
    console.trace('Stack trace for resetVoiceInput');
    setError(null);
    setLastTranscript('');
    setParsedData(null);
    setConfidence(0);
    resetState();
  }, [resetState]);

  return {
    isRecording,
    isProcessing: isRecorderProcessing,
    isSupported,
    error,
    lastTranscript,
    parsedData,
    confidence,
    startVoiceInput,
    stopVoiceInput,
    resetVoiceInput,
    processVoiceInput: handleVoiceProcessing
  };
};
