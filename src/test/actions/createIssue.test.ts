import { createAppTester } from "zapier-platform-core";
import nock from "nock";
import { addInputData, mockBundle } from "../utils/mockBundle";
import App from "../../index";
import { KontentBundle } from "../../types/kontentBundle";
import IssueAction, { InputData as IssueInputData } from "../../creates/issue";

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

const spaceId = "99da6cb66b5e6b39007690854fd66df9";
const issueId = "5fdf75523b35335eab45adc72038cf51";
const membershipId = "32c76cb66b5e6b39007690854fd668a1";

const userResponse = {
  included: [{ id: spaceId, attributes: { subdomain: "trial" } }],
};

const issueAttributes = {
  subject: "My issue",
  message: "Please fix me!",
  private: false,
};

const mockSpaceLookup = (api2: nock.Scope) => {
  api2.get("/user?include=adminOf").reply(200, userResponse);
};

describe("createIssue", () => {
  it("creates a help desk issue as the admin", async () => {
    const bundle: KontentBundle<IssueInputData> = addInputData(
      mockBundle,
      rawVariant,
    );

    const api2 = nock("https://api.cobot.me");
    mockSpaceLookup(api2);
    api2
      .post("/issues", {
        data: {
          type: "issues",
          attributes: issueAttributes,
          relationships: {
            space: { data: { id: spaceId, type: "spaces" } },
          },
        },
      })
      .reply(201, {
        data: {
          id: issueId,
          type: "issues",
          attributes: issueAttributes,
          relationships: {
            space: { data: { id: spaceId, type: "spaces" } },
            issuer: { data: null },
          },
        },
      });

    const action = App.creates[IssueAction.key].operation.perform;
    const result = await appTester(action as any, bundle as any);

    expect(nock.isDone()).toBe(true);
    expect(result).toEqual({
      id: issueId,
      subject: "My issue",
      message: "Please fix me!",
      private: false,
      issuer: {
        name: null,
        membership_id: null,
      },
    });
  });

  it("creates a help desk issue for a membership", async () => {
    const bundle: KontentBundle<IssueInputData> = addInputData(mockBundle, {
      ...rawVariant,
      membership_id: membershipId,
    });

    const api2 = nock("https://api.cobot.me");
    mockSpaceLookup(api2);
    api2
      .post("/issues", {
        data: {
          type: "issues",
          attributes: issueAttributes,
          relationships: {
            space: { data: { id: spaceId, type: "spaces" } },
            issuer: { data: { id: membershipId, type: "memberships" } },
          },
        },
      })
      .reply(201, {
        data: {
          id: issueId,
          type: "issues",
          attributes: issueAttributes,
          relationships: {
            space: { data: { id: spaceId, type: "spaces" } },
            issuer: { data: { id: membershipId, type: "memberships" } },
          },
        },
      });
    api2.get(`/memberships/${membershipId}`).reply(200, {
      data: {
        id: membershipId,
        type: "memberships",
        attributes: { name: "Jane Fonda", company: "Acme Inc" },
      },
    });

    const action = App.creates[IssueAction.key].operation.perform;
    const result = await appTester(action as any, bundle as any);

    expect(nock.isDone()).toBe(true);
    expect(result).toEqual({
      id: issueId,
      subject: "My issue",
      message: "Please fix me!",
      private: false,
      issuer: {
        name: "Jane Fonda",
        membership_id: membershipId,
      },
    });
  });

  it("uses company name when membership name is missing", async () => {
    const bundle: KontentBundle<IssueInputData> = addInputData(mockBundle, {
      ...rawVariant,
      membership_id: membershipId,
    });

    const api2 = nock("https://api.cobot.me");
    mockSpaceLookup(api2);
    api2.post("/issues").reply(201, {
      data: {
        id: issueId,
        type: "issues",
        attributes: issueAttributes,
        relationships: {
          space: { data: { id: spaceId, type: "spaces" } },
          issuer: { data: { id: membershipId, type: "memberships" } },
        },
      },
    });
    api2.get(`/memberships/${membershipId}`).reply(200, {
      data: {
        id: membershipId,
        type: "memberships",
        attributes: { name: null, company: "Acme Inc" },
      },
    });

    const action = App.creates[IssueAction.key].operation.perform;
    const result = await appTester(action as any, bundle as any);

    expect(nock.isDone()).toBe(true);
    expect(result).toEqual({
      id: issueId,
      subject: "My issue",
      message: "Please fix me!",
      private: false,
      issuer: {
        name: "Acme Inc",
        membership_id: membershipId,
      },
    });
  });

  it("throws when the space is not found", async () => {
    const bundle: KontentBundle<IssueInputData> = addInputData(
      mockBundle,
      rawVariant,
    );

    nock("https://api.cobot.me")
      .get("/user?include=adminOf")
      .reply(200, { included: [] });

    const action = App.creates[IssueAction.key].operation.perform;
    await expect(appTester(action as any, bundle as any)).rejects.toThrow(
      "No space found for subdomain trial",
    );
    expect(nock.isDone()).toBe(true);
  });
});

const rawVariant: IssueInputData = {
  subdomain: "trial",
  subject: "My issue",
  message: "Please fix me!",
  private: false,
};
