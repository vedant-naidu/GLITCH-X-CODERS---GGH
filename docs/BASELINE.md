# FXWise — Phase 0 Baseline Observations

Captured on: October 23, 2026

## Baseline Screenshots Stored in `docs/baseline-screenshots/`:
1. `baseline_home_desktop.png` — Main workbench and hero at 1280px viewport
2. `baseline_home_mobile.png` — Main workbench and hero at 375px mobile viewport
3. `baseline_student.png` — Student persona page
4. `baseline_freelancer.png` — Freelancer persona page
5. `baseline_travel.png` — Travel persona page
6. `baseline_dashboard.png` — User dashboard page

## Key Baseline Observations & Pre-existing Issues Identified (Mapped to Plan):
1. **B1 (P0): Inverted Markup / Inconsistent Currencies in Hero:**
   - Hidden Loss is displayed as `$9,790.32` while Amount Received is `₹73,329.68` for a 1,000 USD to INR conversion.
   - Effective rate calculation logic in `utils/finance.ts` needs pure mathematical foundation where markup strictly worsens user rate.
2. **B11 (P0): Real-time claims overstate daily reference rate:**
   - Badge in hero explicitly says `"REAL-TIME RATE TRANSPARENCY"`.
   - Must be updated to `"daily mid-market reference rate"` with an `"as of"` date label.
3. **B4 (P1): Traveler persona page inconsistency:**
   - Recommended providers list credit cards with high spread markup rather than specialized zero-forex cards (Niyo Global).
4. **B3 (P1): Freelancer copy discrepancies:**
   - Tip percentages are static and do not reconcile with live calculation results.
5. **V8: Mobile table responsiveness:**
   - 375px mobile viewport shows opportunities for stacked card layout improvements.
