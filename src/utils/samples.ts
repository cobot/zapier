import exp = require("constants");
import { BookingOutput, MembershipOutput } from "../types/outputs";

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

export const membershipSample: MembershipOutput = {
  id: "003b37a3-f205-5d9e-9caf-c4ca612075d4",
  name: "Sam Duncan",
  company: "",
  email: "sig@rauwekug.kr",
  customer_number: "123",
  plan_name: "Full Time",
  payment_method_name: "Credit Card",
};
