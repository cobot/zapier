import { ExternalBookingStatus, BaseInvoiceProperties } from "./api-responses";

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

export type EventOutput = {
  id: string;
  title: string;
  from: string;
  to: string;
  description: string | null;
  tags: string[];
  video_url: string | null;
  capacity: number | null;
  public_url: string | null;
  audience: "membersOnly" | "public";
  color: string;
  image_url: string | null;
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
  confirmed_at: string | null;
  canceled_to?: string;
};

export type InvoiceMembershipOutput = {
  id: string;
  email: string | null;
};

export type InvoiceContactOutput = {
  id: string;
  email: string | null;
  name: string | null;
};

export type InvoiceOutput = BaseInvoiceProperties & {
  id: string;
  membership?: InvoiceMembershipOutput;
  contact?: InvoiceContactOutput;
};
