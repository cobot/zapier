import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import {
  apiCallUrl,
  listRecentBookings,
  subscribeHook,
  unsubscribeHook,
} from "../utils/api";
import { SubscribeBundleInputType } from "../types/subscribeType";
import { getSubdomainField } from "../fields/getSudomainsField";

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

async function parsePayload(z: ZObject, bundle: KontentBundle<{}>) {
  var membership;
  if (bundle.cleanedRequest) {
    membership = await apiCallUrl(z, bundle.cleanedRequest.url);
    membership.from = new Date(membership.from).toISOString();
    membership.to = new Date(membership.to).toISOString();
    membership.created_at = new Date(membership.created_at).toISOString();
    membership.updated_at = new Date(membership.updated_at).toISOString();
  }
  return [membership];
}

export default {
  key: event,
  noun: hookLabel,
  display: {
    label: hookLabel,
    description: "Triggers on the day a member's new plan becomes active.",
  },
  operation: {
    type: "hook",

    inputFields: [getSubdomainField()],

    performSubscribe: subscribeHookExecute,
    performUnsubscribe: unsubscribeHookExecute,

    perform: parsePayload,
    performList: (
      z: ZObject,
      bundle: KontentBundle<SubscribeBundleInputType>,
    ) => listRecentBookings(z, bundle),

    sample: {
      url: "https://co-up.cobot.me/api/memberships/93207605",
    },
  },
} as const;
