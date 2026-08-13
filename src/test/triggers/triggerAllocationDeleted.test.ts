import { createAppTester } from "zapier-platform-core";
import nock from "nock";
import App from "../../index";
import {
  prepareBundle,
  prepareMocksForWebhookSubscribeTest,
} from "../utils/prepareMocksForWebhookSubscribeTest";
import triggerAllocationDeleted from "../../triggers/triggerAllocationDeleted";
import { HookTrigger } from "../../types/trigger";
import {
  UserApiResponse,
  AllocationApiResponse,
} from "../../types/api-responses";

const appTester = createAppTester(App);
nock.disableNetConnect();
const trigger = App.triggers[triggerAllocationDeleted.key] as HookTrigger;

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

describe("triggerAllocationDeleted", () => {
  it("creates new webhook through CM API upon subscribe", async () => {
    const bundle = prepareMocksForWebhookSubscribeTest(
      triggerAllocationDeleted.key,
    );
    const subscribe = trigger.operation.performSubscribe;

    const result = await appTester(subscribe as any, bundle as any);

    expect(result).toMatchInlineSnapshot(`
{
  "url": "https://trial.cobot.me/api/event/callback",
}
`);
  });

  it("lists allocation ids", async () => {
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

    const results = await appTester(
      trigger.operation.performList as any,
      bundle as any,
    );

    expect(nock.isDone()).toBe(true);
    expect(results).toStrictEqual([{ id: "a8f21a71ac8df98d29de357180d27358" }]);
  });

  it("triggers on allocation deleted with id from url only", async () => {
    const bundle = prepareBundle({
      url: "https://api.cobot.me/allocations/a8f21a71ac8df98d29de357180d27358",
    });

    const results = await appTester(
      trigger.operation.perform as any,
      bundle as any,
    );

    expect(results).toStrictEqual([{ id: "a8f21a71ac8df98d29de357180d27358" }]);
  });
});
