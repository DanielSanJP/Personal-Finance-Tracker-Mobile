import {
  AudioModule,
  RecordingPresets,
  useAudioRecorder as useExpoAudioRecorder,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

type RecordingState = 'idle' | 'recording' | 'processing';

interface UseAudioRecorderOptions {
  onTranscription: (transcript: string) => void;
  onError?: (error: string) => void;
}

export const useAudioRecorder = ({ onTranscription, onError }: UseAudioRecorderOptions) => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  
  // Use HIGH_QUALITY preset - M4A/AAC is supported by Gemini!
  const audioRecorder = useExpoAudioRecorder(RecordingPresets.HIGH_QUALITY);
  
  if (__DEV__) {
    console.log('🎤 Audio recorder initialized:', {
      isRecording: audioRecorder.isRecording,
      uri: audioRecorder.uri,
    });
  }

  const checkPermissions = useCallback(async () => {
    try {
      if (__DEV__) console.log('🔐 Requesting recording permissions...');
      const result = await AudioModule.requestRecordingPermissionsAsync();
      if (__DEV__) console.log('🔐 Permission result:', result);
      
      if (!result.granted) {
        if (__DEV__) console.log('❌ Permission denied');
        onError?.('Microphone permission is required for voice input');
        return false;
      }
      
      if (__DEV__) console.log('✅ Permission granted');
      return true;
    } catch (error) {
      console.error('❌ Error checking permissions:', error);
      onError?.('Failed to check microphone permissions');
      return false;
    }
  }, [onError]);

  const startRecording = useCallback(async () => {
    try {
      if (__DEV__) console.log('🎤 Starting recording process...');
      
      const hasPermission = await checkPermissions();
      if (__DEV__) console.log('🔐 Permission check result:', hasPermission);
      if (!hasPermission) return;

      // Set audio mode for iOS to allow recording
      if (Platform.OS === 'ios') {
        if (__DEV__) console.log('📱 Setting iOS audio mode...');
        try {
          await AudioModule.setAudioModeAsync({
            allowsRecording: true,
            playsInSilentMode: true,
          });
          if (__DEV__) console.log('✅ iOS audio mode set successfully');
        } catch (audioModeError) {
          console.error('❌ Failed to set iOS audio mode:', audioModeError);
          onError?.('Failed to configure audio for recording');
          return;
        }
      }

      if (__DEV__) console.log('🎵 Preparing to record...');
      
      // IMPORTANT: Must call prepareToRecordAsync() before record()
      try {
        await audioRecorder.prepareToRecordAsync();
        if (__DEV__) console.log('✅ Recorder prepared successfully');
      } catch (prepareError) {
        console.error('❌ Failed to prepare recorder:', prepareError);
        onError?.('Failed to prepare audio recorder');
        return;
      }
      
      if (__DEV__) console.log('🎵 Starting recording...');
      
      // Log recorder state before recording
      if (__DEV__) {
        console.log('🎵 Recorder state before record():', {
          isRecording: audioRecorder.isRecording,
          uri: audioRecorder.uri
        });
      }
      
      await audioRecorder.record();
      if (__DEV__) console.log('🎵 audioRecorder.record() completed, checking isRecording:', audioRecorder.isRecording);
      
      // Wait a short moment and check again - sometimes state takes time to update
      setTimeout(() => {
        if (__DEV__) console.log('🎵 After timeout, isRecording:', audioRecorder.isRecording);
        if (audioRecorder.isRecording) {
          if (__DEV__) console.log('✅ Recording started successfully');
          setRecordingState('recording');
        } else {
          if (__DEV__) {
            console.log('❌ Recording still not active after timeout');
            console.log('❌ This usually means prepareToRecordAsync() was not called or failed');
          }
          setRecordingState('idle');
          onError?.('Failed to start recording - recording not active. Make sure microphone permissions are granted.');
        }
      }, 100);
    } catch (error) {
      console.error('❌ Exception in startRecording:', error);
      setRecordingState('idle');
      onError?.(`Failed to start recording: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [checkPermissions, onError, audioRecorder]);

  const stopRecording = useCallback(async () => {
    if (__DEV__) {
      console.log('🎤 stopRecording called, audioRecorder.isRecording:', audioRecorder.isRecording, 'recordingState:', recordingState);
    }
    
    // Check our local state first, then audioRecorder state
    if (recordingState !== 'recording' && !audioRecorder.isRecording) {
      if (__DEV__) console.log('⚠️ Not recording, exiting stopRecording');
      return;
    }

    try {
      if (__DEV__) console.log('🛑 Stopping recording...');
      // Set to processing IMMEDIATELY before any async operations
      setRecordingState('processing');

      // Only stop if actually recording
      if (audioRecorder.isRecording) {
        await audioRecorder.stop();
      }
      
      const uri = audioRecorder.uri;
      if (__DEV__) console.log('✅ Recording stopped, uri:', uri);

      if (uri) {
        try {
          // Check if file exists first
          const fileInfo = await FileSystem.getInfoAsync(uri);
          if (__DEV__) console.log('📁 File info:', fileInfo);
          
          if (!fileInfo.exists) {
            throw new Error(`Recording file does not exist at ${uri}`);
          }
          
          if (fileInfo.size === 0) {
            throw new Error('Recording file is empty - no audio was captured');
          }
          
          if (__DEV__) console.log('📁 File exists and has size:', fileInfo.size, 'bytes');
          
          // Read audio file as base64
          const base64Audio = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
          });
          
          if (__DEV__) console.log('📁 Audio file read successfully, length:', base64Audio.length);
          
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
              if (__DEV__) console.log('✅ Transcription successful:', transcript);
              onTranscription(transcript);
              // DON'T reset to idle here - let the parent (useVoiceInput) control when processing is done
              // This prevents the button from flickering between transcription and parsing
            } else {
              throw new Error('No transcription text found in response');
            }
          } else {
            if (__DEV__) console.warn('⚠️  No speech detected in audio');
            throw new Error('No speech detected. Please try speaking more clearly.');
          }
          
        } catch (error) {
          console.error('❌ Transcription error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Transcription failed';
          onError?.(errorMessage);
          // Only reset to idle on error
          setRecordingState('idle');
        }
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      onError?.('Failed to stop recording');
      setRecordingState('idle');
    }
    // NOTE: No finally block - state stays 'processing' until parent explicitly resets it
  }, [onTranscription, onError, audioRecorder, recordingState]);

  const toggleRecording = useCallback(() => {
    if (recordingState === 'recording') {
      stopRecording();
    } else if (recordingState === 'idle') {
      startRecording();
    }
  }, [recordingState, startRecording, stopRecording]);

  const resetState = useCallback(() => {
    if (__DEV__) console.log('🔄 Resetting recording state to idle');
    setRecordingState('idle');
  }, []);

  const isSupported = Platform.OS !== 'web'; // Only supported on native platforms

  return {
    isRecording: recordingState === 'recording',
    isProcessing: recordingState === 'processing',
    isSupported,
    startRecording,
    stopRecording,
    toggleRecording,
    resetState,
  };
};
