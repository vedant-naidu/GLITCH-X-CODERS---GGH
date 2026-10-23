# FXWise 💱

> **Stop Losing Money on Hidden Forex Charges.**

FXWise is an AI-powered fintech platform that uncovers hidden costs in international payments. Instead of comparing only visible fees, FXWise analyzes exchange-rate markups, forex spreads, GST, processing charges, and effective exchange rates to recommend the most cost-effective payment provider.

Think of it as **Google Flights for international payments.**

---

## ✨ Features

### 🔍 Hidden Fee Detector
Reveal costs that providers don't clearly advertise.

- Hidden exchange-rate markups
- Forex spreads
- Processing charges
- GST
- Fixed & percentage fees
- Effective exchange rates
- Actual amount received

---

### 📊 Transparency Score

Every provider receives a proprietary **Transparency Score (0–100)** based on:

- Exchange markup
- Hidden fees
- Fee clarity
- Effective exchange rate
- Total cost

Badges include:

- 🟢 Excellent
- 🔵 Good
- 🟡 Average
- 🔴 Poor

---

### 🤖 AI Financial Advisor

Ask questions like:

- Should I use Wise or PayPal?
- What's the cheapest way to pay tuition abroad?
- Which provider gives freelancers the highest take-home income?
- Why is this provider expensive?

The AI references the user's current comparison instead of providing generic advice.

---

### 👤 Persona-Based Recommendations

FXWise adapts recommendations for different users.

- 🎓 International Students
- 💼 Freelancers
- ✈️ Travelers
- 🏢 Businesses

Each persona receives personalized provider rankings and financial insights.

---

### 📈 Analytics Dashboard

Visualize payment costs through:

- Fee Breakdown
- Transparency Metrics
- Savings Analysis
- Amount Received
- Historical Exchange Rates

Charts include:

- Pie Charts
- Bar Charts
- Horizontal Bar Charts
- Historical Trend Graphs

---

### 💰 Savings Calculator

Estimate how much you could save by switching providers.

Example:

> Switching from PayPal to Wise could save **₹1,740** on a single transfer.

---

## 🌍 Supported Payment Providers

- Wise
- PayPal
- Payoneer
- Visa
- Mastercard
- Flywire
- Revolut
- Western Union
- BookMyForex
- HDFC Bank
- ICICI Bank
- Niyo Global

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Animation | Framer Motion |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| AI | Google Gemini API (@google/genai) |
| Deployment | Vercel |

---

## 📂 Project Structure

```
app/
components/
features/
    comparison/
    exchange/
    providers/
    ai/
    analytics/
    dashboard/
services/
hooks/
lib/
types/
utils/
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/<username>/fxwise.git
```

```bash
cd fxwise
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env.local` file.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash-lite

EXCHANGE_RATE_API_KEY=
```

### Start the development server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 🔐 Authentication

FXWise uses Supabase Authentication.

Supported methods:

- Email & Password
- Google OAuth
- Password Reset

Protected routes include:

- Dashboard
- Saved Comparisons
- Favorites
- Reports

---

## 📡 APIs

- Frankfurter API
- ExchangeRate API
- Google Gemini API
- Supabase

---

## 🎯 Core Vision

FXWise exists to make international payments transparent.

Instead of asking:

> "Which provider charges the lowest fee?"

Users can finally answer:

> **"Which provider lets me keep the most of my money?"**

---

## 🏗 Development Goals

- Clean Architecture
- Strict TypeScript
- Reusable Components
- Responsive Design
- Accessibility (WCAG)
- Error Boundaries
- Skeleton Loaders
- Feature-Based Structure
- Production Ready

---

## 🤝 Contributing

Contributions are welcome.

Please open an issue before submitting major feature requests or pull requests.

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
<b>FXWise</b><br>
Making international payments transparent, one transfer at a time.
</p>
