import { ZObject } from "zapier-platform-core";
import { Field } from "../fields/field";
import { KontentBundle } from "./kontentBundle";
import { SubscribeBundleInputType } from "./subscribeType";

export type HookOperation = {
  type: "hook";
  inputFields: Field[];
  performSubscribe: (
    z: ZObject,
    bundle: KontentBundle<SubscribeBundleInputType>,
  ) => Promise<unknown>;
  performUnsubscribe: (
    z: ZObject,
    bundle: KontentBundle<SubscribeBundleInputType>,
  ) => Promise<unknown>;
  perform: (z: ZObject, bundle: KontentBundle<{}>) => Promise<unknown>;
  performList: (
    z: ZObject,
    bundle: KontentBundle<SubscribeBundleInputType>,
  ) => Promise<unknown>;
  sample: unknown;
};

export type PollingOperation = {
  type: "polling";
  perform: (z: ZObject, bundle: KontentBundle<{}>) => unknown;
  sample: unknown;
  outputFields: ReadonlyArray<Field>;
};

type Trigger = Readonly<{
  key: string;
  noun: string;
  display: {
    label: string;
    description: string;
    hidden?: boolean;
  };
}>;

export type HookTrigger = Trigger & { operation: HookOperation };
export type PollingTrigger = Trigger & { operation: PollingOperation };
