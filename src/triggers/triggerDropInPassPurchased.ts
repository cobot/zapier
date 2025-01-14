import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import {
  apiCallUrl,
  subscribeHook,
  unsubscribeHook,
  listRecentDropInPasses,
} from "../utils/api";
import { SubscribeBundleInputType } from "../types/subscribeType";
import { getSubdomainField } from "../fields/getSudomainsField";
import { dropInPassSample } from "../utils/samples";
import { DropInPassOutput } from "../types/outputs";
import { DropInPassApiResponse } from "../types/api-responses";
import { apiResponseToDropInPassOutput } from "../utils/api-to-output";
import { HookTrigger } from "../types/trigger";

const hookLabel = "Drop in Pass Purchased";
const event = "created_drop_in_pass";

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
): Promise<DropInPassOutput[]> {
  if (bundle.cleanedRequest) {
    const dropInPass = (
      await apiCallUrl(z, bundle.cleanedRequest.url, {
        Accept: "application/vnd.api+json",
      })
    ).data as DropInPassApiResponse;
    return [apiResponseToDropInPassOutput(dropInPass)];
  } else {
    return [];
  }
}

const trigger: HookTrigger = {
  key: event,
  noun: hookLabel,
  display: {
    label: hookLabel,
    description: "Triggers when an user has bought a drop in pass",
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
    ): Promise<DropInPassOutput[]> => {
      const dropInPasses = await listRecentDropInPasses(z, bundle);
      return dropInPasses.map(apiResponseToDropInPassOutput);
    },

    sample: dropInPassSample,
  },
};
export default trigger;
