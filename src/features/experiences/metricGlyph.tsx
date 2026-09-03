import * as React from 'react';
import {
  ClipboardTick,
  CloseSquare,
  Pointer,
  Eye,
  Flash,
  Messages2,
  Profile2User,
  Rank,
  Send2,
  TickSquare,
} from 'iconsax-react';
import type { MetricKey } from '@/data/experiences';

/**
 * Metric → tile glyph.
 *
 * The Checklist artboard draws three of these and they are transcribed: a
 * ticked checkbox for the completion rate, an eye for users viewed, an x-square
 * for the dismissal. The other nine are chosen to read as the thing they count
 * and are invented, like everything else no frame draws.
 */
export const METRIC_ICON: Record<MetricKey, React.ReactNode> = {
  'users-reached': <Profile2User size={20} variant="Linear" color="currentColor" />,
  'finished-submissions': <Send2 size={20} variant="Linear" color="currentColor" />,
  'completion-rate': <ClipboardTick size={20} variant="Linear" color="currentColor" />,
  'button-actions': <Pointer size={20} variant="Linear" color="currentColor" />,
  'went-through-all-steps': <Rank size={20} variant="Linear" color="currentColor" />,
  'reached-goal': <Flash size={20} variant="Linear" color="currentColor" />,
  'total-tooltip-shown': <Eye size={20} variant="Linear" color="currentColor" />,
  // The artboard's three, transcribed.
  'completed-checklist': <TickSquare size={20} variant="Linear" color="currentColor" />,
  'users-viewed': <Eye size={20} variant="Linear" color="currentColor" />,
  'dismissed-checklist': <CloseSquare size={20} variant="Linear" color="currentColor" />,
  'users-opened': <Profile2User size={20} variant="Linear" color="currentColor" />,
  'ask-ai-messages': <Messages2 size={20} variant="Linear" color="currentColor" />,
};
