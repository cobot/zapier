import { ExternalBookingStatus } from "./api-responses";

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

export type ExternalBookingOutput = {
  id: string;
  from: string;
  to: string;
  title: string | null;
  resource_name: string;
  net_price: string;
  gross_price: string;
  currency: string;
  comments: string | null;
  number_of_visitors: number;
  name: string | null;
  company: string | null;
  email: string;
  phone: string | null;
  status: ExternalBookingStatus;
  billing_address: string;
  extra_names: string | null;
};

export type MembershipOutput = {
  id: string;
  name: string | null;
  company: string | null;
  email: string | null;
  customer_number: string | null;
  plan_name: string;
  payment_method_name: string | null;
};
