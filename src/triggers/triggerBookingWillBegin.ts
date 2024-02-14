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
import { apiResponseToBookingOutput } from "../utils/api-to-output";
import { BookingOutput } from "../types/outputs";
import { bookingSample } from "../utils/samples";
import { BookingApiResponse } from "../types/api-responses";
import { HookTrigger, Trigger } from "../types/trigger";

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

async function parsePayload(
  z: ZObject,
  bundle: KontentBundle<{}>,
): Promise<BookingOutput[]> {
  if (bundle.cleanedRequest) {
    const booking = (await apiCallUrl(
      z,
      bundle.cleanedRequest.url,
    )) as BookingApiResponse;
    return [apiResponseToBookingOutput(booking)];
  } else {
    return [];
  }
}

const trigger: HookTrigger = {
  key: event,
  noun: hookLabel,
  display: {
    label: hookLabel,
    description: "Triggers when a booking is about to begin.",
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
    ): Promise<BookingOutput[]> => {
      const apiBookings = await listRecentBookings(z, bundle);
      return apiBookings.map((b) => apiResponseToBookingOutput(b));
    },
    sample: bookingSample,
  },
};
export default trigger;
