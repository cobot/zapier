import nock from "nock";

// Jest reuses the same process (and therefore the same http/https modules) for
// multiple test files, so nock's interceptors stack up and stop matching unless
// each file removes its own patches when it is done.
afterAll(() => {
  nock.cleanAll();
  nock.restore();
  nock.enableNetConnect();
});
