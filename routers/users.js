const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

// This wrapper function allows us to pass 'usersCollection' and middlewares from index.js
module.exports = (usersCollection, verifyTokenFB, verifyAdmin) => {

  // Get All Users (Admin Only)
  router.get('/', verifyTokenFB, async (req, res) => {
    const users = await usersCollection.find().toArray();
    res.send(users);
  });

  // Search Users (Admin Only)
  router.get("/search", verifyTokenFB, verifyAdmin, async (req, res) => {
    const emailQuery = req.query.email;
    if (!emailQuery) return res.status(400).send({ message: "Missing email query" });

    const regex = new RegExp(emailQuery, "i");
    const users = await usersCollection.find({ email: { $regex: regex } }).limit(10).toArray();
    res.send(users);
  });

  // Create New User
  router.post('/', async (req, res) => {
    const user = req.body;
    const existingUser = await usersCollection.findOne({ email: user.email });
    if (existingUser) {
        return res.send({ message: 'User already exists', insertedId: null });
    }
    const result = await usersCollection.insertOne(user);
    res.send(result);
  });

  // Get User Role
  router.get('/:email/role', verifyTokenFB, async (req, res) => {
    const email = req.params.email;
    if (req.decoded.email !== email) return res.status(403).send({ message: 'Forbidden' });

    const user = await usersCollection.findOne({ email });
    res.send({ role: user?.role || 'user' });
  });


  // ... other routes ...

    // ✅ GET SINGLE USER (New Route)
    router.get('/:email', verifyTokenFB, async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.send(user);
    });

  // ✅ UPDATE USER PROFILE (Name, Image, Phone, Address)
  router.patch('/:email', verifyTokenFB, async (req, res) => {
    const email = req.params.email;
    if (req.decoded.email !== email) return res.status(403).send({ message: 'Forbidden' });

    const user = req.body;
    const filter = { email: email };
    const updateDoc = {
      $set: {
        name: user.name,
        image: user.image,
        phone: user.phone,      // Phone Update
        address: user.address   // Address Update
      }
    };
    const result = await usersCollection.updateOne(filter, updateDoc, { upsert: true });
    res.send(result);
  });


  // Update User Role (Admin Only)
  router.patch("/:id/role", verifyTokenFB, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { role } }
    );
    res.send(result);
  });

  // ✅ UPDATE USER PROFILE (Name, Image, Phone, Address)
  router.patch('/:email', verifyTokenFB, async (req, res) => {
    const email = req.params.email;
    if (req.decoded.email !== email) return res.status(403).send({ message: 'Forbidden' });

    const user = req.body;
    const filter = { email: email };
    const updateDoc = {
      $set: {
        name: user.name,
        image: user.image,
        phone: user.phone,      // Phone Update
        address: user.address   // Address Update
      }
    };
    const result = await usersCollection.updateOne(filter, updateDoc, { upsert: true });
    res.send(result);
  });

  return router;
};