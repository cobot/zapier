import { createAppTester } from "zapier-platform-core";
import * as nock from "nock";
import App from "../../index";
import {
  prepareBundle,
  prepareMocksForWebhookSubscribeTest,
} from "../utils/prepareMocksForWebhookSubscribeTest";
import triggerBookingUpdated from "../../triggers/triggerBookingUpdated";
import { HookTrigger } from "../../types/trigger";
import {
  BookingApiResponse,
  MembershipApiResponse,
} from "../../types/api-responses";
import { BookingOutput } from "../../types/outputs";

const appTester = createAppTester(App);
nock.disableNetConnect();

const bookingResponse: BookingApiResponse = {
  id: "d58b612aaa62619aae546dd336587eb2",
  from: "2012/04/12 12:00:00 +0000",
  to: "2012/04/12 18:00:00 +0000",
  title: "test booking",
  resource: { name: "Meeting Room", id: "resource-1" },
  membership: { id: "membership-1", name: "John Doe" },
  comments: "coffee please",
  price: 10.0,
  currency: "EUR",
  units: 1,
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
  currency: "EUR",
  member_name: "John Doe",
  member_email: "john.doe@example.com",
  comments: "coffee please",
  units: 1,
  attendee_list: [],
  attendees_message: null,
};

afterEach(() => nock.cleanAll());

describe("triggerBookingUpdated", () => {
  it("creates new webhook through CM API upon subscribe", async () => {
    const bundle = prepareMocksForWebhookSubscribeTest(
      triggerBookingUpdated.key,
    );
    const subscribe = (App.triggers[triggerBookingUpdated.key] as HookTrigger)
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
    const apiScope = nock("https://trial.cobot.me");
    apiScope.get("/api/bookings").query(true).reply(200, [bookingResponse]);
    apiScope
      .get("/api/memberships/membership-1")
      .reply(200, membershipResponse);

    const listBookings = triggerBookingUpdated.operation.performList;

    const results = await appTester(listBookings as any, bundle as any);
    expect(nock.isDone()).toBe(true);
    expect(results).toStrictEqual([bookingOutput]);
  });

  it("triggers on booking updated", async () => {
    const bundle = prepareBundle({
      url: "https://trial.cobot.me/api/bookings/b1",
    });
    const apiScope = nock("https://trial.cobot.me");
    apiScope.get("/api/bookings/b1").reply(200, bookingResponse);
    apiScope
      .get("/api/memberships/membership-1")
      .reply(200, membershipResponse);

    const results = await appTester(
      triggerBookingUpdated.operation.perform as any,
      bundle as any,
    );

    expect(nock.isDone()).toBe(true);
    expect(results).toStrictEqual([bookingOutput]);
  });

  it("triggers on booking updated without membership", async () => {
    const bookingWithoutMembership: BookingApiResponse = {
      ...bookingResponse,
      id: "no-member",
      membership: null,
    };
    const bundle = prepareBundle({
      url: "https://trial.cobot.me/api/bookings/b2",
    });
    const apiScope = nock("https://trial.cobot.me");
    apiScope.get("/api/bookings/b2").reply(200, bookingWithoutMembership);

    const results = (await appTester(
      triggerBookingUpdated.operation.perform as any,
      bundle as any,
    )) as BookingOutput[];

    expect(nock.isDone()).toBe(true);
    expect(results[0].member_name).toBeNull();
    expect(results[0].member_email).toBeNull();
  });
});
