import { createAppTester } from "zapier-platform-core";
import * as nock from "nock";
import App from "../../index";
import {
  prepareBundle,
  prepareMocksForWebhookSubscribeTest,
} from "../utils/prepareMocksForWebhookSubscribeTest";
import triggerEventPublished from "../../triggers/triggerEventPublished";
import { HookTrigger } from "../../types/trigger";
import { UserApiResponse, EventApiResponse } from "../../types/api-responses";

const appTester = createAppTester(App);
nock.disableNetConnect();
const trigger = App.triggers[triggerEventPublished.key] as HookTrigger;

afterEach(() => nock.cleanAll());

describe("triggerEventPublished", () => {
  it("creates new webhook through CM API upon subscribe", async () => {
    const bundle = prepareMocksForWebhookSubscribeTest(
      triggerEventPublished.key,
    );
    const subscribe = trigger.operation.performSubscribe;

    const result = await appTester(subscribe as any, bundle as any);

    expect(result).toMatchInlineSnapshot(`
{
  "url": "https://trial.cobot.me/api/event/callback",
}
`);
  });

  it("lists recent events", async () => {
    const bundle = prepareBundle();
    const userResponse: UserApiResponse = {
      included: [{ id: "space-1", attributes: { subdomain: "trial" } }],
    };
    const imageItem = {
      url: "https://www.example.com/image.png",
      width: 100,
      height: 100,
    };
    const eventResponse: EventApiResponse = {
      id: "1",
      attributes: {
        title: "event 1",
        from: "2024-12-20T06:22:29+01:00",
        to: "2024-12-20T08:22:29+01:00",
        description: "event 1 description",
        tags: ["free"],
        videoUrl: "https://www.youtube.com/watch?v=123",
        capacity: 12,
        publicUrl: "https://trial.cobot.me/events/1",
        audience: "membersOnly",
        color: "#ff0000",
        image: {
          default: imageItem,
          small: imageItem,
          icon: imageItem,
          medium: imageItem,
          large: imageItem,
        },
      },
    };

    const scope = nock("https://api.cobot.me");
    scope.get("/user?include=adminOf").reply(200, userResponse);
    scope
      .get(/\/spaces\/space-1\/events/)
      .reply(200, { data: [eventResponse] });

    const listRecentEvents = trigger.operation.performList;

    const results = await appTester(listRecentEvents as any, bundle as any);

    expect(results).toStrictEqual([
      {
        audience: "membersOnly",
        capacity: 12,
        color: "#ff0000",
        description: "event 1 description",
        from: "2024-12-20T05:22:29.000Z",
        id: "1",
        image_url: "https://www.example.com/image.png",
        public_url: "https://trial.cobot.me/events/1",
        tags: ["free"],
        title: "event 1",
        to: "2024-12-20T07:22:29.000Z",
        video_url: "https://www.youtube.com/watch?v=123",
      },
    ]);
  });
});
