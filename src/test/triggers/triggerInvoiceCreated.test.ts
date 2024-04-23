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
    const invoiceResponse: InvoiceApiResponse = {
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

    const scope = nock("https://api.cobot.me");
    scope.get("/user?include=adminOf").reply(200, userResponse);
    scope
      .get(/\/spaces\/space-1\/invoices/)
      .reply(200, { data: [invoiceResponse] });

    const listRecentEvents = trigger.operation.performList;

    const results = await appTester(listRecentEvents as any, bundle as any);

    expect(results).toStrictEqual([
      {
        ...attributes,
        id: "1",
        membershipId: "membership-1",
      },
    ]);
  });
});
