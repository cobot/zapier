export type MembershipApiResponse = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  picture: string;
  address: {
    company: string | null;
    name: string | null;
    full_address: string | null;
  };
  customer_number: string | null;
  plan: {
    name: string;
  };
  payment_method: {
    name: string;
  } | null;
  starts_at: string;
  canceled_at: string | null;
};
