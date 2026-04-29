import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import { subscribeHook, unsubscribeHook, getMembership } from "../utils/api";
import { getSubdomainField } from "../fields/getSudomainsField";
import { SubscribeBundleInputType } from "../types/subscribeType";
import { bookingSample } from "../utils/samples";
import { BookingOutput } from "../types/outputs";
import { apiResponseToBookingOutput } from "../utils/api-to-output";
import { HookTrigger } from "../types/trigger";
import { listRecentBookingsAndConvertToOutput } from "../utils/list";

const hookLabel = "Booking Deleted";
const event = "deleted_booking";
type BookingDeletedPayload = {
  id: string;
  from: string;
  to: string;
  title: string;
  comments: string;
  resource: { id: string; name: string };
  membership: { id: string; name: string } | null;
  units: number;
  price: string;
  currency: string;
  tax_rate: string;
};
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
    const bookingPayload: BookingDeletedPayload = bundle.cleanedRequest.booking;
    const subdomain = (bundle.inputData as any).subdomain as string;

    const booking: Parameters<typeof apiResponseToBookingOutput>[0] = {
      id: bookingPayload.id,
      attributes: {
        from: bookingPayload.from,
        to: bookingPayload.to,
        title: bookingPayload.title,
        comments: bookingPayload.comments,
        attendees: [],
        attendeesMessage: null,
        price: {
          net: bookingPayload.price,
          gross: "",
          currency: "EUR",
          taxes: [],
        },
        units: bookingPayload.units,
      },
    };

    let membership: Parameters<typeof apiResponseToBookingOutput>[1] =
      bookingPayload.membership
        ? { name: bookingPayload.membership.name, email: null }
        : null;
    const membershipId = bookingPayload.membership?.id;
    if (membershipId && subdomain) {
      try {
        const membershipResponse = await getMembership(
          z,
          subdomain,
          membershipId,
        );
        if (membershipResponse) {
          membership = {
            name: membershipResponse.name,
            email: membershipResponse.email,
          };
        }
      } catch {
        // 404 if membership was removed; keep webhook payload membership
      }
    }
    return [
      apiResponseToBookingOutput(booking, membership, {
        id: bookingPayload.resource.id,
        attributes: { name: bookingPayload.resource.name },
      }),
    ];
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
