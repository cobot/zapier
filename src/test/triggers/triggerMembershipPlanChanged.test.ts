import { createAppTester } from "zapier-platform-core";
import * as nock from "nock";
import App from "../../index";
import { prepareMocksForWebhookSubscribeTest } from "../utils/prepareMocksForWebhookSubscribeTest";
import triggerMembershipPlanChanged from "../../triggers/triggerMembershipPlanChanged";

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

describe("triggerMembershipPlanChanged", () => {
  it("creates new webhook upon through CM API upon subscribe", async () => {
    const bundle = prepareMocksForWebhookSubscribeTest(
      triggerMembershipPlanChanged.key,
    );
    const subscribe =
      App.triggers[triggerMembershipPlanChanged.key].operation.performSubscribe;

    const result = await appTester(subscribe as any, bundle as any);

    expect(result).toMatchInlineSnapshot(`
{
  "url": "https://trial.cobot.me/api/event/callback",
}
`);
  });
});
