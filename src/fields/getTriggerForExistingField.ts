import { Field } from "./field";

export const getTriggerForExistingField = (noun: string): Field => ({
  label: "Trigger for existing",
  key: "trigger_for_existing",
  type: "string",
  required: false,
  default: "No",
  choices: [
    { sample: "Yes", value: "Yes", label: "Yes" },
    { sample: "No", value: "No", label: "No" },
  ],
  helpText: `When enabled, immediately trigger for each ${noun} that already exists in the space.`,
});
