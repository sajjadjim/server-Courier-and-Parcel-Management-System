const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Import Middlewares
const { verifyTokenFB, verifyAdmin } = require('./middleware/auth');

// Middleware Setup
app.use(cors());
app.use(express.json());

// Database Connection
const uri = `mongodb+srv://${process.env.Currier_and_Parcel_Management_Admin}:${process.env.Currier_and_Parcel_Management_Admin_Password}@sajjadjim15.ac97xgz.mongodb.net/?appName=SajjadJim15`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect(); // Optional in V4.7+

    // --- COLLECTIONS ---
    const db = client.db('Currier_and_Parcel_Management');
    const parcelsCollection = db.collection('parcels');
    const paymentsCollection = db.collection('payments');
    const usersCollection = db.collection('users');
    const ridersCollection = db.collection('riders');
    const trackingsCollection = db.collection('trackings');

// --- SETUP ROUTES ---
    // Change './routes/...' to './routers/...'
    
    // 1. User Routes
    const userRoutes = require('./routers/users')(usersCollection, verifyTokenFB, verifyAdmin(usersCollection));
    app.use('/users', userRoutes);

    // 2. Parcel Routes
    const parcelRoutes = require('./routers/parcels')(parcelsCollection);
    app.use('/parcels', parcelRoutes);

    // 3. Rider Routes
    const riderRoutes = require('./routers/riders')(ridersCollection, parcelsCollection, verifyTokenFB, verifyAdmin(usersCollection));
    app.use('/riders', riderRoutes);

    // 4. Payment Routes
    const paymentRoutes = require('./routers/payments')(paymentsCollection, parcelsCollection, verifyTokenFB);
    app.use('/payments', paymentRoutes);

    // 5. Root Route
    app.get('/', (req, res) => {
      res.send(`
    <html>
      <head>
        <title>Currier_and_Parcel_Management Server</title>
        <style>
          body {
            background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
            height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Arial, sans-serif;
          }
          .container {
            background: #fff;
            padding: 40px 60px;
            border-radius: 18px;
            box-shadow: 0 8px 32px rgba(60, 72, 88, 0.15);
            text-align: center;
          }
          h1 {
            color: #4f46e5;
            margin-bottom: 16px;
            font-size: 2.5rem;
            letter-spacing: 1px;
          }
          p {
            color: #374151;
            font-size: 1.1rem;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Currier_and_Parcel_Management is Always Ready for Users!</h1>
          <p><strong>Currier_and_Parcel_Management Server Running</strong></p>
          <p>This is a delivery server. Here, users can add and update tasks, and create accounts.</p>
        </div>
      </body>
    </html>
    `);
    });

    console.log("✅ Database Connected & Routes Loaded Successfully!");

  } catch (error) {
    console.error("❌ Connection Failed:", error);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});