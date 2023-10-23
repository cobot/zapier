import { Bundle } from 'zapier-platform-core';

export type KontentBundle<InputData extends Readonly<Record<string, unknown>>> =
  Omit<Bundle<InputData>, 'authData'> & Readonly<{ authData: AuthData }>;

type AuthData = Readonly<{
  access_token: string;
  refresh_token: string;
  subdomain: string;
  space: string;
  membershipId?: string;
  memberships: Array<any>;
  subdomains: Array<any>;
}>;