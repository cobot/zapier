import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import { BookingOutput } from "../types/outputs";
import { SubscribeBundleInputType } from "../types/subscribeType";
import { listRecentBookings, getResource, getMembership } from "./api";
import { apiResponseToBookingOutput } from "./api-to-output";

export async function listRecentBookingsAndConvertToOutput(
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
): Promise<BookingOutput[]> {
  const apiBookings = await listRecentBookings(z, bundle);
  const bookingOutputPromises = apiBookings.map(async (b) => {
    const subdomain = (bundle.inputData as any).subdomain as string;
    const membershipId = b.relationships.membership?.data?.id;
    const resourceId = b.relationships.resource.data.id;
    const resource = await getResource(z, resourceId);
    if (!resource) return null;
    const membership =
      membershipId && subdomain
        ? await getMembership(z, subdomain, membershipId)
        : null;
    return apiResponseToBookingOutput(b, membership, resource);
  });
  const bookingOutputs = (await Promise.all(bookingOutputPromises)).filter(
    Boolean,
  ) as BookingOutput[];
  return bookingOutputs;
}
