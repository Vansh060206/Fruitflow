# 🍎 FruitFlow: The Future of B2B Fruit Marketplace

[![Next.js](https://img.shields.io/badge/Next.js-14.2.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-RTDB%20%26%20Auth-ffca28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payment%20Gateway-635bff?style=for-the-badge&logo=stripe)](https://stripe.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-AI%20Intelligence-4285f4?style=for-the-badge&logo=google-gemini)](https://deepmind.google/technologies/gemini/)

> **FruitFlow** is a state-of-the-art B2B marketplace platform designed to bridge the gap between fruit wholesalers and retailers. By integrating real-time logistics, AI-driven market intelligence, and secure payment processing, FruitFlow eliminates supply chain friction and empowers traders with data-driven decision-making.

---

## 🌟 The Vision

Traditional fruit supply chains are plagued by price opacity, manual logistics, and high wastage. **FruitFlow** solves this by providing:
1.  **Price Transparency**: Real-time government mandi prices (Agmarknet) paired with AI predictions.
2.  **Efficient Logistics**: Direct wholesaler-to-retailer tracking with a dedicated driver interface.
3.  **Secure Transactions**: B2B-grade Stripe integration and automated professional invoicing.

---

## ✨ Power-Packed Features

### 🏢 1. Wholesaler: The Command Center
-   **Smart Inventory**: Atomic stock updates ensuring zero "double-selling."
-   **Wastage Control**: Specialized module to track spoilage and optimize profit margins.
-   **Driver Dispatch**: Assign deliveries to active drivers in one click.
-   **AI Insights**: Gemini AI suggests pricing strategies based on national arrival data.

### 🛒 2. Retailer: The Procurement Gateway
-   **Dynamic Marketplace**: Browse fresh inventory across multiple wholesalers with fuzzy search.
-   **Persistent Smart Cart**: Cart items stay synced across all your devices and browser sessions.
-   **Negotiation Engine**: Submit price bids directly to wholesalers—bargain digitally!
-   **Mandi Intelligence**: National volatility charts and AI "Buy/Wait" strategy cards.

### 🚛 3. Driver & Logistics
-   **On-Field Dashboard**: Simplified, high-contrast UI tailored for mobile use on the road.
-   **Real-time Dispatch Queue**: Instant notifications when assigned a new delivery.
-   **Delivery Confirmation**: Triggers automated receipting and payment finalizing.

### 🛡️ 4. Security & Core
-   **2FA Protection**: Secure email-based two-factor authentication for sensitive account actions.
-   **Role-Based Access**: Dedicated portals for Wholesalers, Retailers, and Drivers.
-   **Glassmorphic Design**: A premium, modern UI with rich animations and dark-mode support.

---

## 🛠️ Technical Masterpiece

| Technology | Usage |
| :--- | :--- |
| **Next.js 14+** | High-performance App Router framework. |
| **Firebase RTDB** | Sub-second real-time data synchronization. |
| **Google Gemini Pro** | LLM-powered market sentiment and predictions. |
| **Stripe API** | Secure, industrial-standard payment processing. |
| **Nodemailer** | Secure 2FA and transactional email engine. |
| **jsPDF** | Automated professional invoice generation. |
| **Recharts** | Dynamic market volatility visualization. |

---

## 🚀 Getting Started

### 1. Installation
```bash
git clone https://github.com/your-username/fruitflow.git
cd fruitflow
npm install
```

### 2. Configure Environment `.env.local`
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_DATABASE_URL=xxx
# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
# AI
GEMINI_API_KEY=xxx
# Email
GMAIL_USER=xxx
GMAIL_PASS=xxx
```

### 3. Launch the Platform
```bash
npm run dev
```
Navigate to `http://localhost:3000` to experience the future of fruit trading.

---

## 🗺️ Project Roadmap
-   [x] Real-time Mandi Price Integration
-   [x] AI-Powered Strategy Cards (Gemini)
-   [x] Driver Dispatch System
-   [x] Digital Bidding & Negotiation
-   [ ] Live GPS Delivery Tracking (Google Maps API)
-   [ ] Cold-Chain Sensor Integration

---

## 👨‍💻 Developed By
**Mankani Vansh**  
📧 [mankanivansh273@gmail.com](mailto:mankanivansh273@gmail.com)  
🔗 [LinkedIn Profile](https://linkedin.com/in/vanshmankani)

---
*Built with ❤️ for a more efficient and transparent food supply chain.*
