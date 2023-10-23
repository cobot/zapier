import { createAppTester } from "zapier-platform-core";
import * as nock from "nock";
import App from "../../index";
import { prepareMocksForWebhookSubscribeTest } from "../utils/prepareMocksForWebhookSubscribeTest";
import triggerExternalBooking from "../../triggers/triggerExternalBooking";

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

describe("triggerExternalBooking", () => {
  it("creates new webhook upon through CM API upon subscribe", async () => {
    const bundle = prepareMocksForWebhookSubscribeTest('created_booking')
    const subscribe =
      App.triggers[triggerExternalBooking.key].operation.performSubscribe;

    const result = await appTester(subscribe as any, bundle as any);

    expect(result).toMatchInlineSnapshot(`
{
  "url": "https://trial.cobot.me/api/event/callback",
}
`);
  })
})