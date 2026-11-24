# Gilly's — QA report (v9 → v10)

Method: served the site locally, drove it in headless Chromium at 1366px and 390px, walked
menu → customize → cart → checkout, and compared against Smart Meals (per-day pricing,
calorie-counted plans), Nuthera (premium tiers, plan guidance) and KFC PH (clear pickup/delivery
mode, guest-friendly ordering, compact mobile menu).
No JavaScript errors and no horizontal scroll on any page tested (11 pages × 2 sizes).

## Fixed in v10
| # | Area | Problem | Fix |
|---|------|---------|-----|
| 1 | Flow | Customizer opened with nothing selected, so **Add to cart was disabled with no explanation**, though every default is free | Regular portion, As prepared, House dressing pre-selected (pricing already assumed Regular) |
| 2 | Flow | Toast said "bag"; header says "cart"; no way to reach the cart | Wording unified to "cart"; toast has **View cart** button |
| 3 | Flow | "Added" toast followed the customer to the next page and overlapped the footer | Cleared on navigation |
| 4 | Structure | Footer on JS pages had no address/hours, a lowercase "gilly's" logo, and mixed link sizes | Footer shows pickup address, windows, cash-at-pickup note; one link size; logo case fixed |
| 5 | Content | Info page `<title>` said "Delivery and FAQs"; nav says "Pickup & FAQs" | Title corrected |
| 6 | Design | Category tags used 3 unrelated styles (solid maroon / outline / green); rows wrapped unevenly | One tinted system: maroon = High Protein, saffron = Balanced, green = Plant-Based |
| 7 | Mobile | One huge photo per screen; 2×2 filter block; ~480px before first meal | Compact rows (thumbnail + name + facts + Add), single scrolling filter row |
| 8 | Accessibility | Option prices ~10px | 13px minimum |

## Recommended next (not built — need a decision or a backend)
1. **Guest checkout.** Checkout hard-gates behind sign-in/sign-up. Orders are stored per account in localStorage, so guest mode needs reference-number lookup for receipts. Biggest conversion win.
2. **Pickup time before the cart.** Choose date/window on the cart (KFC asks mode first), not after sign-in.
3. **Self-host photos.** Every food photo is hot-linked from Unsplash/Pexels; if one URL breaks, a card shows a blank tile. Download, compress (WebP) and ship in `/assets`.
4. **Plan guidance (Nuthera-style).** Link the Calorie Guide result straight into a recommended meal plan, and show a per-day price on plan cards (Smart Meals' main hook).
5. **Reduce `!important` (≈500 across 3 stylesheets).** Layered overrides (styles.css → theme.css) are why small CSS edits fight back. Consolidate into theme.css.
6. **Backend.** Orders never reach the restaurant (browser-local only). Supabase or similar is required before real commerce.
7. Admin pages are thin stubs that load `admin.js`; they load without errors but were not audited in depth.

## Added after review
- Footer changed from solid maroon to a light surface with maroon accents (`v10b` block in theme.css).
- **Scroll lock:** the page behind any modal no longer scrolls. The old `body.overlay-active` rule only locked `<body>`, so the page still moved (tested: scrollY 300 → 1500 behind the sign-in modal). The checkout confirmation dialog was not covered at all. Now `<html>` and `<body>` are both locked for the customizer, chooser, cart drawer, sign-in and confirmation dialog; scroll inside the modal still works and the page position is kept on close.
- **Customizer layout (from your screen recording):** the dish name, description and nutrition strip are now pinned at the top; only the choices scroll. Previously the title scrolled away and the nutrition strip floated over the options (text peeked out above it). On phones the photo is shorter and the description is limited to 2 lines so the choices keep enough room. Scroll position is kept when you tick an option.

## Open content issue (not changed)
- The allergen note at the bottom of every meal reads "...must be verified before launch" — placeholder developer wording shown to customers. Replace it with your approved allergen/disclaimer text before going live.

## Header and alignment pass
- **Nav is now centred.** Header is a 3-column grid (logo left · links in the true centre of the page · Sign in/cart right) on screens wider than 960px. Below that the burger menu is unchanged.
- **One left edge.** Measured every page: logo, headings, content and footer all start at the same x-position. Two pages were off and are fixed: the cart breadcrumb (a `.wrap` nested in a `.wrap` doubled its padding) and the checkout sign-in gate (now a centred card with breadcrumb, heading and buttons on one edge).
- **Meal cards:** removed the "+ ADD" label (the whole card already opens the customizer). The maroon bar now shows the price only; "✓ Added" still appears once the meal is in the cart.
- **Red accent lines removed** from the footer (top), every modal (customizer, sign-in, chooser, confirmation; top bar), white panel cards (account, forms, offers, empty states, etc.; top edge), receipts/summary cards (now a quiet hairline), and notices/callouts with a thick left bar (Total calories bar, FAQ cards, pickup-location box, menu banner, calorie shortcut, auth alert). Kept on purpose: the active-page underline in the nav, the selected filter chip, radio/toggle controls, and divider rules above totals.
