import { KontentBundle } from '../../types/kontentBundle';
import { SubscribeBundleInputType } from '../../types/subscribeType';
import { mockBundle } from './mockBundle';
import * as nock from 'nock';

export const prepareMocksForWebhookSubscribeTest = (event:string) => {
  const bundle: KontentBundle<SubscribeBundleInputType> = {
    ...mockBundle,
    inputData: {
      ...mockBundle.inputData,
      subdomain: 'trial'
    },
    targetUrl: 'https://test-url.test'
  }

  const url = `https://${bundle.inputData.subdomain}.cobot.me/api/subscriptions`

  nock(url).post("", { event, callback_url: bundle.targetUrl })
  .reply(200, {"url": "https://trial.cobot.me/api/event/callback"})

  return bundle;
}
