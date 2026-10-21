import { createAppTester } from "zapier-platform-core";
import nock from "nock";
import { addInputData, mockBundle } from "../utils/mockBundle";
import App from "../../index";
import { KontentBundle } from "../../types/kontentBundle";
import getExternalResources from "../../triggers/dropdowns/getExternalResources";
import {
  ResourceApiResponse,
  UserApiResponse,
} from "../../types/api-responses";

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

const spaceId = "99da6cb66b5e6b39007690854fd66df9";

const userResponse: UserApiResponse = {
  included: [
    {
      id: spaceId,
      attributes: { subdomain: "trial" },
    },
  ],
};

const resources: ResourceApiResponse[] = [
  {
    id: "resource-2",
    attributes: { name: "Phone Booth" },
  },
  {
    id: "resource-1",
    attributes: { name: "Meeting Room" },
  },
];

describe("getExternalResources", () => {
  it("lists external resources for the selected space", async () => {
    const bundle: KontentBundle<{ subdomain: string }> = addInputData(
      mockBundle,
      { subdomain: "trial" },
    );

    const scope = nock("https://api.cobot.me");
    scope.get("/user?include=adminOf").reply(200, userResponse);
    scope
      .get(`/spaces/${spaceId}/external_resources`)
      .reply(200, { data: resources });

    const action = App.triggers[getExternalResources.key].operation.perform;
    const result = await appTester(action as any, bundle as any);

    expect(nock.isDone()).toBe(true);
    expect(result).toEqual([
      { id: "resource-1", name: "Meeting Room" },
      { id: "resource-2", name: "Phone Booth" },
    ]);
  });

  it("returns an empty list when subdomain is missing", async () => {
    const action = App.triggers[getExternalResources.key].operation.perform;
    const result = await appTester(action as any, mockBundle as any);

    expect(result).toEqual([]);
  });

  it("returns an empty list when the space is not found", async () => {
    const bundle: KontentBundle<{ subdomain: string }> = addInputData(
      mockBundle,
      { subdomain: "unknown" },
    );

    nock("https://api.cobot.me")
      .get("/user?include=adminOf")
      .reply(200, { included: [] });

    const action = App.triggers[getExternalResources.key].operation.perform;
    const result = await appTester(action as any, bundle as any);

    expect(nock.isDone()).toBe(true);
    expect(result).toEqual([]);
  });
});
