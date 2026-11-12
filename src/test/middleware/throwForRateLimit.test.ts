import { createAppTester } from "zapier-platform-core";
import nock from "nock";
import App from "../../index";
import { addInputData, mockBundle } from "../utils/mockBundle";
import ActivityAction, {
  InputData as ActivityInputData,
} from "../../creates/activity";
import { KontentBundle } from "../../types/kontentBundle";
import triggerCreatedMembership from "../../triggers/triggerCreatedMembership";
import { prepareBundle } from "../utils/prepareMocksForWebhookSubscribeTest";

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

const throttled = (delay: number) => ({
  name: "ThrottledError",
  message: JSON.stringify({
    message: `Cobot rate limit exceeded. Retrying in ${delay} seconds.`,
    delay,
  }),
});

describe("Cobot 429 responses", () => {
  const bundle: KontentBundle<ActivityInputData> = addInputData(mockBundle, {
    subdomain: "trial",
    text: "trial text",
    level: "ERROR",
    channels: ["admin"],
  });

  const activitiesUrl = `https://${bundle.inputData.subdomain}.cobot.me/api/activities`;

  it("throws ThrottledError using the Retry-After header", async () => {
    nock(activitiesUrl)
      .post("")
      .reply(429, { error: "Too many requests" }, { "Retry-After": "45" });

    const action = App.creates[ActivityAction.key].operation.perform;

    await expect(appTester(action as any, bundle as any)).rejects.toMatchObject(
      throttled(45),
    );
  });

  it("retries after 60 seconds when Retry-After is missing", async () => {
    nock(activitiesUrl).post("").reply(429, { error: "Too many requests" });

    const action = App.creates[ActivityAction.key].operation.perform;

    await expect(appTester(action as any, bundle as any)).rejects.toMatchObject(
      throttled(60),
    );
  });

  it("still fails other Cobot errors", async () => {
    nock(activitiesUrl).post("").reply(500, { error: "unavailable" });

    const action = App.creates[ActivityAction.key].operation.perform;

    await expect(appTester(action as any, bundle as any)).rejects.toMatchObject(
      { name: "ResponseError" },
    );
  });

  it("does not swallow a 429 while loading a webhook payload", async () => {
    const hookBundle = prepareBundle({
      url: "https://trial.cobot.me/api/memberships/m1",
    });
    nock("https://trial.cobot.me")
      .get("/api/memberships/m1")
      .reply(429, { error: "Too many requests" }, { "Retry-After": "15" });

    await expect(
      appTester(
        triggerCreatedMembership.operation.perform as any,
        hookBundle as any,
      ),
    ).rejects.toMatchObject(throttled(15));
  });

  it("does not swallow a 429 while loading a membership team", async () => {
    const hookBundle = prepareBundle({
      url: "https://trial.cobot.me/api/memberships/m1",
    });
    nock("https://trial.cobot.me")
      .get("/api/memberships/m1")
      .reply(200, membershipWithTeam);
    nock("https://api.cobot.me")
      .get("/teams/team-1")
      .reply(429, { error: "Too many requests" }, { "Retry-After": "20" });

    await expect(
      appTester(
        triggerCreatedMembership.operation.perform as any,
        hookBundle as any,
      ),
    ).rejects.toMatchObject(throttled(20));
  });
});

const membershipWithTeam = {
  id: "m1",
  name: "Sam Duncan",
  email: "sam@example.com",
  phone: null,
  address: {
    company: null,
    name: null,
    full_address: null,
    address: null,
    city: null,
    post_code: null,
    state: null,
    country: null,
  },
  payment_method: null,
  plan: {
    name: "Full Time",
    description: null,
    total_price_per_cycle: "100.0",
    currency: "USD",
    cycle_duration: 1,
    cancellation_period: null,
    accounting_code: null,
  },
  customer_number: null,
  confirmed_at: null,
  team_id: "team-1",
};
