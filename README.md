GitHub blocked your push because you accidentally committed a secret file (firebase_admin_key.json). Even if you add it to .gitignore now, the file is already "stuck" in your previous commit history.


# 📦 Courier & Parcel Management System - Server

This is the backend server for the **Courier and Parcel Management System**. It handles user authentication, parcel booking, rider management, delivery tracking, and payment processing.

## 🚀 Technologies Used
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Native Driver)
* **Authentication:** Firebase Admin SDK
* **Payments:** Stripe
* **Security:** JWT (JSON Web Tokens) via Firebase
* **Deployment:** Vercel (Ready)

---

## 📂 Project Structure

The project is organized into a modular structure for better scalability:

```text
server/
├── config/             # Firebase Admin setup
├── middleware/         # Auth verification (JWT & Admin checks)
├── routers/            # API Routes (Users, Parcels, Riders, Payments)
├── index.js            # Main entry point
└── .env                # Environment variables (Not committed)

```

#  🛠️ Setup & Installation
1. Clone the repository
Bash

git clone [https://github.com/sajjadjim/server-Courier-and-Parcel-Management-System.git](https://github.com/sajjadjim/server-Courier-and-Parcel-Management-System.git)
cd server-Courier-and-Parcel-Management-System

 ## 2. Install Dependencies
Bash

npm install

---

##  3. Environment Variables
Create a file named .env in the root folder and add the following keys.

Important: Never commit this file to GitHub!

Code snippet

# Server Port
PORT=3000


---


# MongoDB Credentials
Currier_and_Parcel_Management_Admin=your_db_username
Currier_and_Parcel_Management_Admin_Password=your_db_password

# Firebase Admin SDK (Base64 Encoded Service Account)
FB_SERVICE_KEY=your_base64_encoded_service_account_json

# Stripe Secret Key
PAYMENT_GATEWAY_KEY=your_stripe_secret_key
4. Run the Server
Development Mode (Auto-restart):

Bash

npm run dev
Production Mode:

Bash

node index.js
📡 API Endpoints Overview
👤 Users (/users)
GET /users - Get all users (Admin only)

POST /users - Create a new user

PATCH /users/:email - Update profile (Name, Photo, Phone, Address)

GET /users/:email/role - Check if user is Admin, Rider, or User

---

## 📦 Parcels (/parcels)
POST /parcels - Book a new parcel

GET /parcels - Get parcels (Filter by email or status)

PATCH /parcels/:id/assign - Assign a rider to a parcel

PATCH /parcels/:id/status - Update delivery status (On the way / Delivered)

---

🛵 Riders (/riders)
GET /riders/active - Get list of approved riders

GET /riders/tasks - Get pending deliveries for a specific rider

POST /riders - Register as a rider

---

💳 Payments (/payments)
POST /payments/create-payment-intent - Generate Stripe Client Secret

POST /payments - Save payment history and mark parcel as paid

GET /payments - Get payment history for a user

---

🛡️ Security Features
verifyTokenFB: Middleware that intercepts requests to verify the Firebase ID Token.

verifyAdmin: Middleware that checks MongoDB to ensure the requester has the admin role before allowing sensitive actions.

Secure Environment: Sensitive keys are managed via dotenv and never exposed in the codebase.

👤 Author
Sajjad Hossain Jim
