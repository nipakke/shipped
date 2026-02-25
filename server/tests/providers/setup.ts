import nock from "nock";
import { isCI } from "std-env";
import { afterEach, beforeAll, afterAll } from "vitest";

const fixturesDir = `${import.meta.dirname}/fixtures`;
nock.back.fixtures = fixturesDir;

// Use lockdown mode in CI (must use recorded fixtures), record mode locally. only update if we delete fixtures
nock.back.setMode(isCI ? "lockdown" : "record");

beforeAll(() => {
  nock.disableNetConnect();
  nock.enableNetConnect("127.0.0.1");
});

afterEach(() => {
  nock.cleanAll();
});

afterAll(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});