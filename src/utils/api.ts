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
  try {
    const response = await z.request({
      url,
      method: "GET",
      params: {
        from,
        to,
        limit: 1,
      },
    });
    return response.data;
  } catch (error) {
    return [];
  }
};

export const listMemberships = async (
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
): Promise<MembershipApiResponse[]> => {
  const url = `https://${bundle.inputData.subdomain}.cobot.me/api/memberships`;
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

export const getUserDetailV2 = async (z: ZObject) => {
  try {
    const response = await z.request({
      url: "https://api.cobot.me/user?include=adminOf",
      method: "GET",
      headers: {
        Accept: "application/vnd.api+json",
      },
    });
    return response.data;
  } catch (error) {
    return [];
  }
};

export const listRecentExternalBookings = async (
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
): Promise<ExternalBookingWithResourceApiResponse[]> => {
  try {
    const subdomain = bundle.inputData.subdomain;
    const userV2 = await getUserDetailV2(z);
    var space = userV2.included.find(
      (x) => get(x, "attributes.subdomain", "") === subdomain,
    );
    if (space) {
      var spaceId = space.id;

      var [from, to] = getDateRange();
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
      return bookings.map((booking) => ({
        ...booking,
        resource: resourcesById[booking.relationships.resource.data.id],
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
};

export type ExternalBookingWithResourceApiResponse =
  ExternalBookingApiResponse & { resource: ResourceApiResponse };

export const getExternalBooking = async (
  z: ZObject,
  bookingId: string,
): Promise<ExternalBookingWithResourceApiResponse | null> => {
  const url = `https://api.cobot.me/bookings/${bookingId}`;
  try {
    const bookingResponse = await z.request({
      url,
      method: "GET",
      headers: {
        Accept: "application/vnd.api+json",
      },
    });
    const externalBookingId = get(
      bookingResponse.data,
      "data.relationships.externalBooking.data.id",
    );
    if (externalBookingId) {
      const externalBookingResponse = (
        await z.request({
          url: `https://api.cobot.me/external_bookings/${externalBookingId}`,
          method: "GET",
          headers: {
            Accept: "application/vnd.api+json",
          },
        })
      ).data.data as ExternalBookingApiResponse;
      const resourceResponse = (
        await z.request({
          url: `https://api.cobot.me/resources/${externalBookingResponse.relationships.resource.data.id}`,
          method: "GET",
          headers: {
            Accept: "application/vnd.api+json",
          },
        })
      ).data.data as ResourceApiResponse;
      return { ...externalBookingResponse, resource: resourceResponse };
    }
    return null;
  } catch (error) {
    return null;
  }
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
