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

const membershipIdField: Field = {
  label: "Membership ID",
  key: "membership_id",
  type: "string",
  helpText:
    "Membership to create the issue for. If empty, the issue is created as the connected admin.",
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
      membershipIdField,
      subjectField,
      messageField,
      privateField,
    ],
    sample: {
      id: "5fdf75523b35335eab45adc72038cf51",
      issuer: {
        name: "Jane Fonda",
        membership_id: "32c76cb66b5e6b39007690854fd668a1",
      },
      subject: "My issue",
      message: "Please fix me!",
      private: false,
    },
  },
};

export type InputData = Readonly<{
  subdomain: string;
  subject: string;
  message: string;
  private: boolean;
  membership_id?: string;
}> &
  ElementFields;
