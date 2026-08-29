import { useSyncExternalStore } from 'react';
import { getSkills, subscribeSkills } from './skillsStore';

/** Matching `useKnowledge` — the hook is the only React in the store's world. */
export function useSkills() {
  return useSyncExternalStore(subscribeSkills, getSkills, getSkills);
}

export {
  addSkill,
  removeSkill,
  updateSkill,
  toggleSkill,
  duplicateSkill,
  setSkills,
  resetSkills,
  filterSkills,
  skillsForPage,
} from './skillsStore';
export type { SkillsState, SkillFilters, SkillModeFilter, SkillSort } from './skillsStore';
