import { createAppTester } from "zapier-platform-core";
import * as nock from "nock";
import { addInputData, mockBundle } from "../utils/mockBundle";
import App from "../../index";
import { KontentBundle } from "../../types/kontentBundle";
import ActivityAction, { InputData as ActivityInputData } from "../../creates/activity";

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

describe("createActivity", () => {
  it("changes workflow step", async () => {
    const bundle: KontentBundle<ActivityInputData> = addInputData(mockBundle, rawVariant);

    const url = `https://${bundle.inputData.subdomain}.cobot.me/api/activities`
    nock(url).post("", {
      text: bundle.inputData.text,
      level: bundle.inputData.level,
      channels: bundle.inputData.channels,
      source_ids: bundle.inputData.source_ids,
    })
    .reply(200, {
      "created_at": "2023-10-16T12:00:00.000Z",
      "type": "text",
      "channels": ["admin"],
      "level": "ERROR",
      "attributes": {
        "text": "trial text"
      }
    })

    const action = App.creates[ActivityAction.key].operation.perform;
    const result = await appTester(action as any, bundle as any);

    expect(result).toMatchInlineSnapshot(`
{
  "attributes": {
    "text": "trial text",
  },
  "channels": [
    "admin",
  ],
  "created_at": "2023-10-16T12:00:00.000Z",
  "level": "ERROR",
  "type": "text",
}
`)
  })
})

const rawVariant: ActivityInputData = {
  subdomain: 'trial',
  text: 'trial text',
  level: 'ERROR',
  channels: ['admin'],
  source_ids: []
};
