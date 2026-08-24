import { useSyncExternalStore } from 'react';
import { getKnowledge, subscribeKnowledge } from './knowledgeStore';

export function useKnowledge() {
  return useSyncExternalStore(subscribeKnowledge, getKnowledge, getKnowledge);
}

export { addProperties, removeProperty, resetKnowledge } from './knowledgeStore';
export type { KnowledgeState } from './knowledgeStore';
