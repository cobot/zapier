import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import { listAllocations, subscribeHook, unsubscribeHook } from "../utils/api";
import { SubscribeBundleInputType } from "../types/subscribeType";
import { getSubdomainField } from "../fields/getSudomainsField";
import { allocationDeletedSample } from "../utils/samples";
import { AllocationDeletedOutput } from "../types/outputs";
import { HookTrigger } from "../types/trigger";

const hookLabel = "Allocation Deleted";
const event = "deleted_allocation";

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
): Promise<AllocationDeletedOutput[]> {
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
    description: "Triggers when an allocation is deleted.",
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
    ): Promise<AllocationDeletedOutput[]> => {
      const allocations = await listAllocations(z, bundle);
      return allocations.map((allocation) => ({ id: allocation.id }));
    },

    sample: allocationDeletedSample,
  },
};
export default trigger;
