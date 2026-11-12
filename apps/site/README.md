# Covenant Household homepage

The homepage of Covenant Household. Next.js builds a static export to `out/`. Run
`npm run site` at the repository root to build the web app and the homepage
together. That command puts the app in `out/app/`.

```bash
npm install
npm run dev      # the homepage on http://localhost:3000, without the app
```

The images in `src/images/screens/` are screenshots of the app at a width of
390 pixels. When the app changes, take them again.

The site is at `https://covenanthousehold.app`. The sitemap, the canonical URLs
and the social cards use that address. To build for a different address, for
example a preview, set `NEXT_PUBLIC_SITE_URL`.

## Pages

| Path | Page |
| --- | --- |
| `/` | The homepage, with the pricing section and the store buttons |
| `/readings/` | The days of the church year, by season |
| `/readings/<id>/` | The lessons, the collect, and the Epistle and Gospel of one day |
| `/get/` | One link for a QR code. A phone goes to its store. The search engines do not index this page. |
| `/app/` | The web app |

The build makes the readings pages from `apps/web/public/calendar/`. Run
`npm run calendar` at the repository root before you build the site.

## The store buttons

`packages/core/src/links.ts` holds the store addresses of the mobile app. When
the app is in a store, put its address in that file. The site and the web app
then show these items:

- The store badge on the homepage, on each readings page and on `/get/`.
- A bar at the top of the web app on a phone of that type.
- The Smart App Banner in Safari, when `APP_STORE_ID` has the App Store number.
- A `MobileApplication` entry in the structured data of the homepage.

Before that, the site shows a line of text that says the apps will be available soon.

`public/badges/` holds the official badges of Apple and Google. Do not change
their colours or their shape.

`public/og.png` is the image that a link to the site shows on social media.

The design comes from the Primer template of Tailwind Plus. `LICENSE.md` holds
the licence of the template.
