import { createAppTester } from "zapier-platform-core";
import nock from "nock";
import { addInputData, mockBundle } from "../utils/mockBundle";
import App from "../../index";
import { KontentBundle } from "../../types/kontentBundle";
import ChargeAction, {
  InputData as ChargeInputData,
} from "../../creates/charge";
import { ChargeApiResponse, UserApiResponse } from "../../types/api-responses";
import { chargeSample } from "../../utils/samples";

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

const userResponse: UserApiResponse = {
  included: [
    {
      id: "99da6cb66b5e6b39007690854fd66df9",
      attributes: { subdomain: "trial" },
    },
  ],
};

const chargeResponse: ChargeApiResponse = {
  id: "51b8fa71ac8df98d29de357180d274d8",
  type: "charges",
  attributes: {
    description: "Coffee",
    amount: {
      net: "10.5",
      gross: "12.6",
      currency: "EUR",
      taxes: [{ name: "VAT", rate: "20.0", amount: "2.1" }],
    },
    quantity: "2.0",
    accountingCode: "BEV",
    carryOver: false,
    costCenter: { name: "Drinks", number: "CC1" },
    revenueAccount: { name: "Beverages", number: "RA1" },
    chargeAt: "2018-12-15",
  },
  relationships: {
    space: {
      data: { id: "99da6cb66b5e6b39007690854fd66df9", type: "spaces" },
    },
    owner: {
      data: { id: "89da3cb66b5e6b39007690854kd66da4", type: "memberships" },
    },
  },
};

const membershipInput: ChargeInputData = {
  subdomain: "trial",
  membership_id: "32c76cb66b5e6b39007690854fd668a1",
  description: "Coffee",
  amount: 10.5,
  quantity: 2,
  charge_at: "2018-12-15T09:30:00.000Z",
  accounting_code: "BEV",
  carry_over: false,
  cost_center_name: "Drinks",
  cost_center_number: "CC1",
  revenue_account_name: "Beverages",
  revenue_account_number: "RA1",
};

describe("createCharge", () => {
  it("creates a charge for a membership", async () => {
    const bundle: KontentBundle<ChargeInputData> = addInputData(
      mockBundle,
      membershipInput,
    );

    const scope = nock("https://api.cobot.me");
    scope.get("/user?include=adminOf").reply(200, userResponse);
    scope
      .post("/charges", {
        data: {
          type: "charges",
          attributes: {
            description: "Coffee",
            amount: { net: "10.5" },
            quantity: "2",
            chargeAt: "2018-12-15",
            accountingCode: "BEV",
            carryOver: false,
            costCenter: { name: "Drinks", number: "CC1" },
            revenueAccount: { name: "Beverages", number: "RA1" },
          },
          relationships: {
            space: {
              data: { id: "99da6cb66b5e6b39007690854fd66df9", type: "spaces" },
            },
            billable: {
              data: {
                id: "32c76cb66b5e6b39007690854fd668a1",
                type: "memberships",
              },
            },
          },
        },
      })
      .reply(201, { data: chargeResponse });

    const action = App.creates[ChargeAction.key].operation.perform;
    const result = await appTester(action as any, bundle as any);

    expect(nock.isDone()).toBe(true);
    expect(result).toEqual(chargeSample);
  });

  it("creates a charge for a team", async () => {
    const bundle: KontentBundle<ChargeInputData> = addInputData(mockBundle, {
      subdomain: "trial",
      team_id: "team-123",
      description: "Coffee",
      amount: "10.5",
    });

    const teamChargeResponse: ChargeApiResponse = {
      ...chargeResponse,
      attributes: {
        ...chargeResponse.attributes,
        quantity: "1.0",
        accountingCode: null,
        costCenter: null,
        revenueAccount: null,
      },
      relationships: {
        ...chargeResponse.relationships,
        owner: { data: { id: "team-123", type: "teams" } },
      },
    };

    const scope = nock("https://api.cobot.me");
    scope.get("/user?include=adminOf").reply(200, userResponse);
    scope
      .post("/charges", {
        data: {
          type: "charges",
          attributes: {
            description: "Coffee",
            amount: { net: "10.5" },
          },
          relationships: {
            space: {
              data: { id: "99da6cb66b5e6b39007690854fd66df9", type: "spaces" },
            },
            billable: {
              data: { id: "team-123", type: "teams" },
            },
          },
        },
      })
      .reply(201, { data: teamChargeResponse });

    const action = App.creates[ChargeAction.key].operation.perform;
    const result = await appTester(action as any, bundle as any);

    expect(nock.isDone()).toBe(true);
    expect(result).toEqual({
      ...chargeSample,
      quantity: "1.0",
      accountingCode: null,
      costCenterName: null,
      costCenterNumber: null,
      revenueAccountName: null,
      revenueAccountNumber: null,
      ownerId: "team-123",
      ownerType: "teams",
    });
  });

  it("rejects when both membership_id and team_id are set", async () => {
    const bundle: KontentBundle<ChargeInputData> = addInputData(mockBundle, {
      subdomain: "trial",
      membership_id: "membership-1",
      team_id: "team-1",
      description: "Coffee",
      amount: 10.5,
    });

    const action = App.creates[ChargeAction.key].operation.perform;
    await expect(appTester(action as any, bundle as any)).rejects.toThrow(
      "Provide either membership_id or team_id, not both.",
    );
  });

  it("rejects when neither membership_id nor team_id is set", async () => {
    const bundle: KontentBundle<ChargeInputData> = addInputData(mockBundle, {
      subdomain: "trial",
      description: "Coffee",
      amount: 10.5,
    });

    const action = App.creates[ChargeAction.key].operation.perform;
    await expect(appTester(action as any, bundle as any)).rejects.toThrow(
      "Provide either membership_id or team_id, not both.",
    );
  });

  it("omits optional attributes when empty", async () => {
    const bundle: KontentBundle<ChargeInputData> = addInputData(mockBundle, {
      subdomain: "trial",
      membership_id: "32c76cb66b5e6b39007690854fd668a1",
      description: "Coffee",
      amount: 10.5,
      quantity: "",
      charge_at: "",
      accounting_code: "",
      cost_center_name: "Drinks",
      revenue_account_number: "RA1",
    });

    const scope = nock("https://api.cobot.me");
    scope.get("/user?include=adminOf").reply(200, userResponse);
    scope
      .post("/charges", {
        data: {
          type: "charges",
          attributes: {
            description: "Coffee",
            amount: { net: "10.5" },
          },
          relationships: {
            space: {
              data: { id: "99da6cb66b5e6b39007690854fd66df9", type: "spaces" },
            },
            billable: {
              data: {
                id: "32c76cb66b5e6b39007690854fd668a1",
                type: "memberships",
              },
            },
          },
        },
      })
      .reply(201, { data: chargeResponse });

    const action = App.creates[ChargeAction.key].operation.perform;
    await appTester(action as any, bundle as any);

    expect(nock.isDone()).toBe(true);
  });
});
