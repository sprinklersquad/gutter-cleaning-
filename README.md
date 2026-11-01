# Gutter cleaning calculator

A responsive, single-price quote calculator for residential gutter cleaning in El Paso County, Colorado. Designed to paste into a GoDaddy Websites + Marketing HTML section.

## Customer flow

1. Enter house size, stories, ZIP code, cleaning history, tree coverage, and downspout needs.
2. See one package price and a dollar-only breakdown: minimum service charge, home size adjustment, extra cleaning time, and selected downspout clearing. Only applicable adjustments appear; the rows add up exactly to the total. No square-foot or linear-foot rates are shown to customers.
3. Accept the price and provide contact details for property review before scheduling.

Guards, difficult access, gutters above 40 feet, and more than six blocked downspouts route to a review request without offering a price.

## Files

- `embed.html`: Complete GoDaddy paste-in component; no build required.
- `index.html`: Standalone browser preview of the same component.
- `email-setup.html`: Owner-only FormSubmit activation helper. Do not publish as a permanent public page.
- `INSTALLATION.txt`: Detailed setup, pricing, limitations, and email activation instructions.
- `test.mjs`: Pricing and input-validation checks, using only Node built-ins.

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

The internal length model is provisional: `3.5 × sqrt(above-ground area / stories) + 30`, rounded up to ten feet. It has not been validated against a measured local sample. Package pricing includes the larger of the cleaning-history and tree-coverage adjustments, plus $35 for each selected accessible downspout blockage. Minimum-based quotes retain the exact minimum plus selected extras. Size-driven quotes round up to $5. See the installation guide for complete rules.

The visible breakdown shows the exact minimum: $149, $175, or $250. Any size-driven price rounding is included in the home-size adjustment. Minimum-only jobs show no home-size adjustment. Extra cleaning time includes a short reason, such as “Last cleaned 1–2 years ago” or “Heavy tree coverage or pine needles.” The same breakdown is included with accepted quote requests.

The displayed price is a package quote based on the customer's answers. If those answers match the property and requested work, the stated policy is to honor that price. Changes require explanation and customer approval. The owner retains estimation risk and must verify scope, service eligibility, and submitted prices before confirmation. No booking or payment processing is included.

Client-side values can be modified by visitors; this component is not a trusted server-side pricing system. No API keys or other secrets belong in the embed. Travel inside the stated county service area is included; ZIP entry alone does not verify county boundaries.

## Checks

Run `node test.mjs`, or `npm test`, with a current Node.js installation. No dependency installation is needed.

## Synchronizing the preview

After editing `embed.html`, replace the embedded section and script in `index.html`, or generate a standalone wrapper around the component. The test checks that the preview contains the current component.
