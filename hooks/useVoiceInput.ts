import { useState, useCallback } from 'react';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const [parsedData, setParsedData] = useState<Partial<VoiceInputResult> | null>(null);
  const [confidence, setConfidence] = useState(0);

  const { isRecording, startRecording, stopRecording, isSupported } = useAudioRecorder({
    onTranscription: (newTranscript: string) => {
      if (newTranscript.trim()) {
        handleVoiceProcessing(newTranscript);
      }
    },
    onError: (err) => setError(err)
  });

  const handleVoiceProcessing = useCallback(async (rawTranscript: string) => {
    if (!rawTranscript.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setLastTranscript(rawTranscript);

    try {
      // Send to our enhanced Gemini API for comprehensive processing
      const formData = new FormData();
      formData.append('transcript', rawTranscript);
      formData.append('accounts', JSON.stringify(accounts));
      formData.append('type', transactionType);

      // Get the API URL from environment or use localhost for development
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

      const response = await fetch(`${apiUrl}/api/speech-to-text`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process voice input');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Gemini has already done all the parsing - just map the results
      const result: VoiceInputResult = {
        amount: data.parsedDetails?.amount || '',
        description: data.parsedDetails?.description || '',
        category: data.parsedDetails?.category || '',
        merchant: data.parsedDetails?.merchant || '',
        account: data.parsedDetails?.account || '',
        date: data.parsedDetails?.date || new Date().toISOString().split('T')[0],
        originalTranscript: data.originalTranscript || rawTranscript,
        confidence: data.confidence || 0.8
      };

      console.log('Processed voice input result:', result);
      
      // Update local state for the modal
      setParsedData(result);
      setConfidence(result.confidence);
      
      onResult(result);

    } catch (err) {
      console.error('Voice processing error:', err);
      setError(err instanceof Error ? err.message : 'Voice processing failed');
    } finally {
      setIsProcessing(false);
    }
  }, [onResult, accounts, transactionType, isProcessing]);

  const startVoiceInput = useCallback(() => {
    setError(null);
    startRecording();
  }, [startRecording]);

  const stopVoiceInput = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  const resetVoiceInput = useCallback(() => {
    setError(null);
    setLastTranscript('');
  }, []);

  return {
    isRecording,
    isProcessing,
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
