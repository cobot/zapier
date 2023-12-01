# Cobot Zapier Integration

This is an integration between cobot.me and zapier.com.

It is based on the [Zapier platform CLI](https://github.com/zapier/zapier-platform/tree/main/packages/cli).

## Contributing

Contributions are very welcome. Please open a pull request to get your code merged.

To add additional triggers/creates, take a look at the [existing triggers](https://github.com/cobot/zapier/tree/main/src/triggers) and at:

- [Cobot webhooks documentation](https://dev.cobot.me/api-docs/webhooks-api)
- [Cobot API docs](https://dev.cobot.me/api-docs)
- [Zapier Platform CLI docs](https://platform.zapier.com/reference/cli-docs)

For a contribution to be merged, it needs to have a test (see `src/test`) and the existing tests need to be passing.

## Commands

```bash

# Run tests
yarn test

# compile TS to JS
yarn build

# Run Zapier validations
yarn validate

# Push to Zapier
yarn push
```
