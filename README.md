# Gutter cleaning calculator

A responsive, single-price quote calculator for residential gutter cleaning in El Paso County, Colorado. Designed to paste into a GoDaddy Websites + Marketing HTML section.

## Customer flow

1. Enter house size, stories, ZIP code, cleaning history, visible debris buildup, tree coverage, and downspout needs.
2. See an initial-cleaning price and separate dollar lines for the house minimum, additional size, debris buildup, tree coverage, and selected downspout clearing. Included/zero-price categories stay visible. No square-foot or linear-foot rates are shown to customers.
3. Compare one-time service, annual maintenance (up to 5% off), and spring-and-fall maintenance (up to 10% off). See each future per-visit price, future maintenance-year total, and actual savings.
4. Accept the initial price, request the desired schedule, and provide contact details for review before scheduling. The selected plan and its pricing are included in the request email.

The included-services panel has inline icons for camera inspection, ground-based work, high-suction vacuum cleaning, and debris cleanup. There are no external icon scripts or dependencies.

Guards, difficult access, gutters above 40 feet, and more than six blocked downspouts route to a review request without offering a price.

## Files

- `embed.html`: Complete GoDaddy paste-in component; no build required.
- `index.html`: Standalone browser preview of the same component.
- `email-setup.html`: Owner-only FormSubmit activation helper. Do not publish as a permanent public page.
- `INSTALLATION.txt`: Detailed setup, pricing, limitations, and email activation instructions.
- `test.mjs`: Pricing and input-validation checks, using only Node built-ins.
- `PRICING-RESEARCH.txt`: Published discount benchmarks, source links, recommended rates, and pricing policies.

## GoDaddy installation

Open **Edit Website → Add Section → HTML**. Paste the entire contents of `embed.html` into **Custom Code**. Preview every screen on desktop and mobile, adjusting the section height if needed, then publish.

## Email delivery must be activated

Requests are configured for **tpatton@sprinklersquad.com** through **FormSubmit**, an external form-to-email processor disclosed in the customer form. FormSubmit requires a first-use confirmation email. Follow `INSTALLATION.txt`, activate the recipient, and verify a clearly labeled test from the published GoDaddy site before accepting real leads.

Local development checked successful, failed, and pending-activation submissions against an isolated simulated receiver. No activation email or real lead was sent during development. A provider success response is not proof of inbox delivery.

## Pricing settings

Edit `CONFIG` near the script top in `embed.html`. Keep `index.html` synchronized if changing the preview.

| Height proxy | Minimum | Internal rate per estimated foot |
| --- | ---: | ---: |
| One story | $149 | $1.25 |
| Two stories / partial levels | $175 | $1.75 |
| Three stories | $250 | $2.25 |

The internal length model is provisional: `3.5 × sqrt(above-ground area / stories) + 30`, rounded up to ten feet. It has not been validated against a measured local sample. Initial pricing adds separate debris and tree-coverage fees, plus $35 for each selected accessible downspout blockage. Explicit visible buildup determines the debris fee; cleaning history estimates it only when buildup is unknown. History is not a third fee. Minimum-based quotes retain the exact minimum plus extras; size-driven quotes round up to $5.

The visible breakdown shows the exact minimum: $149, $175, or $250. Any size-driven price rounding is included in the size adjustment. Zero-price categories display “Included.” The same breakdown accompanies accepted quote requests.

## Maintenance plans

The initial cleaning stays full price for every option. Future routine maintenance starts with the house base/size price plus tree coverage, excluding initial buildup and initial downspout blockage charges. Annual visits receive up to 5% off this maintenance baseline; spring/fall visits receive up to 10%. Per-visit prices retain the house minimum, round up to $5, and never exceed standard maintenance. The UI shows actual dollar savings; at the floor it says “House minimum applies.” See `PRICING-RESEARCH.txt` for the reasoning and sources.

Annual totals describe future maintenance years (one or two future visits), not the initial cleaning or first calendar year. Discounts are not applied to the initial cleanup. Extra new blockages or abnormal buildup require approval. Plans request scheduling for review and payment per completed visit; no automatic billing or appointment is created.

**Version 3 changes:** debris buildup and tree coverage are now separate additive fees rather than only the larger of the two. This can increase an initial quote. Annual and twice-yearly maintenance discount scope is separate from those initial-cleaning extras. Rates and defaults remain editable in `CONFIG`.

The displayed price is a package quote based on the customer's answers. If those answers match the property and requested work, the stated policy is to honor that price. Changes require explanation and customer approval. The owner retains estimation risk and must verify scope, service eligibility, and submitted prices before confirmation. No booking or payment processing is included.

Client-side values can be modified by visitors; this component is not a trusted server-side pricing system. No API keys or other secrets belong in the embed. Travel inside the stated county service area is included; ZIP entry alone does not verify county boundaries.

## Checks

Run `node test.mjs`, or `npm test`, with a current Node.js installation. No dependency installation is needed.

## Synchronizing the preview

After editing `embed.html`, replace the embedded section and script in `index.html`, or generate a standalone wrapper around the component. The test checks that the preview contains the current component.
