# FXWise — Bug-Fix & Hardening Issue Tracker

This tracker tracks all verified bugs (**B1–B12**) and verification tasks (**V1–V10**) outlined in the development plan.

---

## 🎯 Bug Register (B1–B12)

| Bug ID | Priority | Target Phase | Description | Root Cause / Scope | Status | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **B1** | **P0** | Phase 1 & 3 | Hero example has the wrong direction (`Advertised 1 USD = ₹83.00, Effective ₹80.70, Loss −₹2,300`). Markup must make the effective rate worse (higher INR per USD). | Calculation engine formula inverted markup; hero displayed wrong math. | 🟢 Closed (Engine & Hero UI verified; effective rate worse than mid-market; math adds up) | Senior Full-Stack |
| **B2** | **P0** | Phase 1 & 3 | Hardcoded ₹83 rate in hero. Stale static value. | Hero component hardcoded static numbers instead of querying rate service. | 🟢 Closed (Dynamic ECB reference rate service with live query & fallback) | Senior Full-Stack |
| **B11** | **P0** | Phase 1 & 3 | "Real-time" and "live" claims overstate daily ECB reference rate from Frankfurter. | UI copy claims real-time; needs "daily mid-market reference rate" and "as of" date label. | 🟢 Closed (Copy updated; explicit 'as of' date label & fallback stale indicator active) | Senior Full-Stack |
| **B3** | **P1** | Phase 3 | Freelancer tip math error (`4% markup + 4.4% fee can eat ~7%`, `Wise is 5–8x cheaper` unsourced). | Hardcoded copy doesn't add up (4% + 4.4% = 8.4%); claims lack sourced derivations. | 🟢 Closed (Freelancer page tip corrected to 8.4% total drain; data-backed ~7.3x savings) | Senior Full-Stack |
| **B4** | **P1** | Phase 2 & 3 | Traveler page contradictions: recommends cards while tips state cards add 3.5% markup; Niyo Global omitted from ranking. | Static provider mapping inconsistent with persona recommendation weights. | 🟢 Closed (Niyo Global & Wise ranked #1 & #2 on Traveler page; credit cards tagged with 1.5%–3.5% markup) | Senior Full-Stack |
| **B5** | **P1** | Phase 3 | Business GST tip accuracy (`GST on forex conversion caps at ₹60,000`). ₹60k is the cap on taxable service value, not final tax. | Needs neutral wording and verification against official tax authority schedule. | 🟢 Closed (Dashboard updated with Rule 32(2) CGST calculation: ₹60,000 taxable value cap, max tax ₹10,800) | Senior Full-Stack |
| **B6** | **P2** | Phase 2 & 3 | Business recommendations include Western Union cash pickup (ill-fitted for vendor invoice settlement). | Ill-suited persona mapping for B2B cross-border payments. | 🟢 Closed (Western Union deprioritized to bottom; Airwallex, Wise, Payoneer prioritized) | Senior Full-Stack |
| **B7** | **P2** | Phase 2 & 3 | Mixed provider categories: Visa & Mastercard are card payment networks, not direct remittance providers. | Needs relabelling to `Credit card (typical)` with clear category metadata. | 🟢 Closed (Visa & Mastercard categorized as card_network with Credit Card typical labeling) | Senior Full-Stack |
| **B8** | **P2** | Phase 3 | Inconsistent markup ranges and titles (`0.4–4%` vs `1–4%`; page title vs meta title mismatch). | Static copy discrepancies across headers and metadata. | 🟢 Closed (Derived dynamic markup range 0.4%–4.0% from catalog; aligned layout meta title) | Senior Full-Stack |
| **B9** | **P1** | Phase 2 & 3 | Unsourced marketing claims (`3,500+ universities`, `zero markup`). | Missing public source URL and last-verified date metadata. | 🟢 Closed (Softened Flywire and Niyo claims; backed by verified notes & URLs) | Senior Full-Stack |
| **B10** | **P2** | Phase 6 | README and repo discrepancies (placeholder clone URL, outdated app structure, unneeded web3 topics). | Documentation drifted from working implementation. | ⚪ Pending Phase 6 | Senior Full-Stack |
| **B12** | **P1** | Phase 2 & 3 | Provider fees rely on illustrative demo data without verifiable source citations. | Lacks verified pricing data model with source links and last-checked dates. | 🟢 Closed (Surfaced verified pricing links and last-verified timestamps on all quote cards) | Senior Full-Stack |

---

## 🔍 Verification Tasks (V1–V10)

| Task ID | Target Phase | Description | Gate / Test Criteria | Status | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **V1** | Phase 1 | Amount boundaries: 0, negative, empty, non-numeric, huge amounts (₹10 crore). | Zod validation rejects cleanly with typed user-friendly error messages. | 🟢 Closed (9 tests passing in `tests/validation.test.ts`) | Senior Full-Stack |
| **V2** | Phase 1 | Same source and destination currency (e.g. USD to USD). | Rejection with clear prompt to select distinct currency pair. | 🟢 Closed (Refinement error verified in `tests/validation.test.ts`) | Senior Full-Stack |
| **V3** | Phase 1 & 4 | Unsupported currencies not provided by Frankfurter (AED, NGN, PKR). | Clear message explaining currency support limits of reference source. | 🟢 Closed (ECB whitelist rejection tested in `tests/rate-service.test.ts` & `validation.test.ts`) | Senior Full-Stack |
| **V4** | Phase 1 & 4 | Frankfurter API timeout / network failure handling. | Request timeout (8s), single retry, fallback to cached rate with stale badge. | 🟢 Closed (8s timeout, retry, & `isStale: true` fallback tested in `tests/rate-service.test.ts`) | Senior Full-Stack |
| **V5** | Phase 4 | AI provider error / quota / key failure handling. | Bounded fallback advice generated from structured comparison table without UI crash. | 🟢 Closed (Gemini fallback active) | Senior Full-Stack |
| **V6** | Phase 4 | AI advisor context: passes full structured comparison payload instead of just persona string. | Advisor references actual comparison figures (providers, spreads, fees, scores). | 🟢 Closed (POST /api/ai payload verified) | Senior Full-Stack |
| **V7** | Phase 4 | Supabase Auth flows (Google OAuth on production domain, email signup, password reset). | Verified on production domain with route protection middleware. | ⚪ Pending Phase 4 | Senior Full-Stack |
| **V8** | Phase 3 & 5 | Responsive UI: comparison table and Recharts responsiveness at 375px, 768px, 1280px. | No horizontal overflow; readable charts and scrollable/stacked tables. | 🟢 Closed (Responsive containers and mobile-first layouts verified) | Senior Full-Stack |
| **V9** | Phase 3 | URL state synchronisation: amount, source, destination, purpose restored on page reload/share. | URL search params reflect form state and hydrate on mount. | 🟢 Closed (Two-way query param hydration & sync verified in `tests/url-state.test.ts`) | Senior Full-Stack |
| **V10** | Phase 3 | Transparency score calibration: provider with zero fees but 3% hidden markup must score below "Good". | Formula correctly penalises hidden spread markup. | 🟢 Closed (Calibration verified in `tests/transparency-score.test.ts`: >=3% markup scores < 72) | Senior Full-Stack |

---

## 📌 Phase Progression & Milestones

- [x] **Phase 0 — Setup and baseline** (Branch: `fix/phase-0-setup-baseline`)
- [x] **Phase 1 — Calculation engine and backend services** (Branch: `fix/phase-1-calc-engine`)
- [x] **Phase 2 — Database and provider data** (Branch: `fix/phase-2-provider-database`)
- [x] **Phase 3 — Frontend and content** (Branch: `fix/phase-3-frontend-content`)
- [ ] **Phase 4 — Integrations** (Branch: `fix/phase-4-integrations`)
- [ ] **Phase 5 — Testing and QA** (Branch: `fix/phase-5-qa-regression`)
- [ ] **Phase 6 — Deployment and demo readiness** (Branch: `fix/phase-6-release-readiness`)
