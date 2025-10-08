import {
  AudioModule,
  RecordingPresets,
  useAudioRecorder as useExpoAudioRecorder,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

interface UseAudioRecorderOptions {
  onTranscription: (transcript: string) => void;
  onError?: (error: string) => void;
}

export const useAudioRecorder = ({ onTranscription, onError }: UseAudioRecorderOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use HIGH_QUALITY preset - M4A/AAC is supported by Gemini!
  const audioRecorder = useExpoAudioRecorder(RecordingPresets.HIGH_QUALITY);
  
  console.log('🎤 Audio recorder initialized:', {
    isRecording: audioRecorder.isRecording,
    uri: audioRecorder.uri,
  });

  const checkPermissions = useCallback(async () => {
    try {
      console.log('🔐 Requesting recording permissions...');
      const result = await AudioModule.requestRecordingPermissionsAsync();
      console.log('🔐 Permission result:', result);
      
      if (!result.granted) {
        console.log('❌ Permission denied');
        onError?.('Microphone permission is required for voice input');
        return false;
      }
      
      console.log('✅ Permission granted');
      return true;
    } catch (error) {
      console.error('❌ Error checking permissions:', error);
      onError?.('Failed to check microphone permissions');
      return false;
    }
  }, [onError]);

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Starting recording process...');
      
      const hasPermission = await checkPermissions();
      console.log('🔐 Permission check result:', hasPermission);
      if (!hasPermission) return;

      // Set audio mode for iOS to allow recording
      if (Platform.OS === 'ios') {
        console.log('📱 Setting iOS audio mode...');
        try {
          await AudioModule.setAudioModeAsync({
            allowsRecording: true,
            playsInSilentMode: true,
          });
          console.log('✅ iOS audio mode set successfully');
        } catch (audioModeError) {
          console.error('❌ Failed to set iOS audio mode:', audioModeError);
          onError?.('Failed to configure audio for recording');
          return;
        }
      }

      console.log('🎵 Preparing to record...');
      
      // IMPORTANT: Must call prepareToRecordAsync() before record()
      try {
        await audioRecorder.prepareToRecordAsync();
        console.log('✅ Recorder prepared successfully');
      } catch (prepareError) {
        console.error('❌ Failed to prepare recorder:', prepareError);
        onError?.('Failed to prepare audio recorder');
        return;
      }
      
      console.log('🎵 Starting recording...');
      
      // Log recorder state before recording
      console.log('🎵 Recorder state before record():', {
        isRecording: audioRecorder.isRecording,
        uri: audioRecorder.uri
      });
      
      await audioRecorder.record();
      console.log('🎵 audioRecorder.record() completed, checking isRecording:', audioRecorder.isRecording);
      
      // Wait a short moment and check again - sometimes state takes time to update
      setTimeout(() => {
        console.log('🎵 After timeout, isRecording:', audioRecorder.isRecording);
        if (audioRecorder.isRecording) {
          console.log('✅ Recording started successfully');
          setIsRecording(true);
        } else {
          console.log('❌ Recording still not active after timeout');
          console.log('❌ This usually means prepareToRecordAsync() was not called or failed');
          onError?.('Failed to start recording - recording not active. Make sure microphone permissions are granted.');
        }
      }, 100);
    } catch (error) {
      console.error('❌ Exception in startRecording:', error);
      onError?.(`Failed to start recording: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [checkPermissions, onError, audioRecorder]);

  const stopRecording = useCallback(async () => {
    console.log('🎤 stopRecording called, audioRecorder.isRecording:', audioRecorder.isRecording, 'local isRecording:', isRecording);
    
    // Check our local state first, then audioRecorder state
    if (!isRecording && !audioRecorder.isRecording) {
      console.log('⚠️ Not recording, exiting stopRecording');
      return;
    }

    try {
      console.log('🛑 Stopping recording...');
      setIsRecording(false);
      setIsProcessing(true);

      // Only stop if actually recording
      if (audioRecorder.isRecording) {
        await audioRecorder.stop();
      }
      
      const uri = audioRecorder.uri;
      console.log('✅ Recording stopped, uri:', uri);

      if (uri) {
        try {
          // Check if file exists first
          const fileInfo = await FileSystem.getInfoAsync(uri);
          console.log('📁 File info:', fileInfo);
          
          if (!fileInfo.exists) {
            throw new Error(`Recording file does not exist at ${uri}`);
          }
          
          if (fileInfo.size === 0) {
            throw new Error('Recording file is empty - no audio was captured');
          }
          
          console.log('📁 File exists and has size:', fileInfo.size, 'bytes');
          
          // Read audio file as base64
          const base64Audio = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
          });
          
          console.log('📁 Audio file read successfully, length:', base64Audio.length);
          
          // Get API key for Gemini
          const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || 
                         process.env.EXPO_PUBLIC_GEMINI_API_KEY;
          
          if (!apiKey) {
            throw new Error('Gemini API key not configured. Please set EXPO_PUBLIC_GOOGLE_API_KEY or EXPO_PUBLIC_GEMINI_API_KEY');
          }

          // Send to Gemini API - much simpler and supports M4A/AAC!
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: "Please transcribe this audio to text. Only return the transcribed text, no other commentary."
                      },
                      {
                        inline_data: {
                          mime_type: "audio/aac", // M4A uses AAC codec
                          data: base64Audio
                        }
                      }
                    ]
                  }
                ]
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            console.error('❌ Gemini API Error:', data);
            throw new Error(data.error?.message || `API error: ${response.status}`);
          }

          // Parse Gemini response format
          if (data.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts) {
            const transcript = data.candidates[0].content.parts[0].text?.trim();
            
            if (transcript) {
              console.log('✅ Transcription successful:', transcript);
              onTranscription(transcript);
            } else {
              throw new Error('No transcription text found in response');
            }
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
  }, [onTranscription, onError, audioRecorder, isRecording]);

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
