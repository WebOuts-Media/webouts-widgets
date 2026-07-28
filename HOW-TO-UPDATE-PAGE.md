# Updating the onboarding page (no web team needed)

The live page loads its code from GitHub via the jsDelivr CDN. The Bricks page
holds only a tiny loader (`onboarding-loader.html`), pasted once. To change the
page, you change the code in GitHub — that's it.

## The pieces
- **Repo:** `WebOuts-Media/webouts-widgets` (public)
- **File:** `onboarding.js` (the whole widget: styles + form + logic)
- **Branches:** work lands on `main`; the page serves the **`live`** branch
- **Bricks loader (one-time paste):** `onboarding-loader.html`

## Why there are two branches

The loader resolves whatever `live` points at and loads that exact commit. `main`
is where work accumulates, so a half-finished commit on `main` never reaches a
client. Publishing is a separate, deliberate step, and it doubles as the rollback
mechanism.

## ⚠️ Current state: the page still reads `main`

The loader in this repo points at `live`, but the loader **actually pasted on
webouts.com still points at `main`**. Bricks signs its code elements, and that
signature covers the exact code bytes. A signature cannot be minted outside the
Bricks builder, so changing that code through the API would leave the element
unsigned and the page blank.

**To finish the switch** (about 30 seconds, and the page is never broken, because
saving in the builder re-signs atomically): open the Bricks builder on
`webouts.com/onboarding`, select the Code element, replace its contents with
`onboarding-loader.html` from this repo, and save.

Until that happens, **push to both branches** so the page is correct either way:
```
git push origin main && git push origin main:live --force-with-lease
```

## To push an update
1. Edit `onboarding.js` and commit to `main`.
2. Publish:
   ```
   git push origin main:live --force-with-lease
   ```
3. Reload the page. The loader picks up the new commit within seconds; no CDN
   purge and no hard refresh, because it requests an immutable per-commit URL.

## To roll back

Point `live` at the last good commit. It takes effect within seconds:
```
git push origin <good-sha>:live --force
```

## Notes
- No secrets live in `onboarding.js` — it only calls the public onboarding API.
- The page is first-party JavaScript on webouts.com, so anything on `live` can
  read the form. That is the reason for the publish gate: pushing to `main`
  should never be able to change what a client is running.
- Want code-privacy on top of this? Connect a **private** repo to
  Netlify/Cloudflare Pages and point the loader at that URL instead.
