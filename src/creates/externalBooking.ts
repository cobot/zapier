import { Field } from "../fields/field";
import { ElementFields } from "../fields/elements/getItemElementFields";
import { getSubdomainField } from "../fields/getSudomainsField";
import { createExternalBooking } from "../utils/api";
import { externalBookingSample } from "../utils/samples";

const resourceIdField: Field = {
  label: "Resource ID",
  key: "resource_id",
  type: "string",
  required: true,
  dynamic: "get_external_resources.id.name",
  helpText: "Resource enabled for external booking.",
};

const fromField: Field = {
  label: "From",
  key: "from",
  type: "datetime",
  required: true,
  helpText: "Start of the booking. Use a date when Time Unit is Day.",
};

const toField: Field = {
  label: "To",
  key: "to",
  type: "datetime",
  required: true,
  helpText: "End of the booking. Use a date when Time Unit is Day.",
};

const timeUnitField: Field = {
  label: "Time Unit",
  key: "time_unit",
  type: "string",
  choices: [
    { sample: "hour", value: "hour", label: "Hour" },
    { sample: "day", value: "day", label: "Day" },
  ],
  default: "hour",
  helpText: "Hourly or daily pricing. Defaults to Hour.",
};

const numberOfVisitorsField: Field = {
  label: "Number of Visitors",
  key: "number_of_visitors",
  type: "number",
  required: true,
  default: "1",
};

const titleField: Field = {
  label: "Title",
  key: "title",
  type: "string",
};

const nameField: Field = {
  label: "Name",
  key: "name",
  type: "string",
  required: true,
};

const companyField: Field = {
  label: "Company",
  key: "company",
  type: "string",
};

const emailField: Field = {
  label: "Email",
  key: "email",
  type: "string",
  required: true,
};

const phoneField: Field = {
  label: "Phone",
  key: "phone",
  type: "string",
};

const billingAddressField: Field = {
  label: "Billing Address",
  key: "billing_address",
  type: "text",
  required: true,
};

const taxIdField: Field = {
  label: "Tax ID",
  key: "tax_id",
  type: "string",
};

const commentsField: Field = {
  label: "Comments",
  key: "comments",
  type: "text",
};

const adminCommentsField: Field = {
  label: "Admin Comments",
  key: "admin_comments",
  type: "text",
};

const discountIdField: Field = {
  label: "Discount ID",
  key: "discount_id",
  type: "string",
  helpText: "Optional discount code ID to apply to the booking.",
};

export default {
  key: "create_external_booking",
  noun: "External Booking",

  display: {
    label: "Create External Booking",
    description: "Creates an external booking for a visitor (non-member).",
  },

  operation: {
    perform: createExternalBooking,
    inputFields: [
      getSubdomainField({ altersDynamicFields: true }),
      resourceIdField,
      fromField,
      toField,
      timeUnitField,
      numberOfVisitorsField,
      titleField,
      nameField,
      companyField,
      emailField,
      phoneField,
      billingAddressField,
      taxIdField,
      commentsField,
      adminCommentsField,
      discountIdField,
    ],
    sample: externalBookingSample,
  },
};

export type InputData = Readonly<{
  subdomain: string;
  resource_id: string;
  from: string;
  to: string;
  time_unit?: string;
  number_of_visitors: number | string;
  title?: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  billing_address: string;
  tax_id?: string;
  comments?: string;
  admin_comments?: string;
  discount_id?: string;
}> &
  ElementFields;
