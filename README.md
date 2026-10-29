# YonoVIP website

Upload the contents of `dist/` to the root of your web host. No install or build is needed. Keep the assets and licenses folders.

## Domain and SEO

The current canonical domain is in `site-config.json`. When your final domain is connected and ready, run this from the project folder with Node.js installed:

    node configure-seo.mjs https://yonoviprtp.com

Use that command only after you confirm the final domain. It updates the canonical URL, Open Graph and Twitter/X metadata, JSON-LD, sitemap and robots.txt together. Upload the updated `dist/` files afterward. Redirect old domains and the non-preferred www/non-www address to your chosen HTTPS domain using your host.

The sitemap includes only the real homepage. Add game pages when real URLs and content exist; do not add search results or section anchors. The homepage contains the 46 games with available artwork from the supplied contact sheet.

The current Sites publication is private. Search engines and social preview bots cannot access a private publication. Public hosting is needed before indexing and social previews can work. Access was not changed by this update.

Once public: check the live canonical and social image, add the property in Google Search Console, and submit `/sitemap.xml`. Metadata and sitemaps do not guarantee rankings or indexing.

Download buttons open https://yonovipapp.vip/?code=ZFW3U5NM1U9 . The site does not host an APK or verify its version. Game RTP numbers are explicitly labeled simulated.

## Assets

- `dist/assets/yonovip-og.jpg`: 1200 × 630 sharing image for Open Graph and Twitter/X.
- `dist/assets/yonovip-32.png`: browser icon.
- `dist/assets/yonovip-180.png`: Apple touch icon.
- `dist/assets/yonovip-192.png`, `yonovip-512.png`: manifest icons.
- Inline SVGs: official Phosphor icons. MIT license included in `dist/licenses/phosphor-MIT.txt`. Icons do not need a CDN, icon font or runtime library.

Social image made with the built-in image-generation tool using the supplied YonoVIP logo as reference. Prompt: Wide emerald-black and gold website sharing card, faithful YonoVIP logo on the right; headline “Find your game.” / “Get YonoVIP.”; labels “GAMES & APP DOWNLOAD” and “Android app • 18+”; no RTP numbers or winning promises.

## Lightweight motion

`motion.js` uses native browser animations and a one-shot IntersectionObserver for three below-the-fold sections. `motion.css` handles brief press feedback and one gold sheen on the main button. There is no GSAP or animation dependency, no scroll listener, no continuous animation loop and no hidden-content reveal requirement. The main heading and download action stay visible immediately. Reduced-motion disables decorative movement; Data Saver and reported low-memory/low-core devices get a short logo fade and limited interaction feedback. Active browser animations cancel when the tab is hidden. The RTP bar uses a transform rather than animating width. Large mobile backdrop blurs were removed, and the secondary logo uses the small image asset. A shared simulated-RTP timer updates only on-screen cards or the open game dialog; it pauses in hidden tabs.

## Game collection

46 games use custom AI-adapted full-bleed square WebP covers with no provider logos. See ARTWORK-SOURCES.md. Search and saved-game filters work locally. Saved picks persist on this browser when storage is available. The grid initially displays 12 games; Show More adds 12 at a time. Without JavaScript, every card remains visible and opens the app website. One shared one-second timer updates on-screen game RTP displays. Rising values have a green trend-up icon and green bar; falling values have a red trend-down icon and red bar. Cards use three columns on narrow phones and four from 480px upward. It skips hidden tabs and stops decorative updates for reduced-motion and Data Saver. Displayed rates are simulated; no real game RTP was supplied. The And more games in the app link opens the same app website.
