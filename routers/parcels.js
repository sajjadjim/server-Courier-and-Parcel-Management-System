const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

module.exports = (parcelsCollection) => {

  // 1. Get Parcels (With Filters)
  router.get('/', async (req, res) => {
    try {
      const { email, payment_status, delivery_status } = req.query;
      const query = {};
      
      // Apply filters if provided
      if (email) query.email = email;
      if (payment_status) query.payment_status = payment_status;
      if (delivery_status) query.delivery_status = delivery_status;

      const result = await parcelsCollection.find(query).sort({ date: -1 }).toArray();
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Failed to fetch parcels" });
    }
  });

  // 2. Get Single Parcel
  router.get('/:id', async (req, res) => {
    try {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid ID format" });
      }
      const parcel = await parcelsCollection.findOne({ _id: new ObjectId(id) });
      res.send(parcel);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Failed to fetch parcel" });
    }
  });

  // 3. Add Parcel
  router.post('/', async (req, res) => {
    try {
      const result = await parcelsCollection.insertOne(req.body);
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Failed to create parcel" });
    }
  });

  // ============================================
  // 🟢 4. UPDATE PAYMENT STATUS (Fixes 404 Error)
  // URL: PATCH /parcels/:id/payment-status
  // ============================================
  router.patch('/:id/payment-status', async (req, res) => {
    try {
      const id = req.params.id;
      const { payment_status } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid ID" });
      }

      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: { payment_status: payment_status }
      };

      const result = await parcelsCollection.updateOne(filter, updatedDoc);
      res.send(result);
    } catch (error) {
      console.error("Payment Update Error:", error);
      res.status(500).send({ error: "Failed to update payment status" });
    }
  });

  // 5. Assign Rider
  router.patch("/:id/assign", async (req, res) => {
    try {
      const { riderId, riderName, riderEmail } = req.body;
      const result = await parcelsCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        {
          $set: {
            delivery_status: "rider_assigned", // Changed to rider_assigned for consistency
            assigned_rider_id: riderId,
            assigned_rider_name: riderName,
            assigned_rider_email: riderEmail,
          }
        }
      );
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Failed to assign rider" });
    }
  });

  // 6. Update Delivery Status (General)
  router.patch("/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const updateDoc = { delivery_status: status };
      
      // Auto-timestamp logic
      if (status === 'in_transit') updateDoc.picked_at = new Date();
      if (status === 'delivered') updateDoc.delivered_at = new Date();

      const result = await parcelsCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: updateDoc }
      );
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Failed to update status" });
    }
  });

  // 7. Delete Parcel
  router.delete('/:id', async (req, res) => {
    try {
      const result = await parcelsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Failed to delete parcel" });
    }
  });

  // 8. Admin Stats
  router.get('/delivery/status-count', async (req, res) => {
    try {
      const pipeline = [
          { $group: { _id: '$delivery_status', count: { $sum: 1 } } },
          { $project: { status: '$_id', count: 1, _id: 0 } }
      ];
      const result = await parcelsCollection.aggregate(pipeline).toArray();
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Failed to get stats" });
    }
  });

  return router;
};