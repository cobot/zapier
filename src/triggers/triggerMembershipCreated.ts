import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";
import { SubscribeBundleInputType } from "../types/subscribeType";
import { getSubdomainField } from "../fields/getSudomainsField";
import { MembershipOutput } from "../types/outputs";
import { apiResponseToMembershipOutput } from "../utils/api-to-output";
import { membershipSample } from "../utils/samples";

const triggerLabel = "New Membership Signup";

async function performPolling(
  z: ZObject,
  bundle: KontentBundle<SubscribeBundleInputType>,
): Promise<MembershipOutput[]> {
  const url = `https://${bundle.inputData.subdomain}.cobot.me/api/memberships?all=true`;
  const response = await z.request({
    url,
    method: "GET",
  });
  const memberships = response.data;

  // Return only unconfirmed memberships (new signups not yet confirmed)
  const unconfirmedMemberships = memberships.filter(
    (m: any) => m.confirmed_at === null,
  );

  return Promise.all(
    unconfirmedMemberships.map((m: any) =>
      apiResponseToMembershipOutput(m, z),
    ),
  );
}

const trigger = {
  key: "membership_created",
  noun: triggerLabel,
  display: {
    label: triggerLabel,
    description:
      "Triggers when a new membership is created (before confirmation).",
  },
  operation: {
    type: "polling" as const,
    inputFields: [getSubdomainField()],
    perform: performPolling,
    sample: membershipSample,
    outputFields: [
      { key: "id", label: "Membership ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "company", label: "Company" },
      { key: "plan_name", label: "Plan Name" },
      { key: "confirmed_at", label: "Confirmed At" },
    ],
  },
};

export default trigger;