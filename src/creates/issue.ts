import { Field } from "../fields/field";
import { ElementFields } from "../fields/elements/getItemElementFields";
import { getSubdomainField } from "../fields/getSudomainsField";
import { createIssue } from "../utils/api";

const subjectField: Field = {
  label: "Subject",
  key: "subject",
  type: "string",
  required: true,
};

const messageField: Field = {
  label: "Message",
  key: "message",
  type: "text",
  required: true,
};

const privateField: Field = {
  label: "Private",
  key: "private",
  type: "boolean",
  default: "false",
  helpText: "Whether the issue is visible only to space administrators.",
};

export default {
  key: "create_issue",
  noun: "Create Help Desk Issue",

  display: {
    label: "Create Help Desk Issue",
    description: "Creates a help desk issue.",
  },

  operation: {
    perform: createIssue,
    inputFields: [
      getSubdomainField(),
      subjectField,
      messageField,
      privateField,
    ],
    sample: {
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
    },
  },
};

export type InputData = Readonly<{
  subdomain: string;
  subject: string;
  message: string;
  private: boolean;
}> &
  ElementFields;
