import {
  BookingApiResponse,
  MembershipApiResponse,
} from "../types/api-responses";
import {
  BookingOutput,
  ExternalBookingOutput,
  MembershipOutput,
} from "../types/outputs";
import { ExternalBookingWithResourceApiResponse } from "./api";

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

export function apiResponseToExternalBookingOutput(
  booking: ExternalBookingWithResourceApiResponse,
): ExternalBookingOutput {
  const atts = booking.attributes;
  return {
    id: booking.id,
    from: atts.from,
    to: atts.to,
    title: atts.title,
    resource_name: booking.resource.attributes.name,
    net_price: atts.totalPrice.net,
    gross_price: atts.totalPrice.gross,
    currency: atts.totalPrice.currency,
    comments: atts.comments,
    number_of_visitors: atts.numberOfVisitors,
    name: atts.name,
    company: atts.company,
    email: atts.email,
    phone: atts.phone,
    billing_address: atts.billingAddress,
    status: atts.status,
    extra_names: atts.bookingExtras.map((extra) => extra.name).join(", "),
  };
}

const timeToIso8601 = (time: string): string => {
  return new Date(time).toISOString();
};
