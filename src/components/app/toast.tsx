import * as React from 'react';
import { Toast, ToastContainer } from '@/components/ui/Toast/Toast';

type ToastType = 'neutral' | 'positive' | 'warning' | 'negative';
interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  body?: string;
  /** Moji's Toast renders this as an outline button in a second row. */
  secondaryAction?: React.ReactNode;
  onSecondaryAction?: () => void;
  /** Overrides Moji's 4000ms auto-dismiss. */
  duration?: number;
}

/** Moji's default is 4s, which is not long enough to read a toast AND click a
 *  button inside it. Anything actionable gets the longer window. */
const ACTIONABLE_MS = 12000;

const Ctx = React.createContext<(t: Omit<ToastItem, 'id'>) => void>(() => {});
export const useToast = () => React.useContext(Ctx);

let seq = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const push = React.useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = ++seq;
    setItems((prev) => [...prev, { ...t, id }]);
  }, []);

  const dismiss = (id: number) => setItems((prev) => prev.filter((t) => t.id !== id));

  return (
    <Ctx.Provider value={push}>
      {children}
      <ToastContainer>
        {items.map((t) => (
          // Moji's Toast owns its own auto-dismiss timer; mount/unmount from
          // state and never pre-render, per the component's usage contract.
          <Toast
            key={t.id}
            type={t.type}
            title={t.title}
            body={t.body}
            duration={t.duration ?? (t.secondaryAction ? ACTIONABLE_MS : undefined)}
            secondaryAction={t.secondaryAction}
            onSecondaryAction={
              t.onSecondaryAction &&
              (() => {
                t.onSecondaryAction?.();
                dismiss(t.id);
              })
            }
            onDismiss={() => dismiss(t.id)}
          />
        ))}
      </ToastContainer>
    </Ctx.Provider>
  );
}
