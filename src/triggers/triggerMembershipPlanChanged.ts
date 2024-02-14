import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import {
  apiCallUrl,
  listMemberships,
  subscribeHook,
  unsubscribeHook,
} from "../utils/api";
import { SubscribeBundleInputType } from "../types/subscribeType";
import { getSubdomainField } from "../fields/getSudomainsField";
import { MembershipOutput } from "../types/outputs";
import { apiResponseToMembershipOutput } from "../utils/api-to-output";
import { membershipSample } from "../utils/samples";
import { HookTrigger } from "../types/trigger";

const hookLabel = "Membership Plan Change Date Reached";
const event = "membership_plan_change_date_reached";

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
): Promise<MembershipOutput[]> {
  if (bundle.cleanedRequest) {
    const membership = await apiCallUrl(z, bundle.cleanedRequest.url);
    return [apiResponseToMembershipOutput(membership)];
  } else {
    return [];
  }
}

const trigger: HookTrigger = {
  key: event,
  noun: hookLabel,
  display: {
    label: hookLabel,
    description: "Triggers when a member's new plan becomes active.",
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
    ): Promise<MembershipOutput[]> => {
      const apiMemberships = await listMemberships(z, bundle);
      return apiMemberships.map((m) => apiResponseToMembershipOutput(m));
    },

    sample: membershipSample,
  },
};
export default trigger;
