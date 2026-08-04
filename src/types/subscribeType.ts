export type SubscribePayloadType = Readonly<{
  event: string;
  callback_url: string;
  notify_existing?: boolean;
}>;

export type SubscribeBundleInputType = Readonly<{
  subdomain: string;
  trigger_for_existing?: boolean;
}>;
