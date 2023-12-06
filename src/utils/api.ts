import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import {
  SubscribeBundleInputType,
  SubscribePayloadType,
} from "../types/subscribeType";
import { InputData as ActivityInputData } from "../creates/activity";
import { get } from "lodash";
import { DateTime } from "luxon";

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
) => {
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
    return response.data.map((booking) => {
      booking.from = new Date(booking.from).toISOString();
      booking.to = new Date(booking.to).toISOString();
      booking.created_at = new Date(booking.created_at).toISOString();
      booking.updated_at = new Date(booking.updated_at).toISOString();
      return booking;
    });
  } catch (error) {
    return [];
  }
};

export type MembershipApiResponse = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  picture: string;
  address: {
    company: string | null;
    name: string | null;
    full_address: string | null;
  };
  customer_number: string | null;
  plan: {
    name: string;
  };
  payment_method: {
    name: string;
  } | null;
  starts_at: string;
  canceled_at: string | null;
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
) => {
  try {
    const subdomain = bundle.inputData.subdomain;
    const userV2 = await getUserDetailV2(z);
    var admin = userV2.included.find(
      (x) => get(x, "attributes.subdomain", "") === subdomain,
    );
    if (admin) {
      var spaceId = admin.id;

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

      return get(response.data, "data").map((booking) => {
        const object = get(booking, "attributes");
        object.from = new Date(object.from).toISOString();
        object.to = new Date(object.to).toISOString();
        return { ...object, id: booking.id, type: booking.type };
      });
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const getExternalBookings = async (z: ZObject, id: string) => {
  const url = `https://api.cobot.me/bookings/${id}`;
  try {
    const response = await z.request({
      url,
      method: "GET",
      headers: {
        Accept: "application/vnd.api+json",
      },
    });
    const booking = get(
      response.data,
      "data.relationships.externalBooking.data",
    );
    if (booking) {
      const response = await z.request({
        url: `https://api.cobot.me/external_bookings/${booking.id}`,
        method: "GET",
        headers: {
          Accept: "application/vnd.api+json",
        },
      });
      const object = get(response.data, "data.attributes");
      object.from = new Date(object.from).toISOString();
      object.to = new Date(object.to).toISOString();
      return { ...object, id: booking.id };
    }
    return null;
  } catch (error) {
    return [];
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
