export type SubscribePayloadType = Readonly<{
    event: string;
    callback_url: string;
}>

export type SubscribeBundleInputType = Readonly<{
    subdomain: string;
}>