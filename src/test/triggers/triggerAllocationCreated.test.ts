import { createAppTester } from "zapier-platform-core";
import nock from "nock";
import App from "../../index";
import {
  prepareBundle,
  prepareMocksForWebhookSubscribeTest,
} from "../utils/prepareMocksForWebhookSubscribeTest";
import triggerAllocationCreated from "../../triggers/triggerAllocationCreated";
import { HookTrigger } from "../../types/trigger";
import {
  UserApiResponse,
  AllocationApiResponse,
  AllocationAllocateeApiResponse,
  ResourceApiResponse,
} from "../../types/api-responses";
import { AllocationOutput } from "../../types/outputs";

const appTester = createAppTester(App);
nock.disableNetConnect();
const trigger = App.triggers[triggerAllocationCreated.key] as HookTrigger;

afterEach(() => nock.cleanAll());

const allocationResponse: AllocationApiResponse = {
  id: "a8f21a71ac8df98d29de357180d27358",
  type: "allocations",
  attributes: {
    startsAt: "2018-01-01",
    canceledTo: "2018-12-31",
    cycleDuration: 1,
    minimumCommitment: 0,
    recurringMinimumCommitment: false,
    cancellationPeriod: 30,
    pricePerCycle: {
      net: "100.0",
      gross: "119.0",
      currency: "EUR",
      taxes: [{ name: "VAT", rate: "19.0", amount: "19.0" }],
    },
  },
  relationships: {
    space: {
      data: { id: "f9a99a71ac8df98d29de357180d273d3", type: "spaces" },
    },
    resource: {
      data: { id: "a4a99a71ac8df98d29de357180d273d3", type: "resources" },
    },
    allocatee: {
      data: { id: "f11h2a71ac8df98d29de357180d273a3", type: "memberships" },
    },
  },
};

const resourceResponse: ResourceApiResponse = {
  id: "a4a99a71ac8df98d29de357180d273d3",
  attributes: { name: "Dedicated Desk" },
};

const allocateeResponse: AllocationAllocateeApiResponse = {
  id: "f11h2a71ac8df98d29de357180d273a3",
  type: "memberships",
  attributes: {
    name: "Jane Doe",
    email: "jane@example.com",
  },
};

const allocationOutput: AllocationOutput = {
  id: "a8f21a71ac8df98d29de357180d27358",
  startsAt: "2018-01-01",
  canceledTo: "2018-12-31",
  cycleDuration: 1,
  minimumCommitment: 0,
  recurringMinimumCommitment: false,
  cancellationPeriod: 30,
  pricePerCycle: {
    net: "100.0",
    gross: "119.0",
    currency: "EUR",
    taxes: [{ name: "VAT", rate: "19.0", amount: "19.0" }],
  },
  resource: {
    id: "a4a99a71ac8df98d29de357180d273d3",
    name: "Dedicated Desk",
  },
  allocatee: {
    id: "f11h2a71ac8df98d29de357180d273a3",
    type: "memberships",
    name: "Jane Doe",
    email: "jane@example.com",
  },
};

describe("triggerAllocationCreated", () => {
  it("creates new webhook through CM API upon subscribe", async () => {
    const bundle = prepareMocksForWebhookSubscribeTest(
      triggerAllocationCreated.key,
    );
    const subscribe = trigger.operation.performSubscribe;

    const result = await appTester(subscribe as any, bundle as any);

    expect(result).toMatchInlineSnapshot(`
{
  "url": "https://trial.cobot.me/api/event/callback",
}
`);
  });

  it("sends notify_existing when Trigger for existing is enabled", async () => {
    const bundle = prepareBundle();
    bundle.inputData = {
      ...bundle.inputData,
      trigger_for_existing: "Yes",
    };
    const url = `https://${bundle.inputData.subdomain}.cobot.me/api/subscriptions`;
    nock(url)
      .post("", {
        event: triggerAllocationCreated.key,
        callback_url: bundle.targetUrl,
        notify_existing: true,
      })
      .reply(200, { url: "https://trial.cobot.me/api/event/callback" });

    const result = await appTester(
      trigger.operation.performSubscribe as any,
      bundle as any,
    );

    expect(nock.isDone()).toBe(true);
    expect(result).toEqual({
      url: "https://trial.cobot.me/api/event/callback",
    });
  });

  it("lists allocations", async () => {
    const bundle = prepareBundle();
    const userResponse: UserApiResponse = {
      included: [{ id: "space-1", attributes: { subdomain: "trial" } }],
    };

    const scope = nock("https://api.cobot.me");
    scope.get("/user?include=adminOf").reply(200, userResponse);
    scope
      .get("/spaces/space-1/allocations")
      .query(true)
      .reply(200, { data: [allocationResponse] });
    scope
      .get("/resources/a4a99a71ac8df98d29de357180d273d3")
      .reply(200, { data: resourceResponse });
    scope
      .get("/memberships/f11h2a71ac8df98d29de357180d273a3")
      .reply(200, { data: allocateeResponse });

    const results = await appTester(
      trigger.operation.performList as any,
      bundle as any,
    );

    expect(nock.isDone()).toBe(true);
    expect(results).toStrictEqual([allocationOutput]);
  });

  it("triggers on allocation created", async () => {
    const bundle = prepareBundle({
      url: "https://api.cobot.me/allocations/a8f21a71ac8df98d29de357180d27358",
    });
    const scope = nock("https://api.cobot.me");
    scope
      .get("/allocations/a8f21a71ac8df98d29de357180d27358")
      .reply(200, { data: allocationResponse });
    scope
      .get("/resources/a4a99a71ac8df98d29de357180d273d3")
      .reply(200, { data: resourceResponse });
    scope
      .get("/memberships/f11h2a71ac8df98d29de357180d273a3")
      .reply(200, { data: allocateeResponse });

    const results = await appTester(
      trigger.operation.perform as any,
      bundle as any,
    );

    expect(nock.isDone()).toBe(true);
    expect(results).toStrictEqual([allocationOutput]);
  });
});
