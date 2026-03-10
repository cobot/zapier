import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import { BookingOutput } from "../types/outputs";
import { getBooking, getResource, getMembership } from "./api";
import { apiResponseToBookingOutput } from "./api-to-output";

export async function loadBookingAndConvertToOutput(
  z: ZObject,
  bundle: KontentBundle<{}>,
  bookingId: string,
): Promise<BookingOutput[]> {
  const booking = await getBooking(z, bookingId);
  if (!booking) {
    return [];
  }
  const subdomain = (bundle.inputData as any).subdomain as string;
  const membershipId = booking.relationships.membership?.data?.id;
  const resourceId = booking.relationships.resource.data?.id;
  const resource = await getResource(z, resourceId);
  if (!resource) {
    return [];
  }
  if (membershipId && subdomain) {
    const membership = await getMembership(z, subdomain, membershipId);
    return [apiResponseToBookingOutput(booking, membership, resource)];
  }
  return [apiResponseToBookingOutput(booking, null, resource)];
}
