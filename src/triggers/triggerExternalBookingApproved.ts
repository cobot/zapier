import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import {
  getExternalBooking,
  listRecentExternalBookings,
  subscribeHook,
  unsubscribeHook,
} from "../utils/api";
import { SubscribeBundleInputType } from "../types/subscribeType";
import { getSubdomainField } from "../fields/getSudomainsField";
import { externalBookingSample } from "../utils/samples";
import { ExternalBookingOutput } from "../types/outputs";
import { apiResponseToExternalBookingOutput } from "../utils/api-to-output";
import { HookTrigger } from "../types/trigger";

const hookLabel = "External Booking Approved";
const event = "approved_external_booking";

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
): Promise<ExternalBookingOutput[]> {
  const bookingId = bundle.cleanedRequest.url.split("/").pop();
  const response = await getExternalBooking(z, bookingId);
  if (response) {
    return [apiResponseToExternalBookingOutput(response)];
  } else {
    return [];
  }
}

const trigger: HookTrigger = {
  key: event,
  noun: hookLabel,
  display: {
    label: hookLabel,
    description:
      "Triggers when an external booking that was pending before is approved.",
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
    ): Promise<ExternalBookingOutput[]> => {
      const bookings = await listRecentExternalBookings(z, bundle);
      return bookings.map(apiResponseToExternalBookingOutput);
    },

    sample: externalBookingSample,
  },
};
export default trigger;
