# BITSS Prestige Realty — Full Change Request for Dev Agent

**Site:** prestigerealty.thebitss.com  
**Date:** June 2026  
**Total Tasks:** 10  

---

## TASK 01 — Add Payment Plan Field

### Admin Panel (Property Form)
- Add a new text input field labeled `PAYMENT PLAN`
- Input type: free text (e.g. `70/30`, `20/80`, `60/40`)
- Place it near Price and Down Payment fields in the form
- Must be editable at any time after saving

### Client Dashboard (Property Card)
- Display the Payment Plan value on the property listing card **without** the client needing to open View Details
- If the field is left blank in admin, **do not show** it on the client card at all

---

## TASK 02 — Price Format: AED M / K Display

### Client Dashboard Only (admin keeps full numbers)
Convert all price values shown to clients into short AED format:

| Raw Value | Display |
|-----------|---------|
| 649000 | AED 649K |
| 800000 | AED 800K |
| 2065065 | AED 2.06M |
| 3500000 | AED 3.5M |
| 247000 | AED 247K |

### Formatting Logic
```
if value >= 1,000,000 → divide by 1,000,000, round to 2 decimal places, append "M"
if value < 1,000,000 → divide by 1,000, round to nearest whole, append "K"
always prefix with "AED "
```

### Applies To (client side only)
- Entry Price on property card
- Our Offer price on property card
- Unit Option prices
- Any other price field visible to the client

> Admin form values must remain as full numbers for accuracy.

---

## TASK 03 — Property Status Field

### Admin Panel (Property Form)
- Add a dropdown field labeled `STATUS`
- Options:
  - `Ready`
  - `Pre-Launch`
  - `Under Construction`
  - `Ready to Rent`

### Client Dashboard (Property Card)
- Show the selected status as a badge on the property card (similar to existing `HOT` / `DISTRESS` badges)
- Badge should appear on top of the property image
- Style to match HOT/DISTRESS badge design

---

## TASK 04 — Show Handover Date on Client Card

### Context
Handover Date is already collected in the admin form but is **not displayed** on the client property card.

### Change
- Pull the existing Handover Date value and display it on the property listing card
- Position: below Entry Price or in the card info section
- Format: display as entered (e.g. `Q3 2026`)
- No new data entry needed — display-only change

---

## TASK 05 — Add Size (sqft) to Unit Options

### Admin Panel (Property Form → Unit Options Section)
Each unit row currently has: `Unit Type`, `Price (AED)`, `Yield (%)`

- Add a new field: `SIZE (SQFT)` — number input
- Add it to every unit row alongside the existing fields
- Apply to both existing rows and new rows added via `+ Add Row`

### Client Dashboard
- Show size (sqft) alongside unit details
- If left blank, **do not display** it on the client side

---

## TASK 06 — Add Plot Size Field for Villas / Townhouses

### Admin Panel (Property Form → Unit Options Section)
- Add an optional field: `PLOT SIZE (SQFT)` — number input
- This field is intended for Villa and Townhouse unit types only
- Field is fully optional

### Client Dashboard
- If Plot Size is filled → show it on the client dashboard under unit details
- If Plot Size is blank → **hide completely**, no empty placeholder shown

---

## TASK 07 — Show Capital Gain % on Client Property Card

### Context
Capital Appreciation (5YR %) is already shown inside View Details but is missing from the property card.

### Change
- Display Capital Gain % on the property listing card
- Position: next to or just above Projected Yield
- Label: `CAPITAL GAIN (5YR)`
- Data source: existing `Capital Apprec. 5YR (%)` field — display-only change, no new input needed

---

## TASK 08 — % Below Market Badge

### Admin Panel (Property Form)
- Add an optional number input field: `% BELOW MARKET (OPTIONAL)`
- Example: enter `10` to indicate the property is 10% below market value

### Client Dashboard (Property Card)
- If filled → show a badge on the property card image alongside HOT / DISTRESS badges
- Badge text: `10% Below Market` (use the entered number dynamically)
- Badge color: use a distinct color from HOT/DISTRESS (suggest blue or purple)
- If left blank → **no badge shown**, nothing displayed

---

## TASK 09 — Add Call Button for Agent (Kirt Pandey)

### Client Dashboard (Agent Profile Card)
- The agent card currently shows only an `Email` button
- Add a `Call` button next to the Email button
- Phone number: `+919336138256`
- Display text on button: `Call`
- Tapping must open the phone dialer with the number pre-filled

### Implementation
```html
<a href="tel:+919336138256">Call</a>
```

---

## TASK 10 — Fix Image & Brochure PDF Upload (Backend Bug)

### Issue
Both upload buttons in the admin property form are broken:
- `IMAGE URL` section → Upload button not working
- `BROCHURE PDF URL` section → Upload button not working

### Fix Required
- Investigate and fix the backend upload handler / API endpoint
- Ensure uploaded files are saved correctly to storage
- After upload, the file URL must be auto-populated into the respective input field
- Test both image upload and PDF upload after fix
- Confirm uploaded images display correctly on client property cards
- Confirm uploaded PDFs open correctly from the client View Details page

---

## General Rules for All Tasks

- All optional fields: if left blank in admin, must show **nothing** on the client dashboard (no empty labels, no placeholders)
- Price formatting (AED M/K) applies to **client-facing views only** — admin panel keeps full numbers
- Badge styling (Status, % Below Market) should match the existing HOT / DISTRESS badge design language
- All new admin fields must be saved to the database and persist on edit
- All new client-side display elements must be responsive and match the existing dark luxury UI theme (black background, gold text/accents)
