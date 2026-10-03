/*
 * P2Flux self-hosted checkout - your settings.
 *
 * Copy this file to `config.js` next to `index.html` and edit it. The page reads it before it starts
 * and refuses to run without a valid one. Updates of the checkout never contain a `config.js`, so
 * installing a new version does not overwrite your settings.
 */
window.__P2FLUX_CHECKOUT__ = {
  /* 'base' (Base Mainnet, real USDC) or 'base-sepolia' (test network, test USDC). */
  network: 'base',

  /*
   * Optional, recommended: the only wallets allowed to receive payments on this page. With this list
   * set, the page refuses any payment or subscription addressed to another wallet, and any refund
   * sent from another wallet - even if the P2Flux API were compromised and said otherwise. (Where a
   * refund goes is not checked here; see README.) Remove the line to accept any recipient.
   */
  recipients: ['0x0000000000000000000000000000000000000000'],

  /*
   * Optional: your logo (a file next to index.html) and colour. The colour must be dark enough for white
   * button text (contrast 4.5:1). See README, "Branding". Remove the line to keep the P2Flux look.
   */
  // brand: { logo: 'logo.svg', color: '#0f766e', name: 'Your Shop' },
}
