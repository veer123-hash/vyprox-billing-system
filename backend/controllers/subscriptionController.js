const stripe = require("../config/stripe");
const Business = require("../models/Business");
const PLANS = require("../config/plans");

exports.createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;
    const businessId = req.user.businessId;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // 1. create or reuse stripe customer
    let customerId = business.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: business.email,
        name: business.name,
      });

      customerId = customer.id;
      business.stripeCustomerId = customerId;
      await business.save();
    }

    // 2. CREATE CHECKOUT SESSION (IMPORTANT)
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,

      line_items: [
        {
          price: PLANS[plan].priceId, // Stripe Price ID
          quantity: 1,
        },
      ],

      success_url: `${process.env.FRONTEND_URL}/upgrade-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/upgrade-cancel`,
    });

    res.json({
      checkoutUrl: session.url,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};