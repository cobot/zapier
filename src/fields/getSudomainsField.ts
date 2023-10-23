import { Field } from './field';

export const getSubdomainField = (extras?: Partial<Field>): Field => ({
  label: 'Subdomain',
  key: 'subdomain',
  type: 'string',
  required: true,
  helpText: 'Please select a space admin of your spaces',
  dynamic: 'get_subdomains.id.name',
  ...extras,
});