import { Field } from './field';

export const getSourceIdsField = (extras?: Partial<Field>): Field => ({
  label: 'Source Ids',
  key: 'source_ids',
  type: 'string',
  list: true,
  helpText: 'Associate an activity with a source. Right now you can only pass membership ids, which results in the activity to be also displayed on the membership page.',
  dynamic: 'get_memberships.id.space_name',
  ...extras,
});