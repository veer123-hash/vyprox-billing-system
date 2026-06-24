const PLANS = {
  FREE: {
    maxProducts: 10,
    maxStaff: 1,
    maxBillsPerDay: 20,
  },

  BASIC: {
    maxProducts: 100,
    maxStaff: 5,
    maxBillsPerDay: 200,
  },

  PRO: {
    maxProducts: -1, // -1 = unlimited
    maxStaff: -1,
    maxBillsPerDay: -1,
  },
};

module.exports = PLANS;