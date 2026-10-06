# Design Constitution & Architecture Guide

## 1. Domain Aesthetic & Visual Philosophy
Swarna Fancy & Bentex Store is tailored specifically for the hyper-local Indian jewellery retail ecosystem (1-gram gold micro polish, bentex, temple imitation jewellery, daily-wear chains, lockets, and bangles).
- **Primary Typography**: Editorial Display Serif for brand identity and product titles; clean geometric sans-serif for numbers, interfaces, and specifications.
- **Palette**: Warm stone (`#fafaf9`, `#f5f5f4`), deep charcoal (`#1c1917`), rich brass/gold accents (`#78350f`, `#92400e`, `#b45309`), and high-contrast emerald green for WhatsApp action triggers.
- **Zero-Pill Discipline**: All informational metadata (polish type, category, stock counts) is displayed as clean unboxed text separated by subtle typographic dots (`·`). Interactive filters and selectors are rendered as functional segmented buttons with tactile active states.

## 2. Layout & Spatial Engineering
- **Zero Overflow Guarantee**: All controls, category filters, and budget chips wrap responsively within the viewport. No sideways dragging or horizontal overflow on mobile viewports (360px–420px).
- **Card Hierarchy**: 
  - Strict 2-column mobile grid (`grid-cols-2 gap-2.5 sm:gap-4`), scaling cleanly to 3 columns on tablet and 4 columns on desktop.
  - 4:5 image ratio giving 65-70% visual priority to the jewellery photograph.
  - Inline variant selector (sizes `2.4`, `2.6`, `2.8` or chain lengths `18"`, `22"`).
  - Dual-state action button: "Add to Bag" transitions smoothly into quantity stepper (`[-] Qty [+]`).
  - Secondary 1-tap lightning button for instant WhatsApp purchase.

## 3. Customer Storefront Navigation
- **Header**: High-contrast brand identity, direct "Call Counter" link, and animated shopping bag trigger.
- **Search System**: Real-time debounced indexing across product title, category, polish type, and SKU code with an instant clear button (`×`).
- **Budget Quick Chips**: Instant budget filters ("Under ₹199", "Under ₹299", "Under ₹499", "₹500+") matching Indian bazaar buying behaviors.
- **Mobile Sticky Bag Bar**: A floating quick-action pill at the bottom of the viewport when items are in the bag, letting shoppers view cart and proceed to checkout in 1 tap without scrolling back up.
- **Quick-View Modal**: Image zoom preview, detailed specifications (micron plating, base metal, polish warranty), care instructions, and direct order buttons.

## 4. Merchant Administration Console
- **Protected Access**: Bottom section link protected with demo credentials (`ID: bentexdemo`, `Password: bentex123`).
- **Dashboard**: Gross revenue, orders placed, units sold, estimated gross profit, and urgent low-stock alerts.
- **Inventory & Stock Management**:
  - Live stock counter with quick increment/decrement controls.
  - Inline price editing (`₹XXX ✎`).
  - Image handling: supports both image web URLs and **direct file upload from local device** (computer/phone).
  - Canvas-based image compression: resizes uploaded images to max 800px at 0.8 JPEG quality to guarantee file sizes stay under 50KB, ensuring zero localStorage quota crashes.
- **Bulk Upload & Import Engine**:
  - Multi-photo upload: select dozens of photos from device simultaneously.
  - Spreadsheet / CSV paste: paste table rows (`Title, Category, Price, MRP, Stock`).
  - 1-Click Batch Templates for instant catalog seeding.
- **Order Pipeline & Invoices**:
  - Status progression: `New` ➔ `Confirmed` ➔ `Packed` ➔ `Out for Delivery` ➔ `Delivered`.
  - 1-Click WhatsApp status alerts dispatched to the customer's phone.
  - Printable estimation bill / invoice with store letterhead and itemized table.
- **Customer CRM Directory**: Complete list of customers with contact numbers, physical town addresses, lifetime spend, order history, and 1-click WhatsApp message triggers.
- **Store Settings & UPI**: Configurable store name, WhatsApp hotline number, town address, free delivery threshold, and instant UPI QR code generator for Google Pay, PhonePe, and Paytm.
