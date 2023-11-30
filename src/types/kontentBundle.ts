import { Bundle } from "zapier-platform-core";

export type KontentBundle<InputData extends Readonly<Record<string, unknown>>> =
  Omit<Bundle<InputData>, "authData"> & Readonly<{ authData: AuthData }>;

type AdminOfSpace = Readonly<{
  subdomain: string;
  name: string;
}>;

export type AuthData = Readonly<{
  access_token: string;
  adminOf: Array<AdminOfSpace>;
}>;
