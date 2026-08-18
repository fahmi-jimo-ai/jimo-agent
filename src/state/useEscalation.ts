import { useSyncExternalStore } from 'react';
import { getState, subscribe } from './escalationStore';
import type { EscalationState } from './types';

export function useEscalation(): EscalationState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export { setState, resetState } from './escalationStore';
export * from './types';
