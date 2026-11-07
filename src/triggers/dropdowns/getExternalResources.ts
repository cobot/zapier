import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../../types/kontentBundle";
import { OutputField } from "../../fields/output/outputField";
import { OutputFromOutputFields } from "../../fields/output/outputFromOutputFields";
import { PollingTrigger } from "../../types/trigger";
import { listExternalResources, spaceForSubdomain } from "../../utils/api";

const execute = async (
  z: ZObject,
  bundle: KontentBundle<{}>,
): Promise<Output> => {
  const subdomain = (bundle.inputData as { subdomain?: string }).subdomain;
  if (!subdomain) {
    throw new Error("Subdomain is required");
  }
  const space = await spaceForSubdomain(z, subdomain);
  if (!space) {
    throw new Error(`No space found for subdomain ${subdomain}`);
  }
  const resources = await listExternalResources(z, space);
  return resources
    .map((resource) => ({
      id: resource.id,
      name: resource.attributes.name,
    }))
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
    label: "Resource Name",
    type: "string",
  },
] as const satisfies ReadonlyArray<OutputField>;

type Output = ReadonlyArray<OutputFromOutputFields<typeof outputFields>>;

const trigger: PollingTrigger = {
  key: "get_external_resources",
  noun: "External Resource choice",
  display: {
    label: "Get external resource choice",
    description: "Get external resources for the input dropdown.",
    hidden: true,
  },
  operation: {
    type: "polling",
    perform: execute,
    sample: {
      id: "a4a99a71ac8df98d29de357180d273d3",
      name: "Meeting Room",
    },
    outputFields,
  },
};

export default trigger;
