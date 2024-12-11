import { createAppTester } from "zapier-platform-core";
import * as nock from "nock";
import App from "../../index";
import {
  prepareBundle,
  prepareMocksForWebhookSubscribeTest,
} from "../utils/prepareMocksForWebhookSubscribeTest";
import triggerMembershipCancellationDateReached from "../../triggers/triggerMembershipCancellationDateReached";
import trigger from "../../triggers/triggerMembershipCancellationDateReached";
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
    full_address: "982 Ruguw Terrace",
  },
  payment_method: {
    name: "Credit Card",
  },
  plan: {
    name: "Full Time",
  },
  customer_number: "123",
  confirmed_at: "2012/04/12 12:00:00 +0000",
  canceled_to: "2012/04/14",
};

const membershipOutput: MembershipOutput = {
  id: "003b37a3-f205-5d9e-9caf-c4ca612075d4",
  name: "Sam Duncan",
  company: "Acme inc",
  email: "sig@rauwekug.kr",
  customer_number: "123",
  plan_name: "Full Time",
  payment_method_name: "Credit Card",
  confirmed_at: "2012-04-12",
  canceled_to: "2012-04-14",
};

afterEach(() => nock.cleanAll());

describe("triggerMembershipCancellationDateReached", () => {
  it("creates new webhook through CM API upon subscribe", async () => {
    const bundle = prepareMocksForWebhookSubscribeTest(
      triggerMembershipCancellationDateReached.key,
    );
    const subscribe = (
      App.triggers[triggerMembershipCancellationDateReached.key] as HookTrigger
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
      triggerMembershipCancellationDateReached.operation.perform as any,
      bundle as any,
    );
    expect(nock.isDone()).toBe(true);

    expect(results).toStrictEqual([membershipOutput]);
  });
});