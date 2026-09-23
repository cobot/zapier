import { createAppTester } from "zapier-platform-core";
import nock from "nock";
import App from "../../index";
import { addInputData, mockBundle } from "../utils/mockBundle";
import { KontentBundle } from "../../types/kontentBundle";
import SearchMemberships, {
  InputData as SearchMembershipsInputData,
} from "../../searches/searchMemberships";
import {
  MembershipApi2Response,
  UserApiResponse,
} from "../../types/api-responses";
import { MembershipApi2Output } from "../../types/outputs";

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

const userResponse: UserApiResponse = {
  included: [
    {
      id: "f9a99a71ac8df98d29de357180d273d3",
      attributes: { subdomain: "trial" },
    },
  ],
};

const membershipResponse: MembershipApi2Response = {
  id: "a8c12f62ac8df98d29de357180d673e1",
  type: "memberships",
  attributes: {
    name: "Jane Fonda",
    email: "foksol@di.es",
    phone: "(746) 760-3432",
    company: null,
    confirmedAt: "2020-02-01",
    canceledAt: null,
    photo: {
      thumb: {
        url: "https://cdn.com/24a99a71ac8df98d29de357180d273d3/thumb_photo.png",
        width: 50,
        height: 50,
      },
    },
  },
};

const membershipOutput: MembershipApi2Output = {
  id: "a8c12f62ac8df98d29de357180d673e1",
  name: "Jane Fonda",
  email: "foksol@di.es",
  phone: "(746) 760-3432",
  company: null,
  confirmed_at: "2020-02-01",
  canceled_at: null,
  photo_url: "https://cdn.com/24a99a71ac8df98d29de357180d273d3/thumb_photo.png",
};

const input: SearchMembershipsInputData = {
  subdomain: "trial",
  query: "jane",
};

describe("searchMemberships", () => {
  it("searches memberships in the space", async () => {
    const bundle: KontentBundle<SearchMembershipsInputData> = addInputData(
      mockBundle,
      input,
    );

    const scope = nock("https://api.cobot.me");
    scope.get("/user?include=adminOf").reply(200, userResponse);
    scope
      .get("/spaces/f9a99a71ac8df98d29de357180d273d3/memberships/search")
      .query({ "filter[query]": "jane" })
      .reply(200, { data: [membershipResponse] });

    const search = App.searches[SearchMemberships.key].operation.perform;
    const results = await appTester(search as any, bundle as any);

    expect(nock.isDone()).toBe(true);
    expect(results).toEqual([membershipOutput]);
  });

  it("returns an empty list when there are no matches", async () => {
    const bundle: KontentBundle<SearchMembershipsInputData> = addInputData(
      mockBundle,
      { ...input, query: "nobody" },
    );

    const scope = nock("https://api.cobot.me");
    scope.get("/user?include=adminOf").reply(200, userResponse);
    scope
      .get("/spaces/f9a99a71ac8df98d29de357180d273d3/memberships/search")
      .query({ "filter[query]": "nobody" })
      .reply(200, { data: [] });

    const search = App.searches[SearchMemberships.key].operation.perform;
    const results = await appTester(search as any, bundle as any);

    expect(nock.isDone()).toBe(true);
    expect(results).toEqual([]);
  });

  it("throws when no space is found for the subdomain", async () => {
    const bundle: KontentBundle<SearchMembershipsInputData> = addInputData(
      mockBundle,
      { ...input, subdomain: "unknown" },
    );

    const scope = nock("https://api.cobot.me");
    scope.get("/user?include=adminOf").reply(200, userResponse);

    const search = App.searches[SearchMemberships.key].operation.perform;
    await expect(appTester(search as any, bundle as any)).rejects.toThrow(
      "No space found for subdomain unknown",
    );
  });
});
