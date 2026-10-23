import { createAppTester } from "zapier-platform-core";
import nock from "nock";
import { addInputData, mockBundle } from "../utils/mockBundle";
import App from "../../index";
import { KontentBundle } from "../../types/kontentBundle";
import getExternalResources from "../../triggers/dropdowns/getExternalResources";
import {
  ExternalResourceApiResponse,
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

const externalResource = (
  id: string,
  name: string,
): ExternalResourceApiResponse => ({
  id,
  type: "externalResources",
  attributes: {
    name,
    resourceType: "room",
    accountingCode: "EXTR",
    costCenter: { name: "External Bookings", number: "MR1" },
    revenueAccount: { name: "External Bookings", number: "4000" },
    pricing: {
      currency: "EUR",
      taxes: [{ rate: "20.0", name: "Tax" }],
      pricePerHour: {
        net: "10.0",
        gross: "12.0",
        currency: "EUR",
        taxes: [{ name: "Tax", rate: "20.0", amount: "1.0" }],
      },
      priceCap: { maximumDuration: { hours: 12, minutes: 30 } },
      priceCaps: [],
      discounts: [],
    },
    rates: [
      {
        unit: "hour",
        cancellationPeriod: 120,
        bookingCutoff: 1,
        minBookingDuration: 10,
        maxBookingDuration: 20,
        pricePerUnit: {
          net: "10.0",
          gross: "12.0",
          currency: "EUR",
          taxes: [{ name: "Tax", rate: "20.0", amount: "2.0" }],
        },
        priceCap: { maximumDuration: { hours: 12, minutes: 30 } },
        discounts: [],
      },
    ],
    cancellationPeriod: 120,
    bookingCutoff: 1,
    effectiveBookingCutoff: 1,
    description: "Large room, fits 12.",
    instructions: "Ring the bell and wait for the door to be opened.",
    minBookingDuration: 10,
    maxBookingDuration: 20,
    capacity: 1,
    area: [
      { unit: "sqm", number: 40 },
      { unit: "sqft", number: 431 },
    ],
    areaPreferredUnit: "sqm",
    color: "#ff0000",
    photo: null,
    bookingTimes: [{ from: "15:00", to: "16:00", weekdays: [1, 2] }],
    bookingsRequireApproval: false,
    payLater: false,
  },
  relationships: {
    space: {
      data: { id: spaceId, type: "spaces" },
    },
    resource: {
      data: { id: "34e3ccee-4eb1-5b1d-b625-5bb34cefe28e", type: "resources" },
    },
    resourceAvailability: {
      links: {
        related: `https://api.cobot.me/resources/${id}/availability`,
      },
    },
    products: {
      data: [{ id: "69efec34ba8df98d29de35cc80d27565", type: "products" }],
    },
  },
});

const resources: ExternalResourceApiResponse[] = [
  externalResource("resource-2", "Phone Booth"),
  externalResource("resource-1", "Meeting Room"),
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

  it("throws an error when subdomain is missing", async () => {
    const action = App.triggers[getExternalResources.key].operation.perform;

    await expect(appTester(action as any, mockBundle as any)).rejects.toThrow(
      "Subdomain is required",
    );
  });

  it("throws an error when the space is not found", async () => {
    const bundle: KontentBundle<{ subdomain: string }> = addInputData(
      mockBundle,
      { subdomain: "unknown" },
    );

    nock("https://api.cobot.me")
      .get("/user?include=adminOf")
      .reply(200, { included: [] });

    const action = App.triggers[getExternalResources.key].operation.perform;

    await expect(appTester(action as any, bundle as any)).rejects.toThrow(
      "No space found for subdomain unknown",
    );
    expect(nock.isDone()).toBe(true);
  });
});
