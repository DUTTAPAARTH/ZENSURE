# 🛵 Zensure — Parametric Income Insurance for Food Delivery Partners

> **Guidewire DEVTrails 2026** | Team Submission | Phase 1

---

## The Problem

Zomato and Swiggy delivery partners in Indian cities work 6–10 hours a day and take home roughly ₹3,000–₹7,000 a week. When a red-alert rainstorm hits Chennai or Delhi's AQI spikes past 400, orders dry up and those workers lose 20–30% of their weekly income. There is no insurance product built for this. They absorb the loss entirely.

**Zensure** is a parametric income insurance platform built specifically for food delivery partners. When a qualifying disruption occurs in a worker's active delivery zone, the system detects it automatically, validates it, and sends a payout to the worker's UPI account — without the worker having to do anything.

---

## 👤 Persona: Food Delivery Partner

**Target users:** Zomato and Swiggy delivery partners operating in Mumbai, Chennai, Bengaluru, Hyderabad, and Delhi-NCR.

| Attribute | Details |
|-----------|---------|
| Daily Active Hours | 6–10 hours |
| Weekly Earnings | ₹3,000 – ₹7,000 |
| Payout Cycle | Weekly (platform-based) |
| Primary Risk | Lost income from disruptions outside their control |
| Device | Android smartphone |
| Language | Hindi, Tamil, Telugu, Kannada |

### Three Scenarios That Shaped This Build

**Scenario 1 — Heavy Rain, Chennai:**
Ravi earns around ₹900 on a normal day. A red-alert rain event cuts order volume by 70%, so he earns ₹270 instead. Zensure's weather trigger fires for his zone, validates his activity, and credits him ₹630 within minutes.

**Scenario 2 — AQI Emergency, Delhi:**
When Delhi's AQI crosses 400 (Severe+), outdoor work becomes unsafe. Priya receives a partial daily payout for hours she cannot work. She never opens the app to request it.

**Scenario 3 — Unplanned Bandh, Mumbai:**
A sudden zone-level bandh blocks access to pickup locations. Zensure cross-references traffic and mobility data with the worker's GPS zone and processes a payout for the lost hours.

---

## 🔄 How the Platform Works

```
[Worker Onboarding] → [Risk Profiling] → [Weekly Policy Purchase]
         ↓
[Real-Time Disruption Monitoring] → [Parametric Trigger Fired]
         ↓
[Fraud Validation] → [Auto Claim Approval] → [UPI Payout]
         ↓
[Worker Dashboard: Coverage Status and Earnings Protected]
```

1. **Onboarding** — Worker registers with their Zomato/Swiggy partner ID, delivery zone, and UPI ID. Active partner status is verified via a simulated platform API call.
2. **Risk Profiling** — An ML model scores the worker's zone using historical weather data, flood maps, AQI trends, and past bandh incidents.
3. **Policy Activation** — The worker picks a weekly plan (Mon–Sun). The premium is deducted weekly from their earnings or UPI wallet.
4. **Live Monitoring** — Every 15 minutes, the system checks weather (OpenWeatherMap/IMD), air quality (CPCB), and traffic APIs for the worker's active zone.
5. **Trigger Detection** — If a parametric threshold is breached in the worker's zone, the disruption is flagged automatically.
6. **Fraud Validation** — The system checks GPS activity logs, compares against the worker's 4-week behavioral baseline, and runs duplicate-claim checks.
7. **Payout** — The approved amount is transferred via Razorpay (test mode) within 5 minutes of the trigger.

---

## 💰 Weekly Premium Model

All pricing in Zensure is structured on a weekly basis to match how delivery partners actually earn and spend.

### Plans

| Plan | Weekly Premium | Income Replacement | Max Weekly Payout |
|------|---------------|-------------------|-------------------|
| Basic | ₹29/week | 50% of lost income | ₹1,500 |
| Standard | ₹49/week | 70% of lost income | ₹2,500 |
| Full | ₹79/week | 90% of lost income | ₹4,000 |

### How the Premium is Calculated

The base plan price is adjusted by an XGBoost model trained on the following inputs:

- **Zone Risk Score** — how often the worker's delivery zone has seen qualifying weather or civic disruptions historically
- **Seasonal Factor** — monsoon months (June–September) carry a higher multiplier
- **Worker Activity Score** — average active hours over the past 4 weeks, since more active workers have more income at risk
- **City Tier** — metros with denser disruption history get a small upward adjustment

**Example:** A Standard Shield subscriber in Chennai's T. Nagar zone during peak monsoon may pay ₹59/week instead of ₹49, given a zone risk score of 0.78.

---

## ⚡ Parametric Triggers

Claims are never filed manually. Each trigger below is an objective, measurable threshold. When it is crossed in a worker's active zone, the system acts.

| Trigger | Condition | Data Source | Assumed Income Loss |
|---------|-----------|-------------|---------------------|
| Heavy Rain | Rainfall > 64.5mm/day (IMD Red Alert) | OpenWeatherMap / IMD | 60–80% |
| Extreme Heat | Temperature > 43°C for 3+ consecutive hours | OpenWeatherMap | 40% |
| Severe AQI | AQI > 400 (CPCB Severe+) | CPCB Open API | 50% |
| Cyclone Warning | IMD Cyclone Alert for city zone | IMD RSS Feed | 100% |
| Flash Flood | Flood depth > 0.3m in delivery zone | Flood Watch API / mock | 80–100% |
| Civic Disruption | Verified bandh or curfew in GPS zone | Traffic API + news feed (mock) | 70% |

**Payout formula:**
`Payout = (% Income Loss × Worker's Avg Daily Earning × Disruption Days) × Coverage %`

---

## 🤖 AI/ML Plan

### Premium Calculation Model
- **Algorithm:** XGBoost Regressor
- **Inputs:** Zone coordinates, historical disruption frequency, seasonal index, worker activity score, city-level flood risk
- **Output:** Zone Risk Score (0 to 1) that adjusts the base weekly premium
- **Training data:** IMD historical weather records, CPCB AQI archives, OpenStreetMap zone boundaries

### Fraud Detection
- **Anomaly detection:** An Isolation Forest model flags any claim where the worker's GPS trail does not place them in the disruption zone during the event window
- **Duplicate prevention:** Hash-based deduplication ensures one claim per worker per qualifying event
- **GPS spoofing check:** Location consistency is validated using GPS trail patterns over time
- **Behavioral baseline:** Each worker has a rolling 4-week activity profile. Claims that arrive during periods of unusually low activity are held for review, even if a trigger fired

### Insurer Dashboard Intelligence
- A weather and seasonality model forecasts expected claim volume for the coming week so insurers can monitor premium pool stress early
- Live loss ratio tracking compares premium collected against claims paid, with configurable alert thresholds

---

## 🏗️ Tech Stack

### Frontend
- React.js for the insurer/admin web dashboard
- React Native for the worker-facing Android app
- TailwindCSS + shadcn/ui

### Backend
- Node.js with Express.js
- PostgreSQL for policies, claims, and worker records
- Redis for real-time trigger state caching
- JWT + OTP login (no passwords — reduces friction for gig workers)

### AI/ML
- Python with scikit-learn and XGBoost, served as a FastAPI microservice
- Isolation Forest for fraud detection
- XGBoost Regressor for dynamic premium calculation

### External Integrations

| Integration | Purpose | Access |
|-------------|---------|--------|
| OpenWeatherMap API | Weather triggers | Free tier |
| CPCB AQI API | Air quality triggers | Free |
| IMD RSS Feed | Cyclone and flood alerts | Live RSS |
| OLA Maps / Google Maps | Zone validation | Free tier |
| Razorpay Test Mode | Payout simulation | Sandbox |
| Zomato/Swiggy Partner API | Worker verification | Simulated mock |

### Infrastructure
- Hosted on Render or Railway (free tier)
- CI/CD via GitHub Actions
- Logging with Winston

---

## 📅 6-Week Development Plan

### Phase 1 (Weeks 1–2): Foundation ✅
- [x] Finalize persona, scenarios, disruption triggers
- [x] Choose tech stack
- [x] Design system architecture
- [x] Set up repo and README
- [ ] Figma wireframes
- [ ] API key setup and mock data preparation

### Phase 2 (Weeks 3–4): Core Build
- [ ] Worker onboarding and profile creation
- [ ] Weekly policy creation and ML-based premium engine
- [ ] 3–5 parametric trigger integrations (live or mock)
- [ ] Claims management flow
- [ ] Zero-touch claim UX

### Phase 3 (Weeks 5–6): Polish and Submit
- [ ] Fraud detection module (GPS validation + Isolation Forest)
- [ ] Razorpay sandbox payout flow
- [ ] Worker dashboard (active coverage and earnings protected)
- [ ] Insurer dashboard (loss ratio, next-week forecast)
- [ ] Demo video and pitch deck

---

## 📂 Repository Structure

```
zensure/
├── frontend/           # React.js web app (Insurer Dashboard)
├── mobile/             # React Native worker app
├── backend/            # Node.js + Express API
│   ├── routes/         # Policy, claims, triggers, workers
│   ├── services/       # ML calls, payout, fraud checks
│   └── jobs/           # Scheduled trigger monitoring
├── ml/                 # Python ML service (FastAPI)
│   ├── premium_model/  # XGBoost premium calculator
│   └── fraud_model/    # Isolation Forest fraud detection
├── mock-data/          # Simulated APIs and test datasets
├── docs/               # Architecture diagrams, API specs
└── README.md
```

---

## 👥 Team

| Name | Role |
|------|------|
| Paarth Dutta | Full Stack Development |
| Shivam Rajput | AI/ML & Backend |
| Sparsh Shrivastava | Frontend & UX |
| Sia Arora | Product & Integration |

---

## 🔗 Links

- 📹 **Phase 1 Video:** [Link to be added]
- 🗂️ **Figma Wireframes:** [Link to be added]
- 🌐 **Live Demo:** [Link to be added after Phase 2]

---

> *Zensure — income protection for every kilometre they ride.*
