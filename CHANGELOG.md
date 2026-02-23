## 2.10.0

- Added `attendee_list` and `attendees_message` on trigger/created_booking

## 2.9.0

- Add `membership_email` to bookings

## 2.2.1

Minor changes to associated `membership` to the invoice on trigger/created_invoice.

- **[BREAKING CHANGE]** Changed `membership membershipId` field to `membership id`.
- Added `membership email` field.

## 2.2.4

- Added associated `contact` to the invoice on trigger/created_invoice.
- Added `contact email` and `contact name` fields to the Invoice creation trigger.

## 2.3.0

- Added trigger/cancelled_membership

## 2.3.1

- Added `canceled_to` field to trigger on trigger/cancelled_membership which gives the date of cancellation

## 2.4.0

- Added trigger/membership_cancellation_date_reached
- This trigger fires on the day a membership cancellation applies

## 2.4.1

- Added `accounting_code` field to trigger/created_booking

## 2.4.2

- Added membership `phone`, `address`, and `plan` fields

## 2.5.0

- Added trigger/drop_in_pass_purchased
- This trigger fires when a visitor purchases a drop in pass

## 2.8.0

- Added team id and name to membership details for trigger/canceled_membership, trigger/confirmed_membership, trigger/membership_cancellation_date_reached, trigger/membership_plan_change_date_reached
