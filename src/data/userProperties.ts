/**
 * The user-property catalogue the Agent Context tab picks from.
 *
 * Transcribed from Figma Copilot-Widget `901:16049` — the "Add user property"
 * modal (901:15549) supplies the list and its two groups, the populated table
 * (887:10867) supplies the Data Type and Source columns. In the real product
 * this comes from the workspace's SDK schema; here it is a fixture.
 *
 * Two places the two frames disagree, both resolved in favour of the table,
 * which is the later and more detailed artboard:
 *   - First Seen's description: table says "When user was first seen by Jimo",
 *     the modal says "Date when the user was created".
 *   - Email's tile: the table gives it the envelope/Email type, the modal
 *     reuses the Text "Aa" tile.
 */

export type DataType = 'uuid' | 'text' | 'email' | 'datetime' | 'list' | 'tags';
export type PropertySource = 'jimo' | 'custom';

export type UserProperty = {
  id: string;
  name: string;
  description: string;
  dataType: DataType;
  source: PropertySource;
};

/** How each Data Type is spelled in the table's second column. */
export const DATA_TYPE_LABEL: Record<DataType, string> = {
  uuid: 'UUID',
  text: 'Text',
  email: 'Email',
  datetime: 'Datetime',
  list: 'List',
  tags: 'Tags',
};

export const SOURCE_LABEL: Record<PropertySource, string> = {
  jimo: 'Jimo SDK',
  custom: 'Custom',
};

/** The group headings in the add-property modal. */
export const SOURCE_GROUP_LABEL: Record<PropertySource, string> = {
  jimo: 'From Jimo',
  custom: 'Custom Attributes',
};

export const USER_PROPERTIES: UserProperty[] = [
  { id: 'id', name: 'ID', description: "User's Jimo identifier", dataType: 'uuid', source: 'jimo' },
  { id: 'name', name: 'Name', description: "User's full name", dataType: 'text', source: 'jimo' },
  { id: 'email', name: 'Email', description: "User's email address", dataType: 'email', source: 'jimo' },
  { id: 'last_seen', name: 'Last Seen', description: 'When user was last seen by Jimo', dataType: 'datetime', source: 'jimo' },
  { id: 'first_seen', name: 'First Seen', description: 'When user was first seen by Jimo', dataType: 'datetime', source: 'jimo' },
  { id: 'tags', name: 'Tags', description: "User's assigned tag", dataType: 'tags', source: 'jimo' },
  { id: 'plan', name: 'Plan', description: "User's subscription plan type", dataType: 'list', source: 'custom' },
  { id: 'country', name: 'Country', description: "User's origin country", dataType: 'text', source: 'custom' },
];

export const PROPERTY_BY_ID: Record<string, UserProperty> = Object.fromEntries(
  USER_PROPERTIES.map((p) => [p.id, p])
);
