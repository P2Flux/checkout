# P2Flux self-hosted checkout

The P2Flux payment page, ready to serve from your own domain (for example `https://pay.yourcompany.com/`)
instead of `pay.p2flux.com`. It is the same page P2Flux hosts, as built files: no build step, no server
code, no database.

## What stays the same, what changes

- **Payments are unchanged.** Buyers pay from their own wallet straight to yours through the P2Flux
  contracts on Base. P2Flux never holds the money, wherever the page is served from.
- **The page runs on your server.** You decide when it is updated, it is served under your domain and
  your security headers, and you can check every file against the published checksums.
- **The page refuses payments to anyone but you** - when you list your wallets in `config.js`. Then it
  refuses any payment or subscription that names another wallet, any refund sent from another wallet,
  any cancellation of a subscription to another wallet, and any contract other than the published P2Flux contracts, before the buyer is asked to sign. The
  amount the buyer reads is checked against the amount the wallet signs. These checks hold even if the
  P2Flux API were compromised; see below for what they do not cover.
- **Still provided by P2Flux:** the API that creates and confirms payments (`api.p2flux.com`) and,
  for buyers who pay the network fee in USDC, the transaction that carries their payment.

## Install

1. Download `p2flux-checkout-<version>.zip` from the release and its published SHA-256.
2. Check it:
   ```sh
   sha256sum p2flux-checkout-<version>.zip      # compare with the release notes
   unzip p2flux-checkout-<version>.zip -d pay    # index.html, assets/, ... directly in pay/
   cd pay && sha256sum -c SHA256SUMS
   ```
3. Create your settings: `cp config.example.js config.js` and edit it:
   ```js
   window.__P2FLUX_CHECKOUT__ = {
     network: 'base',                 // or 'base-sepolia' for the test network
     recipients: ['0xYourWallet…'],   // optional, recommended
   }
   ```
4. Serve the folder over HTTPS with the headers in `nginx.example.conf` (any web server works; the
   headers are what matter):
   - `Content-Security-Policy` as in the example, with `connect-src` for **your** network, and
     `frame-ancestors 'none'` (it only works as a header).
   - `Cache-Control: no-store` for `index.html` and `config.js`; long caching for `assets/`.
   - Unknown paths answer **404**, never the page.
   - **No** `Cross-Origin-Opener-Policy` header: the page reports the result to your shop page
     through `window.opener`, which COOP breaks.
5. Point your integration at it (see below) and make one small test payment.

**Sub-path installs** (`https://example.com/pay/`) work; the address must end with a slash, because
the page loads its files relative to itself.

If the page shows "This checkout is not configured", `config.js` is missing, unreadable or invalid
(unknown network, a malformed wallet address, an empty `recipients` list, an invalid `brand`, or an unknown
setting).

## Branding

Show your own logo and colour instead of P2Flux's: put the logo file next to `index.html` and add a
`brand` to `config.js`:

```js
window.__P2FLUX_CHECKOUT__ = {
  network: 'base',
  recipients: ['0xYourWallet…'],
  brand: { logo: 'logo.svg', color: '#0f766e', name: 'Your Shop' },
}
```

- `logo`: a file served with the page (a path like `logo.svg` or `img/logo.png`; `.svg`, `.png`, `.webp`,
  `.jpg`; letters, digits, `-`, `_`, `.` and `/` in the name, at most 120 characters). It is shown at most
  24 pixels high and 180 wide, smaller on a narrow phone. A web address is not accepted - the page loads
  nothing from other sites.
- `color`: `#RRGGBB`. Buttons carry white text on this colour, so it must be dark enough to read
  (contrast of at least 4.5:1 against white); a light colour makes the configuration invalid.
- `name`: optional, the logo's text alternative (at most 40 characters).

The address of the page stays in the card header, and "Powered by P2Flux" appears under the card. An
invalid `brand` shows "This checkout is not configured", so a mistake is seen when you install, not by a
buyer.

## Point your integration at it

Checkout links have the form `<your checkout address>/#/<pay|subscribe|cancel|refund|approve>/<token>`.

- **JavaScript SDK** (`@p2flux/sdk` 0.9+):
  `createP2Flux({ apiUrl: 'https://api.p2flux.com', checkoutUrl: 'https://pay.yourcompany.com' })`,
  then `p2flux.checkoutLink('pay', intent)`.
- **PHP SDK** (`p2flux/sdk-php` 0.9+):
  `new P2FluxClient(['apiUrl' => 'https://api.p2flux.com', 'checkoutUrl' => 'https://pay.yourcompany.com'])`,
  then `$client->checkoutLink('pay', $intent)`.
- **Laravel** (`p2flux/laravel` 0.3+): `P2FLUX_CHECKOUT_URL=https://pay.yourcompany.com`.
- **WooCommerce plugin**: the filter `p2flux_wc_checkout_url`.

## What the wallet list protects, and what it does not

- Payments and subscriptions: the receiving wallet must be in your list.
- Cancellations: the subscription being cancelled must be to a wallet in your list.
- Not covered: the screen that restores a subscription's allowance (`#/approve/...`). It names no
  wallet yet; it only lets the buyer re-approve the P2Flux recurring contract for an existing
  subscription they signed.
- Refunds: only the wallet that SENDS the refund is checked against your list. Where the refund goes
  (the original payer) and how much may be refunded come from the P2Flux API, which reads them from the
  original payment on chain. Check both in your wallet before you confirm a refund.
- Contracts, network and amounts: always checked, with or without a wallet list - the contracts against
  the published P2Flux contracts compiled into the page, the amount shown against the amount signed.
- Without a wallet list, any recipient a payment names is accepted (as on pay.p2flux.com).

Not covered: the P2Flux API is still what creates payments and confirms them. A compromised API could
tell your shop that a payment arrived when it did not, so confirm high-value orders in your wallet. A
version that confirms payments without the P2Flux API is not available.

**Where the files come from:** `SHA256SUMS` proves the files match each other; the SHA-256 of the ZIP
in the release notes on GitHub is what ties them to P2Flux.

## Updates

Each release lists what changed. Install it like the first time and keep your `config.js` (releases
never contain one).

If P2Flux ever moves to new contracts, a checkout release that accepts them comes **first**, announced
in advance in its release notes, before the API switches. A page that is not updated by then refuses
payments rather than accept unknown contracts - watch the repository's releases to be told.

## Support

Self-hosting is supported as a paid service: installation help, header and server reviews, and
priority help with updates. Contact `contact@p2flux.com`. Questions about payments and the API itself
are answered as for every P2Flux user.

## Licence

You may serve this page, unmodified, to take payments through P2Flux. Fonts: IBM Plex Mono, SIL Open
Font License 1.1 (`fonts/IBMPlexMono-LICENSE-OFL.txt`).
