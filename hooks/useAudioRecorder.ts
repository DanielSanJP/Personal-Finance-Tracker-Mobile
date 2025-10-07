import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

interface UseAudioRecorderOptions {
  onTranscription: (transcript: string) => void;
  onError?: (error: string) => void;
}

export const useAudioRecorder = ({ onTranscription, onError }: UseAudioRecorderOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const checkPermissions = useCallback(async () => {
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
  }, [onError]);

  const startRecording = useCallback(async () => {
    try {
      const hasPermission = await checkPermissions();
      if (!hasPermission) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Use LINEAR16 format for Google Cloud Speech-to-Text
      // This provides lossless quality and is recommended by Google
      const { recording } = await Audio.Recording.createAsync({
        isMeteringEnabled: true,
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 128000,
        },
      });

      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      onError?.('Failed to start recording');
    }
  }, [checkPermissions, onError]);

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
        try {
          // Read audio file as base64
          const base64Audio = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
          });
          
          // Get API key (Google Cloud Speech-to-Text uses same key as Gemini)
          const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || 
                         process.env.EXPO_PUBLIC_GEMINI_API_KEY;
          
          if (!apiKey) {
            throw new Error('Google API key not configured. Please set EXPO_PUBLIC_GOOGLE_API_KEY or EXPO_PUBLIC_GEMINI_API_KEY');
          }

          // Send to Google Cloud Speech-to-Text API
          // Using LINEAR16 encoding (lossless PCM) as recommended by Google
          const response = await fetch(
            `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                config: {
                  encoding: 'LINEAR16',
                  sampleRateHertz: 16000,
                  languageCode: 'en-US',
                  enableAutomaticPunctuation: true,
                  model: 'default',
                },
                audio: {
                  content: base64Audio,
                },
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            console.error('❌ API Error:', data);
            throw new Error(data.error?.message || `API error: ${response.status}`);
          }

          if (data.results && data.results.length > 0 && data.results[0].alternatives) {
            const transcript = data.results[0].alternatives[0].transcript;
            
            onTranscription(transcript);
          } else {
            console.warn('⚠️  No speech detected in audio');
            throw new Error('No speech detected. Please try speaking more clearly.');
          }
          
        } catch (error) {
          console.error('❌ Transcription error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Transcription failed';
          onError?.(errorMessage);
        }
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
