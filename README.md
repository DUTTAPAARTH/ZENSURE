# 🛵 Zensure — Parametric Income Insurance for Food Delivery Partners

> **Guidewire DEVTrails 2026** | Team Submission | Phase 1

---

## The Problem

Zomato and Swiggy delivery partners in Indian cities work 6–10 hours a day and take home roughly ₹3,000–₹7,000 a week. When a red-alert rainstorm hits Chennai or Delhi's AQI spikes past 400, orders dry up and those workers lose 20–30% of their weekly income. There is no insurance product built for this. They absorb the loss entirely.

**Zensure** is a parametric income insurance platform built specifically for food delivery partners. When a qualifying disruption occurs in a worker's active delivery zone, the system detects it automatically, validates it, and sends a payout to the worker's UPI account — without the worker having to do anything.

---

## 👤 Persona: Food Delivery Partner

**Target users:** Zomato and Swiggy delivery partners operating in Mumbai, Chennai, Bengaluru, Hyderabad, and Delhi-NCR.

| Attribute          | Details                                            |
| ------------------ | -------------------------------------------------- |
| Daily Active Hours | 6–10 hours                                         |
| Weekly Earnings    | ₹3,000 – ₹7,000                                    |
| Payout Cycle       | Weekly (platform-based)                            |
| Primary Risk       | Lost income from disruptions outside their control |
| Device             | Android smartphone                                 |
| Language           | Hindi, Tamil, Telugu, Kannada                      |

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

| Plan     | Weekly Premium | Income Replacement | Max Weekly Payout |
| -------- | -------------- | ------------------ | ----------------- |
| Basic    | ₹29/week       | 50% of lost income | ₹1,500            |
| Standard | ₹49/week       | 70% of lost income | ₹2,500            |
| Full     | ₹79/week       | 90% of lost income | ₹4,000            |

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

| Trigger          | Condition                                   | Data Source                    | Assumed Income Loss |
| ---------------- | ------------------------------------------- | ------------------------------ | ------------------- |
| Heavy Rain       | Rainfall > 64.5mm/day (IMD Red Alert)       | OpenWeatherMap / IMD           | 60–80%              |
| Extreme Heat     | Temperature > 43°C for 3+ consecutive hours | OpenWeatherMap                 | 40%                 |
| Severe AQI       | AQI > 400 (CPCB Severe+)                    | CPCB Open API                  | 50%                 |
| Cyclone Warning  | IMD Cyclone Alert for city zone             | IMD RSS Feed                   | 100%                |
| Flash Flood      | Flood depth > 0.3m in delivery zone         | Flood Watch API / mock         | 80–100%             |
| Civic Disruption | Verified bandh or curfew in GPS zone        | Traffic API + news feed (mock) | 70%                 |

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

## 🛡️ Adversarial Defense & Anti-Spoofing Strategy

> **Context:** A coordinated syndicate of 500 delivery workers organized via Telegram has successfully drained a competitor's liquidity pool by using GPS-spoofing apps to fake locations inside active weather trigger zones while sitting at home. Simple GPS coordinate checks are no longer sufficient. This section documents how Zensure's architecture addresses this threat.

---

### 1. How We Differentiate a Genuine Stranded Worker from a Bad Actor

GPS coordinates alone tell us where a device _claims_ to be. We cross-validate that claim against a stack of independent, harder-to-fake signals before any payout is approved.

**Motion and Sensor Consistency**

A delivery worker caught in a rainstorm behaves differently from someone sitting at home. We analyze accelerometer and gyroscope data from the worker's phone over the claim window. A stationary device with low variance in all axes, combined with a claimed location inside a flood zone, is a strong fraud signal. Spoofing apps can fake GPS coordinates but cannot consistently fake realistic motion patterns across an extended time window.

**Network Triangulation Cross-Check**

GPS can be overridden at the app level. Cell tower triangulation and Wi-Fi network positioning cannot be overridden from the same layer. Zensure cross-checks the GPS-reported location against the device's cell tower and Wi-Fi positioning data independently. A 500-meter or greater mismatch between GPS and network-derived location triggers an automatic hold on the claim.

**Platform Activity Feed Validation**

A genuinely stranded worker has no active deliveries during the disruption window because orders are not being assigned in that zone. We cross-reference the worker's platform activity log (via simulated Zomato/Swiggy API) for the claim period. If a worker claims income loss from being stranded but their platform log shows they accepted and completed orders during the same window, the claim is rejected immediately.

**Hyper-Local Weather Footprint Check**

We do not just check whether a weather event occurred in a city. We verify whether the specific micro-zone the worker claims to be in received qualifying rainfall or AQI readings at that time, using grid-level weather data (OpenWeatherMap's 1km resolution grid). A worker whose GPS places them outside the actual affected grid cell will not have a trigger fire for their location.

---

### 2. Data Points We Analyze to Detect a Coordinated Fraud Ring

Individual fraud is hard to hide. Coordinated fraud at scale leaves statistical fingerprints.

| Signal                               | What It Reveals                                                                                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claim velocity per zone              | 40+ workers in the same 1km zone all filing within a 10-minute window is statistically anomalous and flags a ring event                                       |
| Device fingerprint clustering        | Multiple claims from devices sharing the same Wi-Fi router MAC address or IP subnet reveal workers spoofing from one location                                 |
| GPS path entropy                     | Legitimate workers in bad weather show erratic, low-speed GPS trails. Spoofed locations show perfectly static coordinates or unnaturally smooth paths         |
| New policy + immediate claim pattern | Workers who purchase a policy and file a claim within the first active week during a known trigger event are scored higher risk                               |
| Pre-event policy surge               | Sudden spikes in policy purchases from a specific zone in the 24–48 hours before a forecasted major weather event is a known syndicate behavior pattern       |
| Behavioral deviation score           | A claim that arrives when active hours, GPS trails, and order acceptance rates all deviate sharply downward simultaneously is flagged                         |
| Cross-worker device graph            | If two workers have never shared a GPS zone before but suddenly both claim from the same location during one event, a graph-based anomaly model connects them |

When 3 or more workers share two or more of the above signals simultaneously, the system computes a **Ring Score**. Claims contributing to a Ring Score above 0.7 are auto-held for manual review before any payout is released.

---

### 3. UX Balance: Handling Flagged Claims Without Penalizing Honest Workers

A legitimate worker in a severe storm may have patchy GPS, dropped network signal, and no recent platform activity — all of which look like fraud signals individually. The system must not punish them.

**Tiered Hold System**

Zensure does not reject flagged claims outright. Every claim lands in one of three states:

- **Auto-Approved** — all signals are consistent. Payout within 5 minutes.
- **Soft Hold** — 1 or 2 signals are ambiguous (e.g., weak network triangulation from storm interference). The worker gets an in-app notification explaining the hold and has a 4-hour window to submit one supplementary proof item — a photo of their surroundings or a single-tap location re-ping when connectivity returns. If there is no response within 4 hours, the claim is auto-approved at 70% payout, giving the worker benefit of the doubt.
- **Hard Hold** — 3 or more strong fraud signals are present, or the worker is part of a flagged Ring Score cluster. The claim is held for manual insurer review within 24 hours. The worker is notified immediately with a plain-language explanation and a helpline contact.

**No Silent Rejections**

Every flagged or held claim triggers an in-app notification in the worker's preferred language explaining exactly which signal caused the hold. Workers are never left wondering why their payout is delayed. This is both a trust mechanism and a deterrent — bad actors who see their specific spoofing method named in the rejection notice learn the system can see through it.

**Reputation Score Protection**

A single flagged claim does not affect a worker's future premiums. Only workers with 3 or more confirmed fraud findings within a 90-day window face policy suspension. First-time ambiguous flags are logged but do not change the worker's risk score.

**Network Drop Grace Rule**

During an active weather trigger event, Zensure applies a network drop grace period. If a worker's GPS signal disappears entirely for up to 45 minutes during the event window, the system treats this as connectivity loss from the storm rather than evasion. The last confirmed location before the signal drop is used for zone validation. This rule only activates when an independent weather trigger is already live for that zone.

---

### Architecture Summary

```
[GPS Coordinates]
        +
[Accelerometer / Gyroscope Data]    ──→  [Motion Consistency Check]
        +
[Cell Tower / Wi-Fi Triangulation]  ──→  [Location Cross-Validation]
        +
[Platform Activity Log]             ──→  [Order Activity Check]
        +
[Claim Velocity in Zone]            ──→  [Ring Score Model]
        +
[Device Fingerprint Graph]          ──→  [Cluster Detection]
        ↓
[Fraud Confidence Score: 0 to 1]
        ↓
Auto-Approve  /  Soft Hold  /  Hard Hold
```

The fraud layer runs in parallel with the trigger detection pipeline. It adds no delay to legitimate payouts and surfaces holds only when the evidence warrants it.

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

| Integration               | Purpose                  | Access         |
| ------------------------- | ------------------------ | -------------- |
| OpenWeatherMap API        | Weather triggers         | Free tier      |
| CPCB AQI API              | Air quality triggers     | Free           |
| IMD RSS Feed              | Cyclone and flood alerts | Live RSS       |
| OLA Maps / Google Maps    | Zone validation          | Free tier      |
| Razorpay Test Mode        | Payout simulation        | Sandbox        |
| Zomato/Swiggy Partner API | Worker verification      | Simulated mock |

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
- [x] Adversarial defense architecture designed
- [ ] Figma wireframes
- [ ] API key setup and mock data preparation

### Phase 2 (Weeks 3–4): Core Build

- [ ] Worker onboarding and profile creation
- [ ] Weekly policy creation and ML-based premium engine
- [ ] 3–5 parametric trigger integrations (live or mock)
- [ ] Claims management flow
- [ ] Zero-touch claim UX

### Phase 3 (Weeks 5–6): Polish and Submit

- [ ] Fraud detection module (GPS validation + Isolation Forest + Ring Score)
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
│   └── fraud_model/    # Isolation Forest + Ring Score detection
├── mock-data/          # Simulated APIs and test datasets
├── docs/               # Architecture diagrams, API specs
└── README.md
```

---

## 👥 Team

| Name               | Role                   |
| ------------------ | ---------------------- |
| Paarth Dutta       | Full Stack Development |
| Shivam Rajput      | AI/ML & Backend        |
| Sparsh Shrivastava | Frontend & UX          |
| Sia Arora          | Product & Integration  |

---

## 🔗 Links

- 🗂️ **Figma Wireframes:** [WIREFRAME LINK](https://www.figma.com/make/aMEKCujAiyVQFiKdCoanft/Zensure-Mobile-Wireframe-Design?t=dx9COwY2TnIqolab-1&preview-route=%2Fworker%2Fonboarding)
- 🌐 **Live Demo:** [Link to be added after Phase 2]

---

> _Zensure — income protection for every kilometre they ride._
