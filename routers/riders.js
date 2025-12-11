const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

module.exports = (ridersCollection, parcelsCollection, verifyTokenFB, verifyAdmin) => {

  // Get All Riders
  router.get('/', async (req, res) => {
    const riders = await ridersCollection.find().toArray();
    res.send(riders);
  });

  // Register Rider
  router.post('/', async (req, res) => {
    const existing = await ridersCollection.findOne({ email: req.body.email });
    if (existing) return res.status(400).send({ message: 'Rider exists' });
    const result = await ridersCollection.insertOne(req.body);
    res.send(result);
  });

  // Get Active/Pending Riders (Admin)
  router.get("/active", verifyTokenFB, verifyAdmin, async (req, res) => {
    const result = await ridersCollection.find({ status: "active" }).toArray();
    res.send(result);
  });

  router.get("/pending", verifyTokenFB, verifyAdmin, async (req, res) => {
    const result = await ridersCollection.find({ status: "pending" }).toArray();
    res.send(result);
  });

  // Update Rider Status (Approve/Reject)
  router.patch("/:id/status", verifyTokenFB, verifyAdmin, async (req, res) => {
    const result = await ridersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: req.body.status } }
    );
    res.send(result);
  });

  // Get Pending Tasks for Rider
  router.get('/tasks', verifyTokenFB, async (req, res) => {
    const email = req.query.email;
    const query = {
      assigned_rider_email: email,
      delivery_status: { $in: ['rider_assigned', 'in_transit'] },
    };
    const result = await parcelsCollection.find(query).toArray();
    res.send(result);
  });

  return router;
};