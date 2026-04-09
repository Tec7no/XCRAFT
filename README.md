# XCRAFT — Full Stack E-Commerce Platform

> A modern fashion e-commerce platform built with React + Node.js + MongoDB

![xcraft](https://img.shields.io/badge/Stack-React%20%2B%20Node.js%20%2B%20MongoDB-black?style=flat-square)
![license](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## 📦 Tech Stack

**Frontend**
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Router v6
- i18n (Arabic / English)

**Backend**
- Node.js + Express + TypeScript
- MongoDB Atlas + Mongoose
- JWT Authentication
- Nodemailer (OTP + Password Reset)

---

## 🚀 Features

- 🛍️ Product catalog with color/size variant stock matrix
- 🔐 Auth system — OTP signup, JWT login, password reset
- 🛒 Cart, wishlist, checkout flow
- 💳 Payment methods — COD, Bank Transfer, Card
- 🎟️ Coupon system with usage tracking
- 📦 Admin dashboard — inventory, orders, coupons, content, settings
- 🌐 Site editor — live theme, banners, footer, FAQs
- 📬 HTML email templates (OTP + Reset)
- 📱 RTL support (Arabic)

---

## 🗂️ Project Structure

```
xcraft/
├── frontend/          # React + Vite
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── lib/          # API client
│       ├── config/       # Site settings
│       └── utils/
└── backend/           # Node.js + Express
    └── src/
        ├── controllers/
        ├── models/
        ├── routes/
        ├── middlewares/
        ├── services/
        └── utils/
```

---

## ⚙️ Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account

### Backend

```bash
cd backend
npm install
```

Create `.env`:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/yourcluster?retryWrites=true&w=majority
JWT_SECRET=your_secret_key
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:8080
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create `.env.local`:
```env
VITE_API_URL=http://localhost:5000
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_key
```

```bash
npm run dev
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register |
| POST | `/auth/login` | Login |
| POST | `/auth/send-otp` | Send OTP |
| POST | `/auth/forgot-password` | Password reset email |
| GET | `/products` | List products |
| POST | `/products` | Create product (admin) |
| POST | `/orders` | Place order |
| GET | `/orders/my` | My orders (auth) |
| GET | `/coupons` | List coupons (admin) |
| POST | `/coupons/validate` | Validate coupon |
| GET | `/site-settings` | Get site settings |
| POST | `/site-settings` | Save site settings (admin) |

---

## 👤 Admin Setup

1. Register an account
2. In MongoDB Atlas → Collections → users → find your document
3. Set `role` field to `"admin"`
4. Re-login

---

## 📄 License

Private — All rights reserved.
