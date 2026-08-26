import * as React from 'react';
import { AddCircle, Magicpen, Trash } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { DropdownSelector } from '@/components/ui/DropdownSelector/DropdownSelector';
import { DropdownMenuList } from '@/components/ui/DropdownMenuList/DropdownMenuList';
import { Menu } from '@/components/app/Menu';

/** The operators the artboard's trigger opens on — 932:20777 reads "Contains". */
export type RuleOp = 'contains' | 'starts-with' | 'ends-with';

export const RULE_OP_LABEL: Record<RuleOp, string> = {
  contains: 'Contains',
  'starts-with': 'Starts with',
  'ends-with': 'Ends with',
};

export type UrlRule = { id: string; op: RuleOp; value: string };

let ruleSeq = 0;
export function makeRule(op: RuleOp = 'contains', value = ''): UrlRule {
  ruleSeq += 1;
  return { id: `rule-${ruleSeq}`, op, value };
}

/**
 * Invented, and labelled as such: the two rules "Regenerate rules with AI"
 * produces. The artboard draws the button (932:20784) but nothing behind it,
 * and no upstream source says what a generated rule looks like. Keep this
 * quarantined the way `MATCHERS` in `@/data/fixtures` is.
 */
const AI_RULES = ['/docs', '/product'];

/**
 * The URL-matching rules block — Figma 932:20775 and 932:20782.
 *
 * A bordered container of `[operator ▾] [path] [delete]` rows, with "Add rule
 * manually" and "Regenerate rules with AI" underneath. Every part is a Moji
 * component with props: the operator is a `DropdownSelector` inside a portaled
 * `Menu` (the same trigger-plus-Menu pairing the toolbar filters use), the path
 * is an `Input`, and both buttons are `Button variant="outline" size="sm"`.
 */
export function UrlRuleRows({
  rules,
  onChange,
}: {
  rules: UrlRule[];
  onChange: (rules: UrlRule[]) => void;
}) {
  const [openFor, setOpenFor] = React.useState<string | null>(null);
  const [generating, setGenerating] = React.useState(false);

  const patch = (id: string, next: Partial<UrlRule>) =>
    onChange(rules.map((r) => (r.id === id ? { ...r, ...next } : r)));

  const generate = () => {
    setGenerating(true);
    window.setTimeout(() => {
      onChange(AI_RULES.map((value) => makeRule('contains', value)));
      setGenerating(false);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      {rules.length > 0 && (
        <div className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border-default)]">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center gap-[var(--space-3)] p-[var(--space-3)]"
            >
              <Menu
                open={openFor === rule.id}
                onClose={() => setOpenFor(null)}
                trigger={
                  <DropdownSelector
                    size="small"
                    text={RULE_OP_LABEL[rule.op]}
                    isOpen={openFor === rule.id}
                    // No `hasValue`: it paints the trigger brand-blue, which is
                    // right for a filter that has been narrowed and wrong here —
                    // an operator always has a value, and 932:20777 draws it
                    // neutral.
                    onClick={() => setOpenFor((id) => (id === rule.id ? null : rule.id))}
                  />
                }
              >
                {(Object.keys(RULE_OP_LABEL) as RuleOp[]).map((op) => (
                  <DropdownMenuList
                    key={op}
                    text={RULE_OP_LABEL[op]}
                    state={rule.op === op ? 'selected' : 'default'}
                    onClick={() => {
                      patch(rule.id, { op });
                      setOpenFor(null);
                    }}
                  />
                ))}
              </Menu>
              <Input
                className="flex-1"
                size="small"
                value={rule.value}
                placeholder="/page/path"
                aria-label="Path to match"
                onChange={(e) => patch(rule.id, { value: e.target.value })}
              />
              <Button
                variant="outline"
                size="icon-sm"
                danger
                aria-label="Remove rule"
                leftIcon={<Trash size={16} variant="Linear" color="currentColor" />}
                onClick={() => onChange(rules.filter((r) => r.id !== rule.id))}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-[var(--space-2)]">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<AddCircle size={20} variant="Linear" color="currentColor" />}
          onClick={() => onChange([...rules, makeRule()])}
        >
          Add rule manually
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={generating}
          // Purple/500 is the artboard's tint for this one glyph (932:20784) —
          // a token, not a hex, and scoped to the icon rather than the button.
          leftIcon={
            <span className="text-[var(--color-purple-500)]">
              <Magicpen size={20} variant="Bold" color="currentColor" />
            </span>
          }
          onClick={generate}
        >
          {generating ? 'Regenerating…' : 'Regenerate rules with AI'}
        </Button>
      </div>
    </div>
  );
}
