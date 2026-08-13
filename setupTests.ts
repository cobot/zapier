import * as zapier from "zapier-platform-core";
import nock from "nock";

zapier.tools.env.inject(".env.tests");

// nock patches the http/https modules, so each test file removes its own
// patches when it is done to keep interceptors from leaking between files.
afterAll(() => {
  nock.cleanAll();
  nock.restore();
  nock.enableNetConnect();
});
