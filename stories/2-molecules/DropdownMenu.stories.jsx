import React from 'react';
import { ProfileCircle, DocumentCode } from 'iconsax-react';
import { DropdownSelector } from '../../src/components/ui/DropdownSelector/DropdownSelector';
import { DropdownMenuList } from '../../src/components/ui/DropdownMenuList/DropdownMenuList';
import { Menu } from '../../src/components/app/Menu';
import { JimoMarkBoxed } from '../../src/components/brand/JimoMark';

const FIGMA = 'https://www.figma.com/design/42KccejbNYeHc3EP5P8vHd/Copilot-Widget?node-id=';

/**
 * The selector + menu pair, documented together because they are one control.
 *
 * Two things this file exists to hold still:
 *
 *  1. **Selected rows match the trigger.** `DropdownMenuList`'s `selected` paints
 *     --color-brand-subtle + --color-brand-default, which is exactly the fill
 *     `DropdownSelector` shows when it is open or holds a value. See the header
 *     comment in DropdownMenuList.tsx — this is a deliberate fork of the .css.
 *  2. **Icon slots are one size.** Every glyph in a row is 20px on a 24 grid and
 *     draws the same ~0.83 of it, including the two that are not iconsax icons.
 *     `JimoMarkBoxed` exists for that reason; a bare wordmark in the slot reads
 *     as a different, smaller kind of icon.
 *
 * The panel itself is portaled to <body> — see Foundations/Floating Layers.
 */
const meta = {
  title: 'Molecules/DropdownMenu',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA + '887-11169' },
  },
};
export default meta;

const OPTIONS = [
  { value: 'all', label: 'All types', icon: <ProfileCircle size={20} variant="Linear" color="currentColor" /> },
  { value: 'jimo', label: 'Jimo SDK', icon: <JimoMarkBoxed size={20} /> },
  { value: 'custom', label: 'Custom Attributes', icon: <DocumentCode size={20} variant="Linear" color="currentColor" /> },
];

function Demo({ initialOpen = false, initialValue = 'all' }) {
  const [open, setOpen] = React.useState(initialOpen);
  const [value, setValue] = React.useState(initialValue);
  const label = OPTIONS.find((o) => o.value === value)?.label;

  return (
    // 260px of headroom so the open panel has somewhere to land in the frame.
    <div style={{ paddingBottom: 260 }}>
      <Menu
        open={open}
        onClose={() => setOpen(false)}
        align="right"
        trigger={
          <DropdownSelector
            size="small"
            text={label}
            withIcon
            icon={<ProfileCircle size={20} variant="Linear" color="currentColor" />}
            isOpen={open}
            hasValue={value !== 'all'}
            onClick={() => setOpen((o) => !o)}
          />
        }
      >
        {OPTIONS.map((o) => (
          <DropdownMenuList
            key={o.value}
            text={o.label}
            icon={o.icon}
            state={value === o.value ? 'selected' : 'default'}
            onClick={() => {
              setValue(o.value);
              setOpen(false);
            }}
          />
        ))}
      </Menu>
    </div>
  );
}

export const Closed = { render: () => <Demo /> };

/** The frame the rule comes from: the open panel and the filled trigger side by side. */
export const Open = { render: () => <Demo initialOpen /> };

/** A non-default value — trigger and selected row now carry the same fill. */
export const OpenWithValue = { render: () => <Demo initialOpen initialValue="jimo" /> };

/** The row states in isolation, so a change to any one of them shows up here. */
export const RowStates = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="w-[260px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-neutral-200)]">
      {['list-header', 'default', 'hover', 'selected', 'hover-selected', 'disabled'].map((s) => (
        <DropdownMenuList
          key={s}
          state={s}
          text={s}
          icon={<ProfileCircle size={20} variant="Linear" color="currentColor" />}
        />
      ))}
      <DropdownMenuList danger text="danger" icon={<DocumentCode size={20} variant="Linear" color="currentColor" />} />
    </div>
  ),
};
