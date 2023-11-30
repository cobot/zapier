import { Field } from "../fields/field";
import { ElementFields } from "../fields/elements/getItemElementFields";
import { createActivity } from "../utils/api";
import { getSubdomainField } from "../fields/getSudomainsField";

const textField: Field = {
  label: "Text",
  key: "text",
  type: "text",
  required: true,
  helpText:
    "The text to post on the dashboard. Can include html link tags. Other tags are removed. URLs are converted into links.",
};

const levelChoiceField: Field = {
  label: "Level",
  key: "level",
  type: "string",
  choices: [
    { sample: "ERROR", value: "ERROR", label: "ERROR" },
    { sample: "WARN", value: "WARN", label: "WARN" },
  ],
  helpText: "can be ERROR, WARN or empty",
};

const channelMultiChoiceField: Field = {
  label: "Channels",
  key: "channels",
  type: "string",
  choices: [
    { sample: "admin", value: "admin", label: "admin" },
    { sample: "membership", value: "membership", label: "membership" },
  ],
  default: "admin",
  list: true,
  helpText: "Whether to post an activity on the admin or member dashboard.",
};

export default {
  key: "create_activity",
  noun: "Create Activity",

  display: {
    label: "Create Activity",
    description: "Creates an Activity.",
  },

  operation: {
    perform: createActivity,
    inputFields: [
      getSubdomainField(),
      textField,
      levelChoiceField,
      channelMultiChoiceField,
    ],
    sample: {
      created_at: "2013/05/04 12:00:00 +0000",
      type: "text",
      channels: ["admin", "membership"],
      level: "ERROR",
      attributes: {
        text: "Some text about your activity.",
      },
    },
  },
};

export type InputData = Readonly<{
  subdomain: string;
  text: string;
  level: string;
  channels: string[];
}> &
  ElementFields;
