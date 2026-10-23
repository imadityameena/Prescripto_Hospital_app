# Prescripto – Doctor Appointment Booking

Prescripto is a MERN-stack app for booking doctor appointments. Patients browse doctors and book time slots, doctors manage their appointments, and an admin manages doctors and bookings.

## Live demo

**https://prescripto-hospital-app.vercel.app**

- Patients can sign up and book appointments.
- Doctor and admin dashboards: click **Staff login** on the login page (or in the footer), then **Try admin demo** or **Try doctor demo**. Demo sessions are read-only and hide patients' personal details.

## Features

**Patients** (`frontend/`)
- Sign up and log in
- Browse doctors and filter by speciality
- Book a 30-minute slot over the next 7 days
- Pay online with Stripe or Razorpay
- Cancel unpaid appointments (paid ones are cancelled through the clinic)
- Edit profile and photo

**Doctors** (`admin/`, Doctor login)
- Dashboard with appointments, patients and earnings (online and cash)
- Mark appointments completed or cancel them
- Update fees, address, availability and "about" text

**Admin** (`admin/`, Admin login)
- Dashboard with totals and latest bookings
- Add doctors (with photo upload)
- View and cancel all appointments
- Turn a doctor's availability on or off

## Tech stack

| Part | Tech |
|---|---|
| Patient site & admin panel | React, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Auth | JWT (expires after 7 days; 1 day for admin), bcrypt password hashing |
| Images | Cloudinary |
| Payments | Stripe Checkout, Razorpay |

## Project structure

```
backend/    Express API (routes, controllers, models, middleware)
frontend/   Patient website
admin/      Admin and doctor panel
```

## Running locally

### Prerequisites
- Node.js 18 or newer
- A MongoDB database (local or MongoDB Atlas)
- A Cloudinary account (for image uploads)
- Stripe and/or Razorpay test keys (only needed for payments)

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

### 2. Environment variables

Create a `.env` file in each folder. These files are ignored by git — never commit them.

**backend/.env**

| Variable | Description |
|---|---|
| `PORT` | API port, default `4000` |
| `NODE_ENV` | `development` locally, `production` when deployed |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign login tokens |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `CLOUDINARY_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_SECRET_KEY` | Cloudinary API secret |
| `CURRENCY` | Currency code for payments, e.g. `USD` |
| `RAZORPAY_KEY_ID` | Razorpay key id |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `SEED_DOCTOR_PASSWORD` | Only needed for `npm run seed:doctors` |
| `DEMO_DOCTOR_EMAIL` | Optional. Doctor used by "Try doctor demo" (default: the doctor with the most appointments) |

**admin/.env**

| Variable | Description |
|---|---|
| `VITE_BACKEND_URL` | Backend URL, e.g. `http://localhost:4000` |
| `VITE_CURRENCY` | Currency code shown in the panel, e.g. `USD` |
| `VITE_PATIENT_URL` | Optional. Patient site URL for the "Go to the patient site" link |

**frontend/.env**

| Variable | Description |
|---|---|
| `VITE_RAZORPAY_KEY_ID` | Razorpay key id (same as the backend's) |
| `VITE_CURRENCY` | Currency code for prices, e.g. `USD` (must match the backend's `CURRENCY`) |
| `VITE_ADMIN_URL` | Optional. Admin panel URL for the "Staff login" links, e.g. `http://localhost:5174` locally |

### 3. (Optional) Add sample doctors

```bash
cd backend
npm run seed:doctors
```

Every seeded doctor gets the password in `SEED_DOCTOR_PASSWORD`. Running it again replaces the seeded doctors, so existing appointments with them will point to doctors that no longer exist.

### 4. Start the apps

Run each in its own terminal:

```bash
cd backend && npm run server   # http://localhost:4000
cd frontend && npm run dev     # http://localhost:5173
cd admin && npm run dev        # http://localhost:5174
```

If a port is busy, Vite picks the next free one; the backend accepts any `localhost` port while `NODE_ENV` is not `production`.

### Logging in
- **Patients** sign up on the patient site.
- **Admin** logs in on the admin panel with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- **Doctors** log in on the admin panel (choose "Doctor") with the email and password set when the doctor was added.
- **Anyone** can use the read-only admin/doctor demo from the admin panel's login page.

## Deployment

All three apps are deployed on Vercel. In the backend project set the same environment variables as `backend/.env`, with `NODE_ENV=production`. The allowed frontend URLs are listed in `backend/config/origins.js`.

## Security notes
- Login and sign-up are rate limited (10 attempts per 15 minutes per IP).
- Payments are verified with Stripe/Razorpay on the server before an appointment is marked paid.
- Uploads accept images up to 5 MB only.

## License

MIT — see [LICENSE.md](LICENSE.md).
