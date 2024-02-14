import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../../types/kontentBundle";
import { OutputField } from "../../fields/output/outputField";
import { OutputFromOutputFields } from "../../fields/output/outputFromOutputFields";
import { PollingTrigger } from "../../types/trigger";

const execute = (z: ZObject, bundle: KontentBundle<{}>): Output => {
  return bundle.authData.adminOf
    .map((space) => {
      return { id: space.subdomain, name: space.name };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
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

const trigger: PollingTrigger = {
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
};
export default trigger;
