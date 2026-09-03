import * as React from 'react';
import { Magicpen, Brush } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Alert } from '@/components/ui/Infobox/alert';
import { SpinnerIcon } from '@/components/ui/Icon/Icon';
import { ModalCard } from '@/components/app/ModalCard';
import { ChoiceCard } from '@/features/knowledge/sources/ChoiceCard';
import { armTraining } from '@/state/trainingTimers';
import { SMART_THEME_MS } from '@/state/settingsStore';
import { normalisePreviewUrl } from '@/features/knowledge/PreviewInAppModal';

/**
 * Figma 13:11138 ("Create a new Theme") and 13:11127 ("Generate a smart
 * theme"), as ONE card with steps rather than two dialogs.
 *
 * Docs (build/theme → Smart theme): "you must name your theme and give the URL
 * of the site you use as a template", and — the part no artboard carries —
 * "The Smart Theme feature only works with public websites. If the URL provided
 * is from a private or restricted access page, the theme generation may not
 * work properly."
 *
 * So the generating step HAS a failure path. A spinner that can only ever
 * succeed would be the bug: the docs say this fails, and a reader hitting it
 * with no explanation learns nothing.
 *
 * The URL goes through `normalisePreviewUrl` — already unit-tested — because
 * `new URL()` accepts `javascript:` as happily as `https:`.
 */
type Step = 'choose' | 'name' | 'smart' | 'generating' | 'failed';

export function CreateThemeModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, fromUrl: string | null) => void;
}) {
  const [step, setStep] = React.useState<Step>('choose');
  const [back, setBack] = React.useState(false);
  const [name, setName] = React.useState('');
  const [url, setUrl] = React.useState('');

  const go = (next: Step, isBack = false) => {
    setBack(isBack);
    setStep(next);
  };

  const target = normalisePreviewUrl(url);
  // Invented, and the only way to reach the documented failure without a real
  // fetch: a private-looking host stands in for "not publicly reachable".
  const looksPrivate =
    target != null &&
    /(^https?:\/\/(localhost|127\.|10\.|192\.168\.))|(\.local\/?$)|(\/\/staging\.)/i.test(target);

  const generate = () => {
    go('generating');
    armTraining(
      'smart-theme',
      () => (looksPrivate ? go('failed') : onCreate(name.trim(), target)),
      SMART_THEME_MS,
    );
  };

  return (
    <ModalCard
      title={
        step === 'failed'
          ? "Couldn't read that site"
          : step === 'smart' || step === 'generating'
            ? 'Generate a smart theme'
            : step === 'name'
              ? 'Create a new theme'
              : 'New theme'
      }
      variant={step === 'failed' ? 'confirm' : 'card'}
      step={step}
      direction={back ? 'back' : 'forward'}
      onClose={onClose}
      footer={
        step === 'choose' ? (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        ) : step === 'name' ? (
          <>
            <Button variant="outline" onClick={() => go('choose', true)}>
              Back
            </Button>
            <Button disabled={name.trim() === ''} onClick={() => onCreate(name.trim(), null)}>
              Create theme
            </Button>
          </>
        ) : step === 'smart' ? (
          <>
            <Button variant="outline" onClick={() => go('choose', true)}>
              Back
            </Button>
            <Button disabled={name.trim() === '' || !target} onClick={generate}>
              Generate
            </Button>
          </>
        ) : step === 'failed' ? (
          <>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => go('smart', true)}>Try another URL</Button>
          </>
        ) : undefined
      }
    >
      {step === 'choose' && (
        <div className="flex flex-col gap-[var(--space-3)]">
          <ChoiceCard
            title="Create a new Theme"
            description="Start from Jimo's defaults and style every element yourself."
            icon={<Brush size={20} variant="Linear" color="currentColor" />}
            onClick={() => go('name')}
          />
          <ChoiceCard
            title="Generate a smart theme"
            description="Point Jimo at a public URL and it derives colours and fonts from that site."
            icon={<Magicpen size={20} variant="Linear" color="currentColor" />}
            onClick={() => go('smart')}
          />
        </div>
      )}

      {step === 'name' && (
        <Input
          label="Theme name"
          placeholder="Brand 2026"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      )}

      {step === 'smart' && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <Input
            label="Theme name"
            placeholder="Brand 2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Website URL"
            placeholder="https://www.yourcompany.com"
            value={url}
            status={url.trim() !== '' && !target ? 'negative' : 'none'}
            supportiveText={
              url.trim() !== '' && !target ? 'Enter an http:// or https:// address.' : undefined
            }
            onChange={(e) => setUrl(e.target.value)}
          />
          <Alert
            type="warning"
            title="Public sites only"
            body="If the URL is a private or restricted page, generation will not work."
          />
        </div>
      )}

      {step === 'generating' && (
        <div className="flex flex-col items-center gap-[var(--space-4)] py-[var(--space-8)]">
          <SpinnerIcon size={32} />
          <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
            Reading colours and fonts from {target}…
          </span>
        </div>
      )}

      {step === 'failed' && (
        <>That page looks private or restricted, so Jimo could not read its styles. Try a public URL.</>
      )}
    </ModalCard>
  );
}
