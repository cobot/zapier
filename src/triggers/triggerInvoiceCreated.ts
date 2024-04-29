import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import {
  listRecentInvoices,
  subscribeHook,
  unsubscribeHook,
  getInvoiceFromApi2,
} from "../utils/api";
import { SubscribeBundleInputType } from "../types/subscribeType";
import { getSubdomainField } from "../fields/getSudomainsField";
import { invoiceSample } from "../utils/samples";
import { InvoiceApiResponse } from "../types/api-responses";
import { InvoiceOutput } from "../types/outputs";
import { HookTrigger } from "../types/trigger";
import { apiResponseToInvoiceOutput } from "../utils/api-to-output";

const hookLabel = "Invoice Created";
const event = "created_invoice";

async function subscribeHookExecute(
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
) {
  return subscribeHook(z, bundle, {
    event,
    callback_url: bundle.targetUrl ?? "",
  });
}

async function unsubscribeHookExecute(
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
) {
  const webhook = bundle.subscribeData;
  return unsubscribeHook(z, bundle, webhook?.id ?? "");
}

async function parsePayload(
  z: ZObject,
  bundle: KontentBundle<{}>,
): Promise<InvoiceOutput[]> {
  const invoiceId = bundle.cleanedRequest.url.split("/").pop();
  const api1MembershipUrl =
    new URL(bundle.cleanedRequest.url).origin + "/api/memberships";
  const response = await getInvoiceFromApi2(z, invoiceId, api1MembershipUrl);
  if (response) {
    return [apiResponseToInvoiceOutput(response)];
  } else {
    return [];
  }
}

const trigger: HookTrigger = {
  key: `${event}`,
  noun: hookLabel,
  display: {
    label: hookLabel,
    description: "Triggers when an invoice is created.",
  },
  operation: {
    type: "hook",

    inputFields: [getSubdomainField()],

    performSubscribe: subscribeHookExecute,
    performUnsubscribe: unsubscribeHookExecute,

    perform: parsePayload,
    performList: async (
      z: ZObject,
      bundle: KontentBundle<SubscribeBundleInputType>,
    ): Promise<InvoiceOutput[]> => {
      const invoices = await listRecentInvoices(z, bundle);
      return invoices.map((invoice) => apiResponseToInvoiceOutput(invoice));
    },

    sample: invoiceSample,
  },
};
export default trigger;
