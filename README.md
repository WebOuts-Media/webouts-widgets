# webouts-widgets

## Submit an Invoice page (webouts.com/invoice)
- `invoice.js`: the whole page (tax notice, Monday form embed, invoice checklist, Invoice Builder). Posts to the ClockUp server `/pub/invoice-builder`.
- `invoice-loader.html`: paste once into a Bricks Code element on /invoice. Same `live` branch publishing as onboarding.
- `webouts-logo.png`: logo for the builder preview, loaded from the same commit as `invoice.js`.
- Test against a server draft before promote: `webouts.com/invoice?api=https://<draft>.us.monday.app#builder`.
