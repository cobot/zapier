export function apiResponseToMembershipOutput(
  membership: MembershipApiResponse,
): MembershipOutput {
  return {
    id: membership.id,
    name: membership.name,
    email: membership.email,
    company: membership.address.company,
    customer_number: membership.customer_number,
    plan_name: membership.plan.name,
    payment_method_name: membership.payment_method?.name ?? null,
  };
}
