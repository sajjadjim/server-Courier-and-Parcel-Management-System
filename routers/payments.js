const express = require('express');
const router = express.Router();
// Use correct environment variable for Stripe Key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || process.env.PAYMENT_GATEWAY_KEY);
const { ObjectId } = require('mongodb');

module.exports = (paymentsCollection, parcelsCollection, verifyTokenFB) => {

  // ==========================================
  // 1. CREATE PAYMENT INTENT (Fixes 400 Error)
  // ==========================================
  router.post('/create-payment-intent', async (req, res) => {
    try {
      // ✅ FIX: Read 'price' from frontend (previously was amountInCents)
      const { price } = req.body;

      // 1. Validation: Ensure price exists
      if (!price || isNaN(price)) {
        console.error("❌ Error: Invalid Price received:", price);
        return res.status(400).send({ error: "Invalid Amount" });
      }

      // 2. Conversion: Convert Price to Cents (Integers only)
      const amount = Math.round(price * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd', 
        payment_method_types: ['card'],
      });

      res.send({ clientSecret: paymentIntent.client_secret });

    } catch (e) {
      console.error("❌ Stripe Error:", e.message);
      res.status(500).send({ error: e.message });
    }
  });

  // ==========================================
  // 2. SAVE PAYMENT INFO
  // ==========================================
  router.post('/', verifyTokenFB, async (req, res) => {
    try {
      const payment = req.body;
      payment.paid_at = new Date();
      
      const paymentResult = await paymentsCollection.insertOne(payment);
      
      let parcelResult = null;
      if (payment.parcelId) {
         parcelResult = await parcelsCollection.updateOne(
          { _id: new ObjectId(payment.parcelId) },
          { $set: { payment_status: 'paid' } }
        );
      }

      res.send({ paymentResult, parcelResult });
    } catch (error) {
      console.error("Database Error:", error);
      res.status(500).send({ error: "Failed to save payment info" });
    }
  });

  // ==========================================
  // 3. GET PAYMENT HISTORY
  // ==========================================
  router.get('/', verifyTokenFB, async (req, res) => {
    const email = req.query.email;
    if (req.decoded.email !== email) {
        return res.status(403).send({ message: 'Forbidden' });
    }
    const result = await paymentsCollection.find({ email }).sort({ paid_at: -1 }).toArray();
    res.send(result);
  });

  return router;
};