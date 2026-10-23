import { createAppTester } from "zapier-platform-core";
import nock from "nock";
import { addInputData, mockBundle } from "../utils/mockBundle";
import App from "../../index";
import { KontentBundle } from "../../types/kontentBundle";
import ExternalBookingAction, {
  InputData as ExternalBookingInputData,
} from "../../creates/externalBooking";
import {
  ExternalBookingApiResponse,
  ResourceApiResponse,
} from "../../types/api-responses";
import { externalBookingSample } from "../../utils/samples";

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

const resourceId = "89da3cb66b5e6b39007690854kd66da4";

const resourceResponse: ResourceApiResponse = {
  id: resourceId,
  attributes: {
    name: "Meeting Room",
  },
};

const externalBookingResponse: ExternalBookingApiResponse = {
  id: "d58b612aaa62619aae546dd336587eb2",
  attributes: {
    from: "2012-04-12T12:00:00.000Z",
    to: "2012-04-12T18:00:00.000Z",
    title: "test booking",
    price: {
      net: "10.0",
      gross: "12.0",
      currency: "EUR",
      taxes: [],
    },
    totalPrice: {
      net: "10.0",
      gross: "12.0",
      currency: "EUR",
      taxes: [],
    },
    numberOfVisitors: 3,
    name: "John Doe",
    company: "ACME",
    billingAddress: "123 Main St",
    phone: "(304) 862-4378",
    email: "kofi@jemzahif.gf",
    comments: "coffee please",
    status: "approved",
    accountingCode: "MTR-200",
    bookingExtras: [
      {
        name: "Coffee",
        description: "Hot",
        pricing: {
          amount: {
            net: "1.0",
            gross: "1.2",
            currency: "EUR",
            taxes: [],
          },
          toalAmount: {
            net: "1.0",
            gross: "1.2",
            currency: "EUR",
            taxes: [],
          },
          quantity: "1.0",
          unit: "item",
        },
      },
      {
        name: "Tea",
        description: "Hot",
        pricing: {
          amount: {
            net: "1.0",
            gross: "1.2",
            currency: "EUR",
            taxes: [],
          },
          toalAmount: {
            net: "1.0",
            gross: "1.2",
            currency: "EUR",
            taxes: [],
          },
          quantity: "1.0",
          unit: "item",
        },
      },
    ],
  },
  relationships: {
    resource: {
      data: { id: resourceId },
    },
  },
};

const requiredInput: ExternalBookingInputData = {
  subdomain: "trial",
  resource_id: resourceId,
  from: "2012-04-12T12:00:00.000Z",
  to: "2012-04-12T18:00:00.000Z",
  number_of_visitors: 3,
  accepted_terms: true,
  name: "John Doe",
  email: "kofi@jemzahif.gf",
  billing_address: "123 Main St",
};

describe("createExternalBooking", () => {
  it("creates an external booking without payment fields", async () => {
    const bundle: KontentBundle<ExternalBookingInputData> = addInputData(
      mockBundle,
      {
        ...requiredInput,
        time_unit: "hour",
        title: "test booking",
        company: "ACME",
        phone: "(304) 862-4378",
        comments: "coffee please",
      },
    );

    const scope = nock("https://api.cobot.me");
    scope
      .post("/external_bookings", {
        data: {
          type: "externalBookings",
          attributes: {
            from: "2012-04-12T12:00:00Z",
            to: "2012-04-12T18:00:00Z",
            numberOfVisitors: 3,
            acceptedTerms: true,
            name: "John Doe",
            email: "kofi@jemzahif.gf",
            billingAddress: "123 Main St",
            timeUnit: "hour",
            title: "test booking",
            company: "ACME",
            phone: "(304) 862-4378",
            comments: "coffee please",
          },
          relationships: {
            resource: {
              data: { id: resourceId, type: "externalResources" },
            },
          },
        },
      })
      .reply(201, { data: externalBookingResponse });
    scope
      .get(`/resources/${resourceId}`)
      .reply(200, { data: resourceResponse });

    const action = App.creates[ExternalBookingAction.key].operation.perform;
    const result = await appTester(action as any, bundle as any);

    expect(nock.isDone()).toBe(true);
    expect(result).toEqual(externalBookingSample);
  });

  it("forwards accepted_terms from input", async () => {
    const bundle: KontentBundle<ExternalBookingInputData> = addInputData(
      mockBundle,
      {
        ...requiredInput,
        accepted_terms: false,
      },
    );

    const scope = nock("https://api.cobot.me");
    scope
      .post("/external_bookings", {
        data: {
          type: "externalBookings",
          attributes: {
            from: "2012-04-12T12:00:00Z",
            to: "2012-04-12T18:00:00Z",
            numberOfVisitors: 3,
            acceptedTerms: false,
            name: "John Doe",
            email: "kofi@jemzahif.gf",
            billingAddress: "123 Main St",
          },
          relationships: {
            resource: {
              data: { id: resourceId, type: "externalResources" },
            },
          },
        },
      })
      .reply(201, { data: externalBookingResponse });
    scope
      .get(`/resources/${resourceId}`)
      .reply(200, { data: resourceResponse });

    const action = App.creates[ExternalBookingAction.key].operation.perform;
    await appTester(action as any, bundle as any);

    expect(nock.isDone()).toBe(true);
  });

  it("includes optional discount and admin comments", async () => {
    const bundle: KontentBundle<ExternalBookingInputData> = addInputData(
      mockBundle,
      {
        ...requiredInput,
        admin_comments: "make sure to air the room before",
        tax_id: "123456789A",
        discount_id: "e6a53fb4a996cfa147e174e265edc5e0",
      },
    );

    const scope = nock("https://api.cobot.me");
    scope
      .post("/external_bookings", {
        data: {
          type: "externalBookings",
          attributes: {
            from: "2012-04-12T12:00:00Z",
            to: "2012-04-12T18:00:00Z",
            numberOfVisitors: 3,
            acceptedTerms: true,
            name: "John Doe",
            email: "kofi@jemzahif.gf",
            billingAddress: "123 Main St",
            taxId: "123456789A",
            adminComments: "make sure to air the room before",
          },
          relationships: {
            resource: {
              data: { id: resourceId, type: "externalResources" },
            },
            discount: {
              data: {
                id: "e6a53fb4a996cfa147e174e265edc5e0",
                type: "discountCodes",
              },
            },
          },
        },
      })
      .reply(201, { data: externalBookingResponse });
    scope
      .get(`/resources/${resourceId}`)
      .reply(200, { data: resourceResponse });

    const action = App.creates[ExternalBookingAction.key].operation.perform;
    await appTester(action as any, bundle as any);

    expect(nock.isDone()).toBe(true);
  });

  it("omits optional attributes when empty", async () => {
    const bundle: KontentBundle<ExternalBookingInputData> = addInputData(
      mockBundle,
      {
        ...requiredInput,
        time_unit: "",
        title: "",
        company: "",
        phone: "",
        tax_id: "",
        comments: "",
        admin_comments: "",
        discount_id: "",
      },
    );

    const scope = nock("https://api.cobot.me");
    scope
      .post("/external_bookings", {
        data: {
          type: "externalBookings",
          attributes: {
            from: "2012-04-12T12:00:00Z",
            to: "2012-04-12T18:00:00Z",
            numberOfVisitors: 3,
            acceptedTerms: true,
            name: "John Doe",
            email: "kofi@jemzahif.gf",
            billingAddress: "123 Main St",
          },
          relationships: {
            resource: {
              data: { id: resourceId, type: "externalResources" },
            },
          },
        },
      })
      .reply(201, { data: externalBookingResponse });
    scope
      .get(`/resources/${resourceId}`)
      .reply(200, { data: resourceResponse });

    const action = App.creates[ExternalBookingAction.key].operation.perform;
    await appTester(action as any, bundle as any);

    expect(nock.isDone()).toBe(true);
  });

  it("sends dates when time unit is day", async () => {
    const bundle: KontentBundle<ExternalBookingInputData> = addInputData(
      mockBundle,
      {
        ...requiredInput,
        from: "2018-01-01T12:00:00.000Z",
        to: "2018-01-02T18:00:00.000Z",
        time_unit: "day",
        number_of_visitors: "1",
      },
    );

    const dayBookingResponse: ExternalBookingApiResponse = {
      ...externalBookingResponse,
      attributes: {
        ...externalBookingResponse.attributes,
        from: "2018-01-01",
        to: "2018-01-02",
        numberOfVisitors: 1,
      },
    };

    const scope = nock("https://api.cobot.me");
    scope
      .post("/external_bookings", {
        data: {
          type: "externalBookings",
          attributes: {
            from: "2018-01-01",
            to: "2018-01-02",
            numberOfVisitors: 1,
            acceptedTerms: true,
            name: "John Doe",
            email: "kofi@jemzahif.gf",
            billingAddress: "123 Main St",
            timeUnit: "day",
          },
          relationships: {
            resource: {
              data: { id: resourceId, type: "externalResources" },
            },
          },
        },
      })
      .reply(201, { data: dayBookingResponse });
    scope
      .get(`/resources/${resourceId}`)
      .reply(200, { data: resourceResponse });

    const action = App.creates[ExternalBookingAction.key].operation.perform;
    const result = await appTester(action as any, bundle as any);

    expect(nock.isDone()).toBe(true);
    expect(result).toEqual({
      ...externalBookingSample,
      from: "2018-01-01",
      to: "2018-01-02",
      number_of_visitors: 1,
    });
  });

  it("rejects a missing resource id", async () => {
    const bundle: KontentBundle<ExternalBookingInputData> = addInputData(
      mockBundle,
      {
        ...requiredInput,
        resource_id: "  ",
      },
    );

    const action = App.creates[ExternalBookingAction.key].operation.perform;
    await expect(appTester(action as any, bundle as any)).rejects.toThrow(
      "Resource ID is required.",
    );
  });

  it("rejects an invalid visitor count", async () => {
    const bundle: KontentBundle<ExternalBookingInputData> = addInputData(
      mockBundle,
      {
        ...requiredInput,
        number_of_visitors: 0,
      },
    );

    const action = App.creates[ExternalBookingAction.key].operation.perform;
    await expect(appTester(action as any, bundle as any)).rejects.toThrow(
      "Number of visitors must be at least 1.",
    );
  });
});
