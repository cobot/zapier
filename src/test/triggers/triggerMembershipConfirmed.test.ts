import { createAppTester } from "zapier-platform-core";
import * as nock from "nock";
import App from "../../index";
import {
  prepareBundle,
  prepareMocksForWebhookSubscribeTest,
} from "../utils/prepareMocksForWebhookSubscribeTest";
import triggerMembershipConfirmed from "../../triggers/triggerMembershipConfirmed";
import { HookTrigger } from "../../types/trigger";
import { MembershipApiResponse } from "../../types/api-responses";
import { MembershipOutput } from "../../types/outputs";
import trigger from "../../triggers/triggerMembershipConfirmed";

const appTester = createAppTester(App);
nock.disableNetConnect();

const membershipResponse: MembershipApiResponse = {
  id: "003b37a3-f205-5d9e-9caf-c4ca612075d4",
  name: "Sam Duncan",
  email: "sig@rauwekug.kr",
  phone: "+1 555 683 4463",
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
  payment_method: {
    name: "Credit Card",
  },
  plan: {
    name: "Full Time",
    description: "Enjoy the stability of a Full Time membership",
    total_price_per_cycle: "100.0",
    currency: "USD",
    cycle_duration: 1,
    cancellation_period: 14,
  },
  customer_number: "123",
  confirmed_at: "2012/04/12 12:00:00 +0000",
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
  phone: "+1 555 683 4463",
  customer_number: "123",
  plan_name: "Full Time",
  plan: {
    description: "Enjoy the stability of a Full Time membership",
    total_price_per_cycle: "100.0",
    currency: "USD",
    cycle_duration: 1,
    cancellation_period: 14,
  },
  payment_method_name: "Credit Card",
  confirmed_at: "2012-04-12",
};

afterEach(() => nock.cleanAll());

describe("triggerMembershipConfirmed", () => {
  it("creates new webhook through CM API upon subscribe", async () => {
    const bundle = prepareMocksForWebhookSubscribeTest(
      triggerMembershipConfirmed.key,
    );
    const subscribe = (
      App.triggers[triggerMembershipConfirmed.key] as HookTrigger
    ).operation.performSubscribe;

    const result = await appTester(subscribe as any, bundle as any);

    expect(result).toMatchInlineSnapshot(`
{
  "url": "https://trial.cobot.me/api/event/callback",
}
`);
  });

  it("lists recent memberships", async () => {
    const bundle = prepareBundle();
    const api1Scope = nock("https://trial.cobot.me");
    api1Scope.get("/api/memberships").reply(200, [membershipResponse]);

    const listMemberships = trigger.operation.performList;

    const results = await appTester(listMemberships as any, bundle as any);
    expect(nock.isDone()).toBe(true);
    expect(results).toStrictEqual([membershipOutput]);
  });

  it("triggers on membership confirmed", async () => {
    const bundle = prepareBundle({
      url: "https://trial.cobot.me/api/memberships/m1",
    });
    const api1Scope = nock("https://trial.cobot.me");
    api1Scope.get("/api/memberships/m1").reply(200, membershipResponse);
    const results = await appTester(
      triggerMembershipConfirmed.operation.perform as any,
      bundle as any,
    );

    expect(nock.isDone()).toBe(true);

    expect(results).toStrictEqual([membershipOutput]);
  });
});
