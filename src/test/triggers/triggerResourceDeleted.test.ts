import { createAppTester } from "zapier-platform-core";
import nock from "nock";
import App from "../../index";
import {
  prepareBundle,
  prepareMocksForWebhookSubscribeTest,
} from "../utils/prepareMocksForWebhookSubscribeTest";
import triggerResourceDeleted from "../../triggers/triggerResourceDeleted";
import { HookTrigger } from "../../types/trigger";
import {
  UserApiResponse,
  ResourceApiResponse,
} from "../../types/api-responses";

const appTester = createAppTester(App);
nock.disableNetConnect();
const trigger = App.triggers[triggerResourceDeleted.key] as HookTrigger;

afterEach(() => nock.cleanAll());

const resourceResponse: ResourceApiResponse = {
  id: "a4a99a71ac8df98d29de357180d273d3",
  attributes: {
    name: "Meeting Room",
  },
};

describe("triggerResourceDeleted", () => {
  it("creates new webhook through CM API upon subscribe", async () => {
    const bundle = prepareMocksForWebhookSubscribeTest(
      triggerResourceDeleted.key,
    );
    const subscribe = trigger.operation.performSubscribe;

    const result = await appTester(subscribe as any, bundle as any);

    expect(result).toMatchInlineSnapshot(`
{
  "url": "https://trial.cobot.me/api/event/callback",
}
`);
  });

  it("lists resource ids", async () => {
    const bundle = prepareBundle();
    const userResponse: UserApiResponse = {
      included: [{ id: "space-1", attributes: { subdomain: "trial" } }],
    };

    const scope = nock("https://api.cobot.me");
    scope.get("/user?include=adminOf").reply(200, userResponse);
    scope
      .get("/spaces/space-1/resources")
      .query({ "filter[usage]": "all" })
      .reply(200, { data: [resourceResponse] });

    const results = await appTester(
      trigger.operation.performList as any,
      bundle as any,
    );

    expect(nock.isDone()).toBe(true);
    expect(results).toStrictEqual([{ id: "a4a99a71ac8df98d29de357180d273d3" }]);
  });

  it("triggers on resource deleted with id from url only", async () => {
    const bundle = prepareBundle({
      url: "https://api.cobot.me/resources/a4a99a71ac8df98d29de357180d273d3",
    });

    const results = await appTester(
      trigger.operation.perform as any,
      bundle as any,
    );

    expect(results).toStrictEqual([{ id: "a4a99a71ac8df98d29de357180d273d3" }]);
  });
});
