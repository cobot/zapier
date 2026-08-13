import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import { listResources, subscribeHook, unsubscribeHook } from "../utils/api";
import { SubscribeBundleInputType } from "../types/subscribeType";
import { getSubdomainField } from "../fields/getSudomainsField";
import { resourceDeletedSample } from "../utils/samples";
import { ResourceDeletedOutput } from "../types/outputs";
import { HookTrigger } from "../types/trigger";

const hookLabel = "Resource Deleted";
const event = "deleted_resource";

async function subscribeHookExecute(
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
) {
  return subscribeHook(z, bundle, {
    event,
    callback_url: bundle.targetUrl ?? "",
  });
}

async function unsubscribeHookExecute(
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
) {
  const webhook = bundle.subscribeData;
  return unsubscribeHook(z, bundle, webhook?.id ?? "");
}

async function parsePayload(
  _z: ZObject,
  bundle: KontentBundle<{}>,
): Promise<ResourceDeletedOutput[]> {
  if (bundle.cleanedRequest?.url) {
    const id = bundle.cleanedRequest.url.split("/").pop();
    if (id) {
      return [{ id }];
    }
  }
  return [];
}

const trigger: HookTrigger = {
  key: event,
  noun: hookLabel,
  display: {
    label: hookLabel,
    description: "Triggers when a resource is deleted.",
  },
  operation: {
    type: "hook",

    inputFields: [getSubdomainField()],

    performSubscribe: subscribeHookExecute,
    performUnsubscribe: unsubscribeHookExecute,

    perform: parsePayload,
    performList: async (
      z: ZObject,
      bundle: KontentBundle<SubscribeBundleInputType>,
    ): Promise<ResourceDeletedOutput[]> => {
      const resources = await listResources(z, bundle);
      return resources.map((resource) => ({ id: resource.id }));
    },

    sample: resourceDeletedSample,
  },
};
export default trigger;
