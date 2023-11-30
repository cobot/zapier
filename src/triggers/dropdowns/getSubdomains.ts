import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../../types/kontentBundle";
import { OutputField } from "../../fields/output/outputField";
import { OutputFromOutputFields } from "../../fields/output/outputFromOutputFields";

const execute = (z: ZObject, bundle: KontentBundle<{}>): Output => {
  return bundle.authData.adminOf.map((space) => {
    return { id: space.subdomain, name: space.name };
  });
};

const outputFields = [
  {
    key: "id",
    label: "Id",
    type: "string",
  },
  {
    key: "name",
    label: "Subdomain Name",
    type: "string",
  },
] as const satisfies ReadonlyArray<OutputField>;

type Output = ReadonlyArray<OutputFromOutputFields<typeof outputFields>>;

export default {
  key: "get_subdomains",
  noun: "Subdomain choice",
  display: {
    label: "Get subdomain choice",
    description: "Get subdomain for the input dropdown.",
    hidden: true,
  },
  operation: {
    type: "polling",
    perform: execute,
    sample: {
      name: "Some space",
      id: "some-space",
    },
    outputFields,
  },
} as const;
