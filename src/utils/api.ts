import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import {
  SubscribeBundleInputType,
  SubscribePayloadType,
} from "../types/subscribeType";
import { InputData as ActivityInputData } from "../creates/activity";
import { get } from "lodash";
import { DateTime } from "luxon";
import {
  BookingApiResponse,
  EventApiResponse,
  ExternalBookingApiResponse,
  MembershipApiResponse,
  ResourceApiResponse,
  UserApiResponse,
  InvoiceApiResponse,
  BookingApi2Response,
  DropInPassApiResponse,
} from "../types/api-responses";
import { InvoiceMembershipOutput } from "../types/outputs";

type Space = {
  id: string;
  attributes: {
    subdomain: string;
  };
};

const spaceForSubdomain = async (
  z: ZObject,
  subdomain: string,
): Promise<Space | undefined> => {
  const userV2 = await getUserDetailV2(z);
  var space = userV2.included.find(
    (x) => get(x, "attributes.subdomain", "") === subdomain,
  );
  return space;
};

export const subscribeHook = async (
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
  data: SubscribePayloadType,
): Promise<any> => {
  const url = `https://${bundle.inputData.subdomain}.cobot.me/api/subscriptions`;
  const response = await z.request({
    url,
    method: "POST",
    body: data,
  });

  return response.data;
};

export const unsubscribeHook = async (
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
  subscribeId: string,
): Promise<any> => {
  const url = `https://${bundle.inputData.subdomain}.cobot.me/api/subscriptions/${subscribeId}`;
  return await z.request({
    url,
    method: "DELETE",
  });
};

export const apiCallUrl = async (
  z: ZObject,
  url: string,
  headers?: { [name: string]: string },
) => {
  try {
    const response = await z.request({
      url,
      method: "GET",
      headers,
    });
    return response.data;
  } catch (error) {
    return [];
  }
};

export const listRecentBookings = async (
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
): Promise<BookingApiResponse[]> => {
  const url = `https://${bundle.inputData.subdomain}.cobot.me/api/bookings`;
  const [from, to] = getDateRange();
  const response = await z.request({
    url,
    method: "GET",
    params: {
      from,
      to,
      limit: 3,
    },
  });
  return response.data;
};

export const listRecentEvents = async (
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
): Promise<EventApiResponse[]> => {
  const subdomain = bundle.inputData.subdomain;
  const space = await spaceForSubdomain(z, subdomain);
  if (space) {
    const spaceId = space.id;

    const [from, to] = getDateRange();
    const response = await z.request({
      url: `https://api.cobot.me/spaces/${spaceId}/events`,
      method: "GET",
      headers: {
        Accept: "application/vnd.api+json",
      },
      params: {
        "filter[from]": from,
        "filter[to]": to,
        "filter[sortOrder]": "desc",
        "filter[publishedState]": "published",
      },
    });
    return response.data.data as EventApiResponse[];
  }
  return [];
};

export const listMemberships = async (
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
): Promise<MembershipApiResponse[]> => {
  const url = `https://${bundle.inputData.subdomain}.cobot.me/api/memberships`;
  const response = await z.request({
    url,
    method: "GET",
  });
  return response.data;
};

export const listCancelledMemberships = async (
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
): Promise<MembershipApiResponse[]> => {
  const [from, to] = getDateRange(true);
  const url = `https://${bundle.inputData.subdomain}.cobot.me/api/memberships/cancellations?from=${from}&to=${to}`;
  const response = await z.request({
    url,
    method: "GET",
  });
  return response.data;
};

export const getUserDetailV2 = async (z: ZObject): Promise<UserApiResponse> => {
  const response = await z.request({
    url: "https://api.cobot.me/user?include=adminOf",
    method: "GET",
    headers: {
      Accept: "application/vnd.api+json",
    },
  });
  return response.data;
};

export const listRecentInvoices = async (
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
): Promise<InvoiceApiResponse[]> => {
  const subdomain = bundle.inputData.subdomain;
  const space = await spaceForSubdomain(z, subdomain);
  if (!space) return [];
  const spaceId = space.id;
  const [from, to] = getDateRange(true);
  const response = await z.request({
    url: `https://api.cobot.me/spaces/${spaceId}/invoices`,
    method: "GET",
    headers: {
      Accept: "application/vnd.api+json",
    },
    params: {
      "filter[from]": from,
      "filter[to]": to,
    },
  });
  return response.data.data;
};

export const listRecentExternalBookings = async (
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
): Promise<ExternalBookingWithResourceApiResponse[]> => {
  const subdomain = bundle.inputData.subdomain;
  const space = await spaceForSubdomain(z, subdomain);
  if (space) {
    const spaceId = space.id;

    const [from, to] = getDateRange();
    const response = await z.request({
      url: `https://api.cobot.me/spaces/${spaceId}/external_bookings`,
      method: "GET",
      headers: {
        Accept: "application/vnd.api+json",
      },
      params: {
        "filter[from]": from,
        "filter[to]": to,
        "filter[sortOrder]": "desc",
      },
    });
    const bookings = response.data.data as ExternalBookingApiResponse[];
    const resourcesResponse = (
      await z.request({
        url: `https://api.cobot.me/spaces/${spaceId}/resources`,
        method: "GET",
        headers: {
          Accept: "application/vnd.api+json",
        },
      })
    ).data.data as ResourceApiResponse[];
    const resourcesById: { [propName: string]: ResourceApiResponse | null } =
      resourcesResponse.reduce(
        (acc, resource) => ({
          ...acc,
          [resource.id]: resource,
        }),
        {},
      );

    return bookings
      .map((booking) => {
        const resource = resourcesById[booking.relationships.resource.data.id];
        if (!resource) {
          return null;
        }
        return {
          ...booking,
          resource,
        };
      })
      .filter(notEmpty);
  }
  return [];
};

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export type ExternalBookingWithResourceApiResponse =
  ExternalBookingApiResponse & { resource: ResourceApiResponse };

export const getInvoiceFromApi2 = async (
  z: ZObject,
  invoiceId: string,
): Promise<InvoiceApiResponse | null> => {
  const response = await z.request({
    url: `https://api.cobot.me/invoices/${invoiceId}`,
    method: "GET",
    headers: {
      Accept: "application/vnd.api+json",
    },
  });
  if (response.status === 404) {
    return null;
  }
  return response.data.data;
};

export const getExternalBooking = async (
  z: ZObject,
  bookingId: string,
): Promise<ExternalBookingWithResourceApiResponse | null> => {
  const url = `https://api.cobot.me/bookings/${bookingId}`;
  const bookingResponse = await z.request({
    url,
    method: "GET",
    headers: {
      Accept: "application/vnd.api+json",
    },
  });
  if (bookingResponse.status === 404) {
    return null;
  }
  const bookingData = bookingResponse.data as BookingApi2Response;
  const externalBookingId = get(
    bookingData,
    "data.relationships.externalBooking.data.id",
  );
  if (externalBookingId) {
    const externalBookingResponse = await z.request({
      url: `https://api.cobot.me/external_bookings/${externalBookingId}`,
      method: "GET",
      headers: {
        Accept: "application/vnd.api+json",
      },
    });
    if (externalBookingResponse.status === 404) {
      return null;
    }

    const externalBooking = externalBookingResponse.data
      .data as ExternalBookingApiResponse;
    const resourceResponse = await z.request({
      url: `https://api.cobot.me/resources/${externalBooking.relationships.resource.data.id}`,
      method: "GET",
      headers: {
        Accept: "application/vnd.api+json",
      },
    });
    if (resourceResponse.status === 404) {
      return null;
    }
    const resource = resourceResponse.data.data as ResourceApiResponse;
    return { ...externalBooking, resource };
  }
  return null;
};

export const createActivity = async (
  z: ZObject,
  bundle: KontentBundle<ActivityInputData>,
) => {
  const response = await z.request({
    method: "POST",
    url: `https://${bundle.inputData.subdomain}.cobot.me/api/activities`,
    body: {
      text: bundle.inputData.text,
      level: bundle.inputData.level,
      channels: bundle.inputData.channels,
    },
  });
  const object = response.data;
  object.created_at = new Date(object.created_at).toISOString();
  return object;
};

export const getDateRange = (
  useISODate = false,
  format?: string,
): [string, string] => {
  const now = DateTime.now();
  const lastMonth = now.minus({ months: 1 });
  const nextMonth = now.plus({ months: 1 });
  if (format) {
    return [lastMonth.toFormat(format), nextMonth.toFormat(format)];
  }
  if (!useISODate) {
    return [lastMonth.toISO(), nextMonth.toISO()];
  }
  return [lastMonth.toISODate(), nextMonth.toISODate()];
};

export const listRecentDropInPasses = async (
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
): Promise<DropInPassApiResponse[]> => {
  const subdomain = bundle.inputData.subdomain;
  const space = await spaceForSubdomain(z, subdomain);
  if (!space) return [];
  const url = `https://api.cobot.me/spaces/${space.id}/drop_in_passes`;
  const [from, to] = getDateRange(false, "yyyy-MM-dd");
  const response = await z.request({
    url,
    method: "GET",
    headers: {
      Accept: "application/vnd.api+json",
    },
    params: {
      "filter[valid_on_from]": from,
      "filter[valid_on_to]": to,
      "filter[sortOrder]": "desc",
    },
  });
  return response.data.data as DropInPassApiResponse[];
};
