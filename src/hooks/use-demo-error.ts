import { useCallback } from 'react';
import { useDemoMode, DemoScenarioId } from '@/contexts/DemoModeContext';
import { showErrorToast, showWarningToast, showNetworkError, showServerError } from '@/components/ErrorToast';

interface DemoErrorOptions {
  delay?: number;
  onError?: () => void;
  onSuccess?: () => void;
}

export function useDemoError() {
  const { isActive, shouldTriggerError, markScenarioComplete } = useDemoMode();

  const simulateDelay = useCallback((ms: number = 1500) => {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
  }, []);

  const checkAndTriggerError = useCallback(async (
    scenarioId: DemoScenarioId,
    errorAction: () => void,
    options: DemoErrorOptions = {}
  ): Promise<boolean> => {
    if (!isActive) return false;
    
    const shouldTrigger = shouldTriggerError(scenarioId);
    if (!shouldTrigger) return false;

    if (options.delay) {
      await simulateDelay(options.delay);
    }

    errorAction();
    markScenarioComplete(scenarioId);
    options.onError?.();
    
    return true;
  }, [isActive, shouldTriggerError, markScenarioComplete, simulateDelay]);

  // Pre-configured error triggers for common scenarios
  const triggerUploadNetworkError = useCallback(async (
    setError: (msg: string) => void,
    setProgress?: (p: number) => void
  ) => {
    return checkAndTriggerError('upload-network', () => {
      showNetworkError('Upload failed. Please check your connection and try again.');
      setError('Network error during upload. Please try again.');
    }, { delay: 1500 });
  }, [checkAndTriggerError]);

  const triggerUploadFormatError = useCallback(async () => {
    return checkAndTriggerError('upload-format', () => {
      showErrorToast(
        'This file type is not supported. Please use PDF, PPTX, or DOCX.',
        { title: 'Unsupported Format' }
      );
    }, { delay: 500 });
  }, [checkAndTriggerError]);


  const triggerPrefSaveError = useCallback(async () => {
    return checkAndTriggerError('pref-save', () => {
      showWarningToast('Unable to save preferences. Changes saved locally.', 'Sync Failed');
    }, { delay: 800 });
  }, [checkAndTriggerError]);

  const triggerVoicePreviewError = useCallback(async () => {
    return checkAndTriggerError('voice-preview', () => {
      showErrorToast('Voice preview is temporarily unavailable. Please try again later.', { title: 'Preview Failed' });
    }, { delay: 500 });
  }, [checkAndTriggerError]);

  const triggerAIQuotaError = useCallback(async () => {
    return checkAndTriggerError('ai-quota', () => {
      showErrorToast(
        'AI generation quota exceeded for this session. Please try again in a few minutes.',
        { title: 'Generation Failed', duration: 6000 }
      );
    }, { delay: 2000 });
  }, [checkAndTriggerError]);

  const triggerAutoSaveError = useCallback(async () => {
    return checkAndTriggerError('autosave-fail', () => {
      showWarningToast('Auto-save interrupted. Click "Save" manually to preserve your work.', 'Auto-Save Failed');
    });
  }, [checkAndTriggerError]);

  const triggerAddTestError = useCallback(async (setInlineError: (msg: string) => void) => {
    return checkAndTriggerError('add-test-fail', () => {
      showErrorToast('Unable to add assessment. Server rejected the request.', { title: 'Add Failed' });
      setInlineError('Failed to insert assessment. Please try again.');
    }, { delay: 1000 });
  }, [checkAndTriggerError]);

  const triggerMaxQuestionsError = useCallback(async () => {
    return checkAndTriggerError('max-questions', () => {
      showWarningToast('Maximum of 10 questions per assessment reached.', 'Limit Reached');
    });
  }, [checkAndTriggerError]);

  const triggerSaveError = useCallback(async () => {
    return checkAndTriggerError('save-fail', () => {
      showErrorToast('Unable to save course. Please check your connection and try again.', { title: 'Save Failed' });
    }, { delay: 1500 });
  }, [checkAndTriggerError]);

  const triggerVersionConflict = useCallback(async () => {
    return checkAndTriggerError('version-conflict', () => {
      // This one triggers a dialog, handled in the component
    }, { delay: 1000 });
  }, [checkAndTriggerError]);

  const triggerAudioPlaybackError = useCallback(async (setError: (msg: string) => void) => {
    return checkAndTriggerError('audio-fail', () => {
      setError('Audio playback failed. Please try again.');
    }, { delay: 500 });
  }, [checkAndTriggerError]);

  const triggerPublishError = useCallback(async () => {
    return checkAndTriggerError('publish-fail', () => {
      showServerError(500);
    }, { delay: 2000 });
  }, [checkAndTriggerError]);

  return {
    isActive,
    simulateDelay,
    checkAndTriggerError,
    // Pre-configured triggers
    triggerUploadNetworkError,
    triggerUploadFormatError,
    triggerPrefSaveError,
    triggerVoicePreviewError,
    triggerAIQuotaError,
    triggerAutoSaveError,
    triggerAddTestError,
    triggerMaxQuestionsError,
    triggerSaveError,
    triggerVersionConflict,
    triggerAudioPlaybackError,
    triggerPublishError,
  };
}
