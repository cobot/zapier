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
  ExternalBookingApiResponse,
  MembershipApiResponse,
  ResourceApiResponse,
  UserApiResponse,
} from "../types/api-responses";

export const subscribeHook = async (
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
  data: SubscribePayloadType,
) => {
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
) => {
  const url = `https://${bundle.inputData.subdomain}.cobot.me/api/subscriptions/${subscribeId}`;
  return await z.request({
    url,
    method: "DELETE",
  });
};

export const apiCallUrl = async (z: ZObject, url: string) => {
  try {
    const response = await z.request({
      url,
      method: "GET",
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

export const listRecentExternalBookings = async (
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
): Promise<ExternalBookingWithResourceApiResponse[]> => {
  const subdomain = bundle.inputData.subdomain;
  const userV2 = await getUserDetailV2(z);
  var space = userV2.included.find(
    (x) => get(x, "attributes.subdomain", "") === subdomain,
  );
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
    const resourcesById = resourcesResponse.reduce(
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
      .filter((x) => x);
  }
  return [];
};

export type ExternalBookingWithResourceApiResponse =
  ExternalBookingApiResponse & { resource: ResourceApiResponse };

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
  const externalBookingId = get(
    bookingResponse.data,
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

const getDateRange = (): [string, string] => {
  const now = DateTime.now();
  const lastMonth = now.minus({ months: 1 }).toISO();
  const nextMonth = now.plus({ months: 1 }).toISO();

  return [lastMonth, nextMonth];
};
