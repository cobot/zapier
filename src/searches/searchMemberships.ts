import { Bundle, SearchPerform, ZObject } from "zapier-platform-core";
import { Field } from "../fields/field";
import { getSubdomainField } from "../fields/getSudomainsField";
import { spaceForSubdomain, searchMemberships } from "../utils/api";
import { apiResponseToMembershipApi2Output } from "../utils/api-to-output";
import { membershipApi2Sample } from "../utils/samples";
import { MembershipApi2Output } from "../types/outputs";

const queryField: Field = {
  label: "Search",
  key: "query",
  type: "string",
  required: true,
  helpText: "Searches membership names, company and emails.",
};

const perform: SearchPerform<
  { subdomain: string; query: string },
  MembershipApi2Output
> = async (z: ZObject, bundle: Bundle<InputData>) => {
  const space = await spaceForSubdomain(z, bundle.inputData.subdomain);
  if (!space) {
    throw new Error(
      `No space found for subdomain ${bundle.inputData.subdomain}`,
    );
  }

  const memberships = await searchMemberships(
    z,
    space.id,
    bundle.inputData.query,
  );
  return memberships.map(apiResponseToMembershipApi2Output);
};

export default {
  key: "search_memberships",
  noun: "Membership",

  display: {
    label: "Find Membership",
    description: "Finds a membership by name, company or email.",
  },

  operation: {
    perform,
    inputFields: [getSubdomainField(), queryField],
    sample: membershipApi2Sample,
  },
};

export type InputData = Readonly<{
  subdomain: string;
  query: string;
}>;
