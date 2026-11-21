# 🧾 InvoiceGenerator - Professional Invoicing Made Simple

<div align="center">

![InvoiceGenerator Banner](https://img.shields.io/badge/InvoiceGenerator-Streamline%20Your%20Business-blue?style=for-the-badge&logo=receipt)

**Create, manage, and track professional invoices with ease using our modern, full-stack solution**

[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.3-purple?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?logo=mongodb)](https://www.mongodb.com/)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-technology-stack)

</div>

---

## ✨ Overview

InvoiceGenerator is a robust, full-stack application designed to simplify the invoicing process for freelancers and small businesses. With a clean, modern interface and powerful features, it helps you get paid faster by creating professional invoices in seconds, managing clients, and tracking your revenue.

### 🎯 What Makes InvoiceGenerator Special?

- **⚡ Fast & Responsive** - Built with Vite and React for instant interactions
- **🔒 Secure Authentication** - JWT-based auth with secure password hashing
- **👥 Client Management** - Keep track of all your clients in one place
- **📄 PDF Export** - Generate professional PDF invoices with one click
- **📊 Smart Dashboard** - Visualize your revenue and pending invoices at a glance
- **🌗 Dark Mode** - Easy on the eyes, compatible with system preferences
- **📱 Mobile Friendly** - Manage your business from any device

---

## 🚀 Features

### 💵 Invoice Management
- **Easy Creation** - Intuitive form with auto-calculations for taxes and totals
- **Status Tracking** - Monitor invoices from Draft to Sent to Paid
- **PDF Generation** - Download invoices as high-quality PDFs
- **History** - Keep a complete record of all your billing

### 👥 Client Management
- **Address Book** - Store client details, contacts, and companies
- **Quick Select** - Easily reuse client information for new invoices
- **History** - View invoicing history per client

### 📊 Dashboard & Analytics
- **Revenue Overview** - Track total paid and pending amounts
- **Stats** - Quick counts of invoices and clients
- **Recent Activity** - See what's happening in your business

### 🔒 Security & Tech
- **User Accounts** - Secure sign-up and sign-in functionality
- **Data Protection** - MongoDB backend ensures your data is persistent and safe
- **Type Safety** - Full TypeScript integration for reliable code

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React (Icons), React Hook Form, Zod
- **Backend**: Node.js, Express, MongoDB (Mongoose), JSON Web Tokens (JWT), Bcryptjs
- **Tools**: ESLint, PostCSS, Autoprefixer

---

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (local or Atlas)
- npm or yarn package manager

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/muheeb-codes/invoice-generator.git
   cd invoice-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Server Port
   PORT=3001
   
   # MongoDB Connection
   MONGODB_URI=mongodb://127.0.0.1:27017/invoice-app
   
   # JWT Secret (generate a strong random string)
   JWT_SECRET=your_super_secret_key_change_this
   ```

4. **Start the application**
   Run both backend and frontend concurrently:
   ```bash
   npm run dev:full
   ```
   *Alternatively, run them separately:*
   - Server: `npm run server`
   - Client: `npm run dev`

5. **Open your browser**
   Navigate to `http://localhost:5173`

---

## 🎮 Usage

### Getting Started

1. **Sign Up / Sign In**
   - Create a secure account to start saving your data.

2. **Add a Client**
   - Go to the Dashboard or create an invoice.
   - Enter client details (Name, Company, Email, Address).

3. **Create an Invoice**
   - Click "Create Invoice".
   - Select a Client.
   - Add items (Description, Quantity, Price).
   - Set tax rate and notes.
   - Save or Send!

4. **Export & Track**
   - Click "Export PDF" on any invoice to download.
   - Mark invoices as "Paid" when you receive funds.
   - Watch your revenue grow on the Dashboard!

---

## 🎨 Screenshots

<div align="center">

![Dashboard](https://via.placeholder.com/800x400/3b82f6/ffffff?text=Interactive+Dashboard)
*Track your business performance at a glance*

![Invoice Creation](https://via.placeholder.com/800x400/4ade80/ffffff?text=Invoice+Editor)
*Intuitive invoice creation with real-time updates*

![PDF Export](https://via.placeholder.com/800x400/f59e0b/ffffff?text=Professional+PDFs)
*Generate client-ready documents instantly*

</div>

---

## 🏗️ Project Structure

```
invoice-generator/
├── src/
│   ├── api/                 # API integration
│   ├── components/          # React components
│   │   ├── dashboard/       # Dashboard widgets
│   │   ├── invoices/        # Invoice forms and lists
│   │   ├── layout/          # Sidebar and shell
│   │   └── ui/              # Reusable UI components
│   ├── contexts/            # Context API (Auth)
│   ├── lib/                 # Utilities and helpers
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Entry point
├── server/
│   ├── index.cjs            # Express server & API routes
│   └── ...                  # Server utilities
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

This creates a `dist` folder ready for static hosting (Vercel, Netlify).
For the backend, deploy `server/` to a Node.js environment (Render, Railway, Heroku) and set usage environment variables.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

<div align="center">

**Made with ❤️ by SAR**

*Simplifying business, one invoice at a time*

[⬆ Back to top](#-invoicegenerator---professional-invoicing-made-simple)

</div>

