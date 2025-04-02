import { createAppTester } from "zapier-platform-core";
import * as nock from "nock";
import App from "../../index";
import {
  prepareBundle,
  prepareMocksForWebhookSubscribeTest,
} from "../utils/prepareMocksForWebhookSubscribeTest";
import triggerInvoiceCreated from "../../triggers/triggerInvoiceCreated";
import { HookTrigger } from "../../types/trigger";
import {
  UserApiResponse,
  InvoiceApiResponse,
  BaseInvoiceProperties,
} from "../../types/api-responses";

const attributes: BaseInvoiceProperties = {
  invoiceDate: "2024-12-20T06:22:29+01:00",
  paidStatus: "paid",
  dueDate: "2024-12-30T08:22:29+01:00",
  number: "1",
  sentStatus: "sent",
  taxIdName: "taxIdName",
  canCharge: true,
  recipientAddress: {
    company: "company",
    name: "name",
    fullAddress: "fullAddress",
  },
  senderAddress: {
    company: "company",
    name: "name",
    fullAddress: "fullAddress",
  },
  billingEmails: ["kokpospi@fe.az"],
  items: [
    {
      description: "item 1",
      quantity: "1",
      paid: true,
      accountingCode: null,
      amount: {
        net: "100",
        gross: "100",
        currency: "EUR",
        taxes: [],
      },
      totalAmount: {
        net: "100",
        gross: "100",
        currency: "EUR",
        taxes: [],
      },
    },
  ],
  payableAmount: "100",
  paidAmount: "100",
  totalAmount: {
    net: "100",
    gross: "100",
    currency: "EUR",
    taxes: [],
  },
  invoiceText: "invoiceText",
  paidDate: "2024-12-22T06:22:29+01:00",
  taxId: null,
  chargeAt: null,
  customerNumber: null,
  notes: null,
};

const invoiceResponseWithMembership: InvoiceApiResponse = {
  id: "1",
  attributes,
  relationships: {
    membership: {
      data: {
        id: "membership-1",
      },
    },
  },
};

const invoiceResponseWithContact: InvoiceApiResponse = {
  id: "1",
  attributes,
  relationships: {
    contact: {
      data: {
        id: "contact-1",
      },
    },
  },
};

const membership = {
  id: "membership-1",
  email: "test@best.com",
};

const contact = {
  data: {
    id: "contact-1",
    attributes: {
      email: "contact@best.com",
      address: {
        name: "Joe Doe",
      },
    },
  },
};

const appTester = createAppTester(App);
nock.disableNetConnect();
const trigger = App.triggers[triggerInvoiceCreated.key] as HookTrigger;

afterEach(() => nock.cleanAll());

describe("triggerInvoiceCreated", () => {
  it("creates new webhook through CM API upon subscribe", async () => {
    const bundle = prepareMocksForWebhookSubscribeTest(
      triggerInvoiceCreated.key,
    );
    const subscribe = trigger.operation.performSubscribe;

    const result = await appTester(subscribe as any, bundle as any);

    expect(result).toMatchInlineSnapshot(`
{
  "url": "https://trial.cobot.me/api/event/callback",
}
`);
  });

  it("lists recent invoices", async () => {
    const bundle = prepareBundle();
    const userResponse: UserApiResponse = {
      included: [{ id: "space-1", attributes: { subdomain: "trial" } }],
    };
    const api2Scope = nock("https://api.cobot.me");
    const api1Scope = nock("https://trial.cobot.me");
    api2Scope.get("/user?include=adminOf").reply(200, userResponse);
    api1Scope.get("/api/memberships/membership-1").reply(200, membership);
    api2Scope
      .get(/\/spaces\/space-1\/invoices/)
      .reply(200, { data: [invoiceResponseWithMembership] });

    const listRecentEvents = trigger.operation.performList;

    const results = await appTester(listRecentEvents as any, bundle as any);
    expect(nock.isDone()).toBe(true);
    expect(results).toStrictEqual([
      {
        ...attributes,
        billingEmails: "kokpospi@fe.az",
        id: "1",
        membership: {
          id: "membership-1",
          email: "test@best.com",
        },
      },
    ]);
  });

  it("triggers on new invoice", async () => {
    const bundle = prepareBundle();
    const api1Scope = nock("https://trial.cobot.me");
    const api2Scope = nock("https://api.cobot.me");
    api2Scope
      .get("/invoices/12345")
      .reply(200, { data: invoiceResponseWithContact });
    api2Scope.get("/contacts/contact-1").reply(200, contact);
    const results = await appTester(
      triggerInvoiceCreated.operation.perform as any,
      bundle as any,
    );

    expect(nock.isDone()).toBe(true);

    expect(results).toStrictEqual([
      {
        ...attributes,
        billingEmails: "kokpospi@fe.az",
        id: "1",
        contact: {
          id: "contact-1",
          email: "contact@best.com",
          name: "Joe Doe",
        },
      },
    ]);
  });
});
