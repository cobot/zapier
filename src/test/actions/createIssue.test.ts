import { createAppTester } from "zapier-platform-core";
import nock from "nock";
import { addInputData, mockBundle } from "../utils/mockBundle";
import App from "../../index";
import { KontentBundle } from "../../types/kontentBundle";
import IssueAction, { InputData as IssueInputData } from "../../creates/issue";

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

describe("createIssue", () => {
  it("creates a help desk issue", async () => {
    const bundle: KontentBundle<IssueInputData> = addInputData(
      mockBundle,
      rawVariant,
    );

    const url = `https://${bundle.inputData.subdomain}.cobot.me/api/issues`;
    nock(url)
      .post("", {
        subject: bundle.inputData.subject,
        message: bundle.inputData.message,
        private: bundle.inputData.private,
      })
      .reply(201, {
        id: "5fdf75523b35335eab45adc72038cf51",
        issuer: {
          name: "Anna Admin",
          user_id: "5fdf75523b35335eab45adc72038ed10",
          membership_id: null,
        },
        subject: "My issue",
        message: "Please fix me!",
        private: false,
        created_at: "2016/05/04 12:00:00 +0000",
        closed: false,
      });

    const action = App.creates[IssueAction.key].operation.perform;
    const result = await appTester(action as any, bundle as any);

    expect(result).toEqual({
      id: "5fdf75523b35335eab45adc72038cf51",
      issuer: {
        name: "Anna Admin",
        user_id: "5fdf75523b35335eab45adc72038ed10",
        membership_id: null,
      },
      subject: "My issue",
      message: "Please fix me!",
      private: false,
      created_at: "2016-05-04T12:00:00.000Z",
      closed: false,
    });
  });
});

const rawVariant: IssueInputData = {
  subdomain: "trial",
  subject: "My issue",
  message: "Please fix me!",
  private: false,
};
