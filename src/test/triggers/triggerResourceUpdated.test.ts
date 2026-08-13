import { createAppTester } from "zapier-platform-core";
import * as nock from "nock";
import App from "../../index";
import {
  prepareBundle,
  prepareMocksForWebhookSubscribeTest,
} from "../utils/prepareMocksForWebhookSubscribeTest";
import triggerResourceUpdated from "../../triggers/triggerResourceUpdated";
import { HookTrigger } from "../../types/trigger";
import {
  UserApiResponse,
  ResourceApiResponse,
} from "../../types/api-responses";
import { ResourceOutput } from "../../types/outputs";

const appTester = createAppTester(App);
nock.disableNetConnect();
const trigger = App.triggers[triggerResourceUpdated.key] as HookTrigger;

afterEach(() => nock.cleanAll());

const resourceResponse: ResourceApiResponse = {
  id: "a4a99a71ac8df98d29de357180d273d3",
  attributes: {
    name: "Meeting Room",
    resourceType: "room",
    usage: "bookable",
    description: "Large room, fits 12.",
    capacity: 12,
    units: 2,
    hidden: false,
    color: "#ff0000",
    accountingCode: "ROOM",
    photo: {
      icon: {
        url: "https://cdn.com/resource/photo/a4a99a71ac8df98d29de357180d273d3/icon_photo.png",
        width: 120,
        height: 120,
      },
      default: {
        url: "https://cdn.com/resource/photo/a4a99a71ac8df98d29de357180d273d3/default_photo.png",
        width: 800,
        height: 600,
      },
      small: {
        url: "https://cdn.com/resource/photo/a4a99a71ac8df98d29de357180d273d3/small_photo.png",
        width: 200,
        height: 150,
      },
      medium: {
        url: "https://cdn.com/resource/photo/a4a99a71ac8df98d29de357180d273d3/medium_photo.png",
        width: 400,
        height: 300,
      },
      large: {
        url: "https://cdn.com/resource/photo/a4a99a71ac8df98d29de357180d273d3/large_photo.png",
        width: 1200,
        height: 900,
      },
    },
  },
};

const resourceOutput: ResourceOutput = {
  id: "a4a99a71ac8df98d29de357180d273d3",
  name: "Meeting Room",
  resourceType: "room",
  usage: "bookable",
  description: "Large room, fits 12.",
  capacity: 12,
  units: 2,
  hidden: false,
  color: "#ff0000",
  accountingCode: "ROOM",
  photoUrl:
    "https://cdn.com/resource/photo/a4a99a71ac8df98d29de357180d273d3/default_photo.png",
};

describe("triggerResourceUpdated", () => {
  it("creates new webhook through CM API upon subscribe", async () => {
    const bundle = prepareMocksForWebhookSubscribeTest(
      triggerResourceUpdated.key,
    );
    const subscribe = trigger.operation.performSubscribe;

    const result = await appTester(subscribe as any, bundle as any);

    expect(result).toMatchInlineSnapshot(`
{
  "url": "https://trial.cobot.me/api/event/callback",
}
`);
  });

  it("lists resources", async () => {
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
    expect(results).toStrictEqual([resourceOutput]);
  });

  it("triggers on resource updated", async () => {
    const bundle = prepareBundle({
      url: "https://api.cobot.me/resources/a4a99a71ac8df98d29de357180d273d3",
    });
    const scope = nock("https://api.cobot.me");
    scope
      .get("/resources/a4a99a71ac8df98d29de357180d273d3")
      .reply(200, { data: resourceResponse });

    const results = await appTester(
      trigger.operation.perform as any,
      bundle as any,
    );

    expect(nock.isDone()).toBe(true);
    expect(results).toStrictEqual([resourceOutput]);
  });
});
