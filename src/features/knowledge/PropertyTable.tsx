import * as React from 'react';
import { More, Edit2, CloseCircle } from 'iconsax-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableUserCell,
} from '@/components/ui/Table/Table';
import { Button } from '@/components/ui/Button/Button';
import { DropdownMenuList } from '@/components/ui/DropdownMenuList/DropdownMenuList';
import { Menu } from '@/components/app/Menu';
import { PropertyTypeTile } from './PropertyTypeTile';
import { SourceCell } from './SourceCell';
import { DATA_TYPE_LABEL, type UserProperty } from '@/data/userProperties';

/**
 * The Agent Context table — Figma 887:10867.
 *
 * Moji's Table covers all three columns as-is; the Display Name column is
 * literally `TableUserCell` with the type tile in the `avatar` slot. Two
 * deliberate deviations, both resolved in Moji's favour per CLAUDE.md: the cell
 * inset is --space-4 against Figma's 12px, and the row runs slightly taller
 * than the artboard's 61px. No `divider` — these rows carry no rules.
 */
export function PropertyTable({
  properties,
  onEdit,
  onRemove,
}: {
  properties: UserProperty[];
  onEdit: (property: UserProperty) => void;
  onRemove: (property: UserProperty) => void;
}) {
  const [openFor, setOpenFor] = React.useState<string | null>(null);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Display Name</TableHead>
          <TableHead>Data Type</TableHead>
          <TableHead>Source</TableHead>
          {/* The action column is 34px of button, not a 180px data column. */}
          <TableHead className="min-w-0 w-[1%]">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {properties.map((property) => (
          <TableRow key={property.id}>
            <TableUserCell
              avatar={<PropertyTypeTile dataType={property.dataType} source={property.source} />}
              title={property.name}
              subtitle={property.description}
            />
            <TableCell>{DATA_TYPE_LABEL[property.dataType]}</TableCell>
            <TableCell>
              <SourceCell source={property.source} />
            </TableCell>
            <TableCell className="min-w-0 w-[1%]">
              <Menu
                open={openFor === property.id}
                onClose={() => setOpenFor(null)}
                align="right"
                trigger={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Actions for ${property.name}`}
                    leftIcon={<More size={16} variant="Linear" color="currentColor" />}
                    onClick={() => setOpenFor((id) => (id === property.id ? null : property.id))}
                  />
                }
              >
                <DropdownMenuList
                  text="Edit attribute"
                  icon={<Edit2 size={20} variant="Linear" color="currentColor" />}
                  onClick={() => {
                    setOpenFor(null);
                    onEdit(property);
                  }}
                />
                <DropdownMenuList
                  danger
                  text="Remove from Agent Context"
                  icon={<CloseCircle size={20} variant="Linear" color="currentColor" />}
                  onClick={() => {
                    setOpenFor(null);
                    onRemove(property);
                  }}
                />
              </Menu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
