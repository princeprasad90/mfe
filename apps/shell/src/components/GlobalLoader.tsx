import React, { useEffect } from 'react';
import { useLoadingStore } from '../stores';

const SHELL_EVENTS = {
  LOADING_START: 'mfe:loading:start',
  LOADING_STOP: 'mfe:loading:stop',
};

export function GlobalLoader() {
  const { isLoading, startLoading, stopLoading } = useLoadingStore();

  useEffect(() => {
    const handleStart = (e: CustomEvent<{ key: string }>) => {
      startLoading(e.detail.key);
    };
    const handleStop = (e: CustomEvent<{ key: string }>) => {
      stopLoading(e.detail.key);
    };

    window.addEventListener(SHELL_EVENTS.LOADING_START, handleStart as EventListener);
    window.addEventListener(SHELL_EVENTS.LOADING_STOP, handleStop as EventListener);

    return () => {
      window.removeEventListener(SHELL_EVENTS.LOADING_START, handleStart as EventListener);
      window.removeEventListener(SHELL_EVENTS.LOADING_STOP, handleStop as EventListener);
    };
  }, [startLoading, stopLoading]);

  if (!isLoading) return null;

  return (
    <div className="shell-global-loader">
      <div className="shell-global-loader__backdrop" />
      <div className="shell-global-loader__spinner">
        <div className="shell__spinner" />
        <span>Loading...</span>
      </div>
    </div>
  );
}
