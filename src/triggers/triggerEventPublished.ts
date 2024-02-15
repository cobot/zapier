import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import {
  apiCallUrl,
  listRecentEvents,
  subscribeHook,
  unsubscribeHook,
} from "../utils/api";
import { SubscribeBundleInputType } from "../types/subscribeType";
import { getSubdomainField } from "../fields/getSudomainsField";
import { EventOutput } from "../types/outputs";
import { EventApiResponse } from "../types/api-responses";
import { apiResponseToEventOutput } from "../utils/api-to-output";
import { eventSample } from "../utils/samples";
import { HookTrigger, Trigger } from "../types/trigger";

const hookLabel = "Event Published";
const event = "published_event";

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
): Promise<EventOutput[]> {
  if (bundle.cleanedRequest) {
    const event = (await apiCallUrl(
      z,
      bundle.cleanedRequest.url,
    )) as EventApiResponse;
    return [apiResponseToEventOutput(event)];
  } else {
    return [];
  }
}

const trigger: HookTrigger = {
  key: event,
  noun: hookLabel,
  display: {
    label: hookLabel,
    description: "Triggers when an admin publishes an event.",
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
    ): Promise<EventOutput[]> => {
      const apiEvents = await listRecentEvents(z, bundle);
      return apiEvents.map((e: EventApiResponse) =>
        apiResponseToEventOutput(e),
      );
    },
    sample: eventSample,
  },
};
export default trigger;
