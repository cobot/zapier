import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import {
  apiCallUrl,
  listAllocations,
  subscribeHook,
  unsubscribeHook,
} from "../utils/api";
import { SubscribeBundleInputType } from "../types/subscribeType";
import { getSubdomainField } from "../fields/getSudomainsField";
import { allocationSample } from "../utils/samples";
import { AllocationOutput } from "../types/outputs";
import { AllocationApiResponse } from "../types/api-responses";
import { apiResponseToAllocationOutput } from "../utils/api-to-output";
import { HookTrigger } from "../types/trigger";

const hookLabel = "Allocation Updated";
const event = "updated_allocation";

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
): Promise<AllocationOutput[]> {
  if (bundle.cleanedRequest) {
    const allocation = (
      await apiCallUrl(z, bundle.cleanedRequest.url, {
        Accept: "application/vnd.api+json",
      })
    ).data as AllocationApiResponse;
    return [apiResponseToAllocationOutput(allocation)];
  }
  return [];
}

const trigger: HookTrigger = {
  key: event,
  noun: hookLabel,
  display: {
    label: hookLabel,
    description: "Triggers when an allocation is updated.",
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
    ): Promise<AllocationOutput[]> => {
      const allocations = await listAllocations(z, bundle);
      return allocations.map(apiResponseToAllocationOutput);
    },

    sample: allocationSample,
  },
};
export default trigger;
