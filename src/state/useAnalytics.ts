import { useSyncExternalStore } from 'react';
import { getAnalytics, subscribeAnalytics } from './analyticsStore';

export function useAnalytics() {
  return useSyncExternalStore(subscribeAnalytics, getAnalytics, getAnalytics);
}

export {
  setAnalytics,
  resetAnalytics,
  clearConversationFilters,
} from './analyticsStore';
