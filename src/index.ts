import { version as platformVersion } from "zapier-platform-core";
import auth from "./authentication";

import ActivityCreate from "./creates/activity";

import triggerBookingCreated from "./triggers/triggerBookingCreated";
import triggerBookingWillBegin from "./triggers/triggerBookingWillBegin";
import triggerMembershipConfirmed from "./triggers/triggerMembershipConfirmed";
import triggerMembershipPlanChanged from "./triggers/triggerMembershipPlanChanged";
import triggerExternalBookingCreated from "./triggers/triggerExternalBookingCreated";
import getSubdomains from "./triggers/dropdowns/getSubdomains";
import triggerEventPublished from "./triggers/triggerEventPublished";
import triggerInvoiceCreated from "./triggers/triggerInvoiceCreated";
import triggerMembershipCancelled from "./triggers/triggerMembershipCancelled";
import triggerMembershipCancellationDateReached from "./triggers/triggerMembershipCancellationDateReached";
import triggerDropInPassPurchased from "./triggers/triggerDropInPassPurchased";
import triggerExternalBookingApproved from "./triggers/triggerExternalBookingApproved";

const { version } = require("../package.json");

export default {
  version,
  platformVersion,

  authentication: auth.config,

  beforeRequest: [...auth.befores],

  afterResponse: [...auth.afters],

  // If you want to define optional resources to simplify creation of triggers, searches, creates - do that here!
  resources: {},

  triggers: {
    [triggerBookingCreated.key]: triggerBookingCreated,
    [triggerBookingWillBegin.key]: triggerBookingWillBegin,
    [triggerMembershipConfirmed.key]: triggerMembershipConfirmed,
    [triggerMembershipCancelled.key]: triggerMembershipCancelled,
    [triggerMembershipPlanChanged.key]: triggerMembershipPlanChanged,
    [triggerEventPublished.key]: triggerEventPublished,
    [triggerInvoiceCreated.key]: triggerInvoiceCreated,
    [triggerExternalBookingApproved.key]: triggerExternalBookingApproved,
    [triggerExternalBookingCreated.key]: triggerExternalBookingCreated,
    [triggerDropInPassPurchased.key]: triggerDropInPassPurchased,
    [triggerMembershipCancellationDateReached.key]:
      triggerMembershipCancellationDateReached,
    // Lists for dropdowns
    [getSubdomains.key]: getSubdomains,
  },

  creates: {
    [ActivityCreate.key]: ActivityCreate,
  },
};
