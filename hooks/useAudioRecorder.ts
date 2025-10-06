import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

interface UseAudioRecorderOptions {
  onTranscription: (transcript: string) => void;
  onError?: (error: string) => void;
}

export const useAudioRecorder = ({ onTranscription, onError }: UseAudioRecorderOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const checkPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        onError?.('Microphone permission is required for voice input');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking permissions:', error);
      onError?.('Failed to check microphone permissions');
      return false;
    }
  };

  const startRecording = useCallback(async () => {
    try {
      const hasPermission = await checkPermissions();
      if (!hasPermission) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      onError?.('Failed to start recording');
    }
  }, [onError]);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;

    try {
      setIsRecording(false);
      setIsProcessing(true);

      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (uri) {
        // For mobile, we'll need to use a different approach
        // Web Speech API is not available on React Native
        // We'll just return a placeholder for now
        onError?.('Voice transcription requires backend API integration');
        onTranscription('Voice recording completed - transcription pending');
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      onError?.('Failed to stop recording');
    } finally {
      setIsProcessing(false);
    }
  }, [onTranscription, onError]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const isSupported = Platform.OS !== 'web'; // Only supported on native platforms

  return {
    isRecording,
    isProcessing,
    isSupported,
    startRecording,
    stopRecording,
    toggleRecording,
  };
};
