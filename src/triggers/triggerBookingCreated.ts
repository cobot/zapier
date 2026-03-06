import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import { subscribeHook, unsubscribeHook } from "../utils/api";
import { getSubdomainField } from "../fields/getSudomainsField";
import { SubscribeBundleInputType } from "../types/subscribeType";
import { bookingSample } from "../utils/samples";
import { BookingOutput } from "../types/outputs";
import { HookTrigger } from "../types/trigger";
import { loadBookingAndConvertToOutput } from "../utils/load-to-output";
import { listRecentBookingsAndConvertToOutput } from "../utils/list";

const hookLabel = "Booking Created";
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

async function parsePayload(
  z: ZObject,
  bundle: KontentBundle<{}>,
): Promise<BookingOutput[]> {
  if (bundle.cleanedRequest) {
    const bookingId = bundle.cleanedRequest.url.split("/").pop();
    return loadBookingAndConvertToOutput(z, bundle, bookingId);
  } else {
    return [];
  }
}

const trigger: HookTrigger = {
  key: event,
  noun: hookLabel,
  display: {
    label: hookLabel,
    description: "Triggers when a booking is made.",
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
      return listRecentBookingsAndConvertToOutput(z, bundle);
    },
    sample: bookingSample,
  },
};
export default trigger;
