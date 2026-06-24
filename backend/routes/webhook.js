const stripe = require("../config/stripe");
const Business = require("../models/Business");

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ PAYMENT SUCCESS → AUTO UPGRADE PLAN
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const customerId = session.customer;
      const subscriptionId = session.subscription;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // detect plan from price
      const priceId = subscription.items.data[0].price.id;

      let plan = "FREE";

      if (priceId === process.env.STRIPE_BASIC_PRICE_ID) plan = "BASIC";
      if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = "PRO";

      await Business.findOneAndUpdate(
        { stripeCustomerId: customerId },
        {
          plan,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: "active",
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        }
      );
    }

    res.json({ received: true });
  }
);