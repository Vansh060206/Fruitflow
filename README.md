<p align="center">
  <img src="https://img.shields.io/badge/FruitFlow-B2B%20Marketplace-FF6B6B?style=for-the-badge&logo=apple&logoColor=white" alt="FruitFlow"/>
</p>

<h1 align="center">🍎 FruitFlow</h1>
<h3 align="center">AI-Powered B2B Fruit Marketplace Platform</h3>

<p align="center">
  <strong>Transforming Traditional Fruit Supply Chains into Smart, Data-Driven Networks</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2+-black?style=flat-square&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Firebase-RTDB%20%26%20Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase"/>
  <img src="https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=flat-square&logo=google-gemini&logoColor=white" alt="Gemini AI"/>
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe&logoColor=white" alt="Stripe"/>
</p>

<p align="center">
  <a href="#-the-problem">Problem</a> •
  <a href="#-our-solution">Solution</a> •
  <a href="#-key-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-developer">Developer</a>
</p>

---

## 🔴 The Problem

Traditional B2B fruit supply chains are plagued by price opacity, manual logistics, and high wastage. While farmers and wholesalers struggle to find fair pricing and reliable buyers, retailers face unpredictable inventory and logistical delays. There is **no unified system that connects the entire ecosystem while providing intelligent insights**.

### Existing Supply Chains Suffer From Three Major Gaps:

| Gap | Description |
|-----|-------------|
| **📉 Price Opacity** | Markets fluctuate wildly based on local demand, but there is no transparency or real-time data to help traders negotiate fairly. |
| **🚛 Inefficient Logistics** | Deliveries rely on manual coordination, phone calls, and paper receipts, leading to errors, delays, and zero visibility. |
| **🗑️ High Wastage** | Without predictive insights or centralized inventory tracking, fresh produce often spoils before finding a buyer, cutting into profit margins. |

> **Result:** The agricultural supply chain remains fragmented, relying on outdated methods that reduce profitability, increase food waste, and slow down operations.

---

## 💡 Our Solution

**FruitFlow** is a state-of-the-art B2B marketplace platform that bridges the gap between fruit wholesalers and retailers. By integrating real-time logistics, AI-driven market intelligence, and secure payment processing, FruitFlow eliminates supply chain friction.

<p align="center">
  <img src="https://img.shields.io/badge/1-CONNECT-blue?style=for-the-badge" alt="Connect"/>
  <img src="https://img.shields.io/badge/→-white?style=for-the-badge" alt="arrow"/>
  <img src="https://img.shields.io/badge/2-TRADE-green?style=for-the-badge" alt="Trade"/>
  <img src="https://img.shields.io/badge/→-white?style=for-the-badge" alt="arrow"/>
  <img src="https://img.shields.io/badge/3-OPTIMIZE-orange?style=for-the-badge" alt="Optimize"/>
  <img src="https://img.shields.io/badge/→-white?style=for-the-badge" alt="arrow"/>
  <img src="https://img.shields.io/badge/4-DELIVER-gold?style=for-the-badge" alt="Deliver"/>
</p>

### What FruitFlow Does:

| Feature | Description |
|---------|-------------|
| **🤝 Connects** | Provides dedicated portals for Wholesalers, Retailers, and Drivers in a unified marketplace. |
| **💱 Facilitates** | Enables digital bidding, instant negotiation, and dynamic marketplace browsing with a persistent smart cart. |
| **🧠 Optimizes** | Leverages Google Gemini AI and real-time government mandi prices to suggest pricing and "Buy/Wait" strategies. |
| **🚚 Delivers** | Tracks deliveries via an on-field driver dashboard, automating receipts and final payments upon arrival. |

---

## ⭐ Key Features

### 🏢 Wholesaler: The Command Center
- **Smart Inventory**: Atomic stock updates ensuring zero "double-selling."
- **Wastage Control**: Specialized module to track spoilage and optimize profit margins.
- **Driver Dispatch**: Assign deliveries to active drivers in one click.
- **AI Insights**: Gemini AI suggests pricing strategies based on national arrival data.

### 🛒 Retailer: The Procurement Gateway
- **Dynamic Marketplace**: Browse fresh inventory across multiple wholesalers with fuzzy search.
- **Persistent Smart Cart**: Cart items stay synced across all your devices and browser sessions.
- **Negotiation Engine**: Submit price bids directly to wholesalers—bargain digitally!
- **Mandi Intelligence**: National volatility charts and AI "Buy/Wait" strategy cards.

### 🚛 Driver & Logistics
- **On-Field Dashboard**: Simplified, high-contrast UI tailored for mobile use on the road.
- **Real-time Dispatch Queue**: Instant notifications when assigned a new delivery.
- **Delivery Confirmation**: Triggers automated receipting and payment finalizing.

### 🛡️ Security & Core
- **2FA Protection**: Secure email-based two-factor authentication for sensitive account actions.
- **Role-Based Access**: Dedicated portals and permissions.
- **Glassmorphic Design**: A premium, modern UI with rich animations and dark-mode support.
- **Automated Invoicing**: Professional PDF generation powered by jsPDF.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              FruitFlow Platform Architecture                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│    ┌───────────────────────────────────────────────────────────────────────────┐   │
│    │                          Next.js 14 App Router                            │   │
│    │                                                                           │   │
│    │   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐           │   │
│    │   │  Wholesaler  │      │   Retailer   │      │    Driver    │           │   │
│    │   │  Dashboard   │      │  Marketplace │      │  Interface   │           │   │
│    │   └──────┬───────┘      └──────┬───────┘      └──────┬───────┘           │   │
│    └──────────┼─────────────────────┼─────────────────────┼────────────────────┘   │
│               │                     │                     │                        │
│               │                     │                     │                        │
│               ▼                     ▼                     ▼                        │
│    ┌───────────────────────────────────────────────────────────────────────────┐   │
│    │                            Firebase Services                              │   │
│    │                                                                           │   │
│    │   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐           │   │
│    │   │     Auth     │      │   Realtime   │      │   Cloud      │           │   │
│    │   │  (JWT/OAuth) │      │   Database   │      │   Storage    │           │   │
│    │   └──────────────┘      └──────────────┘      └──────────────┘           │   │
│    └────────────────────────────────┬──────────────────────────────────────────┘   │
│                                     │                                              │
│               ┌─────────────────────┼─────────────────────┐                        │
│               ▼                     ▼                     ▼                        │
│    ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐                │
│    │   Gemini AI     │   │   Stripe API    │   │   Agmarknet     │                │
│    │   (Intelligence)│   │   (Payments)    │   │   (Mandi Data)  │                │
│    └─────────────────┘   └─────────────────┘   └─────────────────┘                │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14+** | High-performance App Router framework |
| **React 18** | UI component architecture |
| **TailwindCSS** | Rapid styling with glassmorphism & dark mode |
| **Recharts** | Dynamic market volatility visualization |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| **Firebase RTDB** | Sub-second real-time data synchronization |
| **Firebase Auth** | Secure user authentication |
| **Nodemailer** | Secure 2FA and transactional email engine |
| **jsPDF** | Automated professional invoice generation |

### APIs & Integrations
| Technology | Purpose |
|------------|---------|
| **Google Gemini Pro** | LLM-powered market sentiment and predictions |
| **Stripe API** | Secure, industrial-standard payment processing |
| **Agmarknet API** | Real-time government mandi prices |

---

## 📁 Project Structure

```
FruitFlow/
├── 📁 role-selection-page/      # Main Next.js Application
│   ├── 📁 app/                  # App Router
│   │   ├── 📁 api/              # API Routes (Stripe, Email, 2FA)
│   │   ├── 📁 wholesaler/       # Wholesaler Dashboard & Tools
│   │   ├── 📁 retailer/         # Retailer Marketplace & Cart
│   │   ├── 📁 driver/           # Driver Logistics Interface
│   │   └── globals.css          # Tailwind & Theme Configuration
│   ├── 📁 components/           # Reusable UI Components
│   ├── 📁 lib/                  # Firebase Config, Utilities
│   ├── 📁 hooks/                # Custom React Hooks
│   ├── 📁 public/               # Static Assets
│   ├── firebase.json            # Firebase Configuration
│   └── package.json             # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **Firebase Account** (for RTDB and Auth)
- **Stripe Account** (for payment processing)
- **Git**

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Vansh060206/Fruitflow.git
cd Fruitflow/role-selection-page
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment `.env.local`

Create a `.env.local` file in the `role-selection-page` directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# AI
GEMINI_API_KEY=your_gemini_key

# Email (Nodemailer)
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password
```

### 4️⃣ Launch the Platform

```bash
npm run dev
# Running on http://localhost:3000
```
Navigate to `http://localhost:3000` to experience the future of fruit trading.

---

## 🎮 User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           User Journey                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  1. Role Selection & Login    │
                    │     (Wholesaler/Retailer)     │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌─────────────────────────┐                       ┌─────────────────────────┐
│       Wholesaler        │                       │        Retailer         │
│ 2a. Add/Manage Stock    │                       │ 2b. Browse Marketplace  │
│     (Atomic updates)    │                       │     (AI Price Insights) │
└──────────┬──────────────┘                       └──────────┬──────────────┘
           │                                                 │
           │                                                 ▼
           │                                      ┌─────────────────────────┐
           │                                      │ 3. Add to Smart Cart &  │
           │                                      │    Submit Bid/Order     │
           │                                      └──────────┬──────────────┘
           ▼                                                 │
┌─────────────────────────┐                                  │
│ 4. Review & Accept Bid  │◄─────────────────────────────────┘
│    (Negotiation Engine) │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐                       ┌─────────────────────────┐
│ 5. Dispatch Order       │                       │       Driver            │
│    (Assign Driver)      │──────────────────────►│ 6. Receive Assignment & │
└─────────────────────────┘                       │    Confirm Delivery     │
                                                  └──────────┬──────────────┘
                                                             │
                                                             ▼
                                                  ┌─────────────────────────┐
                                                  │ 7. Payment Processed &  │
                                                  │    PDF Invoice Sent     │
                                                  └─────────────────────────┘
```

---

## 🔮 Future Roadmap

- [x] Real-time Mandi Price Integration
- [x] AI-Powered Strategy Cards (Gemini)
- [x] Driver Dispatch System
- [x] Digital Bidding & Negotiation
- [ ] Live GPS Delivery Tracking (Google Maps API)
- [ ] Cold-Chain Sensor Integration
- [ ] Mobile App - React Native cross-platform application
- [ ] Multi-Language Support - Regional languages for local traders

---

## 🏆 Impact & Capabilities

- 🥇 **Built for Scale** — Sub-second synchronization using Firebase RTDB
- 🔗 **End-to-End Integration** — Inventory → Negotiation → Dispatch → Delivery
- 🌍 **Market Intelligence** — Converting raw Mandi data into actionable trading strategies
- 🔒 **Enterprise-Grade Security** — 2FA protection and secure B2B payments

---

## 👨‍💻 Developer

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Vansh060206">
        <img src="https://avatars.githubusercontent.com/u/124706598?v=4" width="100px;" alt=""/>
        <br />
        <sub><b>Mankani Vansh</b></sub>
      </a>
      <br />
      <sub>Full Stack Developer</sub>
      <br />
      <sub>🔧 End-to-End Development</sub>
    </td>
  </tr>
</table>

- 📧 **Email:** [mankanivansh273@gmail.com](mailto:mankanivansh273@gmail.com)
- 🔗 **LinkedIn:** [linkedin.com/in/vanshmankani](https://linkedin.com/in/vanshmankani)
- 🐙 **GitHub:** [github.com/Vansh060206](https://github.com/Vansh060206)

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the powerful React framework
- [Firebase](https://firebase.google.com/) for real-time infrastructure
- [Agmarknet](https://agmarknet.gov.in/) for agricultural market data
- [Google Gemini API](https://deepmind.google/technologies/gemini/) for AI intelligence
- [Stripe](https://stripe.com/) for seamless payment processing

- **GitHub Repository:** [https://github.com/Vansh060206/Fruitflow](https://github.com/Vansh060206/Fruitflow)

---

<p align="center">
  <strong>🌱 Built with passion for a more efficient food supply chain 🌍</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge" alt="Made with love"/>
</p>

<p align="center">
  <sub>If you found this project useful, please consider giving it a ⭐!</sub>
</p>
