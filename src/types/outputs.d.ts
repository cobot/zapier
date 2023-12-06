export type MembershipOutput = {
  id: string;
  name: string | null;
  company: string | null;
  email: string | null;
  customer_number: string | null;
  plan_name: string;
  payment_method_name: string | null;
};

export type BookingOutput = {
  id: string;
  from: string;
  to: string;
  title: string | null;
  resource_name: string;
  price: string;
  currency: string;
  comments: string | null;
  units: number;
  member_name: string | null;
};
