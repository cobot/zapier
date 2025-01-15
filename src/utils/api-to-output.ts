import {
  BookingApiResponse,
  EventApiResponse,
  MembershipApiResponse,
  ContactApiResponse,
  InvoiceApiResponse,
  DropInPassApiResponse,
} from "../types/api-responses";
import {
  BookingOutput,
  EventOutput,
  ExternalBookingOutput,
  MembershipOutput,
  InvoiceOutput,
  DropInPassOutput,
} from "../types/outputs";
import { ZObject } from "zapier-platform-core";
import { get } from "lodash";
import { ExternalBookingWithResourceApiResponse, apiCallUrl } from "./api";

export function apiResponseToMembershipOutput(
  membership: MembershipApiResponse,
): MembershipOutput {
  const output: MembershipOutput = {
    id: membership.id,
    name: membership.name,
    email: membership.email,
    phone: membership.phone,
    company: membership.address.company,
    address: {
      full_address: membership.address.full_address,
      address: membership.address.address,
      city: membership.address.city,
      post_code: membership.address.post_code,
      state: membership.address.state,
      country: membership.address.country,
    },
    customer_number: membership.customer_number,
    plan_name: membership.plan.name,
    plan: {
      description: membership.plan.description,
      total_price_per_cycle: membership.plan.total_price_per_cycle,
      cycle_duration: membership.plan.cycle_duration,
      currency: membership.plan.currency,
      cancellation_period: membership.plan.cancellation_period,
    },
    payment_method_name: membership.payment_method?.name ?? null,
    confirmed_at:
      membership.confirmed_at?.replaceAll("/", "-").substring(0, 10) ?? null,
  };
  if (membership.canceled_to) {
    output.canceled_to = membership.canceled_to.replaceAll("/", "-");
  }
  return output;
}

export async function apiResponseToInvoiceOutput(
  z: ZObject,
  invoice: InvoiceApiResponse,
  api1MembershipsUrl: string,
): Promise<InvoiceOutput> {
  const attributes = invoice.attributes;
  const membershipId = get(invoice, "relationships.membership.data.id");
  const contactId = get(invoice, "relationships.contact.data.id");
  if (membershipId) {
    const url = `${api1MembershipsUrl}/${membershipId}`;
    const membership: MembershipApiResponse = await apiCallUrl(z, url);
    return {
      ...attributes,
      id: invoice.id,
      membership: {
        id: membershipId,
        email: membership.email,
      },
    };
  }
  if (contactId) {
    const url = `https://api.cobot.me/contacts/${contactId}`;
    const contact: ContactApiResponse = await apiCallUrl(z, url, {
      Accept: "application/vnd.api+json",
    });
    return {
      ...attributes,
      id: invoice.id,
      contact: {
        id: contactId,
        email: contact.data.attributes.email,
        name: contact.data.attributes.address.name,
      },
    };
  }
  return {
    ...attributes,
    id: invoice.id,
  };
}

export function apiResponseToEventOutput(event: EventApiResponse): EventOutput {
  const attributes = event.attributes;
  return {
    id: event.id,
    title: attributes.title,
    from: timeToIso8601(attributes.from),
    to: timeToIso8601(attributes.to),
    description: attributes.description,
    tags: attributes.tags,
    video_url: attributes.videoUrl,
    capacity: attributes.capacity,
    public_url: attributes.publicUrl,
    audience: attributes.audience,
    color: attributes.color,
    image_url: attributes.image?.default.url || null,
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
    accounting_code: atts.accountingCode,
  };
}

const timeToIso8601 = (time: string): string => {
  return new Date(time).toISOString();
};

export function apiResponseToDropInPassOutput(
  dropInPass: DropInPassApiResponse,
): DropInPassOutput {
  const attrs = dropInPass.attributes;
  const grossPrice = `${attrs.price.gross} ${attrs.price.currency}`;
  const netPrice = `${attrs.price.net} ${attrs.price.currency}`;
  return {
    id: dropInPass.id,
    dropInPassName: attrs.name,
    validOn: attrs.validOn,
    email: attrs.email,
    phone: attrs.phone,
    taxId: attrs.taxId,
    grossPrice,
    netPrice,
    comments: attrs.comments,
    billingAddress: attrs.billingAddress,
  };
}
