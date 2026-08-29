import { Field } from "../fields/field";
import { ElementFields } from "../fields/elements/getItemElementFields";
import { getSubdomainField } from "../fields/getSudomainsField";
import { createCharge } from "../utils/api";
import { chargeSample } from "../utils/samples";

const membershipIdField: Field = {
  label: "Membership ID",
  key: "membership_id",
  type: "string",
  helpText: "Charge a membership. Provide this or Team ID, not both.",
};

const teamIdField: Field = {
  label: "Team ID",
  key: "team_id",
  type: "string",
  helpText: "Charge a team. Provide this or Membership ID, not both.",
};

const descriptionField: Field = {
  label: "Description",
  key: "description",
  type: "string",
  required: true,
};

const amountField: Field = {
  label: "Amount",
  key: "amount",
  type: "number",
  required: true,
  helpText: "Net amount to charge.",
};

const quantityField: Field = {
  label: "Quantity",
  key: "quantity",
  type: "number",
};

const chargeAtField: Field = {
  label: "Charge At",
  key: "charge_at",
  type: "datetime",
  helpText: "Date the charge should be billed. Defaults to today.",
};

const accountingCodeField: Field = {
  label: "Accounting Code",
  key: "accounting_code",
  type: "string",
};

const carryOverField: Field = {
  label: "Carry Over",
  key: "carry_over",
  type: "boolean",
  default: "false",
  helpText:
    "Whether a negative charge remains available as credit until it is fully applied.",
};

const costCenterNameField: Field = {
  label: "Cost Center Name",
  key: "cost_center_name",
  type: "string",
};

const costCenterNumberField: Field = {
  label: "Cost Center Number",
  key: "cost_center_number",
  type: "string",
};

const revenueAccountNameField: Field = {
  label: "Revenue Account Name",
  key: "revenue_account_name",
  type: "string",
};

const revenueAccountNumberField: Field = {
  label: "Revenue Account Number",
  key: "revenue_account_number",
  type: "string",
};

export default {
  key: "create_charge",
  noun: "Create Charge",

  display: {
    label: "Create Charge",
    description: "Creates a charge for a membership or team.",
  },

  operation: {
    perform: createCharge,
    inputFields: [
      getSubdomainField(),
      membershipIdField,
      teamIdField,
      descriptionField,
      amountField,
      quantityField,
      chargeAtField,
      accountingCodeField,
      carryOverField,
      costCenterNameField,
      costCenterNumberField,
      revenueAccountNameField,
      revenueAccountNumberField,
    ],
    sample: chargeSample,
  },
};

export type InputData = Readonly<{
  subdomain: string;
  membership_id?: string;
  team_id?: string;
  description: string;
  amount: number | string;
  quantity?: number | string;
  charge_at?: string;
  accounting_code?: string;
  carry_over?: boolean;
  cost_center_name?: string;
  cost_center_number?: string;
  revenue_account_name?: string;
  revenue_account_number?: string;
}> &
  ElementFields;
