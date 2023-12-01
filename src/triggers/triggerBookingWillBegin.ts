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

const hookLabel = "Booking Will Begin";
const event = "booking_will_begin";

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
  var booking;
  if (bundle.cleanedRequest) {
    booking = await apiCallUrl(z, bundle.cleanedRequest.url);
    booking.from = new Date(booking.from).toISOString();
    booking.to = new Date(booking.to).toISOString();
    booking.created_at = new Date(booking.created_at).toISOString();
    booking.updated_at = new Date(booking.updated_at).toISOString();
  }
  return [booking];
}

export default {
  key: event,
  noun: hookLabel,
  display: {
    label: hookLabel,
    description: "Triggers before a booking begins.",
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
