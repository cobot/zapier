import { version as platformVersion } from "zapier-platform-core";
import auth from "./authentication";

import ActivityCreate from "./creates/activity";

import triggerBookingCreated from "./triggers/triggerBookingCreated";
import triggerBookingWillBegin from "./triggers/triggerBookingWillBegin";
import triggerMembershipConfirmed from "./triggers/triggerMembershipConfirmed";
import triggerMembershipPlanChanged from "./triggers/triggerMembershipPlanChanged";
import triggerExternalBooking from "./triggers/triggerExternalBooking";
import getSubdomains from "./triggers/dropdowns/getSubdomains";

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
    [triggerMembershipPlanChanged.key]: triggerMembershipPlanChanged,
    [triggerExternalBooking.key]: triggerExternalBooking,
    // Lists for dropdowns
    [getSubdomains.key]: getSubdomains,
  },

  creates: {
    [ActivityCreate.key]: ActivityCreate,
  },
};
