import { useSyncExternalStore } from 'react';
import { getKnowledge, subscribeKnowledge } from './knowledgeStore';

export function useKnowledge() {
  return useSyncExternalStore(subscribeKnowledge, getKnowledge, getKnowledge);
}

export {
  addProperties,
  removeProperty,
  resetKnowledge,
  addSource,
  removeSource,
  updateSource,
  retrySource,
  resumeTraining,
  setSources,
  setRetrain,
} from './knowledgeStore';
export type { KnowledgeState, RetrainFrequency } from './knowledgeStore';
