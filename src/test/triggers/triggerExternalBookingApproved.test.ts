import { createAppTester } from "zapier-platform-core";
import * as nock from "nock";
import App from "../../index";
import {
  prepareBundle,
  prepareMocksForWebhookSubscribeTest,
} from "../utils/prepareMocksForWebhookSubscribeTest";
import triggerExternalBookingApproved from "../../triggers/triggerExternalBookingApproved";
import {
  ExternalBookingApiResponse,
  ResourceApiResponse,
  UserApiResponse,
} from "../../types/api-responses";
import { HookTrigger } from "../../types/trigger";
import { ExternalBookingOutput } from "../../types/outputs";

const appTester = createAppTester(App);
nock.disableNetConnect();
const trigger = App.triggers[triggerExternalBookingApproved.key] as HookTrigger;

const externalBookingResponse: ExternalBookingApiResponse = {
  id: "eb1",
  attributes: {
    name: "Booking 1",
    company: "Company 1",
    billingAddress: "Billing Address",
    phone: "123456789",
    email: "",
    from: "2021-01-01T00:00:00.000Z",
    to: "2021-01-01T10:00:00.000Z",
    title: null,
    accountingCode: "MTR-200",
    price: {
      net: "100",
      gross: "100",
      currency: "EUR",
      taxes: [],
    },
    totalPrice: {
      net: "100",
      gross: "100",
      currency: "EUR",
      taxes: [],
    },
    numberOfVisitors: 1,
    comments: null,
    status: "approved",
    bookingExtras: [],
  },
  relationships: {
    resource: {
      data: {
        id: "resource-1",
      },
    },
  },
};
const resourceResponse: ResourceApiResponse = {
  id: "resource-1",
  attributes: {
    name: "Resource 1",
  },
};

const externalBookingOutput: ExternalBookingOutput = {
  id: "eb1",
  from: "2021-01-01T00:00:00.000Z",
  to: "2021-01-01T10:00:00.000Z",
  title: null,
  resource_name: "Resource 1",
  net_price: "100",
  gross_price: "100",
  currency: "EUR",
  comments: null,
  number_of_visitors: 1,
  name: "Booking 1",
  company: "Company 1",
  email: "",
  phone: "123456789",
  billing_address: "Billing Address",
  status: "approved",
  extra_names: "",
  accounting_code: "MTR-200",
};

afterEach(() => nock.cleanAll());

describe("triggerExternalBooking", () => {
  it("creates new webhook through CM API upon subscribe", async () => {
    const bundle = prepareMocksForWebhookSubscribeTest(
      "approved_external_booking",
    );
    const subscribe = trigger.operation.performSubscribe;

    const result = await appTester(subscribe as any, bundle as any);

    expect(result).toMatchInlineSnapshot(`
{
  "url": "https://trial.cobot.me/api/event/callback",
}
`);
  });

  it("lists recent external bookings", async () => {
    const bundle = prepareBundle();
    const userResponse: UserApiResponse = {
      included: [{ id: "space-1", attributes: { subdomain: "trial" } }],
    };

    const scope = nock("https://api.cobot.me");
    scope.get("/user?include=adminOf").reply(200, userResponse);
    scope
      .get(/\/spaces\/space-1\/external_bookings/)
      .reply(200, { data: [externalBookingResponse] });
    scope
      .get(/\/spaces\/space-1\/resources/)
      .reply(200, { data: [resourceResponse] });

    const listRecentExternalBookings = trigger.operation.performList;

    const results = await appTester(
      listRecentExternalBookings as any,
      bundle as any,
    );

    expect(results).toStrictEqual([externalBookingOutput]);
  });

  it("returns no booking if no matching resource is found", async () => {
    const bundle = prepareBundle();
    const userResponse: UserApiResponse = {
      included: [{ id: "space-1", attributes: { subdomain: "trial" } }],
    };
    const externalBookingResponse: ExternalBookingApiResponse = {
      id: "eb1",
      attributes: {
        name: "Booking 1",
        company: "Company 1",
        billingAddress: "Billing Address",
        phone: "123456789",
        email: "",
        from: "2021-01-01T00:00:00.000Z",
        to: "2021-01-01T10:00:00.000Z",
        title: null,
        price: {
          net: "100",
          gross: "100",
          currency: "EUR",
          taxes: [],
        },
        totalPrice: {
          net: "100",
          gross: "100",
          currency: "EUR",
          taxes: [],
        },
        numberOfVisitors: 1,
        comments: null,
        status: "approved",
        bookingExtras: [],
        accountingCode: "MTR-200",
      },
      relationships: {
        resource: {
          data: {
            id: "resource-1",
          },
        },
      },
    };
    const resourceResponse: ResourceApiResponse = {
      id: "resource-2", // <-- different id
      attributes: {
        name: "Resource 2",
      },
    };

    const scope = nock("https://api.cobot.me");
    scope.get("/user?include=adminOf").reply(200, userResponse);
    scope
      .get(/\/spaces\/space-1\/external_bookings/)
      .reply(200, { data: [externalBookingResponse] });
    scope
      .get(/\/spaces\/space-1\/resources/)
      .reply(200, { data: [resourceResponse] });

    const listRecentExternalBookings = trigger.operation.performList;

    const results = await appTester(
      listRecentExternalBookings as any,
      bundle as any,
    );

    expect(results).toStrictEqual([]);
  });

  it("triggers on external booking approval", async () => {
    const bundle = prepareBundle({
      url: "https://api.cobot.me/external_bookings/eb1",
    });
    const api2Scope = nock("https://api.cobot.me");
    api2Scope
      .get("/external_bookings/eb1")
      .reply(200, { data: externalBookingResponse });
    api2Scope
      .get("/resources/resource-1")
      .reply(200, { data: resourceResponse });
    const results = await appTester(
      triggerExternalBookingApproved.operation.perform as any,
      bundle as any,
    );

    expect(nock.isDone()).toBe(true);

    expect(results).toStrictEqual([externalBookingOutput]);
  });
});
