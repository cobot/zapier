import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { OutputField } from '../../fields/output/outputField';
import { OutputFromOutputFields } from '../../fields/output/outputFromOutputFields';

const execute = (z: ZObject, bundle: KontentBundle<{}>): Output => {
    return bundle.authData.memberships
}

const outputFields = [
  {
    key: 'id',
    label: 'Membership Id',
    type: 'string',
  },
  {
    key: 'space_name',
    label: 'Name',
    type: 'string',
  },
] as const satisfies ReadonlyArray<OutputField>;

type Output = ReadonlyArray<OutputFromOutputFields<typeof outputFields>>;

export default {
  key: 'get_memberships',
  noun: 'Membership multiple choice',
  display: {
    label: 'Get memberships multiple choices',
    description: 'Gets memberships for the input dropdown ordered by name.',
    hidden: true,
  },
  operation: {
    type: 'polling',
    perform: execute,
    sample: {
      'space_name': 'Some space',
      'id': 'b2c14f2c-6467-460b-a70b-bca17972a33a',
    },
    outputFields,
  },
} as const;