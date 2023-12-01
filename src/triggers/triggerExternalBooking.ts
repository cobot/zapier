import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import {
  getExternalBookings,
  listRecentBookings,
  listRecentExternalBookings,
  subscribeHook,
  unsubscribeHook,
} from "../utils/api";
import { get } from "lodash";
import { SubscribeBundleInputType } from "../types/subscribeType";
import { getSubdomainField } from "../fields/getSudomainsField";

const hookLabel = "External Booking Created";
const event = "created_booking";

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
  const bookingId = get(bundle.cleanedRequest, "id");
  const response = await getExternalBookings(z, bookingId);
  if (response) {
    return [response];
  } else {
    return [];
  }
}

export default {
  key: `${event}_external`,
  noun: hookLabel,
  display: {
    label: hookLabel,
    description: "Triggers when an external booking is created.",
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
    ) => listRecentExternalBookings(z, bundle),

    sample: {
      id: "d58b612aaa62619aae546dd336587eb2",
      from: "2012-04-12T12:00:00.000Z",
      to: "2012-04-12T12:00:00.000Z",
      tax_rate: "20.0",
      title: "test booking",
      resource: {
        name: "Meeting Room",
        id: "12345",
      },
      price: 10.0,
      has_custom_price: false,
      currency: "EUR",
      accounting_code: "B1",
      membership: {
        id: "123498y452346",
        name: "John Doe",
      },
      url: "https://co-up.cobot.me/api/bookings/20723075",
      can_change: true,
      comments: "coffee please",
      units: 1,
      created_at: "2012-04-12T12:00:00.000Z",
      updated_at: "2012-04-12T12:00:00.000Z",
    },
  },
} as const;
