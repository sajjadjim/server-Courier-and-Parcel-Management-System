const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

// REMOVED verifyTokenFB from the arguments
module.exports = (parcelsCollection) => {

  // 1. Get Parcels (Public - No Verification)
  router.get('/', async (req, res) => {
    try {
      const { email, payment_status, delivery_status } = req.query;
      const query = {};
      if (email) query.email = email;
      if (payment_status) query.payment_status = payment_status;
      if (delivery_status) query.delivery_status = delivery_status;

      const result = await parcelsCollection.find(query).sort({ date: -1 }).toArray();
      res.send(result);
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch parcels" });
    }
  });

  // 2. Get Single Parcel (Public)
  router.get('/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const parcel = await parcelsCollection.findOne({ _id: new ObjectId(id) });
      res.send(parcel);
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch parcel" });
    }
  });

  // 3. Add Parcel (Public)
  router.post('/', async (req, res) => {
    const result = await parcelsCollection.insertOne(req.body);
    res.send(result);
  });

  // 4. Assign Rider (Public for now)
  router.patch("/:id/assign", async (req, res) => {
    const { riderId, riderName, riderEmail } = req.body;
    const result = await parcelsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          delivery_status: "in_transit",
          assigned_rider_id: riderId,
          assigned_rider_name: riderName,
          assigned_rider_email: riderEmail,
        }
      }
    );
    res.send(result);
  });

  // 5. Update Status (Public)
  router.patch("/:id/status", async (req, res) => {
    const { status } = req.body;
    const updateDoc = { delivery_status: status };
    if (status === 'in_transit') updateDoc.picked_at = new Date();
    if (status === 'delivered') updateDoc.delivered_at = new Date();

    const result = await parcelsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateDoc }
    );
    res.send(result);
  });

  // 6. Delete Parcel (Public)
  router.delete('/:id', async (req, res) => {
    const result = await parcelsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  });

  // 7. Admin Stats (Public)
  router.get('/delivery/status-count', async (req, res) => {
    const pipeline = [
        { $group: { _id: '$delivery_status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } }
    ];
    const result = await parcelsCollection.aggregate(pipeline).toArray();
    res.send(result);
  });

  return router;
};