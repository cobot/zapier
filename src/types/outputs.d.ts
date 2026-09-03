import {
  ExternalBookingStatus,
  Address,
  InvoiceItem,
  Amount,
  AllocationAllocateeType,
  ChargeBillableType,
} from "./api-responses";

export type BookingOutput = {
  id: string;
  units: number;
  from: string;
  to: string;
  title: string | null;
  resource_name: string;
  price: string;
  currency: string;
  comments: string | null;
  member_name: string | null;
  member_email: string | null;
  attendee_list: string[];
  attendees_message: string | null;
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
  accounting_code: string | null;
};

export type MembershipOutput = {
  id: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  address: {
    full_address: string | null;
    address: string | null;
    city: string | null;
    post_code: string | null;
    state: string | null;
    country: string | null;
  };
  email: string | null;
  customer_number: string | null;
  plan_name: string;
  plan: {
    description: string | null;
    total_price_per_cycle: string;
    cycle_duration: number;
    currency: string | null;
    cancellation_period: number | null;
    accounting_code: string | null;
  };
  payment_method_name: string | null;
  confirmed_at: string | null;
  canceled_to?: string;
  team: {
    id: string | null;
    name: string | null;
  };
};

export type InvoiceMembershipOutput = { id: string; email: string | null };

export type InvoiceContactOutput = {
  id: string;
  email: string | null;
  name: string | null;
};

export type InvoiceOutput = {
  id: string;
  invoiceText: string | null;
  invoiceDate: string;
  paidDate: string | null;
  paidStatus: "unpaid" | "paid" | "pending" | "canceled" | "writtenOff";
  dueDate: string;
  number: string;
  sentStatus: "sent" | "sending" | "unsent" | "failedToSend";
  taxId: string | null;
  taxIdName: string;
  chargeAt: string | null;
  canCharge: boolean;
  customerNumber: string | null;
  recipientAddress: Address;
  billingEmails: string | null;
  senderAddress: Address;
  notes: string | null;
  items: InvoiceItem[];
  payableAmount: string;
  paidAmount: string;
  totalAmount: Amount;
  membership?: InvoiceMembershipOutput;
  contact?: InvoiceContactOutput;
};

export type DropInPassOutput = {
  id: string;
  dropInPassName: string;
  validOn: string;
  email: string;
  phone: string;
  taxId: string;
  grossPrice: string;
  netPrice: string;
  comments: string;
  billingAddress: {
    name: string | null;
    company: string | null;
    fullAddress: string | null;
  };
};

export type ResourceOutput = {
  id: string;
  name: string;
  resourceType: "room" | "desk" | "other" | null;
  usage: "bookable" | "allocatable" | null;
  description: string | null;
  capacity: number | null;
  units: number | null;
  hidden: boolean | null;
  color: string | null;
  accountingCode: string | null;
  photoUrl: string | null;
};

export type ResourceDeletedOutput = {
  id: string;
};

export type AllocationOutput = {
  id: string;
  startsAt: string;
  canceledTo: string | null;
  cycleDuration: number;
  minimumCommitment: number;
  recurringMinimumCommitment: boolean;
  cancellationPeriod: number | null;
  pricePerCycle: Amount;
  resource: {
    id: string;
    name: string | null;
  };
  allocatee: {
    id: string;
    type: AllocationAllocateeType;
    name: string | null;
    email: string | null;
  } | null;
};

export type AllocationDeletedOutput = {
  id: string;
};

export type IssueOutput = {
  id: string;
  subject: string;
  message: string;
  private: boolean;
  issuer: {
    name: string | null;
    membership_id: string | null;
  };
}

export type ChargeOutput = {
  id: string;
  description: string;
  quantity: string;
  chargeAt: string;
  carryOver: boolean;
  accountingCode: string | null;
  net: string;
  gross: string;
  currency: string;
  costCenterName: string | null;
  costCenterNumber: string | null;
  revenueAccountName: string | null;
  revenueAccountNumber: string | null;
  spaceId: string;
  ownerId: string;
  ownerType: ChargeBillableType;
};
