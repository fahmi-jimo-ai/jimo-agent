import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  armTraining,
  disarmTraining,
  disarmAllTraining,
  isTrainingArmed,
  TRAINING_MS,
} from './trainingTimers';

describe('trainingTimers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    disarmAllTraining();
  });

  it('fires once TRAINING_MS has elapsed, and not before', () => {
    const done = vi.fn();
    armTraining('a', done);

    vi.advanceTimersByTime(TRAINING_MS - 1);
    expect(done).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(done).toHaveBeenCalledExactlyOnceWith('a');
    expect(isTrainingArmed('a')).toBe(false);
  });

  it('replaces rather than stacks, so resuming on every mount is safe', () => {
    const done = vi.fn();
    armTraining('a', done);
    armTraining('a', done);
    armTraining('a', done);

    vi.advanceTimersByTime(TRAINING_MS);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('does not fire once disarmed — a removed row cannot come back', () => {
    const done = vi.fn();
    armTraining('a', done);
    disarmTraining('a');

    vi.advanceTimersByTime(TRAINING_MS * 2);
    expect(done).not.toHaveBeenCalled();
  });

  it('keeps separate rows apart', () => {
    const a = vi.fn();
    const b = vi.fn();
    armTraining('a', a);
    armTraining('b', b);
    disarmTraining('a');

    vi.advanceTimersByTime(TRAINING_MS);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledExactlyOnceWith('b');
  });
});
