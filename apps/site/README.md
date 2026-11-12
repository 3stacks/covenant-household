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

Set `NEXT_PUBLIC_SITE_URL` to the public address of the site. The sitemap and
the canonical URLs use it.

The design comes from the Primer template of Tailwind Plus. `LICENSE.md` holds
the licence of the template.
