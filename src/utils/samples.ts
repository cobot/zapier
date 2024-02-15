import {
  BookingOutput,
  EventOutput,
  ExternalBookingOutput,
  MembershipOutput,
} from "../types/outputs";

export const bookingSample: BookingOutput = {
  id: "d58b612aaa62619aae546dd336587eb2",
  from: "2012-04-12T12:00:00.000Z",
  to: "2012-04-12T18:00:00.000Z",
  title: "test booking",
  resource_name: "Meeting Room",
  price: "10.0",
  currency: "EUR",
  member_name: "John Doe",
  comments: "coffee please",
  units: 1,
};

export const eventSample: EventOutput = {
  id: "d58b612aaa62619aae546dd336587eb2",
  title: "test event",
  description: "test event description",
  from: "2012-04-12T12:00:00.000Z",
  to: "2012-04-12T18:00:00.000Z",
  tags: ["tag1", "tag2"],
  video_url: "https://us06web.zoom.us/j/8582118861",
  image_url: "https://www.example.com/image.jpg",
  capacity: 10,
  public_url: "https://example.cobot.me/event/example-event",
  audience: "membersOnly",
  color: "#ff0000",
};

export const externalBookingSample: ExternalBookingOutput = {
  id: "d58b612aaa62619aae546dd336587eb2",
  from: "2012-04-12T12:00:00.000Z",
  to: "2012-04-12T18:00:00.000Z",
  title: "test booking",
  resource_name: "Meeting Room",
  net_price: "10.0",
  gross_price: "12.0",
  currency: "EUR",
  name: "John Doe",
  company: "ACME",
  email: "kofi@jemzahif.gf",
  phone: "(304) 862-4378",
  status: "approved",
  comments: "coffee please",
  number_of_visitors: 3,
  billing_address: "123 Main St",
  extra_names: "Coffee, Tea",
};

export const membershipSample: MembershipOutput = {
  id: "003b37a3-f205-5d9e-9caf-c4ca612075d4",
  name: "Sam Duncan",
  company: "",
  email: "sig@rauwekug.kr",
  customer_number: "123",
  plan_name: "Full Time",
  payment_method_name: "Credit Card",
};
