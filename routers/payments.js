const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.PAYMENT_GATEWAY_KEY);
const { ObjectId } = require('mongodb');

module.exports = (paymentsCollection, parcelsCollection, verifyTokenFB) => {

  // Get Payment History
  router.get('/', verifyTokenFB, async (req, res) => {
    const email = req.query.email;
    if (req.decoded.email !== email) return res.status(403).send({ message: 'Forbidden' });
    
    const result = await paymentsCollection.find({ email }).sort({ paid_at: -1 }).toArray();
    res.send(result);
  });

  // Create Payment Intent (Stripe)
  router.post('/create-payment-intent', async (req, res) => {
    const { amountInCents } = req.body;
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
      });
      res.send({ clientSecret: paymentIntent.client_secret });
    } catch (e) {
      res.status(500).send({ error: e.message });
    }
  });

  // Save Payment Info
  router.post('/', verifyTokenFB, async (req, res) => {
    const payment = req.body;
    payment.paid_at = new Date();
    
    // Save to payments
    const paymentResult = await paymentsCollection.insertOne(payment);
    
    // Update parcel status
    const parcelResult = await parcelsCollection.updateOne(
      { _id: new ObjectId(payment.parcelId) },
      { $set: { payment_status: 'paid' } }
    );

    res.send({ paymentResult, parcelResult });
  });

  return router;
};