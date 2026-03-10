import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import {
  subscribeHook,
  unsubscribeHook,
  getResource,
  getMembership,
} from "../utils/api";
import { getSubdomainField } from "../fields/getSudomainsField";
import { SubscribeBundleInputType } from "../types/subscribeType";
import { bookingSample } from "../utils/samples";
import { BookingOutput } from "../types/outputs";
import { apiResponseToBookingOutput } from "../utils/api-to-output";
import { HookTrigger } from "../types/trigger";
import { listRecentBookingsAndConvertToOutput } from "../utils/list";

const hookLabel = "Booking Deleted";
const event = "deleted_booking";

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
  if (bundle.cleanedRequest?.booking) {
    const booking = bundle.cleanedRequest.booking;
    const subdomain = (bundle.inputData as any).subdomain as string;
    const membershipId = booking.relationships?.membership?.data?.id;
    const resourceId = booking.relationships.resource.data?.id;
    const resource = await getResource(z, resourceId);
    if (!resource) {
      return [];
    }
    let membership = null;
    if (membershipId && subdomain) {
      membership = await getMembership(z, subdomain, membershipId);
    }
    return [apiResponseToBookingOutput(booking, membership, resource)];
  }
  return [];
}

const trigger: HookTrigger = {
  key: event,
  noun: hookLabel,
  display: {
    label: hookLabel,
    description: "Triggers when a booking is deleted.",
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
