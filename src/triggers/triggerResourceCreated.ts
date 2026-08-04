import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import {
  apiCallUrl,
  listResources,
  subscribeHook,
  unsubscribeHook,
} from "../utils/api";
import { SubscribeBundleInputType } from "../types/subscribeType";
import { getSubdomainField } from "../fields/getSudomainsField";
import { resourceSample } from "../utils/samples";
import { ResourceOutput } from "../types/outputs";
import { ResourceApiResponse } from "../types/api-responses";
import { apiResponseToResourceOutput } from "../utils/api-to-output";
import { HookTrigger } from "../types/trigger";

const hookLabel = "Resource Created";
const event = "created_resource";

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
  z: ZObject,
  bundle: KontentBundle<{}>,
): Promise<ResourceOutput[]> {
  if (bundle.cleanedRequest) {
    const resource = (
      await apiCallUrl(z, bundle.cleanedRequest.url, {
        Accept: "application/vnd.api+json",
      })
    ).data as ResourceApiResponse;
    return [apiResponseToResourceOutput(resource)];
  }
  return [];
}

const trigger: HookTrigger = {
  key: event,
  noun: hookLabel,
  display: {
    label: hookLabel,
    description: "Triggers when a resource is created.",
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
    ): Promise<ResourceOutput[]> => {
      const resources = await listResources(z, bundle);
      return resources.map(apiResponseToResourceOutput);
    },

    sample: resourceSample,
  },
};
export default trigger;
