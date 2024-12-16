## 2.2.1

Minor changes to associated `membership` to the invoice on trigger/created_invoice.

- **[BREAKING CHANGE]** Changed `membership membershipId` field to `membership id`.
- Added `membership email` field.

## 2.2.4

Added associated `contact` to the invoice on trigger/created_invoice.

- Added `contact email` and `contact name` fields to the Invoice creation trigger.

## 2.3.0

Added trigger/cancelled_membership

## 2.3.1

Added `canceled_to` field to trigger on trigger/cancelled_membership which gives the date of cancellation

## 2.4.0

Added trigger/membership_cancellation_date_reached

- This trigger fires on the day a membership cancellation applies

## 2.4.1

Added `accounting_code` field to trigger/created_booking
