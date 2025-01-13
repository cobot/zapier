import { createAppTester } from "zapier-platform-core";
import * as nock from "nock";
import App from "../../index";
import {
  prepareBundle,
  prepareMocksForWebhookSubscribeTest,
} from "../utils/prepareMocksForWebhookSubscribeTest";
import triggerDropInPassPurchased from "../../triggers/triggerDropInPassPurchased";
import { HookTrigger } from "../../types/trigger";
import {
  UserApiResponse,
  DropInPassApiResponse,
} from "../../types/api-responses";

const appTester = createAppTester(App);
nock.disableNetConnect();
const trigger = App.triggers[triggerDropInPassPurchased.key] as HookTrigger;

afterEach(() => nock.cleanAll());

describe("triggerDropInPassPurchased", () => {
  it("creates new webhook through CM API upon subscribe", async () => {
    const bundle = prepareMocksForWebhookSubscribeTest(
      triggerDropInPassPurchased.key,
    );
    const subscribe = trigger.operation.performSubscribe;

    const result = await appTester(subscribe as any, bundle as any);

    expect(result).toMatchInlineSnapshot(`
{
  "url": "https://trial.cobot.me/api/event/callback",
}
`);
  });

  it("lists recent purchased drop in passes", async () => {
    const bundle = prepareBundle();
    const userResponse: UserApiResponse = {
      included: [{ id: "space-1", attributes: { subdomain: "trial" } }],
    };
    const imageItem = {
      url: "https://www.example.com/image.png",
      width: 100,
      height: 100,
    };
    const dropInPassResponse: DropInPassApiResponse = {
      id: "1",
      attributes: {
        name: "Day Pass",
        validOn: "2012-04-12",
        email: "joe@doe.com",
        phone: "+1 555 683 4463",
        taxId: "DE12345",
        onboardingInstructions: "coffee please",
        price: {
          gross: "10.0",
          currency: "EUR",
          net: "8.4",
          taxes: [],
        },
        comments: "coffee please",
        billingAddress: {
          name: "Joe Doe",
          company: "Acme Inc.",
          fullAddress: "2 Coworking Road",
        },
        timeAvailability: [
          {
            from: "01:00",
            to: "05:00",
            weekdays: [1, 2, 5],
          },
        ],
      },
    };

    const scope = nock("https://api.cobot.me");
    scope.get("/user?include=adminOf").reply(200, userResponse);
    scope
      .get(/\/spaces\/space-1\/drop_in_passes/)
      .reply(200, { data: [dropInPassResponse] });

    const listRecentDropInPasses = trigger.operation.performList;

    const results = await appTester(
      listRecentDropInPasses as any,
      bundle as any,
    );

    expect(results).toStrictEqual([
      {
        id: "1",
        dropInPassName: "Day Pass",
        validOn: "2012-04-12",
        email: "joe@doe.com",
        phone: "+1 555 683 4463",
        taxId: "DE12345",
        grossPrice: "10.0 EUR",
        netPrice: "8.4 EUR",
        comments: "coffee please",
        billingAddress: {
          name: "Joe Doe",
          company: "Acme Inc.",
          fullAddress: "2 Coworking Road",
        },
      },
    ]);
  });
});
