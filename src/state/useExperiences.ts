import { useSyncExternalStore } from 'react';
import { getExperiences, subscribeExperiences } from './experiencesStore';

/** Matching `useSkills` — the hook is the only React in the store's world. */
export function useExperiences() {
  return useSyncExternalStore(subscribeExperiences, getExperiences, getExperiences);
}

export {
  addExperience,
  removeExperience,
  updateExperience,
  setExperienceStatus,
  duplicateExperience,
  setView,
  setExperiences,
  resetExperiences,
  filterExperiences,
  experiencesOfType,
  segmentOptions,
  tagOptions,
  EXPERIENCE_TABS,
  EXPERIENCE_TAB_LABEL,
  EXPERIENCE_DISPLAYS,
  EXPERIENCE_DISPLAY_LABEL,
} from './experiencesStore';
export type {
  ExperiencesState,
  ExperienceFilters,
  ExperienceTab,
  ExperienceDisplay,
  ViewPrefs,
} from './experiencesStore';
