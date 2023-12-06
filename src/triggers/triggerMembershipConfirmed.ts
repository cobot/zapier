import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import {
  MembershipApiResponse,
  apiCallUrl,
  listMemberships,
  subscribeHook,
  unsubscribeHook,
} from "../utils/api";
import { SubscribeBundleInputType } from "../types/subscribeType";
import { getSubdomainField } from "../fields/getSudomainsField";

const hookLabel = "Membership Confirmed";
const event = "confirmed_membership";

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

type Output = {
  id: string;
  name: string | null;
  company: string | null;
  email: string | null;
  customer_number: string | null;
  plan_name: string;
  payment_method_name: string | null;
};

function apiResponseToOutput(membership: MembershipApiResponse): Output {
  return {
    id: membership.id,
    name: membership.name,
    email: membership.email,
    company: membership.address.company,
    customer_number: membership.customer_number,
    plan_name: membership.plan.name,
    payment_method_name: membership.payment_method?.name ?? null,
  };
}

async function parsePayload(
  z: ZObject,
  bundle: KontentBundle<{}>,
): Promise<Output[]> {
  if (bundle.cleanedRequest) {
    const membership = await apiCallUrl(z, bundle.cleanedRequest.url);
    return [apiResponseToOutput(membership)];
  } else {
    return [];
  }
}

const sample: Output = {
  id: "003b37a3-f205-5d9e-9caf-c4ca612075d4",
  name: "Sam Duncan",
  company: "",
  email: "sig@rauwekug.kr",
  customer_number: "123",
  plan_name: "Full Time",
  payment_method_name: "Credit Card",
};

export default {
  key: event,
  noun: hookLabel,
  display: {
    label: hookLabel,
    description: "Triggers when a membership is confirmed.",
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
    ): Promise<Output[]> => {
      const apiMemberships = await listMemberships(z, bundle);
      return apiMemberships.map((m) => apiResponseToOutput(m));
    },

    sample,
  },
} as const;
