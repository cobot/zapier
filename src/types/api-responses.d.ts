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

type Amount = {
  net: string;
  gross: string;
  currency: string;
  taxes: {
    name: string;
    amount: string;
    rate: string;
  }[];
};

type PhotoItem = {
  url: string;
  width: number;
  height: number;
};

type Photo = {
  icon: PhotoItem;
  default: PhotoItem;
  small: PhotoItem;
  medium: PhotoItem;
  large: PhotoItem;
};

export type EventApiResponse = {
  id: string;
  attributes: {
    title: string;
    from: string;
    to: string;
    description: string | null;
    tags: string[];
    videoUrl: string | null;
    capacity: number | null;
    publicUrl: string | null;
    audience: "membersOnly" | "public";
    color: string;
    image: Photo | null;
  };
};

type Address = {
  company: string | null;
  name: string | null;
  fullAddress: string | null;
};

type InvoiceItem = {
  description: string;
  paid: boolean;
  quantity: string;
  accountingCode: string | null;
  amount: Amount;
  totalAmount: Amount;
};

type Relationship = {
  data: {
    id: string;
  };
};

export type BaseInvoiceProperties = {
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
  senderAddress: Address;
  notes: string | null;
  items: InvoiceItem[];
  payableAmount: string;
  paidAmount: string;
  totalAmount: Amount;
};

export type InvoiceApiResponse = {
  id: string;
  attributes: BaseInvoiceProperties;
  relationships: {
    membership: Relationship;
  };
};

export type ExternalBookingStatus = "approved" | "pending" | "canceled";

export type ExternalBookingApiResponse = {
  id: string;
  attributes: {
    from: string;
    to: string;
    title: string | null;
    price: Amount;
    totalPrice: Amount;
    numberOfVisitors: number;
    name: string | null;
    company: string | null;
    billingAddress: string;
    phone: string | null;
    email: string;
    comments: string | null;
    status: ExternalBookingStatus;
    bookingExtras: {
      name: string;
      description: string;
      pricing: {
        amount: Amount;
        toalAmount: Amount;
        quantity: string;
        unit: string;
      };
    }[];
  };
  relationships: {
    resource: {
      data: {
        id: string;
      };
    };
  };
};

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

type ResourceApiResponse = {
  id: string;
  attributes: {
    name: string;
  };
};

type UserApiResponse = {
  included: { id: string; attributes: { subdomain: string } }[];
};
