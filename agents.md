# Agent Operational Guidelines & Storefront Engine

## 1. Core Responsibilities & Identity
This application is a hyper-local e-commerce and merchant administration system designed for Indian town retail stores specializing in:
- 1-Gram micro gold jewellery
- Bentex and brass imitation bangles & chains
- Temple antique lockets & bridal jewellery sets
- Daily-wear anklets (payal), rings, and mangalsutras

It operates with **zero external server requirements**, utilizing high-performance client-side state with `localStorage` persistence, structured WhatsApp order dispatches via `https://wa.me/`, and offline vector QR code generation.

## 2. Security & Access Boundaries
- **Storefront**: Completely public, high-speed browsing, search, and checkout.
- **Admin Console**: Protected by authentication barrier located at the footer of the page.
  - **Demo Credentials**: User ID: `bentexdemo` | Password: `bentex123`.
- **Phone Number Normalization**: Always enforce 10 or 12-digit international format (`91XXXXXXXXXX`) when creating WhatsApp links (`https://wa.me/91XXXXXXXXXX?text=...`) without `+`, `-`, or spaces to prevent link failure on mobile devices.

## 3. Data Integrity & Storage Management
- **Catalog & Orders**: Stored in `localStorage` under `swarna_products_v2`, `swarna_orders_v2`, `swarna_config_v2`.
- **Device Photo Compression**: Any image uploaded from a local device must be processed through `compressImageFile` (`/src/utils/imageUtils.ts`). This bounds canvas dimensions to max 800px and exports compressed JPEG data URLs (~30–50 KB), completely mitigating `QuotaExceededError` in browser storage.
- **Bulk Upload**: Provided via `/src/components/admin/BulkUploadModal.tsx` for multi-photo selection, CSV table row ingestion, and 1-click batch presets.

## 4. WhatsApp Order Dispatch Format
The standard customer order message is constructed with explicit itemization, billing subtotals, delivery status, and delivery address:
```text
🛍️ *NEW ORDER - [STORE NAME]*
---------------------------------
*Items Ordered:*
1. [Product Title] | Size: [Variant]
   Qty: [Quantity] × ₹[Unit Price] = ₹[Total]

---------------------------------
*Bill Details:*
• Item Subtotal: ₹[Subtotal]
• Delivery Charges: [₹Free / ₹Amount]
• *Total Payable: ₹[Grand Total]*
• Payment Preference: [COD / UPI on Delivery]

---------------------------------
*Customer Details:*
• Name: [Customer Name]
• Phone: [Customer Phone]
• Address: Door [Door No], [Street], [Town Pincode]
• Landmark: [Landmark]
```

## 5. Verification Protocol
1. Run `compile_applet` to confirm zero TypeScript compilation errors.
2. Run `lint_applet` to ensure pristine lint compliance.
3. Verify all interactive controls:
   - Search input auto-filter and clear button.
   - Category button filtering and budget rate chips.
   - "Add to Bag" and quantity stepper reactivity.
   - Variant picker before adding bangles/chains.
   - Cart slide-over drawer calculations and WhatsApp payload generation.
   - Admin login modal validation (`bentexdemo` / `bentex123`).
   - Admin inventory addition with both local photo upload and web URLs.
   - Admin bulk upload modal functionality.
   - Admin store settings persistence and test WhatsApp ping.
   - Invoice modal printing and WhatsApp sharing.
