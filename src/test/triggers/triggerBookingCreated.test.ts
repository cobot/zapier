import { createAppTester } from "zapier-platform-core";
import * as nock from "nock";
import App from "../../index";
import {
  prepareBundle,
  prepareMocksForWebhookSubscribeTest,
} from "../utils/prepareMocksForWebhookSubscribeTest";
import triggerBookingCreated from "../../triggers/triggerBookingCreated";
import { HookTrigger } from "../../types/trigger";
import { BookingApi2Response } from "../../types/api-responses";
import { BookingOutput } from "../../types/outputs";
import { MembershipApiResponse } from "../../types/api-responses";

const appTester = createAppTester(App);
nock.disableNetConnect();

const priceAttr = {
  net: "10",
  gross: "10",
  currency: "EUR",
  taxes: [] as { name: string; amount: string; rate: string }[],
};

const bookingResponse: BookingApi2Response = {
  id: "d58b612aaa62619aae546dd336587eb2",
  type: "bookings",
  attributes: {
    from: "2012/04/12 12:00:00 +0000",
    to: "2012/04/12 18:00:00 +0000",
    title: "test booking",
    name: "test booking",
    comments: "coffee please",
    attendees: [],
    attendeesMessage: null,
    price: priceAttr,
    units: 1,
  },
  relationships: {
    externalBooking: { data: null },
    membership: { data: { id: "membership-1", type: "memberships" } },
    resource: { data: { id: "resource-1", type: "resources" } },
  },
};

const resourceResponse = {
  id: "resource-1",
  type: "resources",
  attributes: { name: "Meeting Room" },
};

const membershipResponse: MembershipApiResponse = {
  id: "membership-1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 555 683 4463",
  address: {
    company: "Acme inc",
    name: "John Doe",
    full_address: "123 Main St\nNew York, NY 10001",
    address: "123 Main St",
    city: "New York",
    post_code: "10001",
    state: "NY",
    country: "US",
  },
  payment_method: { name: "Credit Card" },
  plan: {
    name: "Full Time",
    description: "Full time membership",
    total_price_per_cycle: "100.0",
    currency: "USD",
    cycle_duration: 1,
    cancellation_period: 14,
    accounting_code: null,
  },
  customer_number: "123",
  confirmed_at: "2012/04/12 12:00:00 +0000",
  team_id: null,
};

const bookingOutput: BookingOutput = {
  id: "d58b612aaa62619aae546dd336587eb2",
  from: "2012-04-12T12:00:00.000Z",
  to: "2012-04-12T18:00:00.000Z",
  title: "test booking",
  resource_name: "Meeting Room",
  price: "10",
  units: 1,
  currency: "EUR",
  member_name: "John Doe",
  member_email: "john.doe@example.com",
  comments: "coffee please",
  attendee_list: [],
  attendees_message: null,
};

const bookingWithAttendeesResponse: BookingApi2Response = {
  ...bookingResponse,
  id: "booking-with-attendees",
  attributes: {
    ...bookingResponse.attributes,
    attendees: [{ email: "alice@example.com" }, { email: "bob@example.com" }],
    attendeesMessage: "See you at the meeting",
  },
};

const bookingWithAttendeesOutput: BookingOutput = {
  ...bookingOutput,
  id: "booking-with-attendees",
  attendee_list: ["alice@example.com", "bob@example.com"],
  attendees_message: "See you at the meeting",
};

const priceAttrUsd = {
  net: "5",
  gross: "5",
  currency: "USD",
  taxes: [] as { name: string; amount: string; rate: string }[],
};

const bookingWithoutMembershipResponse: BookingApi2Response = {
  id: "booking-without-member",
  type: "bookings",
  attributes: {
    from: "2012/04/12 12:00:00 +0000",
    to: "2012/04/12 18:00:00 +0000",
    title: "guest booking",
    name: "guest booking",
    comments: null,
    attendees: [],
    attendeesMessage: null,
    price: priceAttrUsd,
    units: 1,
  },
  relationships: {
    externalBooking: { data: null },
    resource: { data: { id: "resource-2", type: "resources" } },
  },
};

const resourceResponse2 = {
  id: "resource-2",
  type: "resources",
  attributes: { name: "Desk" },
};

const bookingWithoutMembershipOutput: BookingOutput = {
  id: "booking-without-member",
  from: "2012-04-12T12:00:00.000Z",
  to: "2012-04-12T18:00:00.000Z",
  title: "guest booking",
  resource_name: "Desk",
  price: "5",
  units: 1,
  currency: "USD",
  member_name: null,
  member_email: null,
  comments: null,
  attendee_list: [],
  attendees_message: null,
};

const userResponseWithSpace = {
  included: [
    { id: "space-1", type: "spaces", attributes: { subdomain: "trial" } },
  ],
};

afterEach(() => nock.cleanAll());

describe("triggerBookingCreated", () => {
  it("creates new webhook through CM API upon subscribe", async () => {
    const bundle = prepareMocksForWebhookSubscribeTest(
      triggerBookingCreated.key,
    );
    const subscribe = (App.triggers[triggerBookingCreated.key] as HookTrigger)
      .operation.performSubscribe;

    const result = await appTester(subscribe as any, bundle as any);

    expect(result).toMatchInlineSnapshot(`
{
  "url": "https://trial.cobot.me/api/event/callback",
}
`);
  });

  it("lists recent bookings", async () => {
    const bundle = prepareBundle();
    const apiScope = nock("https://api.cobot.me");
    apiScope
      .get("/user")
      .query({ include: "adminOf" })
      .reply(200, userResponseWithSpace);
    apiScope
      .get("/spaces/space-1/bookings")
      .query(true)
      .reply(200, [bookingResponse]);
    apiScope
      .get("/resources/resource-1")
      .reply(200, { data: resourceResponse });
    const spaceScope = nock("https://trial.cobot.me");
    spaceScope
      .get("/api/memberships/membership-1")
      .reply(200, membershipResponse);

    const listBookings = triggerBookingCreated.operation.performList;

    const results = await appTester(listBookings as any, bundle as any);
    expect(nock.isDone()).toBe(true);
    expect(results).toStrictEqual([bookingOutput]);
  });

  it("lists recent bookings without membership", async () => {
    const bundle = prepareBundle();
    const apiScope = nock("https://api.cobot.me");
    apiScope
      .get("/user")
      .query({ include: "adminOf" })
      .reply(200, userResponseWithSpace);
    apiScope
      .get("/spaces/space-1/bookings")
      .query(true)
      .reply(200, [bookingWithoutMembershipResponse]);
    apiScope
      .get("/resources/resource-2")
      .reply(200, { data: resourceResponse2 });

    const listBookings = triggerBookingCreated.operation.performList;

    const results = await appTester(listBookings as any, bundle as any);
    expect(nock.isDone()).toBe(true);
    expect(results).toStrictEqual([bookingWithoutMembershipOutput]);
  });

  it("triggers on booking created", async () => {
    const bundle = prepareBundle({
      url: "https://trial.cobot.me/api/bookings/b1",
    });
    const apiScope = nock("https://api.cobot.me");
    apiScope.get("/bookings/b1").reply(200, { data: bookingResponse });
    apiScope
      .get("/resources/resource-1")
      .reply(200, { data: resourceResponse });
    const spaceScope = nock("https://trial.cobot.me");
    spaceScope
      .get("/api/memberships/membership-1")
      .reply(200, membershipResponse);

    const results = await appTester(
      triggerBookingCreated.operation.perform as any,
      bundle as any,
    );

    expect(nock.isDone()).toBe(true);
    expect(results).toStrictEqual([bookingOutput]);
  });

  it("triggers on booking created without membership", async () => {
    const bundle = prepareBundle({
      url: "https://trial.cobot.me/api/bookings/b2",
    });
    const apiScope = nock("https://api.cobot.me");
    apiScope
      .get("/bookings/b2")
      .reply(200, { data: bookingWithoutMembershipResponse });
    apiScope
      .get("/resources/resource-2")
      .reply(200, { data: resourceResponse2 });

    const results = await appTester(
      triggerBookingCreated.operation.perform as any,
      bundle as any,
    );

    expect(nock.isDone()).toBe(true);
    expect(results).toStrictEqual([bookingWithoutMembershipOutput]);
  });

  it("maps attendee_list and attendees_message when API returns them", async () => {
    const bundle = prepareBundle({
      url: "https://trial.cobot.me/api/bookings/b-attendees",
    });
    const apiScope = nock("https://api.cobot.me");
    apiScope
      .get("/bookings/b-attendees")
      .reply(200, { data: bookingWithAttendeesResponse });
    apiScope
      .get("/resources/resource-1")
      .reply(200, { data: resourceResponse });
    const spaceScope = nock("https://trial.cobot.me");
    spaceScope
      .get("/api/memberships/membership-1")
      .reply(200, membershipResponse);

    const results = await appTester(
      triggerBookingCreated.operation.perform as any,
      bundle as any,
    );

    expect(nock.isDone()).toBe(true);
    expect(results).toStrictEqual([bookingWithAttendeesOutput]);
  });
});
