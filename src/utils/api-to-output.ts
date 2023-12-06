import {
  BookingApiResponse,
  MembershipApiResponse,
} from "../types/api-responses";
import { BookingOutput, MembershipOutput } from "../types/outputs";

export function apiResponseToMembershipOutput(
  membership: MembershipApiResponse,
): MembershipOutput {
  return {
    id: membership.id,
    name: membership.name,
    email: membership.email,
    company: membership.address.company,
    customer_number: membership.customer_number,
    plan_name: membership.plan.name,
    payment_method_name: membership.payment_method?.name ?? null,
  };
}

export function apiResponseToBookingOutput(
  booking: BookingApiResponse,
): BookingOutput {
  return {
    id: booking.id,
    from: timeToIso8601(booking.from),
    to: timeToIso8601(booking.to),
    title: booking.title,
    resource_name: booking.resource.name,
    price: booking.price.toString(),
    currency: booking.currency,
    comments: booking.comments,
    units: booking.units,
    member_name: booking.membership?.name ?? null,
  };
}

const timeToIso8601 = (time: string): string => {
  return new Date(time).toISOString();
};
