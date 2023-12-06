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

export type BookingApiResponse = {
  id: string;
  from: string;
  to: string;
  title: string | null;
  resource: {
    name: string;
    id: string;
  };
  membership: {
    id: string;
    name: string;
  } | null;
  comments: string | null;
  price: number;
  currency: string;
  units: number;
};
