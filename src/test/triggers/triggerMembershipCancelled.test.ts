import { createAppTester } from "zapier-platform-core";
import * as nock from "nock";
import App from "../../index";
import {
  prepareBundle,
  prepareMocksForWebhookSubscribeTest,
} from "../utils/prepareMocksForWebhookSubscribeTest";
import triggerMembershipCancelled from "../../triggers/triggerMembershipCancelled";
import trigger from "../../triggers/triggerMembershipCancelled";
import { HookTrigger } from "../../types/trigger";
import { MembershipApiResponse } from "../../types/api-responses";
import { MembershipOutput } from "../../types/outputs";
import { getDateRange } from "../../utils/api";

const appTester = createAppTester(App);
nock.disableNetConnect();

const membershipResponse: MembershipApiResponse = {
  id: "003b37a3-f205-5d9e-9caf-c4ca612075d4",
  name: "Sam Duncan",
  email: "sig@rauwekug.kr",
  phone: null,
  address: {
    company: "Acme inc",
    name: "Sam Duncan",
    full_address: "982 Ruguw Terrace\n55112 Bellona",
    address: "982 Ruguw Terrace",
    city: "Bellona",
    post_code: "55112",
    state: "AK",
    country: "US",
  },
  payment_method: { name: "Credit Card" },
  plan: {
    name: "Full Time",
    description: "Enjoy the stability of a Full Time membership",
    total_price_per_cycle: "100.0",
    currency: "USD",
    cycle_duration: 1,
    cancellation_period: 14,
    accounting_code: null,
  },
  customer_number: "123",
  confirmed_at: "2012/04/12 12:00:00 +0000",
  canceled_to: "2012/04/14",
  team_id: null,
};

const membershipOutput: MembershipOutput = {
  id: "003b37a3-f205-5d9e-9caf-c4ca612075d4",
  name: "Sam Duncan",
  company: "Acme inc",
  address: {
    full_address: "982 Ruguw Terrace\n55112 Bellona",
    address: "982 Ruguw Terrace",
    city: "Bellona",
    post_code: "55112",
    state: "AK",
    country: "US",
  },
  email: "sig@rauwekug.kr",
  phone: null,
  customer_number: "123",
  plan_name: "Full Time",
  plan: {
    description: "Enjoy the stability of a Full Time membership",
    total_price_per_cycle: "100.0",
    currency: "USD",
    cycle_duration: 1,
    cancellation_period: 14,
    accounting_code: null,
  },
  payment_method_name: "Credit Card",
  confirmed_at: "2012-04-12",
  canceled_to: "2012-04-14",
  team: {
    id: null,
    name: null,
  },
};

afterEach(() => nock.cleanAll());

describe("triggerMembershipCancelled", () => {
  it("creates new webhook through CM API upon subscribe", async () => {
    const bundle = prepareMocksForWebhookSubscribeTest(
      triggerMembershipCancelled.key,
    );
    const subscribe = (
      App.triggers[triggerMembershipCancelled.key] as HookTrigger
    ).operation.performSubscribe;

    const result = await appTester(subscribe as any, bundle as any);

    expect(result).toMatchInlineSnapshot(`
{
  "url": "https://trial.cobot.me/api/event/callback",
}
`);
  });

  it("lists recent cancelled memberships", async () => {
    const bundle = prepareBundle();
    const [from, to] = getDateRange(true);
    const params = new URLSearchParams({ from, to });
    const api1Scope = nock("https://trial.cobot.me");
    api1Scope
      .get("/api/memberships/cancellations")
      .query(params)
      .reply(200, [membershipResponse]);

    const listCancelledMemberships = trigger.operation.performList;

    const results = await appTester(
      listCancelledMemberships as any,
      bundle as any,
    );
    expect(nock.isDone()).toBe(true);
    expect(results).toStrictEqual([membershipOutput]);
  });

  it("triggers on membership cancellation", async () => {
    const bundle = prepareBundle({
      url: "https://trial.cobot.me/api/memberships/m1",
    });
    const api1Scope = nock("https://trial.cobot.me");
    api1Scope.get("/api/memberships/m1").reply(200, membershipResponse);
    const results = await appTester(
      triggerMembershipCancelled.operation.perform as any,
      bundle as any,
    );
    expect(nock.isDone()).toBe(true);

    expect(results).toStrictEqual([membershipOutput]);
  });

  it("triggers on membership cancellation with team information", async () => {
    const membershipWithTeam: MembershipApiResponse = {
      ...membershipResponse,
      team_id: "team-123",
    };

    const expectedOutputWithTeam: MembershipOutput = {
      ...membershipOutput,
      team: {
        id: "team-123",
        name: "Engineering Team",
      },
    };

    const bundle = prepareBundle({
      url: "https://trial.cobot.me/api/memberships/m1",
    });
    const api1Scope = nock("https://trial.cobot.me");
    const api2Scope = nock("https://api.cobot.me");
    api1Scope.get("/api/memberships/m1").reply(200, membershipWithTeam);
    api2Scope.get("/teams/team-123").reply(200, {
      data: { id: "team-123", attributes: { name: "Engineering Team" } },
    });

    const results = await appTester(
      triggerMembershipCancelled.operation.perform as any,
      bundle as any,
    );
    expect(nock.isDone()).toBe(true);
    expect(results).toStrictEqual([expectedOutputWithTeam]);
  });

  it("triggers on membership cancellation when team API returns 404", async () => {
    const membershipWithTeam: MembershipApiResponse = {
      ...membershipResponse,
      team_id: "team-123",
    };

    const bundle = prepareBundle({
      url: "https://trial.cobot.me/api/memberships/m1",
    });
    const api1Scope = nock("https://trial.cobot.me");
    const api2Scope = nock("https://api.cobot.me");
    api1Scope.get("/api/memberships/m1").reply(200, membershipWithTeam);
    api2Scope.get("/teams/team-123").reply(404);

    const results = await appTester(
      triggerMembershipCancelled.operation.perform as any,
      bundle as any,
    );
    expect(nock.isDone()).toBe(true);
    expect(results).toStrictEqual([membershipOutput]);
  });
});
