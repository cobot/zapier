import { get } from "lodash";
import { Bundle, HttpRequestOptions, ZObject } from "zapier-platform-core";
import { AuthData } from "./types/kontentBundle";

const BASE_URL = `https://www.cobot.me`;
const AUTHORIZE_URL = `${BASE_URL}/oauth/authorize`;
const ACCESS_TOKEN_URL = `${BASE_URL}/oauth/access_token`;
const TEST_AUTH_URL = `${BASE_URL}/api/user`;
const scopes =
  "read read_admins read_bookings read_events read_external_bookings read_memberships read_resources read_spaces read_user write_activities write_subscriptions";

const getAccessToken = async (
  z: ZObject,
  bundle: Bundle,
): Promise<AuthData> => {
  const response = await z.request({
    url: ACCESS_TOKEN_URL,
    method: "POST",
    body: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      code: bundle.inputData.code,
    },
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });

  const userData = await z.request({
    url: TEST_AUTH_URL,
    method: "GET",
    headers: {
      Authorization: "Bearer " + response.data.access_token,
    },
  });

  const adminOf = get(userData, "data.admin_of").map(
    (x: { space_subdomain: string; space_name: string }) => ({
      subdomain: x.space_subdomain,
      name: x.space_name,
    }),
  );

  return {
    access_token: response.data.access_token,
    adminOf,
  };
};

const includeBearerToken = (
  request: HttpRequestOptions,
  z: ZObject,
  bundle: Bundle,
) => {
  if (bundle.authData.access_token && request.headers) {
    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
  }

  return request;
};

const test = (z: ZObject, bundle: Bundle) => z.request({ url: TEST_AUTH_URL });

export default {
  config: {
    type: "oauth2",
    oauth2Config: {
      authorizeUrl: {
        url: AUTHORIZE_URL,
        params: {
          client_id: "{{process.env.CLIENT_ID}}",
          state: "{{bundle.inputData.state}}",
          redirect_uri: "{{bundle.inputData.redirect_uri}}",
          response_type: "code",
          scope: scopes,
        },
      },
      getAccessToken,
      autoRefresh: false,
    },

    fields: [],

    test,

    connectionLabel: "{{data.email}}",
  },
  befores: [includeBearerToken],
  afters: [],
};
